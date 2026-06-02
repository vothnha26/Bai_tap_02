const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  province: { type: String, required: true },
  provinceCode: { type: String, required: true },
  ward: { type: String, required: true },
  wardCode: { type: String, required: true },
  fullText: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  coordinates: {
    lat: { type: Number, default: 10.8231 },
    lng: { type: Number, default: 106.6297 }
  }
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: mongoose.Schema.Types.Mixed, // Hỗ trợ cả String (cũ) và Object (mới)
    default: '',
  },
  addresses: {
    type: [addressSchema],
    default: []
  },

  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BANNED'],
    default: 'INACTIVE',
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  accounts: [{
    provider: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      required: true,
    },
    providerId: {
      type: String,
      default: null,
    },
    passwordHash: {
      type: String,
      default: null,
    }
  }]
}, {
  timestamps: true,
});

// Virtual for id to match Prisma-like uuid if needed, 
// but Mongoose uses _id. We can map _id to id in toJSON.
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
