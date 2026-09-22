// src/controllers/exchangeRateController.js
const pool = require('../config/database');

// Helper: ejecutar query dentro de una transacción con contexto de auditoría si está disponible
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
 * Obtener todas las tasas de cambio (público)
 */
const getExchangeRates = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, currency_code, currency_name, symbol, rate_to_usd, is_active, updated_at
      FROM exchange_rates
      ORDER BY id ASC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error('Error al obtener tasas de cambio:', error);
    res.status(500).json({ error: 'Error del servidor al obtener tasas de cambio' });
  }
};

/**
 * Actualizar una tasa de cambio específica (Admin)
 */
const updateExchangeRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { rate_to_usd, is_active } = req.body;

    if (rate_to_usd === undefined || isNaN(parseFloat(rate_to_usd)) || parseFloat(rate_to_usd) <= 0) {
      return res.status(400).json({ error: 'La tasa debe ser un número positivo válido' });
    }

    const result = await withAuditContext(req, async (client) => {
      return client.query(`
        UPDATE exchange_rates
        SET rate_to_usd = $1,
            is_active = COALESCE($2, is_active),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `, [parseFloat(rate_to_usd), is_active, id]);
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tasa de cambio no encontrada' });
    }

    res.json({ success: true, message: 'Tasa de cambio actualizada correctamente', data: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar tasa de cambio:', error);
    res.status(500).json({ error: 'Error del servidor al actualizar tasa de cambio' });
  }
};

/**
 * Actualización masiva de tasas de cambio (Admin)
 * Body esperado: { rates: [ { currency_code: 'VES', rate_to_usd: 72.5 }, { currency_code: 'COP', rate_to_usd: 4250 } ] }
 */
const bulkUpdateExchangeRates = async (req, res) => {
  try {
    const { rates } = req.body;
    if (!Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({ error: 'Se esperaba un arreglo de tasas' });
    }

    const updatedRates = await withAuditContext(req, async (client) => {
      const results = [];
      for (const item of rates) {
        if (!item.currency_code || isNaN(parseFloat(item.rate_to_usd))) continue;
        const resItem = await client.query(`
          UPDATE exchange_rates
          SET rate_to_usd = $1,
              is_active = COALESCE($2, is_active),
              updated_at = CURRENT_TIMESTAMP
          WHERE currency_code = $3
          RETURNING *
        `, [parseFloat(item.rate_to_usd), item.is_active, item.currency_code]);
        if (resItem.rows.length > 0) results.push(resItem.rows[0]);
      }
      return results;
    });

    res.json({ success: true, message: 'Tasas actualizadas exitosamente', data: updatedRates });
  } catch (error) {
    console.error('Error al actualizar tasas en lote:', error);
    res.status(500).json({ error: 'Error al actualizar tasas' });
  }
};

module.exports = {
  getExchangeRates,
  updateExchangeRate,
  bulkUpdateExchangeRates
};
