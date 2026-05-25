const express = require('express');
const cartController = require('../controllers/cart.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyAuth);

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.delete('/', cartController.clearCart);
router.put('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
