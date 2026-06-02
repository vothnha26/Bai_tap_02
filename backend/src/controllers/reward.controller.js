const rewardService = require('../services/reward/reward.service');

class RewardController {
  async getRules(req, res) {
    try {
      const rules = await rewardService.getProductRewardRules();
      res.json({ status: 'success', data: rules });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async upsertRule(req, res) {
    try {
      const { productId, rewardPoints, isActive } = req.body;
      if (!productId) {
        return res.status(400).json({ status: 'error', message: 'productId is required' });
      }
      if (rewardPoints === undefined || rewardPoints < 0) {
        return res.status(400).json({ status: 'error', message: 'rewardPoints must be greater than or equal to 0' });
      }
      const rule = await rewardService.upsertProductRewardRule({ productId, rewardPoints, isActive });
      res.status(201).json({ status: 'success', data: rule });
    } catch (error) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteRule(req, res) {
    try {
      const rule = await rewardService.deleteProductRewardRule(req.params.id);
      if (!rule) {
        return res.status(404).json({ status: 'error', message: 'Rule not found' });
      }
      res.json({ status: 'success', message: 'Rule deleted successfully' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new RewardController();
