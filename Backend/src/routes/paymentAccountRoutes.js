const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const paymentAccountController = require('../controllers/paymentAccountController');

// Obtener métodos de pago activos (público para Website y reservas)
router.get('/', paymentAccountController.getPublicPaymentAccounts);

// Rutas de administración (Solo Administradores)
router.get('/admin', protect, authorize(1), paymentAccountController.getAllPaymentAccounts);
router.post('/', protect, authorize(1), setAuditContext, paymentAccountController.createPaymentAccount);
router.put('/:id', protect, authorize(1), setAuditContext, paymentAccountController.updatePaymentAccount);
router.patch('/:id/toggle', protect, authorize(1), setAuditContext, paymentAccountController.togglePaymentAccountStatus);
router.delete('/:id', protect, authorize(1), setAuditContext, paymentAccountController.deletePaymentAccount);

module.exports = router;
