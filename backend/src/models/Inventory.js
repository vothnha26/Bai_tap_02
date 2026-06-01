const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  warehouseLocation: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

inventorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
