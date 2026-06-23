const pool = require('../config/database');

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
    const { business_name, legal_id, address, phone, email, invoice_footer_message } = req.body;

    if (!business_name) {
      return res.status(400).json({ success: false, error: 'El nombre del negocio es obligatorio' });
    }

    const result = await pool.query(`
      UPDATE business_settings 
      SET business_name = $1, 
          legal_id = $2, 
          address = $3, 
          phone = $4, 
          email = $5, 
          invoice_footer_message = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = (SELECT id FROM business_settings ORDER BY id ASC LIMIT 1)
      RETURNING *
    `, [business_name, legal_id, address, phone, email, invoice_footer_message]);

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
