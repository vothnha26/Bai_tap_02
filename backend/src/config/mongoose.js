const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const defaultUri = 'mongodb://root:root_password@127.0.0.1:27017/baitap04_mongodb?authSource=admin';
    const mongoUri = process.env.MONGODB_URI || defaultUri;
    
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Tự động migrate SKU cho những sản phẩm cũ chưa có
    try {
      // Require model để đảm bảo đã đăng ký trong Mongoose
      require('../models/Product');
      const Product = mongoose.model('Product');
      const products = await Product.find({ $or: [{ sku: { $exists: false } }, { sku: null }, { sku: '' }] });
      if (products.length > 0) {
        console.log(`[Migration] Phát hiện ${products.length} sản phẩm chưa có SKU. Tiến hành tự sinh SKU...`);
        for (const prod of products) {
          const words = prod.name.split(' ');
          const initials = words.map(w => w.charAt(0).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()).join('').substring(0, 4);
          const rand = Math.floor(1000 + Math.random() * 9000);
          prod.sku = `${initials || 'PROD'}-${rand}`;
          await prod.save();
        }
        console.log('[Migration] Hoàn thành cập nhật mã SKU cho toàn bộ sản phẩm.');
      }
    } catch (migError) {
      console.error('[Migration Error] Lỗi khi tự động cập nhật SKU sản phẩm:', migError);
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
