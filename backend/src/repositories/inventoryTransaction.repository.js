const InventoryTransaction = require('../models/InventoryTransaction');
const Product = require('../models/Product');

class InventoryTransactionRepository {
  async createTransaction(data) {
    const transaction = new InventoryTransaction(data);
    return await transaction.save();
  }

  async getTransactionsList({ productId, type, search, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const query = {};

    if (productId) {
      query.productId = productId;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      // Tìm kiếm theo tên sản phẩm
      const matchingProducts = await Product.find({
        name: { $regex: search, $options: 'i' }
      }, '_id');
      const productIds = matchingProducts.map(p => p._id);
      query.productId = { $in: productIds };
    }

    const totalItems = await InventoryTransaction.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const transactions = await InventoryTransaction.find(query)
      .populate('productId', 'name images sku price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      transactions,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit
      }
    };
  }
}

module.exports = new InventoryTransactionRepository();
