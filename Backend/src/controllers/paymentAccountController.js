// src/controllers/paymentAccountController.js
const pool = require('../config/database');

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

/**
 * Obtener métodos de pago activos (público para Website y reservas)
 */
const getPublicPaymentAccounts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, type, currency_code, bank_name, account_number, account_holder,
             id_document, phone, email, instructions, display_order
      FROM payment_accounts
      WHERE is_active = true
      ORDER BY display_order ASC, id ASC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error al obtener métodos de pago públicos:', error);
    res.status(500).json({ error: 'Error al obtener métodos de pago' });
  }
};

/**
 * Obtener todos los métodos de pago (Admin: incluye inactivos)
 */
const getAllPaymentAccounts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM payment_accounts
      ORDER BY display_order ASC, id ASC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error al obtener métodos de pago administrativos:', error);
    res.status(500).json({ error: 'Error del servidor al obtener métodos de pago' });
  }
};

/**
 * Crear nuevo método de pago (Admin)
 */
const createPaymentAccount = async (req, res) => {
  try {
    const {
      name,
      type,
      currency_code,
      bank_name,
      account_number,
      account_holder,
      id_document,
      phone,
      email,
      instructions,
      is_active,
      display_order
    } = req.body;

    if (!name || !type || !currency_code) {
      return res.status(400).json({ error: 'Nombre, tipo y código de moneda son obligatorios' });
    }

    const result = await withAuditContext(req, async (client) => {
      return client.query(`
        INSERT INTO payment_accounts 
          (name, type, currency_code, bank_name, account_number, account_holder, id_document, phone, email, instructions, is_active, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, true), COALESCE($12, 0))
        RETURNING *
      `, [
        name,
        type,
        currency_code.toUpperCase(),
        bank_name || null,
        account_number || null,
        account_holder || null,
        id_document || null,
        phone || null,
        email || null,
        instructions || null,
        is_active,
        display_order
      ]);
    });

    res.status(201).json({
      success: true,
      message: 'Método de pago creado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    res.status(500).json({ error: 'Error al crear método de pago' });
  }
};

/**
 * Actualizar método de pago existente (Admin)
 */
const updatePaymentAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      currency_code,
      bank_name,
      account_number,
      account_holder,
      id_document,
      phone,
      email,
      instructions,
      is_active,
      display_order
    } = req.body;

    const result = await withAuditContext(req, async (client) => {
      return client.query(`
        UPDATE payment_accounts
        SET name = COALESCE($1, name),
            type = COALESCE($2, type),
            currency_code = COALESCE($3, currency_code),
            bank_name = $4,
            account_number = $5,
            account_holder = $6,
            id_document = $7,
            phone = $8,
            email = $9,
            instructions = $10,
            is_active = COALESCE($11, is_active),
            display_order = COALESCE($12, display_order),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $13
        RETURNING *
      `, [
        name,
        type,
        currency_code ? currency_code.toUpperCase() : null,
        bank_name !== undefined ? bank_name : null,
        account_number !== undefined ? account_number : null,
        account_holder !== undefined ? account_holder : null,
        id_document !== undefined ? id_document : null,
        phone !== undefined ? phone : null,
        email !== undefined ? email : null,
        instructions !== undefined ? instructions : null,
        is_active,
        display_order,
        id
      ]);
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    res.json({
      success: true,
      message: 'Método de pago actualizado exitosamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    res.status(500).json({ error: 'Error al actualizar método de pago' });
  }
};

/**
 * Alternar estado activo/inactivo (Admin)
 */
const togglePaymentAccountStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await withAuditContext(req, async (client) => {
      return client.query(`
        UPDATE payment_accounts
        SET is_active = NOT is_active,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id]);
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    res.json({
      success: true,
      message: `Método de pago ${result.rows[0].is_active ? 'activado' : 'desactivado'} correctamente`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al alternar estado del método de pago:', error);
    res.status(500).json({ error: 'Error al modificar estado' });
  }
};

/**
 * Eliminar método de pago (Admin)
 */
const deletePaymentAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await withAuditContext(req, async (client) => {
      return client.query('DELETE FROM payment_accounts WHERE id = $1 RETURNING id', [id]);
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }

    res.json({ success: true, message: 'Método de pago eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).json({ error: 'Error al eliminar método de pago' });
  }
};

module.exports = {
  getPublicPaymentAccounts,
  getAllPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  togglePaymentAccountStatus,
  deletePaymentAccount
};
