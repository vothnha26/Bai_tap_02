const redisClient = require('../config/redis');

const QUEUE_NAME = 'email_queue';

class EmailQueue {
  /**
   * Push an email job to the queue
   * @param {string} type - 'otp' | 'forgot_password'
   * @param {Object} data - { email, otp }
   */
  async push(type, data) {
    const job = JSON.stringify({ type, data, timestamp: Date.now() });
    await redisClient.lPush(QUEUE_NAME, job);
    console.log(`[Queue] Job pushed to ${QUEUE_NAME}: ${type} for ${data.email}`);
  }

  get queueName() {
    return QUEUE_NAME;
  }
}

module.exports = new EmailQueue();
