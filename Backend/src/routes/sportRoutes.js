const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const { cache, clearCacheFor } = require('../middleware/cacheMiddleware');
const sportController = require('../controllers/sportController');

router.get('/', cache(600), sportController.getAllSports);
router.post('/', protect, authorize(1), setAuditContext, clearCacheFor('cache:/api/sports'), sportController.createSport);
router.put('/:id', protect, authorize(1), setAuditContext, clearCacheFor('cache:/api/sports'), sportController.updateSport);
router.delete('/:id', protect, authorize(1), setAuditContext, clearCacheFor('cache:/api/sports'), sportController.deleteSport);

module.exports = router;
