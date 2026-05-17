const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const bookingController = require('../controllers/bookingController');

router.get('/', protect, bookingController.getAllBookings);
router.get('/date/:date', protect, bookingController.getBookingsByDate);
router.get('/check-availability', protect, bookingController.checkAvailability);
router.get('/customer/:customerId', protect, bookingController.getCustomerBookings);
router.post('/', protect, authorize(1, 5, 10), bookingController.createBooking);
router.put('/:id/status', protect, authorize(5, 10), bookingController.updateBookingStatus);

module.exports = router;