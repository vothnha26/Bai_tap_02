// Set environment variables BEFORE any imports
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Promotion = require('../models/Promotion');
const jwtUtils = require('../utils/jwt.utils');
const redisClient = require('../config/redis');

describe('Promotion Integration Testing', () => {
  let token;
  let adminToken;
  let user;
  let adminUser;
  let productA;
  let productB;
  let promoDiscount;
  let promoGift;

  beforeAll(async () => {
    // 1. Connect to Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // 2. Connect to Test DB
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_mongodb_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // 3. Clean up DB before test
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Promotion.deleteMany({});

    // 4. Create Users
    user = await User.create({
      email: `user_promo_${Date.now()}@example.com`,
      fullName: 'Promo Regular User',
      role: 'USER',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    token = jwtUtils.generateAccessToken({ id: user._id, role: user.role });

    adminUser = await User.create({
      email: `admin_promo_${Date.now()}@example.com`,
      fullName: 'Promo Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    adminToken = jwtUtils.generateAccessToken({ id: adminUser._id, role: adminUser.role });

    // 5. Create Products
    productA = await Product.create({
      name: 'Product A (Main)',
      slug: `product-a-${Date.now()}`,
      description: 'Main product to buy',
      price: 100000,
      stock: 10
    });

    productB = await Product.create({
      name: 'Product B (Gift)',
      slug: `product-b-${Date.now()}`,
      description: 'Gift product',
      price: 50000,
      stock: 5
    });

    // 6. Create Promotions
    // A. Discount 10% max 50k
    promoDiscount = await Promotion.create({
      code: 'PROMODISC',
      name: 'Giảm giá 10%',
      type: 'DISCOUNT',
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59')
      },
      actions: {
        applyDiscountTo: 'ORDER_TOTAL',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 50000
      }
    });

    // B. Gift Promotion: Buy Product A, Get Product B
    promoGift = await Promotion.create({
      code: 'PROMOGIFT',
      name: 'Mua A Tặng B',
      type: 'GIFT',
      conditions: {
        applicableProductIds: [productA._id],
        minQuantity: 1
      },
      schedule: {
        startDate: new Date('2026-06-01T00:00:00'),
        endDate: new Date('2026-06-30T23:59:59')
      },
      actions: {
        giftOptions: {
          selectableProducts: [productB._id],
          giftQuantity: 1,
          isSameAsPurchase: false
        }
      }
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Promotion.deleteMany({});
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    await mongoose.connection.close();
  });

  describe('POST /api/promotions/apply', () => {
    it('nên tính toán chính xác số tiền giảm cho mã DISCOUNT', async () => {
      const res = await request(app)
        .post('/api/promotions/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'PROMODISC',
          items: [
            { productId: productA._id, name: productA.name, price: productA.price, quantity: 2 }
          ],
          shippingFee: 15000
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('PROMODISC');
      expect(res.body.data.discountAmount).toBe(20000); // 10% của 200k = 20k
      expect(res.body.data.giftItems).toHaveLength(0);
    });

    it('nên gắn quà tặng chính xác cho mã GIFT', async () => {
      const res = await request(app)
        .post('/api/promotions/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'PROMOGIFT',
          items: [
            { productId: productA._id, name: productA.name, price: productA.price, quantity: 1 }
          ],
          shippingFee: 15000
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('PROMOGIFT');
      expect(res.body.data.discountAmount).toBe(0);
      expect(res.body.data.giftItems).toHaveLength(1);
      expect(res.body.data.giftItems[0].name).toContain('Product B');
    });

    it('nên báo lỗi nếu đơn hàng không đủ điều kiện (ví dụ: mua sản phẩm không được áp dụng GIFT)', async () => {
      const res = await request(app)
        .post('/api/promotions/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'PROMOGIFT',
          items: [
            { productId: productB._id, name: productB.name, price: productB.price, quantity: 1 }
          ],
          shippingFee: 15000
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Đơn hàng không chứa sản phẩm được áp dụng');
    });
  });

  describe('POST /api/orders với Promotion (Tích hợp CoR)', () => {
    beforeEach(async () => {
      // Dọn dẹp giỏ hàng
      if (redisClient.isOpen) {
        await redisClient.del(`cart:${user._id}`);
      }
      // Reset tồn kho
      await Product.findByIdAndUpdate(productA._id, { stock: 10 });
      await Product.findByIdAndUpdate(productB._id, { stock: 5 });
    });

    it('nên tạo đơn hàng thành công, giảm giá và tăng usedCount cho DISCOUNT', async () => {
      // 1. Thêm sản phẩm vào giỏ
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: productA._id, quantity: 2 });

      // 2. Tạo Order kèm mã
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: '456 Tran Hung Dao, Q1, HCMC',
          phone: '0987654321',
          paymentMethod: 'COD',
          promotionCode: 'PROMODISC'
        });

      expect(res.status).toBe(201);
      expect(res.body.promotionCode).toBe('PROMODISC');
      expect(res.body.discountAmount).toBe(20000);
      expect(res.body.totalAmount).toBe(200000);
      expect(res.body.finalAmount).toBe(180000); // 200k - 20k

      // 3. Kiểm tra usedCount tăng lên
      const updatedPromo = await Promotion.findOne({ code: 'PROMODISC' });
      expect(updatedPromo.usedCount).toBe(1);
    });

    it('nên tạo đơn hàng thành công, tặng quà và trừ kho quà tặng cho GIFT', async () => {
      // 1. Thêm sản phẩm vào giỏ
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${token}`)
        .send({ productId: productA._id, quantity: 1 });

      // 2. Tạo Order kèm mã GIFT
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: '456 Tran Hung Dao, Q1, HCMC',
          phone: '0987654321',
          paymentMethod: 'COD',
          promotionCode: 'PROMOGIFT'
        });

      expect(res.status).toBe(201);
      expect(res.body.promotionCode).toBe('PROMOGIFT');
      expect(res.body.discountAmount).toBe(0);
      expect(res.body.giftItems).toHaveLength(1);
      expect(res.body.giftItems[0].name).toContain('Product B');

      // 3. Kiểm tra tồn kho của sản phẩm quà tặng bị trừ
      const Inventory = require('../models/Inventory');
      const giftInventory = await Inventory.findOne({ productId: productB._id });
      expect(giftInventory.stock).toBe(4); // 5 - 1 = 4
    });
  });
});
