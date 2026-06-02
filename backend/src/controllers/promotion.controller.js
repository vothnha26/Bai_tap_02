const promotionService = require('../services/promotion/promotion.service');

class PromotionController {
  // Admin APIs
  async createPromotion(req, res, next) {
    try {
      const promotion = await promotionService.createPromotion(req.body);
      res.status(201).json({ success: true, data: promotion });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updatePromotion(req, res, next) {
    try {
      const promotion = await promotionService.updatePromotion(req.params.id, req.body);
      res.status(200).json({ success: true, data: promotion });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deletePromotion(req, res, next) {
    try {
      await promotionService.deletePromotion(req.params.id);
      res.status(200).json({ success: true, message: 'Xóa khuyến mãi thành công.' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllPromotions(req, res, next) {
    try {
      const query = req.query.isActive !== undefined ? { isActive: req.query.isActive === 'true' } : {};
      const promotions = await promotionService.getAllPromotions(query);
      res.status(200).json({ success: true, data: promotions });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPromotionById(req, res, next) {
    try {
      const promotion = await promotionService.getPromotionById(req.params.id);
      res.status(200).json({ success: true, data: promotion });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // User/Client APIs
  async applyPromotion(req, res, next) {
    try {
      const { code, items, shippingFee } = req.body;
      const userId = req.user.id;
      
      const result = await promotionService.applyPromotionCode(code, items, userId, shippingFee);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getApplicablePromotions(req, res, next) {
    try {
      const { items, shippingFee } = req.body;
      const userId = req.user.id;

      const result = await promotionService.getApplicablePromotions(items, userId, shippingFee);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PromotionController();
