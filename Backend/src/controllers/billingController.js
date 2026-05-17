// src/controllers/billingController.js
const pool = require('../config/database');

// Crear factura (puede incluir reserva y productos)
const createBilling = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { booking_id, customer_id, user_id, payment_method_id, products } = req.body;
    
    if (!customer_id || !user_id || !payment_method_id) {
      return res.status(400).json({ error: 'Datos de facturación incompletos' });
    }
    
    // Calcular subtotal de productos
    let productSubtotal = 0;
    const saleDetails = [];
    
    if (products && products.length > 0) {
      for (const item of products) {
        const productResult = await client.query(
          'SELECT price, stock FROM products WHERE id = $1',
          [item.product_id]
        );
        if (productResult.rows.length === 0) {
          throw new Error(`Producto ${item.product_id} no encontrado`);
        }
        const product = productResult.rows[0];
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para producto ${item.product_id}`);
        }
        const unitPrice = product.price;
        const subtotal = unitPrice * item.quantity;
        productSubtotal += subtotal;
        
        saleDetails.push({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price_at_sale: unitPrice,
          subtotal
        });
      }
    }
    
    // Calcular monto de la reserva si existe
    let bookingAmount = 0;
    if (booking_id) {
      const bookingResult = await client.query(`
        SELECT b.*, c.hourly_rate 
        FROM bookings b
        JOIN courts c ON b.court_id = c.id
        WHERE b.id = $1
      `, [booking_id]);
      
      if (bookingResult.rows.length > 0) {
        const booking = bookingResult.rows[0];
        const hoursDiff = (new Date(`1970-01-01T${booking.end_time}`) - new Date(`1970-01-01T${booking.start_time}`)) / (1000 * 60 * 60);
        bookingAmount = booking.hourly_rate * hoursDiff;
      }
    }
    
    const totalAmount = productSubtotal + bookingAmount;
    const tax = totalAmount * 0.16; // IVA 16% (ajustar según tu país)
    const grandTotal = totalAmount + tax;
    
    // Crear factura
    const billingResult = await client.query(`
      INSERT INTO billings (booking_id, customer_id, user_id, payment_method_id, total_amount, payment_date)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [booking_id || null, customer_id, user_id, payment_method_id, grandTotal]);
    
    const billingId = billingResult.rows[0].id;
    
    // Crear sale_details
    for (const detail of saleDetails) {
      await client.query(`
        INSERT INTO sale_details (billing_id, products_id, quantity, price_unit, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `, [billingId, detail.product_id, detail.quantity, detail.unit_price_at_sale, detail.subtotal]);
      
      // Actualizar stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [detail.quantity, detail.product_id]
      );
    }
    
    // Si hay reserva, actualizarla a Confirmed
    if (booking_id) {
      await client.query(
        "UPDATE bookings SET status = 'Confirmed' WHERE id = $1",
        [booking_id]
      );
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      message: 'Factura creada exitosamente',
      data: {
        billing: billingResult.rows[0],
        products_sold: saleDetails,
        booking_amount: bookingAmount,
        product_subtotal: productSubtotal,
        tax: tax,
        total: grandTotal
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al crear factura' });
  } finally {
    client.release();
  }
};

// Obtener todas las facturas
const getAllBillings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, c.full_name as customer_name, pm.method_name,
             (SELECT COUNT(*) FROM sale_details WHERE billing_id = b.id) as product_count
      FROM billings b
      JOIN customers c ON b.customer_id = c.id
      JOIN payment_methods pm ON b.payment_method_id = pm.id
      ORDER BY b.payment_date DESC
    `);
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
};

// Obtener factura por ID con detalles
const getBillingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const billingResult = await pool.query(`
      SELECT b.*, c.full_name, c.tax_id, pm.method_name, u.username as cashier
      FROM billings b
      JOIN customers c ON b.customer_id = c.id
      JOIN payment_methods pm ON b.payment_method_id = pm.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [id]);
    
    if (billingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    const detailsResult = await pool.query(`
      SELECT sd.*, p.product_name
      FROM sale_details sd
      JOIN products p ON sd.products_id = p.id
      WHERE sd.billing_id = $1
    `, [id]);
    
    res.json({
      success: true,
      data: {
        billing: billingResult.rows[0],
        details: detailsResult.rows
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener factura' });
  }
};

module.exports = {
  createBilling,
  getAllBillings,
  getBillingById
};