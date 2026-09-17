const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const bookingController = require('../controllers/bookingController');

router.get('/', protect, bookingController.getAllBookings);
router.get('/date/:date', bookingController.getBookingsByDate);
router.get('/check-availability', bookingController.checkAvailability);
router.get('/customer/:customerId', protect, bookingController.getCustomerBookings);
router.post('/', bookingController.createBooking);
router.put('/:id', protect, authorize(1), setAuditContext, bookingController.updateBooking);
router.put('/:id/status', protect, authorize(1), setAuditContext, bookingController.updateBookingStatus);

module.exports = router;