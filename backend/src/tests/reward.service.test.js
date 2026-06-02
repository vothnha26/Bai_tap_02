const mongoose = require('mongoose');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Tier = require('../models/Tier');
const BenefitMaster = require('../models/BenefitMaster');
const RewardLog = require('../models/RewardLog');
const RewardService = require('../services/reward/reward.service');
const { REWARD_SOURCES, VALUE_TYPES } = require('../utils/constants');

jest.setTimeout(30000);

describe('RewardService', () => {
  let user;
  let bronzeTier;
  let goldTier;
  let multiplierBenefit;

  beforeAll(async () => {
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/baitap04_mongodb_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // Clean up
    await Promise.all([
      User.deleteMany({}),
      Membership.deleteMany({}),
      Tier.deleteMany({}),
      BenefitMaster.deleteMany({}),
      RewardLog.deleteMany({}),
    ]);

    // Setup metadata
    multiplierBenefit = await BenefitMaster.create({
      code: 'POINT_MULTIPLIER',
      name: 'Multiplier',
      valueType: VALUE_TYPES.NUMBER,
    });

    bronzeTier = await Tier.create({
      code: 'BRONZE',
      name: 'Bronze',
      minPoints: 0,
      benefits: [{ benefitId: multiplierBenefit._id, value: 1.0 }],
    });

    goldTier = await Tier.create({
      code: 'GOLD',
      name: 'Gold',
      minPoints: 1000,
      benefits: [{ benefitId: multiplierBenefit._id, value: 2.0 }],
    });

    user = await User.create({
      email: 'reward_test@example.com',
      fullName: 'Reward Tester',
      status: 'ACTIVE',
    });

    // Ensure indexes are ready for idempotency test
    await RewardLog.syncIndexes();
    await Membership.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Promise.all([
      Membership.deleteMany({}),
      RewardLog.deleteMany({}),
    ]);
  });

  describe('calculatePoints', () => {
    it('should use tier multiplier for ORDER source', async () => {
      // 1. Setup membership for user (Bronze)
      const membership = await Membership.create({
        userId: user._id,
        tierId: bronzeTier._id,
      });

      // 2. Calculate for order (100 points, multiplier 1.0)
      const points = await RewardService.calculatePoints(user._id, REWARD_SOURCES.ORDER, 100);
      expect(points).toBe(100);

      // 3. Upgrade user to Gold manually for test
      membership.tierId = goldTier._id;
      await membership.save();

      // 4. Calculate for order (100 points, multiplier 2.0)
      const pointsGold = await RewardService.calculatePoints(user._id, REWARD_SOURCES.ORDER, 100);
      expect(pointsGold).toBe(200);

      await Membership.deleteOne({ _id: membership._id });
    });
  });

  describe('addPoints', () => {
    it('should atomically add points and log reward', async () => {
      const membership = await Membership.create({
        userId: user._id,
        tierId: bronzeTier._id,
      });

      const sourceId = new mongoose.Types.ObjectId();
      const pointsToAdd = 500;

      await RewardService.addPoints(user._id, REWARD_SOURCES.ORDER, sourceId, pointsToAdd);

      // Verify membership update
      const updated = await Membership.findOne({ userId: user._id });
      expect(updated.currentPoints).toBe(500);
      expect(updated.rollingPoints).toBe(500);
      
      const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
      expect(updated.pointsByMonth.get(currentMonthKey)).toBe(500);

      // Verify log creation
      const log = await RewardLog.findOne({ sourceId });
      expect(log).toBeDefined();
      expect(log.pointsChanged).toBe(500);

      await Membership.deleteOne({ _id: membership._id });
    });

    it('should handle idempotency (not double count same sourceId)', async () => {
      const membership = await Membership.create({
        userId: user._id,
        tierId: bronzeTier._id,
      });

      const sourceId = new mongoose.Types.ObjectId();
      
      // Add first time
      await RewardService.addPoints(user._id, REWARD_SOURCES.REVIEW, sourceId, 100);
      
      // Add second time (should ignore or throw depending on design, plan says idempotency via unique index)
      // If index exists, RewardLog.create will fail, we should catch it or check before.
      await expect(RewardService.addPoints(user._id, REWARD_SOURCES.REVIEW, sourceId, 100))
        .rejects.toThrow(); // Assuming we let unique index throw to be safe

      const updated = await Membership.findOne({ userId: user._id });
      expect(updated.currentPoints).toBe(100);

      await Membership.deleteOne({ _id: membership._id });
    });

    it('should auto-upgrade tier when points reach threshold', async () => {
      const membership = await Membership.create({
        userId: user._id,
        tierId: bronzeTier._id,
      });

      // Gold needs 1000 points
      await RewardService.addPoints(user._id, REWARD_SOURCES.ORDER, new mongoose.Types.ObjectId(), 1100);

      const updated = await Membership.findOne({ userId: user._id });
      expect(updated.tierId.toString()).toBe(goldTier._id.toString());

      await Membership.deleteOne({ _id: membership._id });
    });
  });
});
