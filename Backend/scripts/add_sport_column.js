const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("ALTER TABLE courts ADD COLUMN sport VARCHAR(100) DEFAULT 'Múltiple'").then(() => {
  console.log("Column added");
  pool.end();
}).catch(console.error);
