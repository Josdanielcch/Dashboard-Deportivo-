const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');

router.get('/summary',            protect, authorize(1, 2, 5), reportController.summary);
router.get('/sales-by-date',      protect, authorize(1, 2, 5), reportController.salesByDate);
router.get('/top-products',       protect, authorize(1, 2, 5), reportController.topProducts);
router.get('/revenue-by-court',   protect, authorize(1, 2, 5), reportController.revenueByCourt);
router.get('/booking-report',     protect, authorize(1, 2, 5), reportController.bookingReport);
router.get('/top-customers',      protect, authorize(1, 2, 5), reportController.topCustomers);
router.get('/court-utilization',  protect, authorize(1, 2, 5), reportController.courtUtilization);

module.exports = router;
