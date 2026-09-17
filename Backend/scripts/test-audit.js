/**
 * Script de prueba del Sistema de Auditoría
 * 
 * Ejecutar: node scripts/test-audit.js
 * 
 * Este script verifica:
 * 1. Que la función fn_audit_generic() existe
 * 2. Que los triggers están creados en todas las tablas
 * 3. Que la tabla audit_logs tiene estructura correcta
 * 4. Simula una operación INSERT/UPDATE/DELETE y verifica que se registra
 * 5. Prueba que SET app.current_user_id funciona correctamente
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const RESULTS = [];
let passed = 0;
let failed = 0;

function log(test, ok, detail = '') {
  const status = ok ? '✅ PASS' : '❌ FAIL';
  if (ok) passed++; else failed++;
  console.log(`  ${status} | ${test}${detail ? ' — ' + detail : ''}`);
  RESULTS.push({ test, ok, detail });
}

async function runTests() {
  const client = await pool.connect();
  
  try {
    console.log('\n═══════════════════════════════════════════');
    console.log('  TEST: Sistema de Auditoría - AuditLogs');
    console.log('═══════════════════════════════════════════\n');

    // ─── TEST 1: Función fn_audit_generic existe ───
    console.log('1. Verificando función fn_audit_generic()...');
    const fnResult = await client.query(`
      SELECT proname, proargtypes::regtype[] as arg_types
      FROM pg_proc 
      WHERE proname = 'fn_audit_generic'
    `);
    log('fn_audit_generic() existe', fnResult.rows.length > 0, 
      fnResult.rows.length > 0 ? 'Encontrada' : 'NO encontrada en la BD');

    // ─── TEST 2: Triggers creados ───
    console.log('\n2. Verificando triggers en tablas...');
    const triggerResult = await client.query(`
      SELECT tgname, tgrelid::regclass as tabla
      FROM pg_trigger 
      WHERE tgname LIKE 'trg_audit_%' AND NOT tgisinternal
      ORDER BY tgrelid::regclass::text
    `);
    
    const expectedTables = [
      'users', 'customers', 'courts', 'bookings', 'billings',
      'products', 'suppliers', 'purchases', 'purchase_details',
      'accounts_receivable', 'accounts_payable', 'pending_charges',
      'sports', 'business_settings', 'roles'
    ];
    
    const triggeredTables = triggerResult.rows.map(r => r.tabla);
    for (const table of expectedTables) {
      log(`Trigger en tabla ${table}`, triggeredTables.includes(table),
        triggeredTables.includes(table) ? `trg_audit_${table}` : 'TRIGGER FALTANTE');
    }

    // ─── TEST 3: Estructura de audit_logs ───
    console.log('\n3. Verificando estructura de audit_logs...');
    const colsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    const columns = colsResult.rows.map(r => r.column_name);
    const requiredCols = ['id', 'action_type', 'table_name', 'record_id', 'old_value', 'new_value', 'user_id', 'created_at'];
    for (const col of requiredCols) {
      log(`Columna ${col} existe`, columns.includes(col),
        columns.includes(col) ? `tipo: ${colsResult.rows.find(r => r.column_name === col)?.data_type}` : 'COLUMNA FALTANTE');
    }

    // ─── TEST 4: SET app.current_user_id funciona ───
    console.log('\n4. Verificando SET app.current_user_id...');
    await client.query('SET app.current_user_id = 999');
    const setResult = await client.query("SELECT current_setting('app.current_user_id') as val");
    log('SET app.current_user_id = 999', setResult.rows[0].val === '999',
      `Obtenido: "${setResult.rows[0].val}"`);
    
    // Verificar que SET LOCAL NO persiste sin transacción
    await client.query('BEGIN');
    await client.query('SET LOCAL app.current_user_id = 888');
    const afterSetLocal = await client.query("SELECT current_setting('app.current_user_id') as val");
    log('SET LOCAL funciona dentro de transacción', afterSetLocal.rows[0].val === '888',
      `Dentro de BEGIN: "${afterSetLocal.rows[0].val}"`);
    await client.query('ROLLBACK');
    
    // Después de ROLLBACK, el SET LOCAL se pierde, pero el SET anterior (999) persiste
    const afterRollback = await client.query("SELECT current_setting('app.current_user_id') as val");
    log('SET (session) persiste después de ROLLBACK', afterRollback.rows[0].val === '999',
      `Después de ROLLBACK: "${afterRollback.rows[0].val}" (debería ser 999)`);

    // ─── TEST 5: Simular operación con auditoría ───
    console.log('\n5. Simulando operación con auditoría...');
    
    // Contar audit_logs antes
    const countBefore = await client.query('SELECT COUNT(*) as cnt FROM audit_logs');
    const beforeCount = parseInt(countBefore.rows[0].cnt);
    
    // Establecer usuario de prueba
    await client.query('SET app.current_user_id = 1');
    
    // Obtener un usuario existente para la operación
    const userCheck = await client.query('SELECT id FROM users LIMIT 1');
    if (userCheck.rows.length === 0) {
      log('Hay usuarios en la BD', false, 'No hay usuarios para probar');
    } else {
      log('Hay usuarios en la BD', true, `ID: ${userCheck.rows[0].id}`);
      
      // Obtener un producto existente para UPDATE
      const productCheck = await client.query('SELECT id, product_name FROM products LIMIT 1');
      
      if (productCheck.rows.length > 0) {
        const productId = productCheck.rows[0].id;
        const originalName = productCheck.rows[0].product_name;
        
        // INSERT en products (si tiene trigger)
        await client.query('BEGIN');
        await client.query('SET app.current_user_id = 1');
        await client.query(
          "INSERT INTO products (product_name, price, stock) VALUES ('TEST_AUDIT_PRODUCT', 999, 0) RETURNING id"
        );
        await client.query('COMMIT');
        
        // Verificar que se registró
        const insertLog = await client.query(
          "SELECT * FROM audit_logs WHERE table_name = 'products' AND action_type = 'INSERT' ORDER BY id DESC LIMIT 1"
        );
        log('INSERT en products registra en audit_logs', insertLog.rows.length > 0,
          insertLog.rows.length > 0 ? `ID: ${insertLog.rows[0].record_id}, user_id: ${insertLog.rows[0].user_id}` : 'No se registró');
        
        // UPDATE en products
        const newProduct = insertLog.rows[0]?.record_id;
        if (newProduct) {
          await client.query('BEGIN');
          await client.query('SET app.current_user_id = 1');
          await client.query("UPDATE products SET product_name = 'TEST_AUDIT_UPDATED' WHERE id = $1", [newProduct]);
          await client.query('COMMIT');
          
          const updateLog = await client.query(
            "SELECT * FROM audit_logs WHERE table_name = 'products' AND action_type = 'UPDATE' AND record_id = $1 ORDER BY id DESC LIMIT 1",
            [newProduct]
          );
          log('UPDATE en products registra en audit_logs', updateLog.rows.length > 0,
            updateLog.rows.length > 0 ? `old_value tiene datos: ${!!updateLog.rows[0].old_value}` : 'No se registró');
          
          // DELETE en products (limpiar registro de prueba)
          await client.query('BEGIN');
          await client.query('SET app.current_user_id = 1');
          await client.query('DELETE FROM products WHERE id = $1', [newProduct]);
          await client.query('COMMIT');
          
          const deleteLog = await client.query(
            "SELECT * FROM audit_logs WHERE table_name = 'products' AND action_type = 'DELETE' AND record_id = $1 ORDER BY id DESC LIMIT 1",
            [newProduct]
          );
          log('DELETE en products registra en audit_logs', deleteLog.rows.length > 0,
            deleteLog.rows.length > 0 ? `old_value tiene datos: ${!!deleteLog.rows[0].old_value}` : 'No se registró');
        }
      } else {
        log('SKIP: No hay productos para probar', true, 'Insertar productos primero');
      }
    }

    // ─── TEST 6: Verificar datos en audit_logs ───
    console.log('\n6. Estado actual de audit_logs...');
    const totalCount = await client.query('SELECT COUNT(*) as cnt FROM audit_logs');
    const recentLogs = await client.query(`
      SELECT id, action_type, table_name, record_id, user_id, 
             TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as fecha
      FROM audit_logs 
      ORDER BY id DESC 
      LIMIT 5
    `);
    
    log(`Total registros en audit_logs: ${totalCount.rows[0].cnt}`, parseInt(totalCount.rows[0].cnt) > 0);
    
    if (recentLogs.rows.length > 0) {
      console.log('\n  Últimos 5 registros de auditoría:');
      for (const row of recentLogs.rows) {
        console.log(`    [${row.fecha}] ${row.action_type} en ${row.table_name} (record_id: ${row.record_id}, user_id: ${row.user_id})`);
      }
    } else {
      console.log('\n  ⚠️  No hay registros en audit_logs. Los triggers probablemente no están creados.');
      console.log('  Ejecuta el script SQL primero:');
      console.log('  psql "DATABASE_URL" -f scripts/activate_audit_triggers.sql');
    }

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
    
    console.log('\n═══════════════════════════════════════════');
    console.log(`  RESULTADO: ${passed} passed, ${failed} failed`);
    console.log('═══════════════════════════════════════════\n');
    
    if (failed > 0) {
      console.log('  ⚠️  Algunas pruebas fallaron. Revisar los mensajes arriba.');
      console.log('  Si los triggers no existen, ejecuta:');
      console.log('  psql "DATABASE_URL" -f scripts/activate_audit_triggers.sql\n');
    }
  }
}

runTests();
