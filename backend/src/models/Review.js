const mongoose = require('mongoose');
const { REVIEW_STATUS } = require('../utils/constants');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: Object.values(REVIEW_STATUS),
    default: REVIEW_STATUS.PENDING,
  },
  isRewarded: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure a user can only review a product once per order
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });
// Optimize for product detail page
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });

reviewSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
