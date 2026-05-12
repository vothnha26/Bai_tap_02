const rateLimit = require('express-rate-limit');

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 forgot password requests per hour
  message: {
    message: 'Too many forgot password requests. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 reset password attempts per 15 minutes
  message: {
    message: 'Too many reset password attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  forgotPasswordRateLimiter,
  resetPasswordRateLimiter
};
