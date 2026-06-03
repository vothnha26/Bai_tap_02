const { PROMOTION_MATCH_TYPES, PROMOTION_USER_GROUPS } = require('../../utils/constants');
const PromotionStrategyFactory = require('./promotion.factory');
const priceService = require('./price.service');
const mongoose = require('mongoose');
const logger = require('../../utils/logger');

class PromotionCalculatorFacade {
  async calculate(promotion, items, userId, shippingFee = 0) {
    // 1. Kiểm tra trạng thái hoạt động
    if (!promotion.isActive) {
      return { isValid: false, message: 'Khuyến mãi đã ngừng hoạt động.' };
    }

    // Hydrate items from Database to ensure price security and L1 discount properties
    try {
      const Product = mongoose.model('Product');
      const productIds = items.map(item => item.productId);
      const dbProducts = await Product.find({ _id: { $in: productIds } });
      const productsWithPricing = await priceService.getEffectivePrices(dbProducts);

      const pricingMap = {};
      productsWithPricing.forEach(p => {
        pricingMap[p._id.toString()] = p;
      });

      items = items.map(item => {
        const pInfo = pricingMap[item.productId.toString()];
        return {
          ...item,
          price: pInfo ? pInfo.effectivePrice : item.price,
          originalPrice: pInfo ? pInfo.price : item.price,
          categoryId: pInfo && pInfo.categories && pInfo.categories.length > 0 
            ? (pInfo.categories[0]._id || pInfo.categories[0]).toString() 
            : item.categoryId,
          hasActiveDiscount: pInfo ? pInfo.hasActiveDiscount : false,
          discountIsStackable: pInfo ? pInfo.discountIsStackable : false
        };
      });
    } catch (err) {
      logger.error('Error hydrating items in PromotionCalculatorFacade:', err);
    }

    const now = new Date();
    // Chuyển sang giờ Việt Nam (GMT+7)
    const tzOffset = 7 * 60; // offset in minutes
    const localNow = new Date(now.getTime() + tzOffset * 60 * 1000);

    // Chuẩn hóa ngày dạng YYYY-MM-DD và MM-DD
    const yyyy = localNow.getUTCFullYear();
    const mm = String(localNow.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(localNow.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const shortDateStr = `${mm}-${dd}`;

    // Khung giờ dạng HH:mm
    const hour = String(localNow.getUTCHours()).padStart(2, '0');
    const minute = String(localNow.getUTCMinutes()).padStart(2, '0');
    const timeStr = `${hour}:${minute}`;

    // A. Kiểm tra ngày bắt đầu & kết thúc (không tính giờ phút giây)
    const startDate = new Date(promotion.schedule.startDate);
    const endDate = new Date(promotion.schedule.endDate);
    
    // Đặt giờ về 00:00:00 để so sánh chỉ phần ngày
    const todayZero = new Date(dateStr + 'T00:00:00');
    const startZero = new Date(startDate.toISOString().split('T')[0] + 'T00:00:00');
    const endZero = new Date(endDate.toISOString().split('T')[0] + 'T00:00:00');

    if (todayZero < startZero || todayZero > endZero) {
      return { isValid: false, message: 'Khuyến mãi không nằm trong thời gian hoạt động.' };
    }

    // B. Kiểm tra ngày loại trừ (excludeDates)
    if (promotion.schedule.excludeDates && (promotion.schedule.excludeDates.includes(dateStr) || promotion.schedule.excludeDates.includes(shortDateStr))) {
      return { isValid: false, message: 'Khuyến mãi không áp dụng cho ngày hôm nay.' };
    }

    // C. Kiểm tra ngày cụ thể (specificDates) - Nếu có cấu hình thì hôm nay bắt buộc phải thuộc danh sách đó
    if (promotion.schedule.specificDates && promotion.schedule.specificDates.length > 0) {
      if (!promotion.schedule.specificDates.includes(dateStr) && !promotion.schedule.specificDates.includes(shortDateStr)) {
        return { isValid: false, message: 'Khuyến mãi không áp dụng cho ngày hôm nay.' };
      }
    }

    // D. Kiểm tra các thứ trong tuần (daysOfWeek) - Nếu có cấu hình
    if (promotion.schedule.daysOfWeek && promotion.schedule.daysOfWeek.length > 0) {
      const dayOfWeek = localNow.getUTCDay(); // 0: CN, 1: Thứ 2...
      if (!promotion.schedule.daysOfWeek.includes(dayOfWeek)) {
        return { isValid: false, message: 'Khuyến mãi không áp dụng cho thứ này trong tuần.' };
      }
    }

    // E. Kiểm tra khung giờ hoạt động (timeSlots) - Nếu có cấu hình
    if (promotion.schedule.timeSlots && promotion.schedule.timeSlots.length > 0) {
      const isInSlot = promotion.schedule.timeSlots.some(slot => timeStr >= slot.start && timeStr <= slot.end);
      if (!isInSlot) {
        return { isValid: false, message: 'Khuyến mãi không trong khung giờ áp dụng.' };
      }
    }

    // F. Kiểm tra giới hạn số lượt sử dụng toàn hệ thống
    if (promotion.usageLimit !== null && promotion.usageLimit !== undefined) {
      if (promotion.usedCount >= promotion.usageLimit) {
        return { isValid: false, message: 'Mã khuyến mãi đã hết lượt sử dụng.' };
      }
    }

    // G. Lọc sản phẩm chính hợp lệ trong giỏ hàng để kiểm định tiếp
    const appProdIds = promotion.conditions.applicableProductIds || [];
    const appCatIds = promotion.conditions.applicableCategoryIds || [];
    
    let primaryItems = items;
    if (appProdIds.length > 0 || appCatIds.length > 0) {
      primaryItems = items.filter(item => {
        const matchProduct = appProdIds.length === 0 || appProdIds.some(id => id.toString() === item.productId.toString());
        const matchCategory = appCatIds.length === 0 || (item.categoryId && appCatIds.some(id => id.toString() === item.categoryId.toString()));
        return matchProduct && matchCategory;
      });
    }

    // Áp dụng luật cộng dồn (Stackable Rules) lên sản phẩm chính
    // Ngoại lệ: Nếu là khuyến mãi mua kèm (ADD_ON_ITEMS), sản phẩm chính chỉ đóng vai trò trigger kích hoạt nên không bị ràng buộc cộng dồn
    if (promotion.actions.applyDiscountTo !== 'ADD_ON_ITEMS') {
      primaryItems = primaryItems.filter(item => {
        if (item.hasActiveDiscount) {
          return item.discountIsStackable && promotion.isStackable;
        }
        return true; // Sản phẩm không có giảm giá trực tiếp luôn được áp dụng Voucher
      });
    }

    if (primaryItems.length === 0) {
      return { isValid: false, message: 'Đơn hàng không chứa sản phẩm được áp dụng khuyến mãi hoặc sản phẩm đang sale không cho phép cộng dồn.' };
    }

    // H. Kiểm tra tổng số tiền sản phẩm chính tối thiểu (minOrderAmount)
    const targetAmount = primaryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (targetAmount < promotion.conditions.minOrderAmount) {
      return { isValid: false, message: `Tổng giá trị sản phẩm chính phải tối thiểu ${promotion.conditions.minOrderAmount.toLocaleString('vi-VN')}đ.` };
    }

    // I. Kiểm tra số lượng sản phẩm chính tối thiểu (minQuantity & matchType)
    const minQty = promotion.conditions.minQuantity || 1;
    if (promotion.conditions.matchType === PROMOTION_MATCH_TYPES.ANY_COMBINATION) {
      const totalQty = primaryItems.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty < minQty) {
        return { isValid: false, message: `Tổng số lượng sản phẩm chính phải tối thiểu ${minQty}.` };
      }
    } else if (promotion.conditions.matchType === PROMOTION_MATCH_TYPES.SINGLE_PRODUCT_MIN) {
      const hasMinQty = primaryItems.some(item => item.quantity >= minQty);
      if (!hasMinQty) {
        return { isValid: false, message: `Phải có ít nhất 1 sản phẩm chính áp dụng với số lượng tối thiểu là ${minQty}.` };
      }
    }

    // Xác định danh sách sản phẩm truyền vào Strategy
    let strategyItems = primaryItems;
    if (promotion.actions.applyDiscountTo === 'ADD_ON_ITEMS') {
      const addOnProdIds = promotion.actions.addOnProductIds || [];
      const addOnItems = items.filter(item =>
        addOnProdIds.some(id => id.toString() === item.productId.toString())
      );
      // Gộp sản phẩm chính và phụ
      strategyItems = [...primaryItems, ...addOnItems];
    }

    // J. Lấy Strategy tương ứng và tính toán giảm giá/quà tặng
    const strategy = PromotionStrategyFactory.getStrategy(promotion.type, promotion.actions.applyDiscountTo);
    const { discountAmount, giftItems } = await strategy.apply(promotion, strategyItems, shippingFee);

    // K. Giới hạn discountAmount không vượt quá tổng giá trị đơn hàng
    const totalOrderAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalDiscount = Math.min(discountAmount, totalOrderAmount);

    return {
      isValid: true,
      discountAmount: finalDiscount,
      giftItems: giftItems || []
    };
  }
}

module.exports = new PromotionCalculatorFacade();
