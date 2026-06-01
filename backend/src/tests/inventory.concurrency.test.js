process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const jwtUtils = require('../utils/jwt.utils');
const redisClient = require('../config/redis');

describe('Inventory Concurrency & Race Condition Test', () => {
  let users = [];
  let tokens = [];
  let product;
  const numUsers = 5;
  const initialStock = 2;

  beforeAll(async () => {
    // Kết nối Redis
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    // Kết nối MongoDB test
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_mongodb_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // 1. Tạo một sản phẩm test với số lượng tồn kho = 2
    product = await Product.create({
      name: 'Concurrent Test Item',
      slug: `concurrent-test-item-${Date.now()}`,
      description: 'Item for race condition test',
      price: 150
    });

    // Tạo bản ghi Inventory với stock = 2
    const inventoryRepository = require('../repositories/inventory.repository');
    await inventoryRepository.updateStock(product._id, initialStock, 5, 'Khu Test');

    // 2. Tạo 5 User test khác nhau và lấy access token của họ
    for (let i = 0; i < numUsers; i++) {
      const u = await User.create({
        email: `concur_user_${i}_${Date.now()}@example.com`,
        fullName: `User Concurrent ${i}`,
        status: 'ACTIVE',
        accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
      });
      users.push(u);
      tokens.push(jwtUtils.generateAccessToken({ id: u._id, role: u.role }));
    }

    // 3. Mỗi User thêm 1 sản phẩm này vào giỏ hàng của mình
    for (let i = 0; i < numUsers; i++) {
      await request(app)
        .post('/api/cart')
        .set('Authorization', `Bearer ${tokens[i]}`)
        .send({ productId: product._id, quantity: 1 });
    }
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu
    if (product) {
      await Product.deleteOne({ _id: product._id });
      await Inventory.deleteOne({ productId: product._id });
    }
    for (const u of users) {
      await User.deleteOne({ _id: u._id });
      await Order.deleteMany({ userId: u._id });
      if (redisClient.isOpen) await redisClient.del(`cart:${u._id}`);
    }
    if (redisClient.isOpen) await redisClient.quit();
    await mongoose.connection.close();
  });

  it('should handle race condition safely: only 2 orders succeed and stock cannot go below 0', async () => {
    // 4. Giả lập 5 Users đồng thời gửi request tạo Order mua hàng
    const checkoutRequests = tokens.map(token => {
      return request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingAddress: '123 Concurrency Rd',
          phone: '0987654321',
          paymentMethod: 'COD'
        });
    });

    // Thực thi đồng thời 5 checkout requests
    const responses = await Promise.all(checkoutRequests);

    // 5. Kiểm tra kết quả
    const successfulCheckouts = responses.filter(res => res.status === 201);
    const failedCheckouts = responses.filter(res => res.status >= 400);

    // Chỉ có đúng 2 request thành công (bằng đúng số lượng tồn kho ban đầu)
    expect(successfulCheckouts.length).toBe(2);

    // 3 request còn lại thất bại
    expect(failedCheckouts.length).toBe(3);

    // Kiểm tra lỗi trả về của các request thất bại có thông báo hết hàng
    failedCheckouts.forEach(res => {
      expect(res.body.message).toMatch(/không đủ tồn kho|đã hết hàng/);
    });

    // 6. Kiểm tra số lượng tồn kho cuối cùng trong DB phải bằng 0 (không bao giờ âm)
    const finalInventory = await Inventory.findOne({ productId: product._id });
    expect(finalInventory.stock).toBe(0);
  });
});
