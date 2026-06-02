const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  tierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tier',
    required: true,
  },
  currentPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  rollingPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  pointsByMonth: {
    type: Map,
    of: Number,
    default: {},
  },
  tierChangedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

membershipSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
