const mongoose = require('mongoose');
const logger = require('../utils/logger');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  sku: {
    type: String,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  tags: [{
    type: String,
    lowercase: true,
  }],
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String, // URLs
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  /**
   * @deprecated Trường stock trong Product model đã được chuyển đổi sang Inventory collection.
   * Để lấy tồn kho thực tế, hãy sử dụng PriceService.getEffectivePrices() hoặc truy vấn trực tiếp từ bảng Inventory.
   * Tránh đọc hoặc thay đổi trực tiếp trường này trên Product model để ngăn ngừa bất đồng bộ dữ liệu.
   */
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  soldCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  isPromoted: {
    type: Boolean,
    default: false,
  },
  promotionText: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', description: 'text' });

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

productSchema.post('save', async function (doc) {
  try {
    const Inventory = mongoose.model('Inventory');
    if (doc.stock !== undefined) {
      await Inventory.findOneAndUpdate(
        { productId: doc._id },
        { stock: doc.stock },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    logger.error('Error in Product post-save hook for Inventory:', err);
  }
});

productSchema.pre('findOneAndUpdate', async function () {
  try {
    const update = this.getUpdate();
    let stockValue;
    if (update) {
      if (update.stock !== undefined) {
        stockValue = update.stock;
      } else if (update.$set && update.$set.stock !== undefined) {
        stockValue = update.$set.stock;
      }
    }

    if (stockValue !== undefined) {
      const query = this.getQuery();
      const Inventory = mongoose.model('Inventory');
      await Inventory.findOneAndUpdate(
        { productId: query._id },
        { stock: stockValue },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    logger.error('Error in Product pre-findOneAndUpdate hook for Inventory:', err);
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
