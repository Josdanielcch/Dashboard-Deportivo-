const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    const result = await pool.query(`
      SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status, b.customer_id,
             c.first_name || ' ' || c.last_name as customer_name, c.phone, 
             co.court_name, co.hourly_rate,
             u.username as created_by
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN courts co ON b.court_id = co.id
      LEFT JOIN users u ON b.user_id = u.id
      ORDER BY b.booking_date DESC, b.start_time
      LIMIT 10
    `);
    console.log(result.rows);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    pool.end();
  }
}

test();
