const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['STOCK_TAKE', 'SALE', 'RESTOCK', 'RETURN', 'SYSTEM_UPDATE'],
    required: true,
    index: true
  },
  quantityChanged: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  executedBy: {
    type: String, // Email or 'System'
    default: 'System',
    index: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Thiết lập chỉ mục (index) sắp xếp theo thời gian tạo giảm dần tối ưu hóa truy vấn lịch sử mới nhất
inventoryTransactionSchema.index({ createdAt: -1 });

inventoryTransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);

module.exports = InventoryTransaction;
