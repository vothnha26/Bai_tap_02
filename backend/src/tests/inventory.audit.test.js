// Set environment variables BEFORE any imports
process.env.USE_MEMORY_REDIS = 'true';

const mongoose = require('mongoose');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const inventoryService = require('../services/inventory/InventoryService');

describe('Inventory Audit Log (Facade & Factory Integration Test)', () => {
  let product;
  const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/shop_auth_test?authSource=admin';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Tạo sản phẩm mẫu
    product = new Product({
      name: 'Sản phẩm Test Audit Log',
      slug: 'san-pham-test-audit-log',
      price: 100000,
      description: 'Sản phẩm test',
      images: ['/images/test.jpg'],
      category: 'Test Category',
      isActive: true,
      soldCount: 0
    });
    await product.save();
  });

  afterAll(async () => {
    // Clear data test
    await Product.deleteOne({ _id: product._id });
    await Inventory.deleteOne({ productId: product._id });
    await InventoryTransaction.deleteMany({ productId: product._id });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Reset data inventory và transaction log trước mỗi case test
    await Inventory.deleteOne({ productId: product._id });
    await InventoryTransaction.deleteMany({ productId: product._id });
  });

  it('should successfully record STOCK_TAKE transaction audit log', async () => {
    const actualStock = 50;
    const reason = 'Kiểm kê định kỳ tháng 6';
    const adminEmail = 'admin_test@shopvn.com';

    // 1. Thực hiện kiểm kho
    const updatedInventory = await inventoryService.submitStockTake(product._id, actualStock, reason, adminEmail);
    expect(updatedInventory).toBeDefined();
    expect(updatedInventory.stock).toBe(50);

    // 2. Kiểm tra log được lưu trong DB
    const logs = await InventoryTransaction.find({ productId: product._id });
    expect(logs.length).toBe(1);
    expect(logs[0].type).toBe('STOCK_TAKE');
    expect(logs[0].previousStock).toBe(0);
    expect(logs[0].newStock).toBe(50);
    expect(logs[0].quantityChanged).toBe(50);
    expect(logs[0].reason).toBe(reason);
    expect(logs[0].executedBy).toBe(adminEmail);
  });

  it('should successfully record SALE transaction audit log on decrementing stock', async () => {
    // 1. Thiết lập kho ban đầu bằng 20
    await inventoryService.submitStockTake(product._id, 20, 'Set up initial stock', 'System');

    // 2. Trừ kho 5 sản phẩm
    const updatedInventory = await inventoryService.decrementStockSafely(product._id, 5, {
      reason: 'Trừ kho mua hàng đơn #12345',
      executedBy: 'System'
    });

    expect(updatedInventory).toBeDefined();
    expect(updatedInventory.stock).toBe(15);

    // 3. Kiểm tra log
    const logs = await InventoryTransaction.find({ productId: product._id }).sort({ createdAt: -1 });
    // Có 2 log: 1 cho stock take (khởi tạo), 1 cho sale
    expect(logs.length).toBe(2);
    expect(logs[0].type).toBe('SALE');
    expect(logs[0].previousStock).toBe(20);
    expect(logs[0].newStock).toBe(15);
    expect(logs[0].quantityChanged).toBe(-5);
    expect(logs[0].reason).toBe('Trừ kho mua hàng đơn #12345');
    expect(logs[0].executedBy).toBe('System');
  });

  it('should fail to decrement stock and not write log if stock is insufficient', async () => {
    // 1. Thiết lập kho ban đầu bằng 3
    await inventoryService.submitStockTake(product._id, 3, 'Set up initial stock', 'System');

    // 2. Trừ kho 5 sản phẩm (quá tồn kho hiện tại)
    const result = await inventoryService.decrementStockSafely(product._id, 5, {
      reason: 'Trừ kho mua hàng quá số lượng',
      executedBy: 'System'
    });

    expect(result).toBeNull();

    // 3. Kiểm tra log (chỉ có log STOCK_TAKE khởi tạo ban đầu, không có log SALE mới)
    const logs = await InventoryTransaction.find({ productId: product._id }).sort({ createdAt: -1 });
    expect(logs.length).toBe(1);
    expect(logs[0].type).toBe('STOCK_TAKE');
  });

  it('should successfully record RETURN / RESTOCK transaction audit log on incrementing stock', async () => {
    // 1. Thiết lập kho ban đầu bằng 10
    await inventoryService.submitStockTake(product._id, 10, 'Set up initial stock', 'System');

    // 2. Tăng kho 5 sản phẩm (hoàn trả)
    const updatedInventory = await inventoryService.incrementStock(product._id, 5, {
      type: 'RETURN',
      reason: 'Khách trả hàng đơn #12345',
      executedBy: 'System'
    });

    expect(updatedInventory).toBeDefined();
    expect(updatedInventory.stock).toBe(15);

    // 3. Kiểm tra log
    const logs = await InventoryTransaction.find({ productId: product._id }).sort({ createdAt: -1 });
    expect(logs.length).toBe(2);
    expect(logs[0].type).toBe('RETURN');
    expect(logs[0].previousStock).toBe(10);
    expect(logs[0].newStock).toBe(15);
    expect(logs[0].quantityChanged).toBe(5);
  });
});
