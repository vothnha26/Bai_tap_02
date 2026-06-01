const BasePromotionStrategy = require('./BasePromotionStrategy');

class OrderTotalDiscountStrategy extends BasePromotionStrategy {
  async apply(promotion, items, shippingFee) {
    const applicableItems = this.filterApplicableItems(promotion, items);
    if (applicableItems.length === 0) {
      return { discountAmount: 0, giftItems: [] };
    }

    // Tính tổng tiền của các sản phẩm hợp lệ
    const targetAmount = applicableItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const discountAmount = this.calculateDiscountValue(
      promotion.actions.discountType,
      promotion.actions.discountValue,
      targetAmount,
      promotion.actions.maxDiscountAmount
    );

    return { discountAmount, giftItems: [] };
  }
}

module.exports = OrderTotalDiscountStrategy;
