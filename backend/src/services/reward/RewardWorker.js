const { Worker } = require('bullmq');
const { connection, prefix } = require('../../config/bullmq');
const RewardService = require('./reward.service');

const rewardWorker = new Worker('reward_queue', async (job) => {
  const { userId, source, sourceId, points: basePoints } = job.data;
  
  console.log(`[RewardWorker] Processing reward for user ${userId}, source: ${source}, basePoints: ${basePoints}`);
  
  try {
    // 1. Calculate final points (e.g. apply tier multiplier if source is ORDER)
    const finalPoints = await RewardService.calculatePoints(userId, source, basePoints);
    
    // 2. Add points atomically
    const result = await RewardService.addPoints(userId, source, sourceId, finalPoints);
    
    console.log(`[RewardWorker] Successfully awarded ${finalPoints} points to user ${userId}`);
    return result;
  } catch (error) {
    // If it's a duplicate key error (code 11000), consider it completed successfully (idempotency)
    if (error.code === 11000) {
      console.log(`[RewardWorker] Duplicate reward detected for sourceId ${sourceId}, skipping.`);
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
  console.log(`[RewardWorker] Job ${job.id} completed!`);
});

rewardWorker.on('failed', (job, err) => {
  console.error(`[RewardWorker] Job ${job?.id} failed:`, err);
});

rewardWorker.on('error', (err) => {
  console.error('[RewardWorker] Global worker error:', err);
});

console.log('[RewardWorker] Initialized and listening on reward_queue');

module.exports = rewardWorker;
