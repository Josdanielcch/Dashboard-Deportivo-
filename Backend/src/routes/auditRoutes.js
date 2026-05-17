const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const auditController = require('../controllers/auditController');

// Solo administradores y supervisores
router.get('/', protect, authorize(5, 10), auditController.getAuditLogs);
router.get('/:table_name/:record_id', protect, authorize(5, 10), auditController.getAuditByRecord);

module.exports = router;