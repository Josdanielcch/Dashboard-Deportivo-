require('dotenv').config();
const pool = require('./src/config/database');

async function migrate() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);');
    console.log('Migración completada: Columna avatar_url añadida exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

migrate();
