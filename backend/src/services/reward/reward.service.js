const Membership = require('../../models/Membership');
const Tier = require('../../models/Tier');
const RewardLog = require('../../models/RewardLog');
const ProductRewardRule = require('../../models/ProductRewardRule');
const BenefitRegistry = require('../promotion/BenefitRegistry');
const { REWARD_SOURCES } = require('../../utils/constants');
const logger = require('../../utils/logger');

class RewardService {
  /**
   * Get all product reward rules
   */
  async getProductRewardRules() {
    return ProductRewardRule.find({}).populate('productId');
  }

  /**
   * Create or update a product reward rule
   */
  async upsertProductRewardRule({ productId, rewardPoints, isActive = true }) {
    return ProductRewardRule.findOneAndUpdate(
      { productId },
      { rewardPoints, isActive },
      { new: true, upsert: true, runValidators: true }
    ).populate('productId');
  }

  /**
   * Delete a product reward rule
   */
  async deleteProductRewardRule(id) {
    return ProductRewardRule.findByIdAndDelete(id);
  }

  /**
   * Calculate points based on source and tier multiplier
   * @param {string} userId 
   * @param {string} source 
   * @param {number} basePoints 
   */
  async calculatePoints(userId, source, basePoints) {
    const membership = await Membership.findOne({ userId }).populate({
      path: 'tierId',
      populate: { path: 'benefits.benefitId' }
    });

    if (!membership) return basePoints;

    // Resolve Point Multiplier from Tier
    const multiplierBenefit = membership.tierId.benefits.find(
      b => b.benefitId && b.benefitId.code === 'POINT_MULTIPLIER'
    );

    if (multiplierBenefit && source === REWARD_SOURCES.ORDER) {
      const strategy = BenefitRegistry.get('POINT_MULTIPLIER');
      if (strategy) {
        return strategy.apply({ basePoints }, multiplierBenefit.value);
      }
    }

    return basePoints;
  }

  /**
   * Atomically add points and handle tier upgrades
   */
  async addPoints(userId, source, sourceId, points) {
    // 1. Create Reward Log (Idempotency check via unique index {sourceId, source})
    // We do this FIRST to ensure we don't update membership if this is a duplicate request
    const rewardLog = await RewardLog.create({
      userId,
      pointsChanged: points,
      currentBalance: 0, // Will update after membership update
      source,
      sourceId,
    });

    // 2. Update Membership atomically
    const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const updatePath = `pointsByMonth.${currentMonthKey}`;

    const updatedMembership = await Membership.findOneAndUpdate(
      { userId },
      { 
        $inc: { 
          currentPoints: points, 
          rollingPoints: points,
          [updatePath]: points 
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedMembership) {
      // Rollback RewardLog if membership not found (though this should be rare)
      await RewardLog.deleteOne({ _id: rewardLog._id });
      throw new Error(`Membership not found for user ${userId}`);
    }

    // 3. Sync actual balance to RewardLog
    rewardLog.currentBalance = updatedMembership.currentPoints;
    await rewardLog.save();

    // 4. Check for Tier Upgrade
    await this._checkTierUpgrade(updatedMembership);

    return { rewardLog, membership: updatedMembership };
  }

  /**
   * Internal helper to check and upgrade tier
   */
  async _checkTierUpgrade(membership) {
    // Find all tiers sorted by minPoints descending
    const tiers = await Tier.find({}).sort({ minPoints: -1 });

    const eligibleTier = tiers.find(t => membership.rollingPoints >= t.minPoints);

    if (eligibleTier && eligibleTier._id.toString() !== membership.tierId.toString()) {
      membership.tierId = eligibleTier._id;
      membership.tierChangedAt = new Date();
      await membership.save();
      logger.info(`[RewardService] User ${membership.userId} upgraded to ${eligibleTier.code}`);
    }
  }
}

module.exports = new RewardService();
