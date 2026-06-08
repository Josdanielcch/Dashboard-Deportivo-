const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Añadiendo columnas de autenticación a la tabla customers...');
    await client.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
    `);

    console.log('2. Migrando contraseñas existentes de clients (role_id = 10) desde users a customers...');
    // We update customers using their email (or phone, but email is safer) matched against users
    await client.query(`
      UPDATE customers c
      SET password_hash = u.password_hash
      FROM users u
      WHERE c.email = u.email AND u.role_id = 10 AND u.password_hash IS NOT NULL;
    `);

    console.log('3. Limpiando usuarios clientes (role_id = 10) de la tabla users...');
    // Only delete from users if role_id is 10 (Client).
    await client.query(`
      DELETE FROM users WHERE role_id = 10;
    `);

    await client.query('COMMIT');
    console.log('¡Migración de auth de clientes completada con éxito!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
