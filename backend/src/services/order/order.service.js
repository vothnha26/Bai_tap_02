const orderRepository = require('../../repositories/order.repository');
const cartService = require('../cart/cart.service');
const productRepository = require('../../repositories/product.repository');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../../utils/constants');
const { OrderStateFactory } = require('./order.states');
const { OrderChainFactory } = require('./order.chain.factory');

class OrderService {
  async createOrder(userId, orderInfo) {
    const context = {
      userId,
      orderInfo,
      cart: null,
      orderItems: [],
      shippingFee: 0,
      discountAmount: 0,
      giftItems: [],
      finalAmount: 0,
      order: null
    };

    // 1. Tạo chuỗi trách nhiệm xử lý đơn hàng
    const chain = OrderChainFactory.create();

    // 2. Chạy chuỗi xử lý
    await chain.handle(context);

    // 3. Trả về đơn hàng được tạo
    return context.order;
  }

  async getUserOrders(userId) {
    const orders = await orderRepository.findByUserId(userId);
    // Check auto-confirmation
    const updatedOrders = await Promise.all(orders.map(order => this._checkAutoConfirm(order)));
    return updatedOrders;
  }

  async getOrderById(orderId, userId) {
    let order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    // Check ownership
    if (order.userId._id.toString() !== userId && order.userId.toString() !== userId) {
      throw new Error('Unauthorized access to order');
    }
    
    return await this._checkAutoConfirm(order);
  }

  async cancelOrder(orderId, userId, reason) {
    const order = await this.getOrderById(orderId, userId);
    const state = OrderStateFactory.getState(order, this);
    return await state.cancel(order, userId, reason);
  }

  async getAllOrders() {
    return await orderRepository.findAll();
  }

  async updateOrderStatus(orderId, status, rejectionReason = null) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const state = OrderStateFactory.getState(order, this);
    return await state.updateStatus(order, status, rejectionReason);
  }

  async _checkAutoConfirm(order) {
    if (order.status === ORDER_STATUS.PENDING) {
      const now = new Date();
      const createdAt = new Date(order.createdAt);
      const diffMins = Math.floor((now - createdAt) / 1000 / 60);

      if (diffMins >= 30) {
        const updated = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CONFIRMED);
        return updated;
      }
    }
    return order;
  }
}

module.exports = new OrderService();
