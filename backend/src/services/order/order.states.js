const { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, ERROR_MESSAGES } = require('../../utils/constants');
const productRepository = require('../../repositories/product.repository');
const orderRepository = require('../../repositories/order.repository');
const { orderEventEmitter, ORDER_EVENTS } = require('./order.event');

/**
 * Base Order State
 */
class OrderState {
  constructor(orderService) {
    this.orderService = orderService;
  }

  async cancel(order, userId, reason) {
    throw new Error(ERROR_MESSAGES.ORDER_CANNOT_CANCEL);
  }

  async updateStatus(order, newStatus, rejectionReason = null) {
    throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
  }

  async _returnStock(order) {
    const inventoryRepository = require('./../../repositories/inventory.repository');
    for (const item of order.items) {
      await inventoryRepository.incrementStock(item.productId, item.quantity);
      await productRepository.update(item.productId, {
        $inc: { soldCount: -item.quantity }
      });
    }
  }
}

/**
 * Pending State
 */
class PendingState extends OrderState {
  async cancel(order, userId, reason) {
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMins = Math.floor((now - createdAt) / 1000 / 60);

    if (diffMins < 30) {
      const updatedOrder = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CANCELLED, reason);
      await this._returnStock(order);
      
      // Emit event
      orderEventEmitter.emit(ORDER_EVENTS.ORDER_CANCELLED, updatedOrder);
      
      return { order: updatedOrder, message: ERROR_MESSAGES.ORDER_CANCEL_SUCCESS };
    } else {
      throw new Error(ERROR_MESSAGES.ORDER_CANNOT_CANCEL);
    }
  }

  async updateStatus(order, newStatus, rejectionReason = null) {
    const allowed = [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED, ORDER_STATUS.PROCESSING];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from PENDING to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await this._returnStock(order);
      // Emit event
      const updated = await orderRepository.updateStatus(order.id || order._id, newStatus);
      orderEventEmitter.emit(ORDER_EVENTS.ORDER_CANCELLED, updated);
      return updated;
    }

    const updated = await orderRepository.updateStatus(order.id || order._id, newStatus, null, rejectionReason);
    orderEventEmitter.emit(ORDER_EVENTS.ORDER_STATUS_UPDATED, { order: updated, oldStatus: order.status, newStatus });
    return updated;
  }
}

/**
 * Confirmed State
 */
class ConfirmedState extends OrderState {
  async cancel(order, userId, reason) {
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMins = Math.floor((now - createdAt) / 1000 / 60);

    if (diffMins < 30) {
      const updatedOrder = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CANCELLED, reason);
      await this._returnStock(order);
      
      // Emit event
      orderEventEmitter.emit(ORDER_EVENTS.ORDER_CANCELLED, updatedOrder);
      
      return { order: updatedOrder, message: ERROR_MESSAGES.ORDER_CANCEL_SUCCESS };
    } else {
      throw new Error(ERROR_MESSAGES.ORDER_CANNOT_CANCEL);
    }
  }

  async updateStatus(order, newStatus, rejectionReason = null) {
    const allowed = [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from CONFIRMED to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await this._returnStock(order);
      const updated = await orderRepository.updateStatus(order.id || order._id, newStatus);
      orderEventEmitter.emit(ORDER_EVENTS.ORDER_CANCELLED, updated);
      return updated;
    }

    const updated = await orderRepository.updateStatus(
      order.id || order._id, 
      newStatus, 
      null, 
      newStatus === ORDER_STATUS.PROCESSING && order.status === ORDER_STATUS.CANCELLATION_REQUESTED ? rejectionReason : null
    );
    orderEventEmitter.emit(ORDER_EVENTS.ORDER_STATUS_UPDATED, { order: updated, oldStatus: order.status, newStatus });
    return updated;
  }
}

/**
 * Processing State
 */
class ProcessingState extends OrderState {
  async cancel(order, userId, reason) {
    const now = new Date();
    const createdAt = new Date(order.createdAt);
    const diffMins = Math.floor((now - createdAt) / 1000 / 60);

    if (diffMins < 30) {
      const updatedOrder = await orderRepository.updateStatus(order.id || order._id, ORDER_STATUS.CANCELLATION_REQUESTED, reason);
      
      // Emit event
      orderEventEmitter.emit(ORDER_EVENTS.ORDER_CANCELLATION_REQUESTED, updatedOrder);
      
      return { order: updatedOrder, message: ERROR_MESSAGES.ORDER_CANCELLATION_REQUESTED };
    } else {
      throw new Error(ERROR_MESSAGES.ORDER_CANNOT_CANCEL);
    }
  }

  async updateStatus(order, newStatus, rejectionReason = null) {
    const allowed = [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from PROCESSING to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.CANCELLED) {
      await this._returnStock(order);
      const updated = await orderRepository.updateStatus(order.id || order._id, newStatus);
      orderEventEmitter.emit(ORDER_EVENTS.ORDER_CANCELLED, updated);
      return updated;
    }

    const updated = await orderRepository.updateStatus(order.id || order._id, newStatus, null, rejectionReason);
    orderEventEmitter.emit(ORDER_EVENTS.ORDER_STATUS_UPDATED, { order: updated, oldStatus: order.status, newStatus });
    return updated;
  }
}

/**
 * Shipping State
 */
class ShippingState extends OrderState {
  async updateStatus(order, newStatus, rejectionReason = null) {
    const allowed = [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid transition from SHIPPING to ${newStatus}`);
    }

    if (newStatus === ORDER_STATUS.DELIVERED) {
      if (order.paymentMethod === PAYMENT_METHOD.COD) {
        await orderRepository.updatePaymentStatus(order.id || order._id, PAYMENT_STATUS.PAID);
      }

      // Xử lý cộng điểm thưởng cho sản phẩm khi đơn hàng giao thành công
      try {
        const ProductRewardRule = require('../../models/ProductRewardRule');
        const rewardQueue = require('../reward/RewardQueue');
        const { REWARD_SOURCES } = require('../../utils/constants');

        const itemIds = order.items.map(item => item.productId);
        const rules = await ProductRewardRule.find({ productId: { $in: itemIds }, isActive: true });

        const ruleMap = new Map(rules.map(r => [r.productId.toString(), r.rewardPoints]));

        let totalPoints = 0;
        for (const item of order.items) {
          const points = ruleMap.get(item.productId.toString()) || 0;
          totalPoints += points * item.quantity;
        }

        if (totalPoints > 0) {
          const userIdStr = order.userId._id ? order.userId._id.toString() : order.userId.toString();
          await rewardQueue.add(`reward.order.${order.id || order._id}`, {
            userId: userIdStr,
            points: totalPoints,
            source: REWARD_SOURCES.ORDER,
            sourceId: order.id || order._id
          });
        }
      } catch (rewardError) {
        // Ghi nhận lỗi nhưng không chặn luồng giao dịch chính
        console.error('Lỗi khi tính và đẩy điểm thưởng vào queue cho đơn hàng:', rewardError);
      }
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
