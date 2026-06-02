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

describe('Order Address Integration API', () => {
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
      email: `test_addr_${Date.now()}@example.com`,
      fullName: 'Test Address User',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });

    token = jwtUtils.generateAccessToken({ id: user._id, role: user.role });

    // Create a test product
    product = await Product.create({
      name: 'Test Address Product',
      slug: `test-addr-product-${Date.now()}`,
      description: 'Test Description',
      price: 200,
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

  beforeEach(async () => {
    // Clear cart and prepare product stock
    if (redisClient.isOpen) await redisClient.del(`cart:${user._id}`);
    const Inventory = require('../models/Inventory');
    await Inventory.findOneAndUpdate(
      { productId: product._id },
      { stock: 10 },
      { upsert: true }
    );
  });

  describe('POST /api/orders with Structured Address', () => {
    it('should create order successfully with structured address and coordinates', async () => {
      // 1. Add item to cart
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 1 });

      const structuredAddress = {
        province: 'Thành phố Hồ Chí Minh',
        district: 'Quận 9',
        ward: 'Phường Tăng Nhơn Phú A',
        street: '97 Man Thiện',
        coordinates: {
          lat: 10.8456,
          lng: 106.7943
        }
      };

      // 2. Place order with structured address
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: structuredAddress,
          phone: '0987654321',
          paymentMethod: 'COD'
        });

      expect(res.status).toBe(201);
      expect(res.body.shippingAddress.province).toBe(structuredAddress.province);
      expect(res.body.shippingAddress.district).toBe(structuredAddress.district);
      expect(res.body.shippingAddress.ward).toBe(structuredAddress.ward);
      expect(res.body.shippingAddress.street).toBe(structuredAddress.street);
      expect(res.body.shippingAddress.coordinates.lat).toBe(structuredAddress.coordinates.lat);
      expect(res.body.shippingAddress.coordinates.lng).toBe(structuredAddress.coordinates.lng);

      // 3. Verify in Database
      const orderInDb = await Order.findById(res.body.id);
      expect(orderInDb).toBeDefined();
      expect(orderInDb.shippingAddress.province).toBe(structuredAddress.province);
      expect(orderInDb.shippingAddress.coordinates.lat).toBe(structuredAddress.coordinates.lat);
    });

    it('should create order successfully with string address (backward compatibility)', async () => {
      // 1. Add item to cart
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: product._id, quantity: 1 });

      const stringAddress = '97 Man Thiện, Phường Tăng Nhơn Phú A, Quận 9, TP. HCM';

      // 2. Place order with string address
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: stringAddress,
          phone: '0987654321',
          paymentMethod: 'COD'
        });

      expect(res.status).toBe(201);
      
      // Should be normalized to structured object with 'N/A' for administrative levels
      expect(res.body.shippingAddress.province).toBe('N/A');
      expect(res.body.shippingAddress.district).toBe('N/A');
      expect(res.body.shippingAddress.ward).toBe('N/A');
      expect(res.body.shippingAddress.street).toBe(stringAddress);
      expect(res.body.shippingAddress.coordinates.lat).toBe(0);
      expect(res.body.shippingAddress.coordinates.lng).toBe(0);
    });
  });
});
