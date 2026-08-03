// src/routes/courtRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const courtController = require('../controllers/courtController');

router.get('/', courtController.getAllCourts);
router.get('/:id', courtController.getCourtById);
router.post('/', protect, authorize(1), courtController.createCourt);
router.put('/:id', protect, authorize(1), courtController.updateCourt);
router.put('/:id/status', protect, authorize(1), courtController.updateCourtStatus);
router.delete('/:id', protect, authorize(1), courtController.deleteCourt);

module.exports = router;