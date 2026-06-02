import axios from './api.client';

const rewardService = {
  // Tier Management
  getAllTiers: async () => {
    const res = await axios.get('/api/rewards/tiers');
    return res.data;
  },
  
  createTier: async (data) => {
    const res = await axios.post('/api/rewards/tiers', data);
    return res.data;
  },
  
  updateTier: async (id, data) => {
    const res = await axios.put(`/api/rewards/tiers/${id}`, data);
    return res.data;
  },
  
  deleteTier: async (id) => {
    const res = await axios.delete(`/api/rewards/tiers/${id}`);
    return res.data;
  },

  // Benefit Metadata
  getAllBenefits: async () => {
    const res = await axios.get('/api/rewards/benefits');
    return res.data;
  },

  createBenefit: async (data) => {
    const res = await axios.post('/api/rewards/benefits', data);
    return res.data;
  },

  // User Profile
  getMyMembership: async () => {
    const res = await axios.get('/api/rewards/my-membership');
    return res.data;
  },

  getMyRewardLogs: async () => {
    const res = await axios.get('/api/rewards/my-logs');
    return res.data;
  },

  // Product Reward Rules
  getProductRewardRules: async () => {
    const res = await axios.get('/api/rewards/rules');
    return res.data;
  },

  upsertProductRewardRule: async (data) => {
    const res = await axios.post('/api/rewards/rules', data);
    return res.data;
  },

  deleteProductRewardRule: async (id) => {
    const res = await axios.delete(`/api/rewards/rules/${id}`);
    return res.data;
  }
};

export default rewardService;
