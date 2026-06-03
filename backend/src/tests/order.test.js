// Set environment variables BEFORE any imports
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const jwtUtils = require('../utils/jwt.utils');
const redisClient = require('../config/redis');

describe('Order API', () => {
  let token;
  let user;
  let product;

  beforeAll(async () => {
    // Connect to Redis if not open
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Connect to a test database if not connected
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/baitap04_mongodb_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Create a test user
    user = await User.create({
      email: `test_order_${Date.now()}@example.com`,
      fullName: 'Test Order User',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });

    token = jwtUtils.generateAccessToken({ id: user._id, role: user.role });

    // Create a test product
    product = await Product.create({
      name: 'Test Order Product',
      slug: `test-order-product-${Date.now()}`,
      description: 'Test Description',
      price: 100,
      stock: 10
    });
  });

  afterAll(async () => {
    if (user) await User.deleteOne({ _id: user._id });
    if (product) await Product.deleteOne({ _id: product._id });
    if (user) {
      await Order.deleteMany({ userId: user._id });
      if (redisClient.isOpen) await redisClient.del(`cart:${user._id}`);
    }
    if (redisClient.isOpen) await redisClient.quit();
    await mongoose.connection.close();
  });

  describe('POST /api/orders', () => {
    it('should create a new order and clear cart', async () => {
      // 1. Add item to cart first
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 2 });

      // 2. Place order
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: '123 Test Street',
          phone: '0123456789',
          paymentMethod: 'COD'
        });

      expect(res.status).toBe(201);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.totalAmount).toBe(200);
      expect(res.body.status).toBe('PENDING');

      // 3. Verify stock was reduced
      const Inventory = require('../models/Inventory');
      const inventory = await Inventory.findOne({ productId: product._id });
      expect(inventory.stock).toBe(8);

      // 4. Verify cart was cleared
      const cartRes = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${token}`);
      expect(cartRes.body.items).toHaveLength(0);
    });

    it('should return 400 if cart is empty', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: '123 Test Street',
          phone: '0123456789'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Cart is empty');
    });
  });

  describe('GET /api/orders', () => {
    it('should get user orders', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThan(0);
    });
  });
});
