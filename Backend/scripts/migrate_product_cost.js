// scripts/migrate_product_cost.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../src/config/database');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('✅ Conectado a PostgreSQL para migración de costos y márgenes de productos');
    await client.query('BEGIN');

    // 1. Agregar cost_price a products si no existe
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00;
    `);
    console.log('✅ Columna cost_price verificada/agregada en tabla products.');

    // 2. Agregar cost_price_at_sale a sale_details si no existe
    await client.query(`
      ALTER TABLE sale_details 
      ADD COLUMN IF NOT EXISTS cost_price_at_sale NUMERIC(10,2) NOT NULL DEFAULT 0.00;
    `);
    console.log('✅ Columna cost_price_at_sale verificada/agregada en tabla sale_details.');

    // 3. Si hay compras previas en purchase_details, actualizar el cost_price más reciente de cada producto
    await client.query(`
      WITH latest_purchase AS (
        SELECT DISTINCT ON (product_id) product_id, unit_cost
        FROM purchase_details
        WHERE product_id IS NOT NULL AND unit_cost > 0
        ORDER BY product_id, id DESC
      )
      UPDATE products p
      SET cost_price = lp.unit_cost
      FROM latest_purchase lp
      WHERE p.id = lp.product_id AND p.cost_price = 0;
    `);

    // 4. Poblar ventas históricas con el costo del producto si cost_price_at_sale está en 0
    await client.query(`
      UPDATE sale_details sd
      SET cost_price_at_sale = p.cost_price
      FROM products p
      WHERE sd.products_id = p.id AND (sd.cost_price_at_sale IS NULL OR sd.cost_price_at_sale = 0);
    `);
    console.log('✅ Costos históricos inicializados.');

    await client.query('COMMIT');
    console.log('🎉 Migración completada con éxito.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
