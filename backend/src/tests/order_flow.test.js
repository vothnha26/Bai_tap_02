process.env.USE_MEMORY_REDIS = 'true';
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
const { orderEventEmitter, ORDER_EVENTS } = require('../services/order/order.event');
const { ORDER_STATUS } = require('../utils/constants');

describe('Order Lifecycle and Cancellation Flow', () => {
  let token;
  let user;
  let adminUser;
  let adminToken;
  let product;
  let inventory;

  beforeAll(async () => {
    if (redisClient && !redisClient.isOpen) {
      await redisClient.connect();
    }

    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_mongodb_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Tạo user
    user = await User.create({
      email: `test_flow_${Date.now()}@example.com`,
      fullName: 'Test Flow User',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    token = jwtUtils.generateAccessToken({ id: user._id, role: user.role });

    // Tạo admin user
    adminUser = await User.create({
      email: `test_admin_${Date.now()}@example.com`,
      fullName: 'Test Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
      accounts: [{ provider: 'LOCAL', passwordHash: 'hash' }]
    });
    adminToken = jwtUtils.generateAccessToken({ id: adminUser._id, role: adminUser.role });

    // Tạo product và inventory tương ứng
    product = await Product.create({
      name: 'Test Flow Product',
      slug: `test-flow-product-${Date.now()}`,
      description: 'Test Description',
      price: 100,
      stock: 15
    });

    inventory = await Inventory.findOneAndUpdate(
      { productId: product._id },
      { stock: 15, reserved: 0 },
      { upsert: true, new: true }
    );
  });

  afterAll(async () => {
    if (user) await User.deleteOne({ _id: user._id });
    if (adminUser) await User.deleteOne({ _id: adminUser._id });
    if (product) await Product.deleteOne({ _id: product._id });
    if (inventory) await Inventory.deleteOne({ _id: inventory._id });
    if (user) {
      await Order.deleteMany({ userId: user._id });
      if (redisClient && redisClient.isOpen) await redisClient.del(`cart:${user._id}`);
    }
    if (redisClient && redisClient.isOpen) await redisClient.quit();
    await mongoose.connection.close();
  });


  const createMockOrder = async (status, createdAtOffsetMins = 0) => {
    const createdAt = new Date(Date.now() - createdAtOffsetMins * 60 * 1000);
    return await Order.create({
      userId: user._id,
      items: [{
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 2,
        sku: 'TEST_SKU'
      }],
      totalAmount: 200,
      discountAmount: 0,
      finalAmount: 200,
      shippingAddress: {
        province: 'Test Province',
        ward: 'Test Ward',
        street: '123 Test St'
      },
      phone: '123456789',
      paymentMethod: 'COD',
      status: status,
      createdAt: createdAt
    });
  };

  test('1. Hủy đơn hàng PENDING dưới 30 phút -> Hủy thành công, hoàn tồn kho, phát sự kiện', async () => {
    // Giảm tồn kho ban đầu (giả lập giống đặt đơn hàng giảm 2)
    await Inventory.updateOne({ productId: product._id }, { $inc: { stock: -2 } });
    const order = await createMockOrder(ORDER_STATUS.PENDING, 5); // Đặt cách đây 5 phút

    const cancelSpy = jest.fn();
    orderEventEmitter.once(ORDER_EVENTS.ORDER_CANCELLED, cancelSpy);

    const res = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Muốn đổi ý định' });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe(ORDER_STATUS.CANCELLED);
    expect(res.body.order.cancellationReason).toBe('Muốn đổi ý định');

    // Xác nhận tồn kho được trả về (13 + 2 = 15)
    const checkInv = await Inventory.findOne({ productId: product._id });
    expect(checkInv.stock).toBe(15);

    // Kiểm tra Event Observer
    expect(cancelSpy).toHaveBeenCalled();
    expect(cancelSpy.mock.calls[0][0].cancellationReason).toBe('Muốn đổi ý định');
  });

  test('2. Hủy đơn hàng CONFIRMED dưới 30 phút -> Hủy trực tiếp, hoàn tồn kho', async () => {
    await Inventory.updateOne({ productId: product._id }, { $inc: { stock: -2 } });
    const order = await createMockOrder(ORDER_STATUS.CONFIRMED, 10);

    const res = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Mua trùng sản phẩm' });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe(ORDER_STATUS.CANCELLED);
    expect(res.body.order.cancellationReason).toBe('Mua trùng sản phẩm');

    const checkInv = await Inventory.findOne({ productId: product._id });
    expect(checkInv.stock).toBe(15);
  });

  test('3. Hủy đơn hàng PROCESSING dưới 30 phút -> Gửi yêu cầu hủy đơn cho shop, KHÔNG hoàn tồn kho, phát sự kiện', async () => {
    await Inventory.updateOne({ productId: product._id }, { $inc: { stock: -2 } });
    const order = await createMockOrder(ORDER_STATUS.PROCESSING, 15);

    const reqSpy = jest.fn();
    orderEventEmitter.once(ORDER_EVENTS.ORDER_CANCELLATION_REQUESTED, reqSpy);

    const res = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Đổi địa chỉ giao hàng' });

    expect(res.status).toBe(200);
    expect(res.body.order.status).toBe(ORDER_STATUS.CANCELLATION_REQUESTED);
    expect(res.body.order.cancellationReason).toBe('Đổi địa chỉ giao hàng');

    // Tồn kho không được hoàn trả vì đây là yêu cầu hủy (cần duyệt)
    const checkInv = await Inventory.findOne({ productId: product._id });
    expect(checkInv.stock).toBe(13);

    expect(reqSpy).toHaveBeenCalled();
  });

  test('4. Cố gắng hủy đơn hàng sau 30 phút đặt -> Thất bại (ném lỗi 400)', async () => {
    const order = await createMockOrder(ORDER_STATUS.PENDING, 40); // 40 phút trước

    const res = await request(app)
      .post(`/api/orders/${order._id}/cancel`)
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Quá trễ rồi' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('không thể hủy');
  });

  test('5. Tự động xác nhận đơn hàng sau 30 phút khi xem chi tiết (Auto-Confirm)', async () => {
    const order = await createMockOrder(ORDER_STATUS.PENDING, 45); // 45 phút trước

    const res = await request(app)
      .get(`/api/orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(ORDER_STATUS.CONFIRMED);
  });

  test('6. Admin từ chối yêu cầu hủy đơn (CANCELLATION_REQUESTED -> PROCESSING) -> Trạng thái sang PROCESSING, lưu lý do từ chối, KHÔNG hoàn tồn kho', async () => {
    await Inventory.updateOne({ productId: product._id }, { stock: 13 });
    const order = await createMockOrder(ORDER_STATUS.CANCELLATION_REQUESTED, 15);

    const res = await request(app)
      .put(`/api/orders/admin/${order._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: ORDER_STATUS.PROCESSING, rejectionReason: 'Không đồng ý hủy do hàng đã được đóng gói và giao vị trí chuyển phát' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(ORDER_STATUS.PROCESSING);
    expect(res.body.cancellationRejectionReason).toBe('Không đồng ý hủy do hàng đã được đóng gói và giao vị trí chuyển phát');

    // Tồn kho không hoàn trả
    const checkInv = await Inventory.findOne({ productId: product._id });
    expect(checkInv.stock).toBe(13);
  });
});
