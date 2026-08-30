const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateSportsImages() {
  const client = await pool.connect();
  try {
    const updates = [
      { name: 'Pádel', img: '/images/sport-padel.jpg' },
      { name: 'Tenis', img: '/images/sport-tenis.jpg' },
      { name: 'Fútbol', img: '/images/sport-futbol.jpg' },
      { name: 'Básquet', img: '/images/sport-basquet.jpg' },
    ];

    for (let s of updates) {
      await client.query('UPDATE sports SET image_url = $1 WHERE name = $2', [s.img, s.name]);
    }
    console.log('Successfully updated sports images to local paths.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating sports images:', error);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

updateSportsImages();
