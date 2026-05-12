const redisClient = require('../config/redis');

class LoginRateLimiter {
  constructor() {
    this.maxAttempts = 5;
    this.lockoutTime = 15 * 60; // 15 minutes in seconds
  }

  middleware() {
    return async (req, res, next) => {
      const { email } = req.body;
      const ip = req.ip;

      if (!email) return next();

      const key = `login_attempts:${email}:${ip}`;
      const attempts = await redisClient.get(key);

      if (attempts && parseInt(attempts, 10) >= this.maxAttempts) {
        return res.status(429).json({
          message: 'Too many failed login attempts. Please try again after 15 minutes.'
        });
      }

      // Attach data for controller to use
      req.rateLimit = { email, ip, key };
      next();
    };
  }

  async recordFailedAttempt(email, ip) {
    const key = `login_attempts:${email}:${ip}`;
    const attempts = await redisClient.incr(key);
    if (attempts === 1) {
      await redisClient.expire(key, this.lockoutTime);
    }
  }

  async resetAttempts(email, ip) {
    const key = `login_attempts:${email}:${ip}`;
    await redisClient.del(key);
  }
}

module.exports = new LoginRateLimiter();
