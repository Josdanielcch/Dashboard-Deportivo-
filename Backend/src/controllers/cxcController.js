const pool = require('../config/database');

const getAllAccountsReceivable = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ar.*, c.first_name || ' ' || c.last_name as customer_name,
             b.total_amount as billing_total,
             bk.start_time as booking_start,
             (
                SELECT COALESCE(json_agg(
                    json_build_object(
                        'id', rp.id, 
                        'amount', rp.amount, 
                        'payment_date', rp.payment_date, 
                        'method_name', pm.method_name
                    )
                ), '[]'::json)
                FROM receivable_payments rp
                JOIN payment_methods pm ON rp.payment_method_id = pm.id
                WHERE rp.account_receivable_id = ar.id
             ) as payments
      FROM accounts_receivable ar
      JOIN customers c ON ar.customer_id = c.id
      LEFT JOIN billings b ON ar.billing_id = b.id
      LEFT JOIN bookings bk ON ar.booking_id = bk.id
      ORDER BY ar.created_at DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cuentas por cobrar' });
  }
};

const getByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await pool.query(`
      SELECT ar.*, c.first_name || ' ' || c.last_name as customer_name,
             b.total_amount as billing_total,
             bk.start_time as booking_start,
             (
                SELECT COALESCE(json_agg(
                    json_build_object(
                        'id', rp.id, 
                        'amount', rp.amount, 
                        'payment_date', rp.payment_date, 
                        'method_name', pm.method_name
                    )
                ), '[]'::json)
                FROM receivable_payments rp
                JOIN payment_methods pm ON rp.payment_method_id = pm.id
                WHERE rp.account_receivable_id = ar.id
             ) as payments
      FROM accounts_receivable ar
      JOIN customers c ON ar.customer_id = c.id
      LEFT JOIN billings b ON ar.billing_id = b.id
      LEFT JOIN bookings bk ON ar.booking_id = bk.id
      WHERE ar.customer_id = $1
      ORDER BY ar.created_at DESC
    `, [customerId]);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cuentas por cobrar del cliente' });
  }
};

const createPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { account_receivable_id, amount, payment_method_id } = req.body;
    
    if (!account_receivable_id || !amount || !payment_method_id) {
      return res.status(400).json({ error: 'Faltan datos para el pago' });
    }
    
    const arResult = await client.query('SELECT * FROM accounts_receivable WHERE id = $1 FOR UPDATE', [account_receivable_id]);
    if (arResult.rows.length === 0) {
      throw new Error('Cuenta por cobrar no encontrada');
    }
    
    const ar = arResult.rows[0];
    if (ar.status === 'Pagado') {
      throw new Error('Esta cuenta ya está pagada completamente');
    }
    
    if (amount <= 0 || amount > ar.balance) {
      throw new Error('Monto de abono inválido');
    }
    
    // Insertar abono
    const paymentRes = await client.query(`
      INSERT INTO receivable_payments (account_receivable_id, amount, payment_method_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [account_receivable_id, amount, payment_method_id]);
    
    // Actualizar balance
    const newBalance = ar.balance - amount;
    const newStatus = newBalance <= 0 ? 'Pagado' : 'Parcial';
    
    await client.query(`
      UPDATE accounts_receivable 
      SET balance = $1, status = $2
      WHERE id = $3
    `, [newBalance, newStatus, account_receivable_id]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Abono registrado con éxito',
      data: {
        payment: paymentRes.rows[0],
        newBalance,
        newStatus
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al registrar abono' });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllAccountsReceivable,
  getByCustomerId,
  createPayment
};
