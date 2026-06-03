const Review = require('../../models/Review');
const reviewQueue = require('./ReviewQueue');
const { REVIEW_STATUS } = require('../../utils/constants');
const logger = require('../../utils/logger');

class ReviewService {
  async submitReview(userId, data) {
    const { productId, orderId, rating, comment } = data;

    // Create Review in PENDING status
    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment,
      status: REVIEW_STATUS.PENDING,
    });

    // Push to moderation queue
    try {
      logger.info(`[ReviewService] Pushing review ${review._id} to reviewQueue...`);
      const job = await reviewQueue.add(`moderate.review.${review._id}`, {
        reviewId: review._id,
      });
      logger.info(`[ReviewService] Successfully pushed job ${job.id} to reviewQueue`);
    } catch (err) {
      logger.error('[ReviewService] Error pushing to reviewQueue:', err);
    }

    return review;
  }

  async getProductReviews(productId, page = 1, limit = 10) {
    const reviews = await Review.find({ 
      productId, 
      status: REVIEW_STATUS.APPROVED 
    })
    .populate('userId', 'fullName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const total = await Review.countDocuments({ productId, status: REVIEW_STATUS.APPROVED });

    return { reviews, total };
  }
}

module.exports = new ReviewService();
