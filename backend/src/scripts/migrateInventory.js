const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

async function migrateInventory() {
  try {
    const products = await Product.find({});
    console.log(`[Migration] Found ${products.length} products to check for inventory migration.`);
    
    let migratedCount = 0;
    for (const product of products) {
      const existingInventory = await Inventory.findOne({ productId: product._id });
      if (!existingInventory) {
        // Lấy tồn kho hiện tại của sản phẩm từ trường stock cũ
        const oldStock = typeof product.stock === 'number' ? product.stock : 0;
        await Inventory.create({
          productId: product._id,
          stock: oldStock
        });
        migratedCount++;
      }
    }
    
    if (migratedCount > 0) {
      console.log(`[Migration] Successfully migrated stock for ${migratedCount} products into Inventory table.`);
    } else {
      console.log(`[Migration] Inventory is already up-to-date. No migration needed.`);
    }
  } catch (err) {
    console.error('[Migration] Inventory migration failed:', err);
  }
}

module.exports = migrateInventory;
