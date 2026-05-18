const express = require('express');
const productController = require('../controllers/product.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

router.get('/', productController.searchProducts);
router.get('/home', productController.getHomePageData);
router.get('/search', productController.searchProducts);
router.get('/:slug', productController.getProductDetail);

// Admin routes
router.post('/', verifyAuth, verifyAdmin, productController.createProduct);
router.put('/:id', verifyAuth, verifyAdmin, productController.updateProduct);
router.delete('/:id', verifyAuth, verifyAdmin, productController.deleteProduct);

module.exports = router;
