const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Creando tabla suppliers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        contact_name VARCHAR(150),
        phone VARCHAR(50),
        email VARCHAR(100),
        address TEXT,
        tax_id VARCHAR(50),
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('2. Creando tabla purchases...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchases (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id),
        user_id INTEGER REFERENCES users(id),
        invoice_number VARCHAR(100),
        payment_method_id INTEGER REFERENCES payment_methods(id),
        purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Completed',
        notes TEXT
      );
    `);

    console.log('3. Creando tabla purchase_details...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_details (
        id SERIAL PRIMARY KEY,
        purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        description VARCHAR(255),
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
        subtotal NUMERIC(12,2) NOT NULL DEFAULT 0
      );
    `);

    console.log('4. Creando tabla accounts_payable...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS accounts_payable (
        id SERIAL PRIMARY KEY,
        supplier_id INTEGER REFERENCES suppliers(id),
        purchase_id INTEGER REFERENCES purchases(id),
        total_amount NUMERIC(12,2) NOT NULL,
        balance NUMERIC(12,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pendiente',
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('5. Creando tabla payable_payments...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS payable_payments (
        id SERIAL PRIMARY KEY,
        account_payable_id INTEGER REFERENCES accounts_payable(id) ON DELETE CASCADE,
        amount NUMERIC(12,2) NOT NULL,
        payment_method_id INTEGER REFERENCES payment_methods(id),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id),
        notes TEXT
      );
    `);

    await client.query('COMMIT');
    console.log('¡Migración de Compras y CxP completada con éxito!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
