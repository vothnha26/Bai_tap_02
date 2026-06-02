const express = require('express');
const router = express.Router();
const tierController = require('../controllers/tier.controller');
const benefitController = require('../controllers/benefit.controller');
const rewardController = require('../controllers/reward.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth.middleware');

// Public or Protected for regular users (e.g. view my benefits)
router.get('/tiers', tierController.getAllTiers);
router.get('/tiers/:id', tierController.getTierById);

// User Profile Rewards
router.get('/my-membership', verifyAuth, tierController.getMyMembership);
router.get('/my-logs', verifyAuth, tierController.getMyRewardLogs);

// Admin Only
router.post('/tiers', verifyAuth, verifyAdmin, tierController.createTier);
router.put('/tiers/:id', verifyAuth, verifyAdmin, tierController.updateTier);
router.delete('/tiers/:id', verifyAuth, verifyAdmin, tierController.deleteTier);

router.get('/benefits', verifyAuth, verifyAdmin, benefitController.getAllBenefits);
router.post('/benefits', verifyAuth, verifyAdmin, benefitController.createBenefit);
router.put('/benefits/:id', verifyAuth, verifyAdmin, benefitController.updateBenefit);

// Product Reward Rules
router.get('/rules', verifyAuth, verifyAdmin, rewardController.getRules);
router.post('/rules', verifyAuth, verifyAdmin, rewardController.upsertRule);
router.delete('/rules/:id', verifyAuth, verifyAdmin, rewardController.deleteRule);

module.exports = router;
