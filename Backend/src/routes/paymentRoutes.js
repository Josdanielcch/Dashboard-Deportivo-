// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');
const { bookingLimiter } = require('../middleware/rateLimiter');
const paymentController = require('../controllers/paymentController');

// Iniciar sesión de checkout y apartar turno temporalmente (10 min)
router.post('/checkout', optionalAuth, bookingLimiter, paymentController.initiateCheckout);

// Webhook para confirmación automática de pagos (Stripe / pasarelas)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

// Liberación manual / programada de turnos vencidos sin pagar
router.post('/sweep-expired', protect, authorize(1, 2, 5), paymentController.sweepExpiredHoldings);

module.exports = router;
