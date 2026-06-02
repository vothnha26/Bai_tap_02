const { Worker, Queue } = require('bullmq');
const { connection, DEFAULT_JOB_OPTIONS, prefix } = require('../../config/bullmq');
const Membership = require('../../models/Membership');
const Tier = require('../../models/Tier');

const CRON_QUEUE_NAME = 'cron_queue';

// Producer part (Scheduler)
const cronQueue = new Queue(CRON_QUEUE_NAME, {
  connection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
  prefix,
});

async function scheduleMonthlyDowngrade() {
  await cronQueue.add('monthly_tier_downgrade', {}, {
    repeat: {
      pattern: '0 0 1 * *', // Every 1st of the month at midnight
    }
  });
}

// Consumer part (Worker)
const downgradeWorker = new Worker(CRON_QUEUE_NAME, async (job) => {
  if (job.name === 'monthly_tier_downgrade') {
    console.log('[TierDowngradeWorker] Starting monthly point expiration...');
    
    // Calculate the month key that is 13 months ago
    const date = new Date();
    date.setMonth(date.getMonth() - 13);
    const expiredMonthKey = date.toISOString().slice(0, 7); // YYYY-MM

    // Stream memberships for efficiency if large scale
    const cursor = Membership.find({}).cursor();
    
    for (let membership = await cursor.next(); membership != null; membership = await cursor.next()) {
      const expiredPoints = membership.pointsByMonth.get(expiredMonthKey) || 0;
      
      if (expiredPoints > 0) {
        // Subtract expired points from rolling total
        membership.rollingPoints = Math.max(0, membership.rollingPoints - expiredPoints);
        
        // Remove the expired month from the map
        membership.pointsByMonth.delete(expiredMonthKey);
        
        // Check for downgrade
        const tiers = await Tier.find({}).sort({ minPoints: -1 });
        const eligibleTier = tiers.find(t => membership.rollingPoints >= t.minPoints);
        
        if (eligibleTier && eligibleTier._id.toString() !== membership.tierId.toString()) {
          console.log(`[TierDowngradeWorker] User ${membership.userId} downgraded to ${eligibleTier.code}`);
          membership.tierId = eligibleTier._id;
          membership.tierChangedAt = new Date();
        }
        
        await membership.save();
      }
    }
    
    console.log('[TierDowngradeWorker] Completed monthly point expiration.');
  }
}, { connection, prefix });

module.exports = {
  scheduleMonthlyDowngrade,
  downgradeWorker,
};
