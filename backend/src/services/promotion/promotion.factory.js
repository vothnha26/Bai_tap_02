const { PROMOTION_TYPES, PROMOTION_APPLY_TO } = require('../../utils/constants');
const OrderTotalDiscountStrategy = require('./strategies/OrderTotalDiscountStrategy');
const CheapestItemDiscountStrategy = require('./strategies/CheapestItemDiscountStrategy');
const MostExpensiveItemDiscountStrategy = require('./strategies/MostExpensiveItemDiscountStrategy');
const SpecificItemsDiscountStrategy = require('./strategies/SpecificItemsDiscountStrategy');
const ShippingFeeDiscountStrategy = require('./strategies/ShippingFeeDiscountStrategy');
const GiftPromotionStrategy = require('./strategies/GiftPromotionStrategy');
const AddOnDiscountStrategy = require('./strategies/AddOnDiscountStrategy');

class PromotionStrategyFactory {
  static getStrategy(promotionType, applyDiscountTo) {
    if (promotionType === PROMOTION_TYPES.GIFT) {
      return new GiftPromotionStrategy();
    }

    if (promotionType === PROMOTION_TYPES.SHIPPING) {
      return new ShippingFeeDiscountStrategy();
    }

    if (promotionType === PROMOTION_TYPES.DISCOUNT) {
      switch (applyDiscountTo) {
        case PROMOTION_APPLY_TO.ORDER_TOTAL:
          return new OrderTotalDiscountStrategy();
        case PROMOTION_APPLY_TO.CHEAPEST_ITEM:
          return new CheapestItemDiscountStrategy();
        case PROMOTION_APPLY_TO.MOST_EXPENSIVE_ITEM:
          return new MostExpensiveItemDiscountStrategy();
        case PROMOTION_APPLY_TO.SPECIFIC_ITEMS:
          return new SpecificItemsDiscountStrategy();
        case PROMOTION_APPLY_TO.SHIPPING_FEE:
          return new ShippingFeeDiscountStrategy();
        case PROMOTION_APPLY_TO.ADD_ON_ITEMS:
          return new AddOnDiscountStrategy();
        default:
          return new OrderTotalDiscountStrategy();
      }
    }

    throw new Error(`Loại khuyến mãi không được hỗ trợ: ${promotionType}`);
  }
}

module.exports = PromotionStrategyFactory;
