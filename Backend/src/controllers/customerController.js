// src/controllers/customerController.js
const pool = require('../config/database');

// Obtener todos los clientes
const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, full_name, phone, email, 
             COALESCE(outstanding_balance, 0) as outstanding_balance,
             tax_id
      FROM customers 
      ORDER BY id
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Obtener cliente por ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM bookings WHERE customer_id = c.id) as total_bookings,
        (SELECT SUM(b.total_amount) FROM billings b 
         JOIN bookings bk ON b.booking_id = bk.id 
         WHERE bk.customer_id = c.id) as total_spent
      FROM customers c WHERE c.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Buscar cliente por cédula (tax_id) o nombre
const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Término de búsqueda requerido' });
    
    const result = await pool.query(`
      SELECT id, full_name, phone, email, tax_id, outstanding_balance
      FROM customers 
      WHERE full_name ILIKE $1 OR tax_id ILIKE $1 OR phone ILIKE $1
      LIMIT 10
    `, [`%${q}%`]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error en búsqueda' });
  }
};

// Crear cliente
const createCustomer = async (req, res) => {
  try {
    const { full_name, phone, email, tax_id } = req.body;
    
    if (!full_name) {
      return res.status(400).json({ error: 'Nombre completo requerido' });
    }
    
    const result = await pool.query(`
      INSERT INTO customers (full_name, phone, email, tax_id, outstanding_balance)
      VALUES ($1, $2, $3, $4, 0)
      RETURNING *
    `, [full_name, phone, email, tax_id]);
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un cliente con esa cédula' });
    }
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// Actualizar cliente
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, tax_id } = req.body;
    
    const result = await pool.query(`
      UPDATE customers 
      SET full_name = COALESCE($1, full_name),
          phone = COALESCE($2, phone),
          email = COALESCE($3, email),
          tax_id = COALESCE($4, tax_id)
      WHERE id = $5
      RETURNING *
    `, [full_name, phone, email, tax_id, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
};

// Registrar pago de deuda (outstanding_balance)
const recordPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Monto de pago inválido' });
    }
    
    const result = await pool.query(`
      UPDATE customers 
      SET outstanding_balance = GREATEST(outstanding_balance - $1, 0)
      WHERE id = $2
      RETURNING id, full_name, outstanding_balance
    `, [amount, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Registrar en audit_logs (manual o con trigger)
    res.json({ 
      success: true, 
      message: 'Pago registrado',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar pago' });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  searchCustomers,
  createCustomer,
  updateCustomer,
  recordPayment
};