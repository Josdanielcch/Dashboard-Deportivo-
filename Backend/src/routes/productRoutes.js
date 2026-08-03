const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { cache, clearCacheFor } = require('../middleware/cacheMiddleware');
const productController = require('../controllers/productController');

<<<<<<< HEAD
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', protect, authorize(1, 3), productController.createProduct);
router.put('/:id', protect, authorize(1, 3), productController.updateProduct);
router.patch('/:id/stock', protect, authorize(1, 3), productController.updateStock);
=======
router.get('/', protect, cache(300), productController.getAllProducts);
router.get('/:id', protect, cache(300), productController.getProductById);
router.post('/', protect, authorize(1, 3), clearCacheFor('cache:/api/products'), productController.createProduct);
router.put('/:id', protect, authorize(1, 3), clearCacheFor('cache:/api/products'), productController.updateProduct);
router.patch('/:id/stock', protect, authorize(1, 3), clearCacheFor('cache:/api/products'), productController.updateStock);
>>>>>>> 2dbb2aa1a0d76ff13448df65f7e7b3e15f20b3eb

module.exports = router;