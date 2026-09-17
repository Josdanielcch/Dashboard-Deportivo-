const express = require('express');
const router = express.Router();
const cxcController = require('../controllers/cxcController');
const { protect } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');

router.use(protect);
router.use(setAuditContext);

router.get('/', cxcController.getAllAccountsReceivable);
router.get('/customer/:customerId', cxcController.getByCustomerId);
router.post('/payment', cxcController.createPayment);

module.exports = router;
