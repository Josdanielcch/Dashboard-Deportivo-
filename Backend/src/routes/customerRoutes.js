const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const customerController = require('../controllers/customerController');

// Todos requieren autenticación excepto la creación de clientes para reservas públicas
router.get('/', protect, customerController.getAllCustomers);
router.get('/search', protect, customerController.searchCustomers);
router.get('/:id', protect, customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', protect, setAuditContext, customerController.updateCustomer);
router.put('/:id/membership', protect, setAuditContext, customerController.updateCustomerMembership);
router.delete('/:id', protect, setAuditContext, customerController.deleteCustomer);
router.post('/:id/pay', protect, authorize(1, 5, 10), setAuditContext, customerController.recordPayment);

module.exports = router;