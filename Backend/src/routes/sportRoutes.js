const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const sportController = require('../controllers/sportController');

router.get('/', sportController.getAllSports);
router.post('/', protect, authorize(1), sportController.createSport);
router.put('/:id', protect, authorize(1), sportController.updateSport);
router.delete('/:id', protect, authorize(1), sportController.deleteSport);

module.exports = router;
