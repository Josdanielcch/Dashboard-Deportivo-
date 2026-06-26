const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('1. Creando tabla sports...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sports (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('2. Insertando deportes por defecto...');
    await client.query(`
      INSERT INTO sports (name, image_url) VALUES 
      ('Pádel', '/images/sport-padel.jpg'),
      ('Tenis', '/images/sport-tenis.jpg'),
      ('Fútbol', '/images/sport-futbol.jpg'),
      ('Básquet', '/images/sport-basquet.jpg')
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('3. Modificando tabla courts...');
    // Drop existing sport string column if it exists
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courts' AND column_name='sport') THEN
          ALTER TABLE courts DROP COLUMN sport;
        END IF;
      END $$;
    `);

    // Add sport_id column
    await client.query(`
      ALTER TABLE courts ADD COLUMN IF NOT EXISTS sport_id INTEGER REFERENCES sports(id);
    `);

    // Asignar el deporte 'Pádel' (ID = 1 asumiendo la primera inserción) por defecto a las canchas existentes si tienen sport_id null
    await client.query(`
      UPDATE courts SET sport_id = (SELECT id FROM sports WHERE name = 'Pádel' LIMIT 1) WHERE sport_id IS NULL;
    `);

    await client.query('COMMIT');
    console.log('¡Migración de deportes completada con éxito!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la migración:', error);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
