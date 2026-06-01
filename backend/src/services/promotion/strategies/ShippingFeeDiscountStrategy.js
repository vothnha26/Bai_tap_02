const BasePromotionStrategy = require('./BasePromotionStrategy');

class ShippingFeeDiscountStrategy extends BasePromotionStrategy {
  async apply(promotion, items, shippingFee) {
    if (!shippingFee || shippingFee <= 0) {
      return { discountAmount: 0, giftItems: [] };
    }

    const discountAmount = this.calculateDiscountValue(
      promotion.actions.discountType,
      promotion.actions.discountValue,
      shippingFee,
      promotion.actions.maxDiscountAmount
    );

    return { discountAmount, giftItems: [] };
  }
}

module.exports = ShippingFeeDiscountStrategy;
