const express = require('express');
const router = express.Router();
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const { bookingLimiter } = require('../middleware/rateLimiter');
const bookingController = require('../controllers/bookingController');

router.get('/', protect, bookingController.getAllBookings);
router.get('/date/:date', optionalAuth, bookingController.getBookingsByDate);
router.get('/occupied-slots', bookingController.getOccupiedSlots);
router.get('/check-availability', bookingController.checkAvailability);
router.get('/customer/:customerId', protect, bookingController.getCustomerBookings);
router.post('/', bookingLimiter, optionalAuth, setAuditContext, bookingController.createBooking);
router.put('/:id', protect, authorize(1, 2, 5), setAuditContext, bookingController.updateBooking);
router.put('/:id/status', protect, authorize(1, 2, 5), setAuditContext, bookingController.updateBookingStatus);

module.exports = router;