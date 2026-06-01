const BasePromotionStrategy = require('./BasePromotionStrategy');
const mongoose = require('mongoose');

class GiftPromotionStrategy extends BasePromotionStrategy {
  async apply(promotion, items, shippingFee) {
    const giftItems = [];
    const giftOptions = promotion.actions.giftOptions;

    if (!giftOptions) {
      return { discountAmount: 0, giftItems: [] };
    }

    const quantity = giftOptions.giftQuantity || 1;
    // Sử dụng dynamic require để tránh vòng lặp circular dependency hoặc lỗi load model Product
    const Product = mongoose.model('Product');

    if (giftOptions.isSameAsPurchase) {
      // Tặng chính sản phẩm đã mua (Lấy sản phẩm hợp lệ đầu tiên trong giỏ)
      const applicableItems = this.filterApplicableItems(promotion, items);
      if (applicableItems.length > 0) {
        const targetItem = applicableItems[0];
        const product = await Product.findById(targetItem.productId);
        if (product) {
          giftItems.push({
            productId: product._id,
            name: product.name,
            quantity: quantity,
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : ''
          });
        }
      }
    } else {
      // Tặng sản phẩm chỉ định trong selectableProducts
      const products = giftOptions.selectableProducts || [];
      if (products.length > 0) {
        const product = await Product.findById(products[0]);
        if (product) {
          giftItems.push({
            productId: product._id,
            name: product.name,
            quantity: quantity,
            imageUrl: product.images && product.images.length > 0 ? product.images[0] : ''
          });
        }
      }
    }

    return { discountAmount: 0, giftItems };
  }
}

module.exports = GiftPromotionStrategy;
