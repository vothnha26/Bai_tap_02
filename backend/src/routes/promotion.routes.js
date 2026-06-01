const express = require('express');
const promotionController = require('../controllers/promotion.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// User authenticated routes
router.post('/apply', verifyAuth, promotionController.applyPromotion);
router.post('/applicable', verifyAuth, promotionController.getApplicablePromotions);

// Admin routes
router.post('/admin', verifyAuth, verifyAdmin, promotionController.createPromotion);
router.put('/admin/:id', verifyAuth, verifyAdmin, promotionController.updatePromotion);
router.delete('/admin/:id', verifyAuth, verifyAdmin, promotionController.deletePromotion);
router.get('/admin', verifyAuth, verifyAdmin, promotionController.getAllPromotions);
router.get('/admin/:id', verifyAuth, verifyAdmin, promotionController.getPromotionById);

module.exports = router;
