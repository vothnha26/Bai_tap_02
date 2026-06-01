const orderRepository = require('../repositories/order.repository');
const cartService = require('./cart.service');
const productRepository = require('../repositories/product.repository');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../utils/constants');
const { OrderStateFactory } = require('./order/order.states');

class OrderService {
  async createOrder(userId, orderInfo) {
    const { shippingAddress, phone, note, paymentMethod = PAYMENT_METHOD.COD } = orderInfo;

    // 1. Get Cart Data
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // 2. Validate Stock & Prepare Items
    const orderItems = [];
    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.name} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Product ${item.name} is out of stock`);
      }
      
      orderItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl
      });

      // Update stock
      await productRepository.update(item.productId, {
        stock: product.stock - item.quantity,
        soldCount: (product.soldCount || 0) + item.quantity
      });
    }

    // 3. Create Order
    const orderData = {
      userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      shippingAddress,
      phone,
      note,
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_METHOD.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID,
      status: ORDER_STATUS.PENDING
    };

    const order = await orderRepository.create(orderData);

    // 4. Clear Cart
    await cartService.clearCart(userId);

    return order;
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

  async cancelOrder(orderId, userId) {
    const order = await this.getOrderById(orderId, userId);
    const state = OrderStateFactory.getState(order, this);
    return await state.cancel(order, userId);
  }

  async getAllOrders() {
    return await orderRepository.findAll();
  }

  async updateOrderStatus(orderId, status) {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const state = OrderStateFactory.getState(order, this);
    return await state.updateStatus(order, status);
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
