const Order = require('../models/Order');

class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData);
  }

  async findById(id) {
    return await Order.findById(id).populate('userId', 'fullName email');
  }

  async findByUserId(userId) {
    return await Order.find({ userId }).sort({ createdAt: -1 });
  }

  async updateStatus(id, status) {
    return await Order.findByIdAndUpdate(id, { status }, { new: true });
  }

  async updatePaymentStatus(id, paymentStatus) {
    return await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
  }

  async findAll(query = {}) {
    return await Order.find(query).sort({ createdAt: -1 }).populate('userId', 'fullName email');
  }
}

module.exports = new OrderRepository();
