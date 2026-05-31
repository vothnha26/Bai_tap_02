require('dotenv').config();
const redisClient = require('./config/redis');
const emailQueue = require('./services/email.queue');
const emailService = require('./services/email.service');

const processJobs = async () => {
  console.log('--------------------------------------------------');
  console.log(`[Worker] Email worker started at ${new Date().toLocaleString()}`);
  console.log(`[Worker] Listening on queue: "${emailQueue.queueName}"`);
  console.log('--------------------------------------------------');

  // Kiểm tra kết nối Redis trước khi bắt đầu
  if (!redisClient.isOpen && process.env.USE_MEMORY_REDIS !== 'true') {
    console.log('[Worker] Waiting for Redis connection...');
    // Đợi một chút để Redis kịp kết nối
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  while (true) {
    try {
      // BRPOP trả về { key, element } hoặc null
      const result = await redisClient.brPop(emailQueue.queueName, 0);
      
      if (result) {
        const element = typeof result === 'string' ? result : result.element;
        const job = JSON.parse(element);
        const { type, data } = job;

        console.log(`[Worker][${new Date().toLocaleTimeString()}] 📥 Received job: ${type} for ${data.email}`);

        try {
          switch (type) {
            case 'otp':
              await emailService.sendOTP(data.email, data.otp);
              break;
            case 'forgot_password':
              await emailService.sendForgotPasswordOTP(data.email, data.otp);
              break;
            default:
              console.warn(`[Worker] ⚠️ Unknown job type: ${type}`);
          }
          console.log(`[Worker] ✅ Successfully processed ${type} for ${data.email}`);
        } catch (error) {
          console.error(`[Worker] ❌ Failed to process job ${type}:`, error.message);
        }
      }
    } catch (error) {
      console.error('[Worker] 💥 Error in worker loop:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Worker] 🛑 Shutting down gracefully...');
  process.exit(0);
});

processJobs().catch(err => {
  console.error('[Worker] 💀 Fatal error:', err);
  process.exit(1);
});
