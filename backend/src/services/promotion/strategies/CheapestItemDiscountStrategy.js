const BasePromotionStrategy = require('./BasePromotionStrategy');

class CheapestItemDiscountStrategy extends BasePromotionStrategy {
  async apply(promotion, items, shippingFee) {
    const applicableItems = this.filterApplicableItems(promotion, items);
    if (applicableItems.length === 0) {
      return { discountAmount: 0, giftItems: [] };
    }

    // Tìm sản phẩm rẻ nhất
    let cheapestItem = applicableItems[0];
    for (const item of applicableItems) {
      if (item.price < cheapestItem.price) {
        cheapestItem = item;
      }
    }

    // Áp dụng giảm giá cho 1 sản phẩm rẻ nhất
    const targetAmount = cheapestItem.price;

    const discountAmount = this.calculateDiscountValue(
      promotion.actions.discountType,
      promotion.actions.discountValue,
      targetAmount,
      promotion.actions.maxDiscountAmount
    );

    return { discountAmount, giftItems: [] };
  }
}

module.exports = CheapestItemDiscountStrategy;
