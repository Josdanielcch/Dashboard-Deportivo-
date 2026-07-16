const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cache } = require('../middleware/cacheMiddleware');
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', protect, cache(30), dashboardController.getDashboardStats);

module.exports = router;
