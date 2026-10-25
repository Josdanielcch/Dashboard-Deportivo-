// src/controllers/paymentController.js
const paymentService = require('../services/paymentService');

/**
 * Inicia el proceso de checkout y aparta el slot temporalmente (10 min)
 */
const initiateCheckout = async (req, res) => {
  try {
    const { booking_id, amount, currency, description } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'booking_id y amount son requeridos' });
    }

    const customerId = req.user?.customer_id || req.body.customer_id;

    const result = await paymentService.createPaymentIntent({
      bookingId: booking_id,
      customerId,
      amount,
      currency: currency || 'USD',
      description: description || 'Reserva deportiva'
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al iniciar checkout:', error);
    res.status(500).json({ error: error.message || 'Error al procesar checkout' });
  }
};

/**
 * Endpoint de Webhook para recibir notificaciones automáticas de Stripe
 */
const stripeWebhook = async (req, res) => {
  try {
    const event = req.body;
    const io = req.app.get('io');

    let paymentIntentId = null;

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      paymentIntentId = session?.id;
    } else if (event.type === 'payment_intent.succeeded') {
      const intent = event.data?.object;
      paymentIntentId = intent?.id;
    }

    if (paymentIntentId) {
      const result = await paymentService.processWebhookPayment({
        eventType: event.type,
        paymentIntentId,
        gateway: 'stripe',
        io
      });
      return res.json({ received: true, ...result });
    }

    res.json({ received: true, unhandled: true });
  } catch (error) {
    console.error('Error en webhook de Stripe:', error);
    res.status(400).json({ error: 'Error procesando webhook' });
  }
};

/**
 * Tarea periódica para liberar slots de holding expirados
 */
const sweepExpiredHoldings = async (req, res) => {
  try {
    const expiredList = await paymentService.cleanupExpiredHoldings();
    
    if (expiredList.length > 0) {
      const io = req.app.get('io');
      if (io) {
        expiredList.forEach(slot => {
          io.emit('court-schedule-updated', {
            court_id: slot.court_id,
            booking_date: slot.booking_date
          });
        });
      }
    }

    res.json({ success: true, released_count: expiredList.length, expired: expiredList });
  } catch (error) {
    res.status(500).json({ error: 'Error liberando slots expirados' });
  }
};

module.exports = {
  initiateCheckout,
  stripeWebhook,
  sweepExpiredHoldings
};
