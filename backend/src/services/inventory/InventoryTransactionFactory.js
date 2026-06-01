class InventoryTransactionFactory {
  createDescriptor(type, { productId, previousStock, newStock, quantity, reason = '', executedBy = 'System' }) {
    let quantityChanged = 0;
    let computedNewStock = newStock;

    switch (type) {
      case 'STOCK_TAKE':
        quantityChanged = newStock - previousStock;
        break;
      case 'SALE':
        quantityChanged = -quantity;
        computedNewStock = previousStock - quantity;
        break;
      case 'RESTOCK':
      case 'RETURN':
        quantityChanged = quantity;
        computedNewStock = previousStock + quantity;
        break;
      case 'SYSTEM_UPDATE':
        quantityChanged = newStock - previousStock;
        break;
      default:
        throw new Error(`Loại giao dịch tồn kho không hợp lệ: ${type}`);
    }

    return {
      productId,
      type,
      quantityChanged,
      previousStock,
      newStock: computedNewStock,
      reason,
      executedBy
    };
  }
}

module.exports = new InventoryTransactionFactory();
