const OrderHandler = require('./OrderHandler');
const Promotion = require('../../../models/Promotion');
const productRepository = require('../../../repositories/product.repository');
const promotionCalculatorFacade = require('../../promotion/promotion.facade');

class PromotionHandler extends OrderHandler {
  async handle(context) {
    const { promotionCode } = context.orderInfo;
    const { userId } = context;

    if (promotionCode) {
      // 1. Tìm kiếm Promotion trong Database
      const promotion = await Promotion.findOne({ code: promotionCode.toUpperCase() });
      if (!promotion || !promotion.isActive) {
        throw new Error('Mã khuyến mãi không tồn tại hoặc đã hết hạn.');
      }

      // 2. Gọi Facade tính toán discount
      const result = await promotionCalculatorFacade.calculate(
        promotion, 
        context.orderItems, 
        userId, 
        context.shippingFee || 0
      );

      if (!result.isValid) {
        throw new Error(result.message || 'Đơn hàng không đủ điều kiện áp dụng mã.');
      }

      context.promotionCode = promotion.code;
      context.promotionInstance = promotion; // Lưu lại đối tượng để xử lý ở bước OrderSaveHandler
      context.discountAmount = result.discountAmount;
      context.giftItems = result.giftItems || [];
      context.finalAmount = Math.max(0, context.cart.totalAmount - result.discountAmount);

      // Kiểm tra tồn kho các sản phẩm quà tặng (nếu có) nhưng không trừ kho
      if (context.giftItems.length > 0) {
        for (const gift of context.giftItems) {
          const product = await productRepository.findById(gift.productId);
          if (!product || product.stock < gift.quantity) {
            throw new Error(`Sản phẩm quà tặng ${gift.name} đã hết hàng.`);
          }
        }
      }
    }

    return await super.handle(context);
  }
}

module.exports = PromotionHandler;
