const BasePromotionStrategy = require('./BasePromotionStrategy');

class SpecificItemsDiscountStrategy extends BasePromotionStrategy {
  async apply(promotion, items, shippingFee) {
    const applicableItems = this.filterApplicableItems(promotion, items);
    if (applicableItems.length === 0) {
      return { discountAmount: 0, giftItems: [] };
    }

    // Sắp xếp các sản phẩm hợp lệ từ đắt đến rẻ để tối ưu lợi ích giảm giá cho khách hàng
    const sortedItems = [...applicableItems].sort((a, b) => b.price - a.price);

    let maxApplied = promotion.actions.maxAppliedItems || 1;
    let targetAmount = 0;
    let appliedCount = 0;

    for (const item of sortedItems) {
      if (appliedCount >= maxApplied) break;

      const remainingSlots = maxApplied - appliedCount;
      const countToApply = Math.min(item.quantity, remainingSlots);

      targetAmount += item.price * countToApply;
      appliedCount += countToApply;
    }

    const discountAmount = this.calculateDiscountValue(
      promotion.actions.discountType,
      promotion.actions.discountValue,
      targetAmount,
      promotion.actions.maxDiscountAmount
    );

    return { discountAmount, giftItems: [] };
  }
}

module.exports = SpecificItemsDiscountStrategy;
