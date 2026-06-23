require('dotenv').config();
const pool = require('./src/config/database');

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('reset_token', 'reset_token_expires');
    `);
    console.log('Columns found:', res.rows.map(r => r.column_name));
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
}
checkColumns();
