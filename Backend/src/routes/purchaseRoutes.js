const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');
const { setAuditContext } = require('../middleware/auditContext');

router.use(protect);
router.use(setAuditContext);
router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', purchaseController.createPurchase);

module.exports = router;
