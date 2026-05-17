const mongoose = require('mongoose');

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
