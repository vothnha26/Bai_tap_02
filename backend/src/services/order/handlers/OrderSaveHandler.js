const OrderHandler = require('./OrderHandler');
const orderRepository = require('../../../repositories/order.repository');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../../../utils/constants');

class OrderSaveHandler extends OrderHandler {
  async handle(context) {
    const { userId, orderInfo, orderItems, cart, finalAmount, discountAmount, giftItems, promotionCode } = context;
    const { shippingAddress, phone, note, paymentMethod = PAYMENT_METHOD.COD } = orderInfo;

    const orderData = {
      userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      discountAmount: discountAmount || 0,
      giftItems: giftItems || [],
      promotionCode: promotionCode || undefined,
      finalAmount: finalAmount,
      shippingAddress,
      phone,
      note,
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_METHOD.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID,
      status: ORDER_STATUS.PENDING
    };

    context.order = await orderRepository.create(orderData);
    return await super.handle(context);
  }
}

module.exports = OrderSaveHandler;
