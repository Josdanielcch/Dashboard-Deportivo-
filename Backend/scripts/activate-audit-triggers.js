/**
 * Script para activar los triggers de auditoría en la base de datos
 * Ejecutar: node scripts/activate-audit-triggers.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const FUNCTION_SQL = `
CREATE OR REPLACE FUNCTION public.fn_audit_generic()
RETURNS trigger AS $$
DECLARE
    v_user_id INT;
BEGIN
    BEGIN
        v_user_id := NULLIF(current_setting('app.current_user_id', true), '')::int;
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF v_user_id IS NULL THEN
        BEGIN
            IF (TG_OP = 'DELETE') THEN
                v_user_id := OLD.user_id;
            ELSE
                v_user_id := NEW.user_id;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            v_user_id := NULL;
        END;
    END IF;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (action_type, table_name, record_id, new_value, user_id)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id, row_to_json(NEW)::text, v_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (action_type, table_name, record_id, old_value, new_value, user_id)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, row_to_json(OLD)::text, row_to_json(NEW)::text, v_user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (action_type, table_name, record_id, old_value, user_id)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::text, v_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
`;

const TRIGGER_STATEMENTS = [
  ['users', 'public.users'],
  ['customers', 'public.customers'],
  ['courts', 'public.courts'],
  ['bookings', 'public.bookings'],
  ['billings', 'public.billings'],
  ['products', 'public.products'],
  ['suppliers', 'public.suppliers'],
  ['purchases', 'public.purchases'],
  ['purchase_details', 'public.purchase_details'],
  ['accounts_receivable', 'public.accounts_receivable'],
  ['accounts_payable', 'public.accounts_payable'],
  ['pending_charges', 'public.pending_charges'],
  ['sports', 'public.sports'],
  ['business_settings', 'public.business_settings'],
  ['roles', 'public.roles'],
];

async function activate() {
  console.log('\n🔧 Activando triggers de auditoría...\n');
  
  const client = await pool.connect();
  try {
    // 1. Crear/actualizar la función (como una sola query)
    console.log('1. Creando función fn_audit_generic()...');
    try {
      await client.query(FUNCTION_SQL);
      console.log('  ✅ fn_audit_generic() creada/actualizada');
    } catch (err) {
      console.log(`  ❌ Error: ${err.message}`);
    }

    // 2. Crear triggers uno por uno
    console.log('\n2. Creando triggers...');
    let ok = 0, fail = 0;
    for (const [name, table] of TRIGGER_STATEMENTS) {
      try {
        await client.query(`DROP TRIGGER IF EXISTS trg_audit_${name} ON ${table}`);
        await client.query(`
          CREATE TRIGGER trg_audit_${name}
          AFTER INSERT OR UPDATE OR DELETE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION public.fn_audit_generic()
        `);
        console.log(`  ✅ trg_audit_${name} → ${table}`);
        ok++;
      } catch (err) {
        console.log(`  ❌ trg_audit_${name}: ${err.message}`);
        fail++;
      }
    }

    // 3. Verificar
    console.log('\n3. Verificando triggers activos...');
    const result = await client.query(`
      SELECT tgname, tgrelid::regclass as tabla
      FROM pg_trigger 
      WHERE tgname LIKE 'trg_audit_%' AND NOT tgisinternal
      ORDER BY tgrelid::regclass::text
    `);
    console.log(`  Total: ${result.rows.length} triggers activos\n`);

    // 4. Verificar función
    const fnCheck = await client.query(`
      SELECT pg_get_functiondef(oid) as def
      FROM pg_proc WHERE proname = 'fn_audit_generic'
    `);
    const hasCurrentSetting = fnCheck.rows[0]?.def?.includes('current_setting');
    console.log(`4. Función usa current_setting: ${hasCurrentSetting ? '✅ SÍ' : '❌ NO (versión antigua)'}`);

    if (!hasCurrentSetting) {
      console.log('  ⚠️  La función no se actualizó. Ejecuta manualmente en la BD:');
      console.log('  Ver archivo: scripts/activate_audit_triggers.sql');
    }

    console.log('\n✅ ¡Listo!\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

activate();
