const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { cache, clearCacheFor } = require('../middleware/cacheMiddleware');
const productController = require('../controllers/productController');

router.get('/', protect, cache(300), productController.getAllProducts);
router.get('/:id', protect, cache(300), productController.getProductById);
router.post('/', protect, authorize(1, 3), clearCacheFor('cache:/api/products'), productController.createProduct);
router.put('/:id', protect, authorize(1, 3), clearCacheFor('cache:/api/products'), productController.updateProduct);
router.patch('/:id/stock', protect, authorize(1, 3), clearCacheFor('cache:/api/products'), productController.updateStock);

module.exports = router;