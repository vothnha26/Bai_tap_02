const Inventory = require('../models/Inventory');

class InventoryRepository {
  async findByProductId(productId) {
    return await Inventory.findOne({ productId });
  }

  async findByProductIds(productIds) {
    return await Inventory.find({ productId: { $in: productIds } });
  }

  async updateStock(productId, stock) {
    return await Inventory.findOneAndUpdate(
      { productId },
      { stock },
      { new: true, upsert: true }
    );
  }

  async incrementStock(productId, amount) {
    const inventory = await Inventory.findOneAndUpdate(
      { productId },
      { $inc: { stock: amount } },
      { new: true, upsert: true }
    );
    
    // Đảm bảo stock không âm
    if (inventory.stock < 0) {
      inventory.stock = 0;
      await inventory.save();
    }
    return inventory;
  }
}

module.exports = new InventoryRepository();
