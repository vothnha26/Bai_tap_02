const ProductDiscount = require('../models/ProductDiscount');

class ProductDiscountRepository {
  async findActiveDiscount(productId) {
    const now = new Date();
    return await ProductDiscount.findOne({
      productId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
  }

  async findActiveDiscountsForProducts(productIds) {
    const now = new Date();
    return await ProductDiscount.find({
      productId: { $in: productIds },
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    });
  }

  async findByProductId(productId) {
    return await ProductDiscount.find({ productId }).sort({ startDate: -1 });
  }

  async create(data) {
    const discount = new ProductDiscount(data);
    return await discount.save();
  }

  async update(id, data) {
    return await ProductDiscount.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await ProductDiscount.findByIdAndDelete(id);
  }

  async deleteByProductId(productId) {
    return await ProductDiscount.deleteMany({ productId });
  }

  async findAll() {
    return await ProductDiscount.find({}).populate('productId', 'name price');
  }
}

module.exports = new ProductDiscountRepository();
