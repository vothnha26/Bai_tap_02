const { PROMOTION_DISCOUNT_TYPES } = require('../../../utils/constants');

class BasePromotionStrategy {
  /**
   * Lọc danh sách items trong giỏ hàng thỏa mãn điều kiện áp dụng của Promotion (theo applicableProductIds và applicableCategoryIds)
   */
  filterApplicableItems(promotion, items) {
    const appProdIds = promotion.conditions.applicableProductIds || [];
    const appCatIds = promotion.conditions.applicableCategoryIds || [];

    let filtered = items;
    if (appProdIds.length > 0 || appCatIds.length > 0) {
      filtered = items.filter(item => {
        const matchProduct = appProdIds.length === 0 || appProdIds.some(id => id.toString() === item.productId.toString());
        // Hỗ trợ kiểm tra categoryId nếu có đính kèm trong item
        const matchCategory = appCatIds.length === 0 || (item.categoryId && appCatIds.some(id => id.toString() === item.categoryId.toString()));
        
        return matchProduct && matchCategory;
      });
    }

    // Áp dụng luật cộng dồn (Stackable Rules)
    return filtered.filter(item => {
      if (item.hasActiveDiscount) {
        return item.discountIsStackable && promotion.isStackable;
      }
      return true; // Sản phẩm không có giảm giá trực tiếp luôn được áp dụng Voucher
    });
  }

  /**
   * Tính toán giá trị discount dựa trên discountType (PERCENTAGE hoặc FIXED_AMOUNT)
   */
  calculateDiscountValue(discountType, discountValue, targetAmount, maxDiscountAmount) {
    if (discountType === PROMOTION_DISCOUNT_TYPES.PERCENTAGE) {
      let discount = (targetAmount * discountValue) / 100;
      if (maxDiscountAmount && discount > maxDiscountAmount) {
        discount = maxDiscountAmount;
      }
      return discount;
    } else if (discountType === PROMOTION_DISCOUNT_TYPES.FIXED_AMOUNT) {
      return Math.min(discountValue, targetAmount);
    }
    return 0;
  }

  async apply(promotion, items, shippingFee) {
    throw new Error('Method apply() must be implemented');
  }
}

module.exports = BasePromotionStrategy;
