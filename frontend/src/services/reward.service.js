import axios from './api.client';

const rewardService = {
  // Tier Management
  getAllTiers: async () => {
    const res = await axios.get('/rewards/tiers');
    return res.data;
  },
  
  createTier: async (data) => {
    const res = await axios.post('/rewards/tiers', data);
    return res.data;
  },
  
  updateTier: async (id, data) => {
    const res = await axios.put(`/rewards/tiers/${id}`, data);
    return res.data;
  },
  
  deleteTier: async (id) => {
    const res = await axios.delete(`/rewards/tiers/${id}`);
    return res.data;
  },

  // Benefit Metadata
  getAllBenefits: async () => {
    const res = await axios.get('/rewards/benefits');
    return res.data;
  },

  createBenefit: async (data) => {
    const res = await axios.post('/rewards/benefits', data);
    return res.data;
  },

  // User Profile
  getMyMembership: async () => {
    const res = await axios.get('/rewards/my-membership');
    return res.data;
  },

  getMyRewardLogs: async () => {
    const res = await axios.get('/rewards/my-logs');
    return res.data;
  },

  // Product Reward Rules
  getProductRewardRules: async () => {
    const res = await axios.get('/rewards/rules');
    return res.data;
  },

  upsertProductRewardRule: async (data) => {
    const res = await axios.post('/rewards/rules', data);
    return res.data;
  },

  deleteProductRewardRule: async (id) => {
    const res = await axios.delete(`/rewards/rules/${id}`);
    return res.data;
  }
};

export default rewardService;
