const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, ERROR_MESSAGES } = require('../../utils/constants');
const productRepository = require('../../repositories/product.repository');
const orderRepository = require('../../repositories/order.repository');

/**
 * Base Order State
 */
class OrderState {
  constructor(orderService) {
    this.orderService = orderService;
  }

  async cancel(order, userId) {
    throw new Error(`Cannot cancel order in ${order.status} state`);
  }

  async updateStatus(order, newStatus) {
    throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  async _returnStock(order) {
    for (const item of order.items) {
      const product = await productRepository.findById(item.productId);
      if (product) {
        await productRepository.update(item.productId, {
          stock: product.stock + item.quantity,
          soldCount: Math.max(0, (product.soldCount || 0) - item.quantity)
        });
      }
    }
  }
}

/**
 * Pending State
 */
class PendingState extends OrderState {
  async cancel(order, userId) {
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMins = Math.floor((now - createdAt) / 1000 / 60);

    if (diffMins < 30) {
      const updatedOrder = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CANCELLED);
      await this._returnStock(order);
      return { order: updatedOrder, message: ERROR_MESSAGES.ORDER_CANCEL_SUCCESS };
    } else {
      const updatedOrder = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CANCELLATION_REQUESTED);
      return { order: updatedOrder, message: ERROR_MESSAGES.ORDER_CANCELLATION_REQUESTED };
    }
  }

  async updateStatus(order, newStatus) {
    const allowed = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED, ORDER_STATUS.PROCESSING];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from PENDING to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await this._returnStock(order);
    }

    return await orderRepository.updateStatus(order.id || order._id, newStatus);
  }
}

/**
 * Confirmed State
 */
class ConfirmedState extends OrderState {
  async cancel(order, userId) {
    const updatedOrder = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CANCELLATION_REQUESTED);
    return { order: updatedOrder, message: ERROR_MESSAGES.ORDER_CANCELLATION_REQUESTED };
  }

  async updateStatus(order, newStatus) {
    const allowed = [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from CONFIRMED to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await this._returnStock(order);
    }

    return await orderRepository.updateStatus(order.id || order._id, newStatus);
  }
}

/**
 * Processing State
 */
class ProcessingState extends OrderState {
  async cancel(order, userId) {
    const updatedOrder = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CANCELLATION_REQUESTED);
    return { order: updatedOrder, message: ERROR_MESSAGES.ORDER_CANCELLATION_REQUESTED };
  }

  async updateStatus(order, newStatus) {
    const allowed = [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from PROCESSING to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await this._returnStock(order);
    }

    return await orderRepository.updateStatus(order.id || order._id, newStatus);
  }
}

/**
 * Shipping State
 */
class ShippingState extends OrderState {
  async updateStatus(order, newStatus) {
    const allowed = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from SHIPPING to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.DELIVERED && order.paymentMethod === PAYMENT_METHOD.COD) {
      await orderRepository.updatePaymentStatus(order.id || order._id, PAYMENT_STATUS.PAID);
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await this._returnStock(order);
    }

    return await orderRepository.updateStatus(order.id || order._id, newStatus);
  }
}

/**
 * Delivered State (Final State)
 */
class DeliveredState extends OrderState {
  // No transitions allowed from Delivered
}

/**
 * Cancelled State (Final State)
 */
class CancelledState extends OrderState {
  // No transitions allowed from Cancelled
}

/**
 * State Factory
 */
class OrderStateFactory {
  static getState(order, orderService) {
    switch (order.status) {
      case ORDER_STATUS.PENDING: return new PendingState(orderService);
      case ORDER_STATUS.CONFIRMED: return new ConfirmedState(orderService);
      case ORDER_STATUS.PROCESSING: return new ProcessingState(orderService);
      case ORDER_STATUS.SHIPPING: return new ShippingState(orderService);
      case ORDER_STATUS.DELIVERED: return new DeliveredState(orderService);
      case ORDER_STATUS.CANCELLED: return new CancelledState(orderService);
      case ORDER_STATUS.CANCELLATION_REQUESTED: return new ConfirmedState(orderService); // Treat as confirmed for transitions
      default: throw new Error(`Unknown order status: ${order.status}`);
    }
  }
}

module.exports = { OrderStateFactory };
