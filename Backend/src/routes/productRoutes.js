const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

router.get('/', protect, productController.getAllProducts);
router.get('/:id', protect, productController.getProductById);
router.post('/', protect, authorize(1, 3), productController.createProduct);
router.put('/:id', protect, authorize(1, 3), productController.updateProduct);
router.patch('/:id/stock', protect, authorize(1, 3), productController.updateStock);

module.exports = router;