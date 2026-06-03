const EventEmitter = require('events');
const logger = require('../../utils/logger');

class OrderEventEmitter extends EventEmitter {}

const orderEventEmitter = new OrderEventEmitter();

const ORDER_EVENTS = {
  ORDER_CREATED: 'order.created',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_CANCELLATION_REQUESTED: 'order.cancellation_requested',
  ORDER_STATUS_UPDATED: 'order.status_updated',
};

// Đăng ký một Listener mặc định để phục vụ cho việc debug/logging
orderEventEmitter.on(ORDER_EVENTS.ORDER_CREATED, (order) => {
  logger.info(`[OrderEvent] Event ORDER_CREATED triggered for order: ${order.id || order._id}`);
});

orderEventEmitter.on(ORDER_EVENTS.ORDER_CANCELLED, (order) => {
  logger.info(`[OrderEvent] Event ORDER_CANCELLED triggered for order: ${order.id || order._id}`);
});

orderEventEmitter.on(ORDER_EVENTS.ORDER_CANCELLATION_REQUESTED, (order) => {
  logger.info(`[OrderEvent] Event ORDER_CANCELLATION_REQUESTED triggered for order: ${order.id || order._id}`);
});

orderEventEmitter.on(ORDER_EVENTS.ORDER_STATUS_UPDATED, ({ order, oldStatus, newStatus }) => {
  logger.info(`[OrderEvent] Event ORDER_STATUS_UPDATED triggered for order: ${order.id || order._id} from ${oldStatus} to ${newStatus}`);
});

module.exports = {
  orderEventEmitter,
  ORDER_EVENTS,
};
