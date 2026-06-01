const OrderHandler = require('./OrderHandler');
const orderRepository = require('../../../repositories/order.repository');
const productRepository = require('../../../repositories/product.repository');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../../../utils/constants');

class OrderSaveHandler extends OrderHandler {
  async handle(context) {
    const { userId, orderInfo, orderItems, cart, finalAmount, discountAmount, giftItems, promotionCode, promotionInstance } = context;
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

    // 1. Tạo đơn hàng trong DB
    context.order = await orderRepository.create(orderData);

    const inventoryRepository = require('../../../repositories/inventory.repository');

    // 2. Trừ tồn kho và cập nhật số lượng đã bán cho sản phẩm chính
    for (const item of orderItems) {
      // Trừ tồn kho trong bảng Inventory
      await inventoryRepository.incrementStock(item.productId, -item.quantity);
      // Tăng soldCount trong bảng Product
      await productRepository.update(item.productId, { $inc: { soldCount: item.quantity } });
    }

    // 3. Trừ tồn kho sản phẩm quà tặng (nếu có)
    if (giftItems && giftItems.length > 0) {
      for (const gift of giftItems) {
        await inventoryRepository.incrementStock(gift.productId, -gift.quantity);
      }
    }

    // 4. Tăng lượt sử dụng của Promotion (nếu có)
    if (promotionInstance) {
      promotionInstance.usedCount = (promotionInstance.usedCount || 0) + 1;
      await promotionInstance.save();
    }

    return await super.handle(context);
  }
}

module.exports = OrderSaveHandler;
