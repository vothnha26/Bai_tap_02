const rateLimit = require('express-rate-limit');

const forgotPasswordRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 forgot password requests per 15 minutes
  message: {
    message: 'Bạn đã yêu cầu quên mật khẩu quá nhiều lần. Vui lòng thử lại sau 15 phút.'
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
