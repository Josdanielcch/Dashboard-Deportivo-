const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Modificando tabla customers...');
    // Renombrar y añadir columna
    await client.query('ALTER TABLE customers RENAME COLUMN full_name TO first_name;');
    await client.query('ALTER TABLE customers ADD COLUMN last_name VARCHAR(100);');
    // Separar datos existentes
    await client.query(`
      UPDATE customers 
      SET 
        first_name = split_part(first_name, ' ', 1),
        last_name = substring(first_name from position(' ' in first_name) + 1)
      WHERE position(' ' in first_name) > 0;
    `);

    console.log('2. Modificando tabla users...');
    // Renombrar y añadir columna
    await client.query('ALTER TABLE users RENAME COLUMN full_name TO first_name;');
    await client.query('ALTER TABLE users ADD COLUMN last_name VARCHAR(100);');
    // Separar datos existentes
    await client.query(`
      UPDATE users 
      SET 
        first_name = split_part(first_name, ' ', 1),
        last_name = substring(first_name from position(' ' in first_name) + 1)
      WHERE position(' ' in first_name) > 0;
    `);

    console.log('3. Modificando tabla billings (Agregando customer_id y user_id)...');
    await client.query('ALTER TABLE billings ADD COLUMN customer_id INTEGER REFERENCES customers(id);');
    await client.query('ALTER TABLE billings ADD COLUMN user_id INTEGER REFERENCES users(id);');

    console.log('4. Modificando tabla courts (Agregando hourly_rate)...');
    await client.query('ALTER TABLE courts ADD COLUMN hourly_rate NUMERIC(10,2) DEFAULT 0;');

    await client.query('COMMIT');
    console.log('¡Migración completada con éxito!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
