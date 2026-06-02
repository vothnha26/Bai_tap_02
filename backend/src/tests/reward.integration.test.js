process.env.USE_MEMORY_REDIS = 'true';

const mongoose = require('mongoose');
const request = require('supertest');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Tier = require('../models/Tier');
const BenefitMaster = require('../models/BenefitMaster');
const RewardLog = require('../models/RewardLog');
const Review = require('../models/Review');
const Product = require('../models/Product');
const ProductRewardRule = require('../models/ProductRewardRule');
const Order = require('../models/Order');
const OrderService = require('../services/order/order.service');
const jwtUtils = require('../utils/jwt.utils');
const { REVIEW_STATUS, REWARD_SOURCES, VALUE_TYPES } = require('../utils/constants');

jest.setTimeout(60000);

// Helper polling to avoid flaky asynchronous tests
const pollUntil = async (checkFn, timeout = 15000, interval = 300) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const res = await checkFn();
    if (res) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
};

describe('Reward System Integration', () => {
  let app;
  let user;
  let token;
  let bronzeTier, silverTier, goldTier;
  let multiplierBenefit;
  let rewardQueue, reviewQueue, reviewWorker, rewardWorker;

  beforeAll(async () => {
    const testMongoUri = process.env.MONGODB_URI_TEST || 'mongodb://root:root_password@127.0.0.1:27017/baitap04_mongodb_test?authSource=admin';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testMongoUri);
    }

    // 1. Flush Redis to clean up all old BullMQ jobs and locks BEFORE requiring app or queues/workers
    const redisIoredis = require('../config/redis.ioredis');
    await redisIoredis.flushdb();

    // 2. Dynamic require app and queues & workers so they register on a clean Redis state
    app = require('../app');
    rewardQueue = require('../services/reward/RewardQueue');
    reviewQueue = require('../services/review/ReviewQueue');
    reviewWorker = require('../services/review/ReviewWorker');
    rewardWorker = require('../services/reward/RewardWorker');

    await Promise.all([
      reviewWorker.waitUntilReady(),
      rewardWorker.waitUntilReady()
    ]);

    // Clean up all collections thoroughly
    await Promise.all([
      User.deleteMany({}),
      Membership.deleteMany({}),
      Tier.deleteMany({}),
      BenefitMaster.deleteMany({}),
      RewardLog.deleteMany({}),
      Review.deleteMany({}),
      Product.deleteMany({}),
      ProductRewardRule.deleteMany({}),
      Order.deleteMany({}),
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

    silverTier = await Tier.create({
      code: 'SILVER',
      name: 'Silver',
      minPoints: 500,
      benefits: [{ benefitId: multiplierBenefit._id, value: 1.2 }],
    });

    goldTier = await Tier.create({
      code: 'GOLD',
      name: 'Gold',
      minPoints: 1000,
      benefits: [{ benefitId: multiplierBenefit._id, value: 1.5 }],
    });

    // Create user and get token
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'integration@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        name: 'Integration Tester'
      });
    
    user = await User.findOne({ email: 'integration@example.com' });
    user.status = 'ACTIVE';
    await user.save();

    token = jwtUtils.generateAccessToken({
      id: user.id || user._id,
      email: user.email,
      role: user.role
    });

    let membership = await Membership.findOne({ userId: user._id });
    if (!membership) {
      membership = await Membership.create({
        userId: user._id,
        tierId: bronzeTier._id
      });
    }

    await RewardLog.syncIndexes();
  });

  afterAll(async () => {
    // Close workers and queues
    if (reviewWorker) await reviewWorker.close();
    if (rewardWorker) await rewardWorker.close();
    if (rewardQueue) await rewardQueue.close();
    if (reviewQueue) await reviewQueue.close();

    const redisIoredis = require('../config/redis.ioredis');
    await redisIoredis.quit();

    await mongoose.connection.close();
  });

  it('should upgrade tier when points cross threshold (ORDER flow simulation)', async () => {
    await rewardQueue.add('test.order', {
      userId: user._id,
      source: REWARD_SOURCES.ORDER,
      sourceId: new mongoose.Types.ObjectId(),
      points: 600
    });

    // Wait until upgraded to SILVER
    const upgradedToSilver = await pollUntil(async () => {
      const membership = await Membership.findOne({ userId: user._id });
      return membership && membership.tierId.toString() === silverTier._id.toString();
    }, 10000, 200);

    expect(upgradedToSilver).toBe(true);

    const updatedMembership = await Membership.findOne({ userId: user._id });
    expect(updatedMembership.tierId.toString()).toBe(silverTier._id.toString());
    console.log(`[Integration] User upgraded to ${silverTier.code}`);

    await rewardQueue.add('test.order.gold', {
      userId: user._id,
      source: REWARD_SOURCES.ORDER,
      sourceId: new mongoose.Types.ObjectId(),
      points: 400 
    });

    // Wait until upgraded to GOLD
    const upgradedToGold = await pollUntil(async () => {
      const membership = await Membership.findOne({ userId: user._id });
      return membership && membership.tierId.toString() === goldTier._id.toString();
    }, 10000, 200);

    expect(upgradedToGold).toBe(true);

    const goldMembership = await Membership.findOne({ userId: user._id });
    expect(goldMembership.tierId.toString()).toBe(goldTier._id.toString());
    console.log(`[Integration] User upgraded to ${goldTier.code}`);
  });

  it('should complete the full Review -> Moderation -> Reward -> Tier Up flow', async () => {
    const initialMembership = await Membership.findOne({ userId: user._id });
    const initialPoints = initialMembership ? initialMembership.currentPoints : 0;

    const reviewRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: new mongoose.Types.ObjectId(),
        orderId: new mongoose.Types.ObjectId(),
        rating: 5,
        comment: 'Excellent product!'
      });
    
    expect(reviewRes.status).toBe(201);
    const reviewId = reviewRes.body.data.id;

    // Wait until Review is APPROVED and points are added
    const flowFinished = await pollUntil(async () => {
      const review = await Review.findById(reviewId);
      const membership = await Membership.findOne({ userId: user._id });
      return review && review.status === REVIEW_STATUS.APPROVED && membership.currentPoints > initialPoints;
    }, 15000, 300);

    expect(flowFinished).toBe(true);

    const updatedReview = await Review.findById(reviewId);
    expect(updatedReview.status).toBe(REVIEW_STATUS.APPROVED);

    const updatedMembership = await Membership.findOne({ userId: user._id });
    expect(updatedMembership.currentPoints).toBeGreaterThan(0);
    expect(updatedMembership.rollingPoints).toBeGreaterThan(0);

    const log = await RewardLog.findOne({ userId: user._id, source: REWARD_SOURCES.REVIEW });
    expect(log).toBeDefined();
    expect(log.pointsChanged).toBe(50);
  });

  it('should automatically award product-specific reward points when order transitions to DELIVERED', async () => {
    // 1. Create Mock Products
    const productA = await Product.create({
      name: 'Product A for Reward Test',
      slug: 'product-a-for-reward-test',
      description: 'Test product descriptions A',
      price: 100,
      stock: 50,
    });

    const productB = await Product.create({
      name: 'Product B for Reward Test',
      slug: 'product-b-for-reward-test',
      description: 'Test product descriptions B',
      price: 200,
      stock: 50,
    });

    // 2. Create ProductRewardRules
    const ruleA = await ProductRewardRule.create({
      productId: productA._id,
      rewardPoints: 20,
    });

    const ruleB = await ProductRewardRule.create({
      productId: productB._id,
      rewardPoints: 35,
    });

    // 3. Create a Mock Order in SHIPPING state
    const orderData = {
      userId: user._id,
      items: [
        {
          productId: productA._id,
          name: productA.name,
          price: productA.price,
          quantity: 2,
          sku: 'A_SKU'
        },
        {
          productId: productB._id,
          name: productB.name,
          price: productB.price,
          quantity: 1,
          sku: 'B_SKU'
        }
      ],
      totalAmount: 400,
      discountAmount: 0,
      finalAmount: 400,
      shippingAddress: {
        province: 'Test Province',
        ward: 'Test Ward',
        street: '123 Test St'
      },
      phone: '123456789',
      paymentMethod: 'COD',
      status: 'SHIPPING',
    };

    const order = await Order.create(orderData);

    const initialMembership = await Membership.findOne({ userId: user._id });
    const initialPoints = initialMembership.currentPoints;

    // 4. Update order status to DELIVERED via OrderService
    await OrderService.updateOrderStatus(order._id, 'DELIVERED');

    // 5. Wait for BullMQ job to be processed by RewardWorker
    // Base: (20 * 2) + (35 * 1) = 75 points.
    // User is Gold, so POINT_MULTIPLIER = 1.5. Expected point increase: Math.floor(75 * 1.5) = 112 points.
    const rewardProcessed = await pollUntil(async () => {
      const membership = await Membership.findOne({ userId: user._id });
      return membership && membership.currentPoints === (initialPoints + 112);
    }, 15000, 300);

    expect(rewardProcessed).toBe(true);

    const finalMembership = await Membership.findOne({ userId: user._id });
    expect(finalMembership.currentPoints).toBe(initialPoints + 112);

    // 6. Verify RewardLog entry
    const log = await RewardLog.findOne({
      userId: user._id,
      source: REWARD_SOURCES.ORDER,
      sourceId: order._id,
    });
    expect(log).toBeDefined();
    expect(log.pointsChanged).toBe(112);

    // Clean up
    await Promise.all([
      Product.deleteOne({ _id: productA._id }),
      Product.deleteOne({ _id: productB._id }),
      ProductRewardRule.deleteOne({ _id: ruleA._id }),
      ProductRewardRule.deleteOne({ _id: ruleB._id }),
      Order.deleteOne({ _id: order._id }),
    ]);
  });
});
