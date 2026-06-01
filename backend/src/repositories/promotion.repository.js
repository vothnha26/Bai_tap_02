const Promotion = require('../models/Promotion');

class PromotionRepository {
  async create(data) {
    return await Promotion.create(data);
  }

  async findById(id) {
    return await Promotion.findById(id);
  }

  async findByCode(code) {
    return await Promotion.findOne({ code: code.toUpperCase() });
  }

  async findAll(query = {}) {
    return await Promotion.find(query).sort({ priority: -1, createdAt: -1 });
  }

  async update(id, data) {
    // Để trigger Mongoose pre('save') hook cho validation chạy đúng,
    // ta nên find và gán thuộc tính rồi gọi save() thay vì findByIdAndUpdate.
    const promotion = await Promotion.findById(id);
    if (!promotion) return null;
    
    Object.assign(promotion, data);
    return await promotion.save();
  }

  async delete(id) {
    return await Promotion.findByIdAndDelete(id);
  }

  async incrementUsedCount(id) {
    return await Promotion.findByIdAndUpdate(id, { $inc: { usedCount: 1 } }, { new: true });
  }
}

module.exports = new PromotionRepository();
