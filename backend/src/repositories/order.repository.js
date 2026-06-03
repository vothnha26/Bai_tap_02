const Order = require('../models/Order');

class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData);
  }

  async findById(id) {
    return await Order.findById(id).populate('userId', 'fullName email');
  }

  async findByUserId(userId, options = {}) {
    const { status, startDate, endDate, page = 1, limit = 10 } = options;
    const query = { userId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { orders, total, page: Number(page), limit: Number(limit) };
  }

  async updateStatus(id, status, cancellationReason = null, cancellationRejectionReason = null) {
    const updateData = { status };
    if (cancellationReason !== null) {
      updateData.cancellationReason = cancellationReason;
    }
    if (cancellationRejectionReason !== null) {
      updateData.cancellationRejectionReason = cancellationRejectionReason;
    }
    return await Order.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updatePaymentStatus(id, paymentStatus) {
    return await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
  }

  async findAll(query = {}) {
    return await Order.find(query).sort({ createdAt: -1 }).populate('userId', 'fullName email');
  }
}

module.exports = new OrderRepository();
