const Inventory = require('../models/Inventory');

class InventoryRepository {
  async findByProductId(productId) {
    return await Inventory.findOne({ productId });
  }

  async findByProductIds(productIds) {
    return await Inventory.find({ productId: { $in: productIds } });
  }

  async updateStock(productId, stock, lowStockThreshold = undefined, warehouseLocation = undefined) {
    const updateData = {};
    if (stock !== undefined && stock !== null) updateData.stock = stock;
    if (lowStockThreshold !== undefined && lowStockThreshold !== null) updateData.lowStockThreshold = lowStockThreshold;
    if (warehouseLocation !== undefined && warehouseLocation !== null) updateData.warehouseLocation = warehouseLocation;

    return await Inventory.findOneAndUpdate(
      { productId },
      updateData,
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

  async decrementStockSafely(productId, amount) {
    return await Inventory.findOneAndUpdate(
      { productId, stock: { $gte: amount } },
      { $inc: { stock: -amount } },
      { new: true }
    );
  }

  async getLowStockItems() {
    return await Inventory.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    }).populate('productId');
  }
}

module.exports = new InventoryRepository();
