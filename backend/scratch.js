const mongoose = require('mongoose');
const connectDB = require('./src/config/mongoose');
const User = require('./src/models/User');
const Membership = require('./src/models/Membership');
const Tier = require('./src/models/Tier');
const BenefitMaster = require('./src/models/BenefitMaster');
const RewardLog = require('./src/models/RewardLog');
const RewardService = require('./src/services/reward.service');
const { VALUE_TYPES, REWARD_SOURCES } = require('./src/utils/constants');

async function run() {
  await connectDB();
  console.log('--- Connected to MongoDB ---');

  // Clean up
  await Promise.all([
    User.deleteMany({}),
    Membership.deleteMany({}),
    Tier.deleteMany({}),
    BenefitMaster.deleteMany({}),
    RewardLog.deleteMany({}),
  ]);

  console.log('--- Cleaned DB ---');

  // 1. Setup Benefit & Tiers
  const multiplierBenefit = await BenefitMaster.create({
    code: 'POINT_MULTIPLIER',
    name: 'Multiplier',
    valueType: VALUE_TYPES.NUMBER,
  });

  const bronzeTier = await Tier.create({
    code: 'BRONZE',
    name: 'Bronze',
    minPoints: 0,
    benefits: [{ benefitId: multiplierBenefit._id, value: 1.0 }],
  });

  const silverTier = await Tier.create({
    code: 'SILVER',
    name: 'Silver',
    minPoints: 500,
    benefits: [{ benefitId: multiplierBenefit._id, value: 1.2 }],
  });

  const goldTier = await Tier.create({
    code: 'GOLD',
    name: 'Gold',
    minPoints: 1000,
    benefits: [{ benefitId: multiplierBenefit._id, value: 1.5 }],
  });

  console.log('--- Created Tiers ---');

  // 2. Create User & Membership
  const user = await User.create({
    email: 'test@example.com',
    password: 'Password123!',
    fullName: 'Test Tester',
    status: 'ACTIVE'
  });

  let membership = await Membership.create({
    userId: user._id,
    tierId: bronzeTier._id
  });

  console.log('--- Created User & Membership ---');

  // 3. Simulate first award (600 points -> SILVER)
  console.log('\n--- Simulating 1st award: 600 points ---');
  try {
    const finalPoints1 = await RewardService.calculatePoints(user._id, REWARD_SOURCES.ORDER, 600);
    console.log('Final points 1 calculated:', finalPoints1);
    const res1 = await RewardService.addPoints(user._id, REWARD_SOURCES.ORDER, new mongoose.Types.ObjectId(), finalPoints1);
    console.log('Successfully added points 1. Current membership tier code (before reload):', res1.membership.tierId);
    
    // Reload membership
    const updatedMem = await Membership.findOne({ userId: user._id }).populate('tierId');
    console.log('Reloaded membership tier code:', updatedMem.tierId.code);
  } catch (err) {
    console.error('Error during 1st award:', err);
  }

  // 4. Simulate second award (400 points -> GOLD)
  console.log('\n--- Simulating 2nd award: 400 points ---');
  try {
    const finalPoints2 = await RewardService.calculatePoints(user._id, REWARD_SOURCES.ORDER, 400);
    console.log('Final points 2 calculated:', finalPoints2);
    const res2 = await RewardService.addPoints(user._id, REWARD_SOURCES.ORDER, new mongoose.Types.ObjectId(), finalPoints2);
    console.log('Successfully added points 2. Current membership tier code (before reload):', res2.membership.tierId);

    // Reload membership
    const updatedMem = await Membership.findOne({ userId: user._id }).populate('tierId');
    console.log('Reloaded membership tier code:', updatedMem.tierId.code);
  } catch (err) {
    console.error('Error during 2nd award:', err);
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
