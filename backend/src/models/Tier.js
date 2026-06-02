const mongoose = require('mongoose');

const tierSchema = new mongoose.Schema({
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
  minPoints: {
    type: Number,
    required: true,
    min: 0,
  },
  benefits: [{
    benefitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BenefitMaster',
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Stores actual value based on BenefitMaster.valueType
      required: true,
    }
  }]
}, {
  timestamps: true,
});

tierSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const Tier = mongoose.model('Tier', tierSchema);

module.exports = Tier;
