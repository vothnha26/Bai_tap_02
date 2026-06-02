const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/mongoose');
const BenefitMaster = require('../models/BenefitMaster');
const Tier = require('../models/Tier');
const { VALUE_TYPES } = require('../utils/constants');

async function seedRewardSystem() {
  try {
    await connectDB();

    console.log('Seeding Reward System metadata...');

    // 1. Seed BenefitMaster
    const benefits = [
      {
        code: 'POINT_MULTIPLIER',
        name: 'Hệ số nhân điểm',
        description: 'Tăng số điểm tích lũy được trên mỗi đơn hàng',
        valueType: VALUE_TYPES.NUMBER
      },
      {
        code: 'FREE_SHIPPING',
        name: 'Miễn phí vận chuyển',
        description: 'Miễn phí vận chuyển cho mọi đơn hàng',
        valueType: VALUE_TYPES.BOOLEAN
      },
      {
        code: 'GIFT_ON_BIRTHDAY',
        name: 'Quà tặng sinh nhật',
        description: 'Mã quà tặng đặc biệt vào ngày sinh nhật',
        valueType: VALUE_TYPES.STRING
      }
    ];

    const seededBenefits = [];
    for (const b of benefits) {
      const existing = await BenefitMaster.findOne({ code: b.code });
      if (!existing) {
        const newBenefit = await BenefitMaster.create(b);
        seededBenefits.push(newBenefit);
      } else {
        seededBenefits.push(existing);
      }
    }

    console.log(`Seeded ${seededBenefits.length} benefits.`);

    // Helper to find benefit ID by code
    const getBenefitId = (code) => seededBenefits.find(b => b.code === code)._id;

    // 2. Seed Tiers
    const tiers = [
      {
        code: 'BRONZE',
        name: 'Hạng Đồng',
        minPoints: 0,
        benefits: [
          { benefitId: getBenefitId('POINT_MULTIPLIER'), value: 1.0 }
        ]
      },
      {
        code: 'SILVER',
        name: 'Hạng Bạc',
        minPoints: 1000,
        benefits: [
          { benefitId: getBenefitId('POINT_MULTIPLIER'), value: 1.2 },
          { benefitId: getBenefitId('FREE_SHIPPING'), value: false }
        ]
      },
      {
        code: 'GOLD',
        name: 'Hạng Vàng',
        minPoints: 5000,
        benefits: [
          { benefitId: getBenefitId('POINT_MULTIPLIER'), value: 1.5 },
          { benefitId: getBenefitId('FREE_SHIPPING'), value: true },
          { benefitId: getBenefitId('GIFT_ON_BIRTHDAY'), value: 'VOUCHER_GOLD_100K' }
        ]
      }
    ];

    for (const t of tiers) {
      const existing = await Tier.findOne({ code: t.code });
      if (!existing) {
        await Tier.create(t);
        console.log(`Created Tier: ${t.name}`);
      } else {
        // Update existing tier rules if needed
        existing.minPoints = t.minPoints;
        existing.benefits = t.benefits;
        await existing.save();
        console.log(`Updated Tier: ${t.name}`);
      }
    }

    console.log('Reward system seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding reward system:', error);
    process.exit(1);
  }
}

seedRewardSystem();
