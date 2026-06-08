require('dotenv').config();
const pool = require('./src/config/database');

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log('Users columns:', res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
checkColumns();
