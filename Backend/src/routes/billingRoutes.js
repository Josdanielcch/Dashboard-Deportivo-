const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const billingController = require('../controllers/billingController');

router.get('/', protect, authorize(1, 5, 10), billingController.getAllBillings);
router.get('/:id', protect, authorize(1, 5, 10), billingController.getBillingById);
router.post('/', protect, authorize(1, 5, 10), billingController.createBilling);

module.exports = router;