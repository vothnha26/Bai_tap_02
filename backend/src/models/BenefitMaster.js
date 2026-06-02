const mongoose = require('mongoose');
const { VALUE_TYPES } = require('../utils/constants');

const benefitMasterSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  valueType: {
    type: String,
    enum: Object.values(VALUE_TYPES),
    required: true,
  },
}, {
  timestamps: true,
});

benefitMasterSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const BenefitMaster = mongoose.model('BenefitMaster', benefitMasterSchema);

module.exports = BenefitMaster;
