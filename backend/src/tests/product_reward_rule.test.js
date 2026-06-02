process.env.USE_MEMORY_REDIS = 'true';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const ProductRewardRule = require('../models/ProductRewardRule');
const jwtUtils = require('../utils/jwt.utils');
const redisClient = require('../config/redis');

jest.setTimeout(60000);

describe('ProductRewardRule API', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;
  let product;
  let rule;

  beforeAll(async () => {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_mongodb_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Clean up
    await ProductRewardRule.deleteMany({});
    await User.deleteMany({ email: /@test-reward.com$/ });

    // Create admin user
    adminUser = await User.create({
      email: 'admin@test-reward.com',
      fullName: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    adminToken = jwtUtils.generateAccessToken({ id: adminUser._id, role: adminUser.role });

    // Create regular user
    regularUser = await User.create({
      email: 'user@test-reward.com',
      fullName: 'Regular User',
      role: 'USER',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    userToken = jwtUtils.generateAccessToken({ id: regularUser._id, role: regularUser.role });

    // Create product
    product = await Product.create({
      name: 'Product Rule Test',
      slug: `product-rule-test-${Date.now()}`,
      description: 'Test Description',
      price: 150,
      stock: 20
    });
  });

  afterAll(async () => {
    try {
      if (adminUser) await User.deleteOne({ _id: adminUser._id });
      if (regularUser) await User.deleteOne({ _id: regularUser._id });
      if (product) await Product.deleteOne({ _id: product._id });
      await ProductRewardRule.deleteMany({});
    } catch (e) {
      console.error('Error during test cleanup:', e);
    }
    try {
      if (redisClient.isOpen) await redisClient.quit();
    } catch (e) {
      console.error('Error closing Redis:', e);
    }
    try {
      await mongoose.connection.close();
    } catch (e) {
      console.error('Error closing Mongoose:', e);
    }
  });

  describe('POST /api/rewards/rules', () => {
    it('should allow admin to upsert a product reward rule', async () => {
      const res = await request(app)
        .post('/api/rewards/rules')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: product._id,
          rewardPoints: 50,
          isActive: true
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.productId.id.toString()).toBe(product._id.toString());
      expect(res.body.data.rewardPoints).toBe(50);
      rule = res.body.data;
    });

    it('should deny non-admin users', async () => {
      const res = await request(app)
        .post('/api/rewards/rules')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: product._id,
          rewardPoints: 50
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/rewards/rules', () => {
    it('should allow admin to get all rules', async () => {
      const res = await request(app)
        .get('/api/rewards/rules')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].productId.id.toString()).toBe(product._id.toString());
    });

    it('should deny non-admin users', async () => {
      const res = await request(app)
        .get('/api/rewards/rules')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/rewards/rules/:id', () => {
    it('should allow admin to delete a rule', async () => {
      const res = await request(app)
        .delete(`/api/rewards/rules/${rule.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');

      // Verify deletion
      const check = await ProductRewardRule.findById(rule.id);
      expect(check).toBeNull();
    });

    it('should deny non-admin users', async () => {
      const res = await request(app)
        .delete(`/api/rewards/rules/${rule.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
