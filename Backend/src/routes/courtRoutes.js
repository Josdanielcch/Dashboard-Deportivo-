// src/routes/courtRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { cache, clearCacheFor } = require('../middleware/cacheMiddleware');
const courtController = require('../controllers/courtController');

router.get('/', protect, cache(300), courtController.getAllCourts);
router.get('/:id', protect, cache(300), courtController.getCourtById);
router.post('/', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.createCourt);
router.put('/:id', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.updateCourt);
router.put('/:id/status', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.updateCourtStatus);
router.delete('/:id', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.deleteCourt);

module.exports = router;