const express = require('express');
const orderController = require('../controllers/order.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyAuth);

// Admin routes
router.get('/admin/all', verifyAdmin, orderController.getAllOrders);
router.put('/admin/:id/status', verifyAdmin, orderController.updateStatus);

// User routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
