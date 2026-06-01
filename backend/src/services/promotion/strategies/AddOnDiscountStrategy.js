const BasePromotionStrategy = require('./BasePromotionStrategy');

class AddOnDiscountStrategy extends BasePromotionStrategy {
  async apply(promotion, items, shippingFee) {
    const primaryProductIds = promotion.conditions.applicableProductIds || [];
    const addOnProductIds = promotion.actions.addOnProductIds || [];
    const maxAddOnQuantity = promotion.actions.maxAddOnQuantity || 1;

    // 1. Tìm các sản phẩm chính trong giỏ hàng
    const primaryItemsInCart = items.filter(item =>
      primaryProductIds.some(id => id.toString() === item.productId.toString())
    );

    // Nếu không có sản phẩm chính nào, không được giảm giá mua kèm
    if (primaryItemsInCart.length === 0) {
      return { discountAmount: 0, giftItems: [] };
    }

    // 2. Tính tổng số lượng sản phẩm chính mua kèm
    const totalPrimaryQty = primaryItemsInCart.reduce((sum, item) => sum + item.quantity, 0);

    // Giới hạn tổng số lượng sản phẩm phụ được giảm sâu
    const maxAddOnSlotsAllowed = totalPrimaryQty * maxAddOnQuantity;

    // 3. Tìm các sản phẩm phụ trong giỏ hàng
    const addOnItemsInCart = items.filter(item =>
      addOnProductIds.some(id => id.toString() === item.productId.toString())
    );

    // Nếu không có sản phẩm phụ nào, không được giảm giá
    if (addOnItemsInCart.length === 0) {
      return { discountAmount: 0, giftItems: [] };
    }

    // Không áp dụng ràng buộc cộng dồn lên phụ kiện mua kèm, vì đây là ưu đãi mua kèm có chủ ý của hệ thống
    const stackableAddOnItems = addOnItemsInCart;

    // 4. Sắp xếp sản phẩm phụ theo giá từ đắt đến rẻ để tối ưu lợi ích cho khách hàng
    const sortedAddOnItems = [...stackableAddOnItems].sort((a, b) => b.price - a.price);

    let totalDiscount = 0;
    let filledSlots = 0;

    for (const item of sortedAddOnItems) {
      if (filledSlots >= maxAddOnSlotsAllowed) break;

      const remainingSlots = maxAddOnSlotsAllowed - filledSlots;
      const countToApply = Math.min(item.quantity, remainingSlots);

      // Tính tổng giá trị của các sản phẩm phụ được áp dụng giảm giá trong slot này
      const targetAmount = item.price * countToApply;

      // Tính số tiền giảm giá cho item này
      const itemDiscount = this.calculateDiscountValue(
        promotion.actions.discountType,
        promotion.actions.discountValue,
        targetAmount,
        promotion.actions.maxDiscountAmount // Số tiền giảm tối đa (nếu có cấu hình)
      );

      totalDiscount += itemDiscount;
      filledSlots += countToApply;
    }

    return { discountAmount: totalDiscount, giftItems: [] };
  }
}

module.exports = AddOnDiscountStrategy;
