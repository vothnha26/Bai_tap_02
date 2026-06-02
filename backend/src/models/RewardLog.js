const mongoose = require('mongoose');
const { REWARD_SOURCES } = require('../utils/constants');

const rewardLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pointsChanged: {
    type: Number,
    required: true,
  },
  currentBalance: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    enum: Object.values(REWARD_SOURCES),
    required: true,
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
}, {
  timestamps: true,
});

// Chống cộng điểm trùng (Idempotency)
rewardLogSchema.index({ sourceId: 1, source: 1 }, { 
  unique: true, 
  partialFilterExpression: { sourceId: { $type: "objectId" } } 
});

// Tối ưu cho Cron Job quét điểm 12 tháng
rewardLogSchema.index({ userId: 1, createdAt: 1, pointsChanged: 1 });

// Tối ưu cho API hiển thị lịch sử ví điểm
rewardLogSchema.index({ userId: 1, createdAt: -1 });

rewardLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const RewardLog = mongoose.model('RewardLog', rewardLogSchema);

module.exports = RewardLog;
