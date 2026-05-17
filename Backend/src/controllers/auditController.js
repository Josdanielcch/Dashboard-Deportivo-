// src/controllers/auditController.js
const pool = require('../config/database');

const getAuditLogs = async (req, res) => {
  try {
    const { table_name, user_id, limit = 100, offset = 0 } = req.query;
    
    let query = `
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (table_name) {
      params.push(table_name);
      query += ` AND al.table_name = $${params.length}`;
    }
    if (user_id) {
      params.push(user_id);
      query += ` AND al.user_id = $${params.length}`;
    }
    
    query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener logs' });
  }
};

const getAuditByRecord = async (req, res) => {
  try {
    const { table_name, record_id } = req.params;
    const result = await pool.query(`
      SELECT al.*, u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.table_name = $1 AND al.record_id = $2
      ORDER BY al.created_at DESC
    `, [table_name, record_id]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

module.exports = {
  getAuditLogs,
  getAuditByRecord
};