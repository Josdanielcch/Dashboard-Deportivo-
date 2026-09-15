// src/config/database.js
const { Pool } = require('pg');

let pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false }
  });
}

pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Error conectando a PostgreSQL:', err.stack);
  } else {
    console.log('✅ Conectado a PostgreSQL (Neon.tech)');
    try {
      await client.query(`
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS membership_level VARCHAR(20) DEFAULT 'standard';
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS membership_status VARCHAR(20) DEFAULT 'active';
        ALTER TABLE customers ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(100);
      `);
      console.log('✅ Migración de columnas de membresía en customers verificada.');
    } catch (migErr) {
      console.error('⚠️ Error verificando migración de columnas:', migErr.message);
    } finally {
      release();
    }
  }
});

module.exports = pool;