const Tier = require('../models/Tier');
const Membership = require('../models/Membership');
const RewardLog = require('../models/RewardLog');

class TierController {
  async getMyMembership(req, res) {
    try {
      const membership = await Membership.findOne({ userId: req.user.id })
        .populate({
          path: 'tierId',
          populate: { path: 'benefits.benefitId' }
        });
      
      // Nếu user chưa có membership (đăng ký mới), trả về giá trị mặc định thay vì 404
      if (!membership) {
        return res.json({ 
          status: 'success', 
          data: { rollingPoints: 0, currentPoints: 0, tierId: null } 
        });
      }
      res.json({ status: 'success', data: membership });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getMyRewardLogs(req, res) {
    try {
      const logs = await RewardLog.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);
      res.json({ status: 'success', data: logs || [] });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getAllTiers(req, res) {
    try {
      const tiers = await Tier.find({})
        .populate('benefits.benefitId')
        .sort({ minPoints: 1 });
      res.json({ status: 'success', data: tiers });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getTierById(req, res) {
    try {
      const tier = await Tier.findById(req.params.id).populate('benefits.benefitId');
      if (!tier) return res.status(404).json({ status: 'error', message: 'Tier not found' });
      res.json({ status: 'success', data: tier });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async createTier(req, res) {
    try {
      const tier = await Tier.create(req.body);
      res.status(201).json({ status: 'success', data: tier });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateTier(req, res) {
    try {
      const tier = await Tier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!tier) return res.status(404).json({ status: 'error', message: 'Tier not found' });
      res.json({ status: 'success', data: tier });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteTier(req, res) {
    try {
      const tier = await Tier.findByIdAndDelete(req.params.id);
      if (!tier) return res.status(404).json({ status: 'error', message: 'Tier not found' });
      res.json({ status: 'success', message: 'Tier deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new TierController();
