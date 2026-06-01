const inventoryRepository = require('../../repositories/inventory.repository');
const inventoryTransactionRepository = require('../../repositories/inventoryTransaction.repository');
const inventoryTransactionFactory = require('./InventoryTransactionFactory');

class InventoryService {
  async submitStockTake(productId, actualStock, reason, adminEmail) {
    const currentInventory = await inventoryRepository.findByProductId(productId);
    const previousStock = currentInventory ? currentInventory.stock : 0;

    // Cập nhật kho mới
    const updatedInventory = await inventoryRepository.updateStock(productId, actualStock);

    // Ghi log biến động
    const transactionDescriptor = inventoryTransactionFactory.createDescriptor('STOCK_TAKE', {
      productId,
      previousStock,
      newStock: actualStock,
      reason,
      executedBy: adminEmail
    });
    await inventoryTransactionRepository.createTransaction(transactionDescriptor);

    return updatedInventory;
  }

  async decrementStockSafely(productId, quantity, { reason = 'Khách đặt mua hàng', executedBy = 'System' } = {}) {
    const currentInventory = await inventoryRepository.findByProductId(productId);
    if (!currentInventory || currentInventory.stock < quantity) {
      return null;
    }

    const previousStock = currentInventory.stock;

    // Thực hiện trừ kho một cách an toàn
    const updatedInventory = await inventoryRepository.decrementStockSafely(productId, quantity);
    if (!updatedInventory) {
      return null;
    }

    // Ghi log biến động
    const transactionDescriptor = inventoryTransactionFactory.createDescriptor('SALE', {
      productId,
      previousStock,
      quantity,
      reason,
      executedBy
    });
    await inventoryTransactionRepository.createTransaction(transactionDescriptor);

    return updatedInventory;
  }

  async incrementStock(productId, quantity, { type = 'RESTOCK', reason = 'Nhập thêm kho', executedBy = 'System' } = {}) {
    const currentInventory = await inventoryRepository.findByProductId(productId);
    const previousStock = currentInventory ? currentInventory.stock : 0;

    // Thực hiện tăng kho
    const updatedInventory = await inventoryRepository.incrementStock(productId, quantity);

    // Ghi log biến động
    const transactionDescriptor = inventoryTransactionFactory.createDescriptor(type, {
      productId,
      previousStock,
      quantity,
      reason,
      executedBy
    });
    await inventoryTransactionRepository.createTransaction(transactionDescriptor);

    return updatedInventory;
  }
}

module.exports = new InventoryService();
