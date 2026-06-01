const promotionRepository = require('../repositories/promotion.repository');
const promotionCalculatorFacade = require('./promotion/promotion.facade');

class PromotionService {
  async createPromotion(data) {
    return await promotionRepository.create(data);
  }

  async updatePromotion(id, data) {
    const promotion = await promotionRepository.update(id, data);
    if (!promotion) {
      throw new Error('Khuyến mãi không tồn tại.');
    }
    return promotion;
  }

  async deletePromotion(id) {
    const promotion = await promotionRepository.delete(id);
    if (!promotion) {
      throw new Error('Khuyến mãi không tồn tại.');
    }
    return promotion;
  }

  async getAllPromotions(query = {}) {
    return await promotionRepository.findAll(query);
  }

  async getPromotionById(id) {
    const promotion = await promotionRepository.findById(id);
    if (!promotion) {
      throw new Error('Khuyến mãi không tồn tại.');
    }
    return promotion;
  }

  async applyPromotionCode(code, items, userId, shippingFee = 0) {
    const promotion = await promotionRepository.findByCode(code);
    if (!promotion || !promotion.isActive) {
      throw new Error('Mã khuyến mãi không tồn tại hoặc đã hết hạn.');
    }

    const result = await promotionCalculatorFacade.calculate(promotion, items, userId, shippingFee);
    if (!result.isValid) {
      throw new Error(result.message || 'Đơn hàng không đủ điều kiện áp dụng mã.');
    }

    return {
      code: promotion.code,
      name: promotion.name,
      type: promotion.type,
      discountAmount: result.discountAmount,
      giftItems: result.giftItems
    };
  }

  async getApplicablePromotions(items, userId, shippingFee = 0) {
    const allPromotions = await promotionRepository.findAll({ isActive: true });
    const applicable = [];

    for (const promotion of allPromotions) {
      try {
        const result = await promotionCalculatorFacade.calculate(promotion, items, userId, shippingFee);
        if (result.isValid) {
          applicable.push({
            _id: promotion._id,
            code: promotion.code,
            name: promotion.name,
            type: promotion.type,
            discountAmount: result.discountAmount,
            giftItems: result.giftItems
          });
        }
      } catch (err) {
        // Bỏ qua các promotion không đủ điều kiện
      }
    }

    return applicable;
  }
}

module.exports = new PromotionService();
