const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../utils/constants');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
    imageUrl: String,
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  promotionCode: {
    type: String,
    uppercase: true,
    trim: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  shippingDiscountAmount: {
    type: Number,
    default: 0,
  },
  giftItems: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: String,
    quantity: Number,
    imageUrl: String,
  }],
  finalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING,
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PAYMENT_METHOD),
    default: PAYMENT_METHOD.COD,
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
  },
  note: {
    type: String,
  },
  cancellationReason: {
    type: String,
  },
  cancellationRejectionReason: {
    type: String,
  }
}, {
  timestamps: true,
});

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
