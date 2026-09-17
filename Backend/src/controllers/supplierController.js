const pool = require('../config/database');

// Helper: ejecutar query dentro de una transacción con contexto de auditoría
const withAuditContext = async (req, queryFn) => {
  const client = req.dbClient || await pool.connect();
  const releaseClient = !req.dbClient;
  try {
    if (!req.dbClient) await client.query('BEGIN');
    const result = await queryFn(client);
    if (!req.dbClient) await client.query('COMMIT');
    return result;
  } catch (error) {
    if (!req.dbClient) await client.query('ROLLBACK');
    throw error;
  } finally {
    if (releaseClient) client.release();
  }
};

const getAllSuppliers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY id DESC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedores' });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proveedor' });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, contact_name, phone, email, address, tax_id } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre de la empresa es requerido' });

    const result = await withAuditContext(req, async (client) => {
      return client.query(`
        INSERT INTO suppliers (name, contact_name, phone, email, address, tax_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [name, contact_name, phone, email, address, tax_id]);
    });
    
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear proveedor' });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_name, phone, email, address, tax_id, status } = req.body;
    
    const result = await withAuditContext(req, async (client) => {
      return client.query(`
        UPDATE suppliers
        SET name = COALESCE($1, name),
            contact_name = COALESCE($2, contact_name),
            phone = COALESCE($3, phone),
            email = COALESCE($4, email),
            address = COALESCE($5, address),
            tax_id = COALESCE($6, tax_id),
            status = COALESCE($7, status)
        WHERE id = $8
        RETURNING *
      `, [name, contact_name, phone, email, address, tax_id, status, id]);
    });

    if (result.rows.length === 0) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proveedor' });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier
};
