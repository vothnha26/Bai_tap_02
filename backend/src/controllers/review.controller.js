const reviewService = require('../services/review/review.service');

class ReviewController {
  async submitReview(req, res) {
    try {
      const review = await reviewService.submitReview(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Review submitted and is pending moderation.',
        data: review,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          status: 'error',
          message: 'You have already reviewed this product for this order.',
        });
      }
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }

  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;
      const { page, limit } = req.query;
      const data = await reviewService.getProductReviews(productId, parseInt(page), parseInt(limit));
      res.json({
        status: 'success',
        data,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
}

module.exports = new ReviewController();
