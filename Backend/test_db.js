require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function comprobarConexion() {
  try {
    const res = await pool.query('SELECT NOW(), current_database()');
    console.log('-----------------------------------------');
    console.log('✅ ¡CONEXIÓN EXITOSA!');
    console.log('Base de datos conectada:', res.rows[0].current_database);
    console.log('Hora del servidor:', res.rows[0].now);
    console.log('-----------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR DE CONEXIÓN:');
    console.error(err.message);
    process.exit(1);
  }
}

comprobarConexion();