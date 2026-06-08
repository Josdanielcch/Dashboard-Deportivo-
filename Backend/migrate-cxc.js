require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    await pool.query('BEGIN');
    
    console.log("Creando tabla accounts_receivable...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts_receivable (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        billing_id INTEGER REFERENCES billings(id),
        booking_id INTEGER REFERENCES bookings(id),
        total_amount DECIMAL(10,2) NOT NULL,
        balance DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pendiente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creando tabla receivable_payments...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS receivable_payments (
        id SERIAL PRIMARY KEY,
        account_receivable_id INTEGER NOT NULL REFERENCES accounts_receivable(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Verificando método de pago Crédito...");
    const checkCredit = await pool.query("SELECT id FROM payment_methods WHERE method_name = 'Crédito'");
    if (checkCredit.rows.length === 0) {
      await pool.query("INSERT INTO payment_methods (method_name) VALUES ('Crédito')");
      console.log("Método 'Crédito' insertado.");
    } else {
      console.log("El método 'Crédito' ya existe.");
    }

    await pool.query('COMMIT');
    console.log("Migración completada con éxito!");
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Error en migración:", error);
  } finally {
    pool.end();
  }
}

migrate();
