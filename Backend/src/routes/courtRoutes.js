// src/routes/courtRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { cache, clearCacheFor } = require('../middleware/cacheMiddleware');
const courtController = require('../controllers/courtController');

<<<<<<< HEAD
router.get('/', courtController.getAllCourts);
router.get('/:id', courtController.getCourtById);
router.post('/', protect, authorize(1), courtController.createCourt);
router.put('/:id', protect, authorize(1), courtController.updateCourt);
router.put('/:id/status', protect, authorize(1), courtController.updateCourtStatus);
router.delete('/:id', protect, authorize(1), courtController.deleteCourt);
=======
router.get('/', protect, cache(300), courtController.getAllCourts);
router.get('/:id', protect, cache(300), courtController.getCourtById);
router.post('/', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.createCourt);
router.put('/:id', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.updateCourt);
router.put('/:id/status', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.updateCourtStatus);
router.delete('/:id', protect, authorize(1), clearCacheFor('cache:/api/courts'), courtController.deleteCourt);
>>>>>>> 2dbb2aa1a0d76ff13448df65f7e7b3e15f20b3eb

module.exports = router;