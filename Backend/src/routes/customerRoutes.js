const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController');

// Todos requieren autenticación
router.get('/', protect, customerController.getAllCustomers);
router.get('/search', protect, customerController.searchCustomers);
router.get('/:id', protect, customerController.getCustomerById);
router.post('/', protect, customerController.createCustomer);
router.put('/:id', protect, customerController.updateCustomer);
router.post('/:id/pay', protect, authorize(1, 5, 10), customerController.recordPayment);

module.exports = router;