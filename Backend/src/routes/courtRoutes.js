// src/routes/courtRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const courtController = require('../controllers/courtController');

router.get('/', protect, courtController.getAllCourts);
router.get('/:id', protect, courtController.getCourtById);
router.post('/', protect, authorize('admin'), courtController.createCourt);
router.put('/:id/status', protect, authorize('admin'), courtController.updateCourtStatus);

module.exports = router;