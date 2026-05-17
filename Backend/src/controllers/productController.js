// src/controllers/productController.js
const pool = require('../config/database');

const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, product_name, price, stock
      FROM products
      ORDER BY id
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { product_name, price, stock } = req.body;
    if (!product_name || price === undefined) {
      return res.status(400).json({ error: 'Nombre y precio requeridos' });
    }
    const result = await pool.query(
      'INSERT INTO products (product_name, price, stock) VALUES ($1, $2, $3) RETURNING *',
      [product_name, price, stock || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, price, stock } = req.body;
    const result = await pool.query(
      `UPDATE products 
       SET product_name = COALESCE($1, product_name),
           price = COALESCE($2, price),
           stock = COALESCE($3, stock)
       WHERE id = $4 RETURNING *`,
      [product_name, price, stock, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const result = await pool.query(
      'UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar stock' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock
};