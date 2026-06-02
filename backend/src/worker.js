require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/mongoose');
const redisClient = require('./config/redis');

// Existing Email Queue (Manual Redis List)
const emailQueue = require('./services/email/email.queue');
const emailService = require('./services/email/email.service');

// New BullMQ Workers
const reviewWorker = require('./services/review/ReviewWorker');
const rewardWorker = require('./services/reward/RewardWorker');
const { downgradeWorker, scheduleMonthlyDowngrade } = require('./services/reward/TierDowngradeWorker');

/**
 * Process Legacy Email Jobs (Manual BRPOP)
 */
const processEmailJobs = async () => {
  console.log(`[Worker] Legacy Email worker listening on: "${emailQueue.queueName}"`);
  
  while (true) {
    try {
      const result = await redisClient.brPop(emailQueue.queueName, 0);
      if (result) {
        const element = typeof result === 'string' ? result : result.element;
        const job = JSON.parse(element);
        const { type, data } = job;

        console.log(`[EmailWorker] Processing ${type} for ${data.email}`);
        if (type === 'otp') await emailService.sendOTP(data.email, data.otp);
        else if (type === 'forgot_password') await emailService.sendForgotPasswordOTP(data.email, data.otp);
      }
    } catch (error) {
      console.error('[EmailWorker] Error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

const startWorkers = async () => {
  await connectDB();

  console.log('--------------------------------------------------');
  console.log(`[Worker] PubliCast System Workers started at ${new Date().toLocaleString()}`);
  console.log('--------------------------------------------------');

  // Start BullMQ Workers
  console.log('[Worker] BullMQ Review Worker: ONLINE');
  console.log('[Worker] BullMQ Reward Worker: ONLINE');
  console.log('[Worker] BullMQ Tier Downgrade Worker: ONLINE');

  // Schedule repeatable jobs
  await scheduleMonthlyDowngrade();
  console.log('[Worker] Cron Jobs scheduled.');

  // Start Legacy Workers
  processEmailJobs().catch(err => console.error('[Worker] EmailWorker Fatal:', err));
};

// Handle graceful shutdown
const shutdown = async () => {
  console.log('\n[Worker] 🛑 Shutting down gracefully...');
  await Promise.all([
    reviewWorker.close(),
    rewardWorker.close(),
    downgradeWorker.close(),
    mongoose.connection.close(),
  ]);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startWorkers().catch(err => {
  console.error('[Worker] 💀 Fatal error:', err);
  process.exit(1);
});
