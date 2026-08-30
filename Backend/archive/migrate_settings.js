require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const migrateSettings = async () => {
  const client = await pool.connect();
  try {
    console.log('Iniciando migración de configuraciones de empresa...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS business_settings (
        id SERIAL PRIMARY KEY,
        business_name VARCHAR(255) NOT NULL,
        legal_id VARCHAR(100),
        address TEXT,
        phone VARCHAR(100),
        email VARCHAR(150),
        invoice_footer_message TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla business_settings creada exitosamente.');

    const checkRes = await client.query('SELECT COUNT(*) FROM business_settings');
    if (parseInt(checkRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO business_settings 
        (business_name, legal_id, address, phone, email, invoice_footer_message)
        VALUES 
        ('Dashboard Deportivo', 'J-12345678-9', 'Av. Principal, Ciudad, País', '+58 000-0000000', 'contacto@dashboard.com', '¡Gracias por su preferencia! Vuelva pronto.')
      `);
      console.log('Configuración por defecto insertada exitosamente.');
    } else {
      console.log('La tabla de configuración ya contiene datos.');
    }

    console.log('Migración de configuraciones completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración de configuraciones:', error);
  } finally {
    client.release();
    pool.end();
    process.exit(0);
  }
};

migrateSettings();
