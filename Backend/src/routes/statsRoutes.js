const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cache } = require('../middleware/cacheMiddleware');
const { getDashboardStats } = require('../controllers/statsController');

router.get('/dashboard', protect, cache(30), getDashboardStats);

module.exports = router;
