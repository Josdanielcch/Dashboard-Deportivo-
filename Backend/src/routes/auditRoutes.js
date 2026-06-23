const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const auditController = require('../controllers/auditController');

// Solo administradores
router.get('/', protect, authorize(1), auditController.getAuditLogs);
router.get('/:table_name/:record_id', protect, authorize(1), auditController.getAuditByRecord);

module.exports = router;