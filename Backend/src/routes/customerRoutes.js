const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const customerController = require('../controllers/customerController');

// Rutas de administración de clientes
router.get('/', protect, authorize(1, 2, 5), customerController.getAllCustomers);
router.get('/search', protect, authorize(1, 2, 5), customerController.searchCustomers);
router.get('/:id', protect, customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', protect, setAuditContext, customerController.updateCustomer);
router.put('/:id/membership', protect, authorize(1, 5), setAuditContext, customerController.updateCustomerMembership);
router.delete('/:id', protect, authorize(1), setAuditContext, customerController.deleteCustomer);
router.post('/:id/pay', protect, authorize(1, 2, 5), setAuditContext, customerController.recordPayment);

module.exports = router;