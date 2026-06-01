process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const ProductDiscount = require('../models/ProductDiscount');
const Promotion = require('../models/Promotion');
const jwtUtils = require('../utils/jwt.utils');
const redisClient = require('../config/redis');

describe('Double-Layer Discount & Stackable Rules Integration Testing', () => {
  let token;
  let user;
  let productStackable;
  let productNonStackable;
  let productNoDiscount;
  let promoVoucher;

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
    await ProductDiscount.deleteMany({});
    await Promotion.deleteMany({});

    // 4. Create User
    user = await User.create({
      email: `user_discount_${Date.now()}@example.com`,
      fullName: 'Discount Tester',
      role: 'USER',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    token = jwtUtils.generateAccessToken({ id: user._id, role: user.role });

    // 5. Create Products
    productStackable = await Product.create({
      name: 'Sản phẩm Stackable (Giảm L1 + cho phép Voucher L2)',
      slug: `prod-stackable-${Date.now()}`,
      description: 'Cho phép cộng dồn voucher',
      price: 100000,
      stock: 10
    });

    productNonStackable = await Product.create({
      name: 'Sản phẩm Non-Stackable (Giảm L1 + không cho phép Voucher L2)',
      slug: `prod-non-stackable-${Date.now()}`,
      description: 'Không cho phép cộng dồn voucher',
      price: 100000,
      stock: 10
    });

    productNoDiscount = await Product.create({
      name: 'Sản phẩm Không Giảm Giá L1 (Chỉ áp dụng Voucher L2)',
      slug: `prod-nodisc-${Date.now()}`,
      description: 'Giá gốc 100k',
      price: 100000,
      stock: 10
    });

    // 6. Create Product Discounts (L1)
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Hôm qua
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Ngày mai

    // Stackable L1 discount: 20%
    await ProductDiscount.create({
      productId: productStackable._id,
      discountType: 'PERCENTAGE',
      discountValue: 20,
      startDate,
      endDate,
      isStackable: true
    });

    // Non-Stackable L1 discount: 20%
    await ProductDiscount.create({
      productId: productNonStackable._id,
      discountType: 'PERCENTAGE',
      discountValue: 20,
      startDate,
      endDate,
      isStackable: false
    });

    // 7. Create Cart-level Voucher (L2) - Giảm 10% cho toàn bộ sản phẩm trong danh sách
    promoVoucher = await Promotion.create({
      code: 'VOUCHER10',
      name: 'Giảm giá 10% giỏ hàng',
      type: 'DISCOUNT',
      schedule: {
        startDate,
        endDate
      },
      actions: {
        applyDiscountTo: 'ORDER_TOTAL',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxDiscountAmount: 50000
      },
      isStackable: true
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await ProductDiscount.deleteMany({});
    await Promotion.deleteMany({});
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    await mongoose.connection.close();
  });

  describe('Lớp 1: Giảm giá trực tiếp của sản phẩm (ProductDiscount)', () => {
    it('nên tự động tính toán effectivePrice đã giảm và đánh dấu hasActiveDiscount', async () => {
      const res = await request(app).get(`/api/products/${productStackable._id}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      const product = res.body.data.product;
      expect(product.hasActiveDiscount).toBe(true);
      expect(product.effectivePrice).toBe(80000); // 100k - 20% = 80k
    });

    it('sản phẩm không có discount hoạt động phải giữ nguyên giá gốc', async () => {
      const res = await request(app).get(`/api/products/${productNoDiscount._id}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      
      const product = res.body.data.product;
      expect(product.hasActiveDiscount).toBe(false);
      expect(product.effectivePrice).toBe(100000);
    });
  });

  describe('Lớp 2: Kiểm tra Quy tắc cộng dồn Voucher (Stackable)', () => {
    it('voucher chỉ được áp dụng trên sản phẩm stackable hoặc không giảm giá', async () => {
      const res = await request(app)
        .post('/api/promotions/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'VOUCHER10',
          items: [
            // 1. Stackable: giá L1 = 80k, sl = 1 => 80k -> Được giảm voucher (giảm 10% của 80k = 8k)
            { productId: productStackable._id, name: productStackable.name, price: 80000, quantity: 1 },
            // 2. Non-stackable: giá L1 = 80k, sl = 1 => 80k -> Không được giảm voucher
            { productId: productNonStackable._id, name: productNonStackable.name, price: 80000, quantity: 1 },
            // 3. No discount: giá gốc = 100k, sl = 1 => 100k -> Được giảm voucher (giảm 10% của 100k = 10k)
            { productId: productNoDiscount._id, name: productNoDiscount.name, price: 100000, quantity: 1 }
          ],
          shippingFee: 0
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe('VOUCHER10');
      
      // Tổng giảm giá phải là 8k + 10k = 18k
      // (Nếu non-stackable bị áp dụng nhầm thì sẽ là 8k + 8k + 10k = 26k)
      expect(res.body.data.discountAmount).toBe(18000);
    });

    it('nên trả về lỗi nếu giỏ hàng chỉ có sản phẩm không cho phép cộng dồn', async () => {
      const res = await request(app)
        .post('/api/promotions/apply')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'VOUCHER10',
          items: [
            { productId: productNonStackable._id, name: productNonStackable.name, price: 80000, quantity: 1 }
          ],
          shippingFee: 0
        });

      // Voucher không có mặt hàng nào phù hợp để áp dụng nên sẽ báo lỗi
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Đơn hàng không chứa sản phẩm được áp dụng khuyến mãi hoặc sản phẩm đang sale không cho phép cộng dồn');
    });
  });
});
