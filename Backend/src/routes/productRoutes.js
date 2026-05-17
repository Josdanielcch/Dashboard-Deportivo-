const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

router.get('/', protect, productController.getAllProducts);
router.get('/:id', protect, productController.getProductById);
router.post('/', protect, authorize(5, 10), productController.createProduct);
router.put('/:id', protect, authorize(5, 10), productController.updateProduct);
router.patch('/:id/stock', protect, authorize(5, 10), productController.updateStock);

module.exports = router;