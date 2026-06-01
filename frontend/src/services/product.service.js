import api from './api.client';

export const productApi = {
  getHomePage: () => api.get('/products/home'),
  getDetail: (slug) => api.get(`/products/${slug}`),
  search: (params) => api.get('/products/search', { params }),
  getAll: () => api.get('/products?limit=100'),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  getDiscount: (productId) => api.get(`/products/${productId}/discount`),
  upsertDiscount: (productId, discountData) => api.post(`/products/${productId}/discount`, discountData),
  deleteDiscount: (productId) => api.delete(`/products/${productId}/discount`),
};
