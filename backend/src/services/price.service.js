const productDiscountRepository = require('../repositories/productDiscount.repository');

class PriceService {
  /**
   * Tính toán giá bán thực tế (effectivePrice) cho một danh sách các sản phẩm
   * @param {Array} products - Danh sách sản phẩm (Mongoose Documents hoặc plain objects)
   * @returns {Promise<Array>} - Danh sách sản phẩm đã được bổ sung thông tin giá thực tế
   */
  async getEffectivePrices(products) {
    if (!products || products.length === 0) return [];
    
    // Chuẩn hóa input
    const isArray = Array.isArray(products);
    const productList = isArray ? products : [products];
    
    const productIds = productList.map(p => p._id || p.id);
    
    // Lấy tất cả các discount đang hoạt động của các sản phẩm này
    const activeDiscounts = await productDiscountRepository.findActiveDiscountsForProducts(productIds);
    
    // Ánh xạ discount theo productId để tìm kiếm nhanh
    const discountMap = {};
    activeDiscounts.forEach(discount => {
      discountMap[discount.productId.toString()] = discount;
    });

    const result = productList.map(product => {
      // Chuyển sang plain object để dễ dàng thêm các thuộc tính mới
      const pObj = typeof product.toObject === 'function' ? product.toObject() : { ...product };
      
      const discount = discountMap[pObj._id ? pObj._id.toString() : pObj.id.toString()];
      
      if (discount) {
        let discountAmount = 0;
        if (discount.discountType === 'PERCENTAGE') {
          discountAmount = (pObj.price * discount.discountValue) / 100;
        } else if (discount.discountType === 'FIXED_AMOUNT') {
          discountAmount = discount.discountValue;
        }
        
        pObj.effectivePrice = Math.max(0, pObj.price - discountAmount);
        pObj.hasActiveDiscount = true;
        pObj.discountIsStackable = discount.isStackable;
        pObj.discountDetails = {
          discountType: discount.discountType,
          discountValue: discount.discountValue,
          discountAmount: discountAmount,
          startDate: discount.startDate,
          endDate: discount.endDate
        };
      } else {
        pObj.effectivePrice = pObj.price;
        pObj.hasActiveDiscount = false;
        pObj.discountIsStackable = false;
        pObj.discountDetails = null;
      }
      
      // Đảm bảo id đồng bộ
      if (pObj._id && !pObj.id) {
        pObj.id = pObj._id.toString();
      }
      
      return pObj;
    });

    return isArray ? result : result[0];
  }
}

module.exports = new PriceService();
