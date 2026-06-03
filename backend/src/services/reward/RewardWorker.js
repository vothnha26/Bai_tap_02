const { Worker } = require('bullmq');
const { connection, prefix } = require('../../config/bullmq');
const RewardService = require('./reward.service');
const logger = require('../../utils/logger');

const rewardWorker = new Worker('reward_queue', async (job) => {
  const { userId, source, sourceId, points: basePoints } = job.data;
  
  logger.info(`[RewardWorker] Processing reward for user ${userId}, source: ${source}, basePoints: ${basePoints}`);
  
  try {
    // 1. Calculate final points (e.g. apply tier multiplier if source is ORDER)
    const finalPoints = await RewardService.calculatePoints(userId, source, basePoints);
    
    // 2. Add points atomically
    const result = await RewardService.addPoints(userId, source, sourceId, finalPoints);
    
    logger.info(`[RewardWorker] Successfully awarded ${finalPoints} points to user ${userId}`);
    return result;
  } catch (error) {
    // If it's a duplicate key error (code 11000), consider it completed successfully (idempotency)
    if (error.code === 11000) {
      logger.info(`[RewardWorker] Duplicate reward detected for sourceId ${sourceId}, skipping.`);
      return { skipped: true, reason: 'DUPLICATE' };
    }
    throw error;
  }
}, {
  connection,
  concurrency: 10, // Adjust based on DB capacity
  prefix,
});

rewardWorker.on('completed', (job) => {
  logger.info(`[RewardWorker] Job ${job.id} completed!`);
});

rewardWorker.on('failed', (job, err) => {
  logger.error(`[RewardWorker] Job ${job?.id} failed:`, err);
});

rewardWorker.on('error', (err) => {
  logger.error('[RewardWorker] Global worker error:', err);
});

logger.info('[RewardWorker] Initialized and listening on reward_queue');

module.exports = rewardWorker;
