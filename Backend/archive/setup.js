const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    await pool.query("UPDATE bookings SET status='Pending' WHERE id=30");
    await pool.query("UPDATE courts SET hourly_rate=20.00 WHERE id=7");
    console.log('Updated booking 30 to Pending and Court 7 to 20.00/hr');
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
