const Product = require('../models/Product');
const ProductDiscount = require('../models/ProductDiscount');

async function migrateDiscounts() {
  try {
    console.log('[MIGRATION] Bắt đầu kiểm tra và di chuyển dữ liệu discountPrice cũ...');
    
    // Tìm các sản phẩm có discountPrice hợp lệ và nhỏ hơn price
    const productsToMigrate = await Product.find({
      discountPrice: { $exists: true, $ne: null, $gt: 0 }
    });

    if (productsToMigrate.length === 0) {
      console.log('[MIGRATION] Không có sản phẩm nào cần di chuyển dữ liệu.');
      return;
    }

    console.log(`[MIGRATION] Tìm thấy ${productsToMigrate.length} sản phẩm cần di chuyển.`);

    let migratedCount = 0;
    const now = new Date();
    const tenYearsLater = new Date();
    tenYearsLater.setFullYear(now.getFullYear() + 10);

    for (const product of productsToMigrate) {
      // Kiểm tra xem sản phẩm này đã có discount nào chưa
      const existingDiscount = await ProductDiscount.findOne({ productId: product._id });
      
      if (!existingDiscount) {
        const discountValue = product.price - product.discountPrice;
        
        if (discountValue > 0) {
          await ProductDiscount.create({
            productId: product._id,
            discountType: 'FIXED_AMOUNT',
            discountValue: discountValue,
            startDate: now,
            endDate: tenYearsLater,
            isStackable: false,
            isActive: true
          });
          
          migratedCount++;
        }
      }
      
      // Xóa trường discountPrice tĩnh cũ trên Product để tránh nhầm lẫn sau này
      product.discountPrice = null;
      await product.save();
    }

    console.log(`[MIGRATION] Di chuyển thành công ${migratedCount} sản phẩm sang bảng ProductDiscount.`);
  } catch (error) {
    console.error('[MIGRATION] Có lỗi xảy ra trong quá trình di chuyển dữ liệu:', error);
  }
}

module.exports = migrateDiscounts;
