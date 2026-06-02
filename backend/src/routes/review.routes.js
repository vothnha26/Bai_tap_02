const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

// Public routes
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes
router.post('/', verifyAuth, reviewController.submitReview);

module.exports = router;
