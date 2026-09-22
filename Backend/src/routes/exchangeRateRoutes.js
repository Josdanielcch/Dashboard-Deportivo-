const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const exchangeRateController = require('../controllers/exchangeRateController');

// Obtener tasas de cambio (público para Website y Panel)
router.get('/', exchangeRateController.getExchangeRates);

// Actualizar tasas de cambio (Solo Administradores)
router.put('/:id', protect, authorize(1), setAuditContext, exchangeRateController.updateExchangeRate);
router.put('/', protect, authorize(1), setAuditContext, exchangeRateController.bulkUpdateExchangeRates);

module.exports = router;
