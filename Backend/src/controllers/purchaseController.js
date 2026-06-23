const pool = require('../config/database');

const createPurchase = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { supplier_id, user_id, invoice_number, payment_method_id, products, notes } = req.body;

    if (!supplier_id || !user_id) {
      return res.status(400).json({ error: 'Faltan datos de la compra' });
    }

    let total_amount = 0;
    if (products && products.length > 0) {
      total_amount = products.reduce((acc, p) => acc + (p.quantity * p.unit_cost), 0);
    }

    const purchaseResult = await client.query(`
      INSERT INTO purchases (supplier_id, user_id, invoice_number, payment_method_id, total_amount, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [supplier_id, user_id, invoice_number, payment_method_id, total_amount, notes]);
    
    const purchaseId = purchaseResult.rows[0].id;

    if (products && products.length > 0) {
      for (const item of products) {
        const subtotal = item.quantity * item.unit_cost;
        await client.query(`
          INSERT INTO purchase_details (purchase_id, product_id, description, quantity, unit_cost, subtotal)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [purchaseId, item.product_id || null, item.description, item.quantity, item.unit_cost, subtotal]);

        if (item.product_id) {
          await client.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
        }
      }
    }

    if (payment_method_id) {
      const pmResult = await client.query('SELECT method_name FROM payment_methods WHERE id = $1', [payment_method_id]);
      const isCredit = pmResult.rows.length > 0 && pmResult.rows[0].method_name === 'Crédito';

      if (isCredit) {
        await client.query(`
          INSERT INTO accounts_payable (supplier_id, purchase_id, total_amount, balance, status)
          VALUES ($1, $2, $3, $4, 'Pendiente')
        `, [supplier_id, purchaseId, total_amount, total_amount]);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, data: purchaseResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Error al registrar compra' });
  } finally {
    client.release();
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.name as supplier_name, pm.method_name, u.first_name || ' ' || COALESCE(u.last_name, '') as user_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.purchase_date DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compras' });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchaseResult = await pool.query(`
      SELECT p.*, s.name as supplier_name, pm.method_name
      FROM purchases p
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN payment_methods pm ON p.payment_method_id = pm.id
      WHERE p.id = $1
    `, [id]);
    
    if (purchaseResult.rows.length === 0) return res.status(404).json({ error: 'Compra no encontrada' });
    
    const detailsResult = await pool.query(`
      SELECT pd.*, pr.product_name 
      FROM purchase_details pd
      LEFT JOIN products pr ON pd.product_id = pr.id
      WHERE pd.purchase_id = $1
    `, [id]);
    
    res.json({ success: true, data: { purchase: purchaseResult.rows[0], details: detailsResult.rows } });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener compra' });
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById
};
