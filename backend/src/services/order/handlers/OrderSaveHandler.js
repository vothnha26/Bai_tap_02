const OrderHandler = require('./OrderHandler');
const orderRepository = require('../../../repositories/order.repository');
const productRepository = require('../../../repositories/product.repository');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../../../utils/constants');

class OrderSaveHandler extends OrderHandler {
  async handle(context) {
    const { userId, orderInfo, orderItems, cart, finalAmount, discountAmount, giftItems, promotionCode, promotionInstance } = context;
    const { shippingAddress, phone, note, paymentMethod = PAYMENT_METHOD.COD } = orderInfo;

    // Chuẩn hóa địa chỉ để tương thích ngược với các client/test cũ gửi dạng String
    let addressObject;
    if (typeof shippingAddress === 'string') {
      addressObject = {
        province: 'N/A',
        district: 'N/A',
        ward: 'N/A',
        street: shippingAddress,
        coordinates: { lat: 0, lng: 0 }
      };
    } else {
      addressObject = shippingAddress;
    }

    const orderData = {
      userId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      discountAmount: discountAmount || 0,
      giftItems: giftItems || [],
      promotionCode: promotionCode || undefined,
      finalAmount: finalAmount,
      shippingAddress: addressObject,
      phone,
      note,
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_METHOD.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID,
      status: ORDER_STATUS.PENDING
    };

    const inventoryService = require('../../../services/inventory/InventoryService');
    const updatedInventories = [];

    try {
      // 1. Trừ tồn kho sản phẩm chính một cách an toàn qua Facade Service
      for (const item of orderItems) {
        const updated = await inventoryService.decrementStockSafely(item.productId, item.quantity, {
          reason: `Trừ kho mua hàng sản phẩm SKU: ${item.sku || 'N/A'}`,
          executedBy: 'System'
        });
        if (!updated) {
          throw new Error(`Sản phẩm với ID ${item.productId} đã hết hàng hoặc không đủ tồn kho.`);
        }
        updatedInventories.push({ productId: item.productId, quantity: item.quantity });
      }

      // 2. Trừ tồn kho sản phẩm quà tặng (nếu có) qua Facade Service
      if (giftItems && giftItems.length > 0) {
        for (const gift of giftItems) {
          const updated = await inventoryService.decrementStockSafely(gift.productId, gift.quantity, {
            reason: 'Quà tặng khuyến mại (đơn hàng)',
            executedBy: 'System'
          });
          if (!updated) {
            throw new Error(`Sản phẩm quà tặng với ID ${gift.productId} đã hết hàng hoặc không đủ tồn kho.`);
          }
          updatedInventories.push({ productId: gift.productId, quantity: gift.quantity });
        }
      }

      // 3. Tạo đơn hàng trong DB sau khi trừ kho thành công
      context.order = await orderRepository.create(orderData);

      // 4. Cập nhật số lượng đã bán (soldCount) cho sản phẩm chính
      for (const item of orderItems) {
        await productRepository.update(item.productId, { $inc: { soldCount: item.quantity } });
      }

      // 5. Tăng lượt sử dụng của Promotion (nếu có)
      if (promotionInstance) {
        promotionInstance.usedCount = (promotionInstance.usedCount || 0) + 1;
        await promotionInstance.save();
      }

    } catch (error) {
      // Rollback: Cộng lại kho cho các sản phẩm đã trừ thành công trước đó qua Facade Service
      for (const rolled of updatedInventories) {
        await inventoryService.incrementStock(rolled.productId, rolled.quantity, {
          type: 'RETURN',
          reason: 'Hoàn kho do lỗi tạo đơn hàng',
          executedBy: 'System'
        });
      }
      throw error; // Ném lỗi để ngắt chuỗi Chain of Responsibility (CoR)
    }

    return await super.handle(context);
  }
}

module.exports = OrderSaveHandler;
