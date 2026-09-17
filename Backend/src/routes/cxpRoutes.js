const express = require('express');
const router = express.Router();
const cxpController = require('../controllers/cxpController');
const { protect } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');

router.use(protect);
router.use(setAuditContext);
router.get('/', cxpController.getAllCxp);
router.get('/:id', cxpController.getCxpById);
router.post('/:id/payments', cxpController.addPayment);

module.exports = router;
