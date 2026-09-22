// scripts/migrate_multicurrency.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../src/config/database');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('✅ Conectado a PostgreSQL para migración multimoneda');

    await client.query('BEGIN');

    // 1. Tabla exchange_rates
    await client.query(`
      CREATE TABLE IF NOT EXISTS exchange_rates (
        id SERIAL PRIMARY KEY,
        currency_code VARCHAR(10) UNIQUE NOT NULL,
        currency_name VARCHAR(50) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        rate_to_usd NUMERIC(14, 4) NOT NULL DEFAULT 1.0,
        is_active BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar tasas iniciales si no existen
    await client.query(`
      INSERT INTO exchange_rates (currency_code, currency_name, symbol, rate_to_usd, is_active)
      VALUES 
        ('VES', 'Bolívares (VES)', 'Bs.', 70.50, true),
        ('COP', 'Pesos Colombianos (COP)', '$ COP', 4200.00, true)
      ON CONFLICT (currency_code) DO NOTHING;
    `);
    console.log('✅ Tabla exchange_rates creada y sembrada.');

    // 2. Tabla payment_accounts (Cuentas y Métodos de cobro multimoneda para reservas y web)
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_accounts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(30) NOT NULL,
        currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
        bank_name VARCHAR(100),
        account_number VARCHAR(50),
        account_holder VARCHAR(100),
        id_document VARCHAR(50),
        phone VARCHAR(30),
        email VARCHAR(100),
        instructions TEXT,
        is_active BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insertar cuentas/métodos iniciales si está vacía
    const countRes = await client.query('SELECT COUNT(*) FROM payment_accounts');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO payment_accounts 
          (name, type, currency_code, bank_name, account_number, account_holder, id_document, phone, email, instructions, is_active, display_order)
        VALUES 
          ('Pago Móvil Banco de Venezuela', 'pago_movil', 'VES', 'Banco de Venezuela (0102)', NULL, 'CourtConnect Sports C.A.', 'J-50123456-9', '0412-3129425', NULL, 'Realizar pago al cambio del día según tasa BCV y registrar los últimos dígitos del comprobante.', true, 1),
          ('Zelle Corporativo', 'zelle', 'USD', NULL, NULL, 'CourtConnect Sports LLC', NULL, NULL, 'pagos@courtconnect.com', 'Colocar en el concepto tu nombre completo y número de reserva.', true, 2),
          ('Transferencia Bancolombia / Nequi', 'transfer_cop', 'COP', 'Bancolombia', 'Ahorros 123-456789-01', 'CourtConnect Colombia SAS', 'NIT: 901.234.567-8', '310-9876543', 'pagos.co@courtconnect.com', 'Transferencia directa o vía Nequi/PSE al número indicado.', true, 3),
          ('Efectivo en Taquilla', 'cash', 'USD', NULL, NULL, NULL, NULL, NULL, NULL, 'Cancela directamente en la recepción del complejo antes del inicio de tu turno.', true, 4)
      `);
      console.log('✅ Cuentas de pago por defecto creadas en payment_accounts.');
    }

    // 3. Columnas multimoneda en bookings
    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS currency_code VARCHAR(10) DEFAULT 'USD';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(14, 4);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS amount_in_currency NUMERIC(14, 2);
    `);
    console.log('✅ Columnas multimoneda en bookings verificadas.');

    // 4. Columnas multimoneda en customers (para membresía)
    await client.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS membership_currency VARCHAR(10) DEFAULT 'USD';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS membership_amount_in_currency NUMERIC(14, 2);
    `);
    console.log('✅ Columnas multimoneda en customers verificadas.');

    await client.query('COMMIT');
    console.log('🎉 Migración multimoneda completada con éxito.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error en migración:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
