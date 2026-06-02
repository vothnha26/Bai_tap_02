const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const redisClient = require('../config/redis');

const connectDB = require('../config/mongoose');

describe('Auth Security Integration Tests', () => {
  jest.setTimeout(20000);
  const email = 'security_test@example.com';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await User.deleteOne({ email });
    // app closure handled by forceExit or manual if needed
  });

  describe('Password Strength Validation', () => {
    it('should reject password shorter than 12 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test',
          email: email,
          password: 'Short1!',
          confirmPassword: 'Short1!'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      const passError = res.body.errors.find(err => err.path === 'password');
      expect(passError.msg).toContain('at least 12 characters');
    });

    it('should reject password without special characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test',
          email: email,
          password: 'Password123456',
          confirmPassword: 'Password123456'
        });
      
      expect(res.status).toBe(400);
      const passError = res.body.errors.find(err => err.path === 'password');
      expect(passError.msg).toContain('special character');
    });

    it('should accept valid strong password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test',
          email: email,
          password: 'StrongPassword123!',
          confirmPassword: 'StrongPassword123!'
        });
      
      expect(res.status).toBe(201);
    });
  });
});
