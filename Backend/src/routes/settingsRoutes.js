const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');
const settingsController = require('../controllers/settingsController');

router.get('/', settingsController.getSettings);
router.put('/', protect, setAuditContext, settingsController.updateSettings);

module.exports = router;
