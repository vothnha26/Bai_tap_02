const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI environment variable is required in production');
      }
      logger.warn('MONGODB_URI is not defined. Falling back to local default (for development only).');
    }

    const defaultUri = 'mongodb://127.0.0.1:27017/baitap04_mongodb';
    const uri = mongoUri || defaultUri;
    
    logger.info('Connecting to MongoDB...');
    const conn = await mongoose.connect(uri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Tự động migrate SKU cho những sản phẩm cũ chưa có (Non-blocking)
    // KHÔNG chạy trong môi trường test
    if (process.env.NODE_ENV !== 'test') {
      setImmediate(async () => {
        try {
          require('../models/Product');
          const Product = mongoose.model('Product');
          const products = await Product.find({ $or: [{ sku: { $exists: false } }, { sku: null }, { sku: '' }] });
          if (products.length > 0) {
            logger.info(`[Migration] Phát hiện ${products.length} sản phẩm chưa có SKU. Tiến hành tự sinh SKU...`);
            for (const prod of products) {
              const words = prod.name.split(' ');
              const initials = words.map(w => w.charAt(0).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()).join('').substring(0, 4);
              const rand = Math.floor(1000 + Math.random() * 9000);
              prod.sku = `${initials || 'PROD'}-${rand}`;
              await prod.save();
            }
            logger.info('[Migration] Hoàn thành cập nhật mã SKU cho toàn bộ sản phẩm.');
          }
        } catch (migError) {
          logger.error('[Migration Error] Lỗi khi tự động cập nhật SKU sản phẩm:', migError);
        }
      });
    }

  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

