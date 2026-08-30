const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    console.log('Testing queries...');
    
    console.log('1. Reservas Hoy');
    const today = new Date().toISOString().split('T')[0];
    const r1 = await pool.query(`SELECT COUNT(*) as count FROM bookings WHERE booking_date = $1 AND status != 'Cancelled'`, [today]);
    console.log('Reservas Hoy:', r1.rows[0].count);

    console.log('2. Ingresos Totales');
    const r2 = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) as total FROM billings`);
    console.log('Ingresos Totales:', r2.rows[0].total);

    console.log('3. Clientes Activos');
    const r3 = await pool.query(`SELECT COUNT(*) as count FROM customers`);
    console.log('Clientes Activos:', r3.rows[0].count);

    console.log('4. Ocupacion');
    const r4 = await pool.query(`SELECT COUNT(*) as count FROM courts WHERE status = 'Available'`);
    console.log('Canchas Available:', r4.rows[0].count);

    console.log('5. Sports Distribution');
    const r5 = await pool.query(`
      SELECT c.court_name, COUNT(b.id) as count
      FROM bookings b
      JOIN courts c ON b.court_id = c.id
      WHERE b.status != 'Cancelled'
      GROUP BY c.court_name
    `);
    console.log('Sports Distribution:', r5.rows);

    console.log('6. Weekly Income');
    const r6 = await pool.query(`
      SELECT DATE(payment_date) as date, SUM(total_amount) as total
      FROM billings
      WHERE payment_date >= current_date - interval '7 days'
      GROUP BY DATE(payment_date)
      ORDER BY DATE(payment_date) ASC
    `);
    console.log('Weekly Income:', r6.rows);

    console.log('7. Recent Bookings');
    const r7 = await pool.query(`
      SELECT b.id, c.first_name || ' ' || COALESCE(c.last_name, '') as customer_name, co.court_name, b.start_time, b.status
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN courts co ON b.court_id = co.id
      ORDER BY b.id DESC
      LIMIT 5
    `);
    console.log('Recent Bookings:', r7.rows);

    console.log('All queries succeeded!');
  } catch (error) {
    console.error('Error in query:', error);
  } finally {
    pool.end();
  }
}

test();
