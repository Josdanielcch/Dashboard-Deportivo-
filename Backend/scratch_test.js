require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateEnum() {
  const client = await pool.connect();
  try {
    await client.query("ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'Confirmed';");
    await client.query("ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'Completed';");
    console.log("Enum updated successfully");
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    client.release();
    pool.end();
  }
}
migrateEnum();
