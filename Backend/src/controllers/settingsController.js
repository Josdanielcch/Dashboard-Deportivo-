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

const getSettings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM business_settings ORDER BY id ASC LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Configuración no encontrada' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    res.status(500).json({ success: false, error: 'Error del servidor al obtener configuraciones' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { 
      business_name, legal_id, address, phone, email, invoice_footer_message,
      tax_rate, timezone, default_currency, logo_url, primary_color, secondary_color,
      terms_and_conditions, privacy_policy
    } = req.body;

    if (!business_name) {
      return res.status(400).json({ success: false, error: 'El nombre del negocio es obligatorio' });
    }

    const result = await withAuditContext(req, async (client) => {
      return client.query(`
        UPDATE business_settings 
        SET business_name = COALESCE($1, business_name), 
            legal_id = COALESCE($2, legal_id), 
            address = COALESCE($3, address), 
            phone = COALESCE($4, phone), 
            email = COALESCE($5, email), 
            invoice_footer_message = COALESCE($6, invoice_footer_message),
            tax_rate = COALESCE($7, tax_rate),
            timezone = COALESCE($8, timezone),
            default_currency = COALESCE($9, default_currency),
            logo_url = COALESCE($10, logo_url),
            primary_color = COALESCE($11, primary_color),
            secondary_color = COALESCE($12, secondary_color),
            terms_and_conditions = COALESCE($13, terms_and_conditions),
            privacy_policy = COALESCE($14, privacy_policy),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = (SELECT id FROM business_settings ORDER BY id ASC LIMIT 1)
        RETURNING *
      `, [
        business_name, legal_id, address, phone, email, invoice_footer_message,
        tax_rate !== undefined ? tax_rate : null,
        timezone || null,
        default_currency || null,
        logo_url || null,
        primary_color || null,
        secondary_color || null,
        terms_and_conditions || null,
        privacy_policy || null
      ]);
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Configuración no encontrada' });
    }

    res.json({ success: true, message: 'Configuraciones actualizadas con éxito', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    res.status(500).json({ success: false, error: 'Error del servidor al actualizar configuraciones' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
