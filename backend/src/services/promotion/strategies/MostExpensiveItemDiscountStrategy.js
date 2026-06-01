const BasePromotionStrategy = require('./BasePromotionStrategy');

class MostExpensiveItemDiscountStrategy extends BasePromotionStrategy {
  async apply(promotion, items, shippingFee) {
    const applicableItems = this.filterApplicableItems(promotion, items);
    if (applicableItems.length === 0) {
      return { discountAmount: 0, giftItems: [] };
    }

    // Tìm sản phẩm đắt nhất
    let mostExpensiveItem = applicableItems[0];
    for (const item of applicableItems) {
      if (item.price > mostExpensiveItem.price) {
        mostExpensiveItem = item;
      }
    }

    const targetAmount = mostExpensiveItem.price;

    const discountAmount = this.calculateDiscountValue(
      promotion.actions.discountType,
      promotion.actions.discountValue,
      targetAmount,
      promotion.actions.maxDiscountAmount
    );

    return { discountAmount, giftItems: [] };
  }
}

module.exports = MostExpensiveItemDiscountStrategy;
