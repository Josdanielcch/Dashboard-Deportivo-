// scripts/migrate.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../src/config/database');

async function migrate() {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL para migraciones');

    await client.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS membership_level VARCHAR(20) DEFAULT 'standard';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS membership_status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
    `);
    console.log('✅ Migración de columnas de membresía en customers verificada.');

    await client.query(`
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);
    `);
    console.log('✅ Migración de columnas de pago en bookings verificada.');

    client.release();
    console.log('✅ Migraciones completadas');
  } catch (err) {
    console.error('⚠️ Error en migraciones:', err.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

migrate();
