// src/services/paymentService.js
const crypto = require('crypto');
const pool = require('../config/database');
const mailer = require('../config/mailer');

/**
 * Crea una sesión de pago / intención de cobro con temporizador de Holding (10 minutos)
 * Soporta Stripe, Mercado Pago o modo Sandbox/Manual según configuración.
 */
const createPaymentIntent = async ({ bookingId, customerId, amount, currency = 'USD', description = 'Reserva de Cancha' }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar que la reserva exista y no esté ya confirmada
    const bookingRes = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingId]);
    if (bookingRes.rows.length === 0) {
      throw new Error('Reserva no encontrada');
    }
    const booking = bookingRes.rows[0];
    if (['Confirmed', 'Completed', 'Paid'].includes(booking.status)) {
      throw new Error('La reserva ya se encuentra pagada o confirmada');
    }

    // 2. Establecer Holding de 10 minutos para apartar el slot durante el checkout
    const holdingMinutes = 10;
    const holdingExpiresAt = new Date(Date.now() + holdingMinutes * 60 * 1000);

    let paymentIntentId = `pi_sandbox_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    let checkoutUrl = null;
    let gateway = 'sandbox';

    // 3. Integración con Stripe (si está configurado)
    if (process.env.STRIPE_SECRET_KEY) {
      gateway = 'stripe';
      try {
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'success_url': `${process.env.FRONTEND_URL || 'http://localhost:5173'}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
            'cancel_url': `${process.env.FRONTEND_URL || 'http://localhost:5173'}/booking-cancelled?booking_id=${bookingId}`,
            'payment_method_types[0]': 'card',
            'mode': 'payment',
            'client_reference_id': String(bookingId),
            'line_items[0][price_data][currency]': currency.toLowerCase(),
            'line_items[0][price_data][product_data][name]': description,
            'line_items[0][price_data][unit_amount]': String(Math.round(Number(amount) * 100)),
            'line_items[0][quantity]': '1'
          })
        });

        if (response.ok) {
          const session = await response.json();
          paymentIntentId = session.id;
          checkoutUrl = session.url;
        } else {
          console.error('Error al generar sesión en Stripe:', await response.text());
        }
      } catch (stripeErr) {
        console.error('Error de conexión con Stripe:', stripeErr.message);
      }
    }

    // 4. Actualizar la reserva en estado Pending_Payment con expiración de Holding
    await client.query(`
      UPDATE bookings 
      SET status = 'Pending_Payment',
          holding_expires_at = $1,
          payment_intent_id = $2,
          payment_gateway = $3,
          total_amount = COALESCE(total_amount, $4)
      WHERE id = $5
    `, [holdingExpiresAt, paymentIntentId, gateway, amount, bookingId]);

    await client.query('COMMIT');

    return {
      success: true,
      booking_id: bookingId,
      gateway,
      payment_intent_id: paymentIntentId,
      checkout_url: checkoutUrl,
      holding_expires_at: holdingExpiresAt.toISOString(),
      expires_in_minutes: holdingMinutes
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Procesa webhooks de pasarelas de pago externas y confirma reservas y facturas en tiempo real
 */
const processWebhookPayment = async ({ eventType, paymentIntentId, gateway = 'stripe', io = null }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Buscar la reserva asociada al paymentIntentId
    const bookingRes = await client.query(`
      SELECT b.*, c.first_name || ' ' || c.last_name as customer_name, c.email as customer_email,
             co.court_name
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN courts co ON b.court_id = co.id
      WHERE b.payment_intent_id = $1
      FOR UPDATE
    `, [paymentIntentId]);

    if (bookingRes.rows.length === 0) {
      console.warn(`Webhook: No se encontró reserva para payment_intent_id ${paymentIntentId}`);
      await client.query('ROLLBACK');
      return { received: true, processed: false };
    }

    const booking = bookingRes.rows[0];

    // Si ya fue confirmada, evitar doble procesamiento (Idempotencia)
    if (booking.status === 'Confirmed' || booking.status === 'Completed') {
      await client.query('COMMIT');
      return { received: true, already_processed: true };
    }

    // 2. Confirmar la reserva y limpiar el temporizador de holding
    await client.query(`
      UPDATE bookings 
      SET status = 'Confirmed',
          holding_expires_at = NULL,
          updated_at = NOW()
      WHERE id = $1
    `, [booking.id]);

    // 3. Crear factura (billing) automáticamente si aún no existe
    const existingBilling = await client.query('SELECT id FROM billings WHERE booking_id = $1', [booking.id]);
    let billingId;

    if (existingBilling.rows.length === 0) {
      // Método de pago: buscar o asignar ID de Pasarela / Tarjeta
      let methodId = 1; // Default
      const methodRes = await client.query("SELECT id FROM payment_methods WHERE method_name ILIKE '%Tarjeta%' OR method_name ILIKE '%Online%' LIMIT 1");
      if (methodRes.rows.length > 0) methodId = methodRes.rows[0].id;

      const billingInsert = await client.query(`
        INSERT INTO billings (booking_id, customer_id, user_id, payment_method_id, total_amount, payment_intent_id, payment_gateway, payment_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id
      `, [booking.id, booking.customer_id, booking.user_id || null, methodId, booking.total_amount || 0, paymentIntentId, gateway]);
      billingId = billingInsert.rows[0].id;
    } else {
      billingId = existingBilling.rows[0].id;
    }

    await client.query('COMMIT');

    // 4. Notificar en tiempo real al panel administrativo mediante Socket.IO
    if (io) {
      io.to('dashboard').emit('booking-payment-confirmed', {
        booking_id: booking.id,
        billing_id: billingId,
        customer_name: booking.customer_name,
        court_name: booking.court_name,
        booking_date: booking.booking_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        amount: booking.total_amount,
        gateway
      });
      io.emit('court-schedule-updated', {
        court_id: booking.court_id,
        booking_date: booking.booking_date
      });
    }

    // 5. Enviar correo de confirmación al cliente
    if (booking.customer_email) {
      try {
        await mailer.sendMail({
          from: process.env.SMTP_FROM || '"SportSpaces OS" <no-reply@sportspaces.com>',
          to: booking.customer_email,
          subject: '¡Reserva Confirmada y Pago Aprobado! — SportSpaces OS',
          html: `
            <h2>¡Tu reserva ha sido confirmada con éxito!</h2>
            <p>Hola <strong>${booking.customer_name}</strong>,</p>
            <p>Hemos recibido el pago correspondiente a tu reserva deportiva.</p>
            <ul>
              <li><strong>Cancha:</strong> ${booking.court_name}</li>
              <li><strong>Fecha:</strong> ${booking.booking_date}</li>
              <li><strong>Horario:</strong> ${booking.start_time} - ${booking.end_time}</li>
              <li><strong>Total Pagado:</strong> $${booking.total_amount || 0}</li>
              <li><strong>Referencia:</strong> ${paymentIntentId}</li>
            </ul>
            <p>¡Te esperamos en las instalaciones!</p>
          `
        });
      } catch (mailErr) {
        console.error('Error enviando correo de confirmación webhook:', mailErr.message);
      }
    }

    return { received: true, processed: true, booking_id: booking.id, billing_id: billingId };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error procesando webhook de pago:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Libera slots cuyo tiempo de holding haya expirado sin concretar el pago
 */
const cleanupExpiredHoldings = async () => {
  try {
    const result = await pool.query(`
      UPDATE bookings 
      SET status = 'Expired',
          updated_at = NOW()
      WHERE status = 'Pending_Payment'
        AND holding_expires_at IS NOT NULL
        AND holding_expires_at < NOW()
      RETURNING id, court_id, booking_date
    `);
    return result.rows;
  } catch (err) {
    console.error('Error limpiando holdings expirados:', err.message);
    return [];
  }
};

module.exports = {
  createPaymentIntent,
  processWebhookPayment,
  cleanupExpiredHoldings
};
