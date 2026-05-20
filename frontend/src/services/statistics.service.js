import api from './api.client';

export const statisticsApi = {
  getAdminStats: () => api.get('/statistics'),
};
