import api from './api.client';

export const promotionApi = {
  // Admin APIs
  getAllAdmin: () => api.get('/promotions/admin'),
  getByIdAdmin: (id) => api.get(`/promotions/admin/${id}`),
  createAdmin: (data) => api.post('/promotions/admin', data),
  updateAdmin: (id, data) => api.put(`/promotions/admin/${id}`, data),
  deleteAdmin: (id) => api.delete(`/promotions/admin/${id}`),

  // User APIs
  apply: (code, items, shippingFee) => api.post('/promotions/apply', { code, items, shippingFee }),
  getApplicable: (items, shippingFee) => api.post('/promotions/applicable', { items, shippingFee }),
};
