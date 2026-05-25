// Set environment variables BEFORE any imports
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const jwtUtils = require('../utils/jwt.utils');
const redisClient = require('../config/redis');

describe('Cart API', () => {
  let token;
  let user;
  let product;

  beforeAll(async () => {
    // Connect to Redis if not open
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Connect to a test database if not connected
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_mongodb_test?authSource=admin';
    
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Create a test user
    user = await User.create({
      email: `test_cart_${Date.now()}@example.com`,
      fullName: 'Test Cart User',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });

    token = jwtUtils.generateAccessToken({ id: user._id, role: user.role });

    // Create a test product
    product = await Product.create({
      name: 'Test Product',
      slug: `test-product-${Date.now()}`,
      description: 'Test Description',
      price: 100,
      stock: 10
    });
  });

  afterAll(async () => {
    if (user) await User.deleteOne({ _id: user._id });
    if (product) await Product.deleteOne({ _id: product._id });
    if (user && redisClient.isOpen) await redisClient.del(`cart:${user._id}`);
    if (redisClient.isOpen) await redisClient.quit();
    await mongoose.connection.close();
  });

  describe('POST /api/cart', () => {
    it('should add a product to the cart', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product._id,
          quantity: 2
        });

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].productId).toBe(product._id.toString());
      expect(res.body.items[0].quantity).toBe(2);
      expect(res.body.totalAmount).toBe(200);
    });

    it('should return 400 if productId is missing', async () => {
      const res = await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/cart', () => {
    it('should get the current cart', async () => {
      const res = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });
  });

  describe('PUT /api/cart/:productId', () => {
    it('should update product quantity in the cart', async () => {
      const res = await request(app)
        .put(`/api/cart/${product._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(200);
      expect(res.body.items[0].quantity).toBe(5);
      expect(res.body.totalAmount).toBe(500);
    });
  });

  describe('DELETE /api/cart/:productId', () => {
    it('should remove a product from the cart', async () => {
      const res = await request(app)
        .delete(`/api/cart/${product._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(0);
      expect(res.body.totalAmount).toBe(0);
    });
  });
});
