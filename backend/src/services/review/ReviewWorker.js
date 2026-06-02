const { Worker } = require('bullmq');
const { connection, prefix } = require('../../config/bullmq');
const Review = require('../../models/Review');
const rewardQueue = require('../reward/RewardQueue');
const { REVIEW_STATUS, REWARD_SOURCES } = require('../../utils/constants');

const reviewWorker = new Worker('review_queue', async (job) => {
  const { reviewId } = job.data;
  
  const review = await Review.findById(reviewId);
  if (!review) return;

  console.log(`[ReviewWorker] Moderating review ${reviewId}...`);

  // Simple moderation logic: auto-approve if rating >= 3
  // In real world, use AI or bad words filter
  if (review.rating >= 3) {
    review.status = REVIEW_STATUS.APPROVED;
    await review.save();

    console.log(`[ReviewWorker] Review ${reviewId} APPROVED. Triggering reward...`);

    // Add to Reward Queue
    // Base points for a review could be 50 (can be configured)
    const basePoints = 50; 
    
    await rewardQueue.add(`reward.review.${reviewId}`, {
      userId: review.userId,
      source: REWARD_SOURCES.REVIEW,
      sourceId: review._id,
      points: basePoints,
    });
  } else {
    review.status = REVIEW_STATUS.REJECTED;
    await review.save();
    console.log(`[ReviewWorker] Review ${reviewId} REJECTED.`);
  }
}, {
  connection,
  concurrency: 5,
  prefix,
});

reviewWorker.on('completed', (job) => {
  console.log(`[ReviewWorker] Job ${job.id} completed!`);
});

reviewWorker.on('failed', (job, err) => {
  console.error(`[ReviewWorker] Job ${job?.id} failed:`, err);
});

reviewWorker.on('error', (err) => {
  console.error('[ReviewWorker] Global worker error:', err);
});

console.log('[ReviewWorker] Initialized and listening on review_queue');

module.exports = reviewWorker;
