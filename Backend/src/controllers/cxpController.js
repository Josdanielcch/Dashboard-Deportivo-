const pool = require('../config/database');

const getAllCxp = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cxp.*, s.name as supplier_name, p.invoice_number, p.purchase_date,
             (
                SELECT COALESCE(json_agg(
                    json_build_object(
                        'id', pp.id, 
                        'amount', pp.amount, 
                        'payment_date', pp.payment_date, 
                        'method_name', pm.method_name
                    )
                ), '[]'::json)
                FROM payable_payments pp
                LEFT JOIN payment_methods pm ON pp.payment_method_id = pm.id
                WHERE pp.account_payable_id = cxp.id
             ) as payments
      FROM accounts_payable cxp
      JOIN suppliers s ON cxp.supplier_id = s.id
      LEFT JOIN purchases p ON cxp.purchase_id = p.id
      ORDER BY cxp.created_at DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener cuentas por pagar' });
  }
};

const getCxpById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT cxp.*, s.name as supplier_name, p.invoice_number
      FROM accounts_payable cxp
      JOIN suppliers s ON cxp.supplier_id = s.id
      LEFT JOIN purchases p ON cxp.purchase_id = p.id
      WHERE cxp.id = $1
    `, [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cuenta no encontrada' });

    const payments = await pool.query(`
      SELECT pp.*, pm.method_name, u.username as cashier
      FROM payable_payments pp
      LEFT JOIN payment_methods pm ON pp.payment_method_id = pm.id
      LEFT JOIN users u ON pp.user_id = u.id
      WHERE pp.account_payable_id = $1
      ORDER BY pp.payment_date DESC
    `, [id]);

    res.json({ success: true, data: { account: result.rows[0], payments: payments.rows } });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener detalle de cuenta por pagar' });
  }
};

const addPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { amount, payment_method_id, user_id, notes } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Monto inválido' });

    const cxpRes = await client.query('SELECT balance FROM accounts_payable WHERE id = $1', [id]);
    if (cxpRes.rows.length === 0) throw new Error('Cuenta por pagar no encontrada');
    
    let newBalance = parseFloat(cxpRes.rows[0].balance) - parseFloat(amount);
    if (newBalance < 0) newBalance = 0;
    
    const newStatus = newBalance === 0 ? 'Pagada' : 'Pendiente';

    await client.query(`
      UPDATE accounts_payable 
      SET balance = $1, status = $2 
      WHERE id = $3
    `, [newBalance, newStatus, id]);

    const paymentResult = await client.query(`
      INSERT INTO payable_payments (account_payable_id, amount, payment_method_id, user_id, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, amount, payment_method_id, user_id, notes]);

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Pago registrado', data: paymentResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message || 'Error al registrar el pago' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllCxp,
  getCxpById,
  addPayment
};
