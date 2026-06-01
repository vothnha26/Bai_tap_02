// Set environment variables BEFORE any imports
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';
process.env.USE_MEMORY_REDIS = 'true';

const mongoose = require('mongoose');
const User = require('../models/User');
const authService = require('../services/auth.service');
const redisClient = require('../config/redis');

describe('Auth Service', () => {
  let user;
  const email = 'test_reset@example.com';
  const password = 'Password123!';
  const newPassword = 'NewPassword123!';

  beforeAll(async () => {
    // Connect to a test database
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_auth_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Clear existing user if any
    await User.deleteOne({ email });
  });

  afterAll(async () => {
    await User.deleteOne({ email });
    await mongoose.connection.close();
  });

  it('should reset password successfully', async () => {
    // 1. Register user
    await authService.register('Test User', email, password);
    
    // 2. Activate user (manual update for test)
    await User.findOneAndUpdate({ email }, { status: 'ACTIVE' });

    // 3. Mock forgot password OTP
    const otp = '123456';
    await redisClient.setEx(`forgot-otp:${email}`, 300, otp);

    // 4. Reset password
    const result = await authService.resetPassword(email, otp, newPassword);

    expect(result.message).toBeDefined();
    
    // 5. Verify password changed
    const updatedUser = await User.findOne({ email });
    const bcrypt = require('bcryptjs');
    const localAccount = updatedUser.accounts.find(acc => acc.provider === 'LOCAL');
    const isValid = await bcrypt.compare(newPassword, localAccount.passwordHash);
    expect(isValid).toBe(true);
  });
});
