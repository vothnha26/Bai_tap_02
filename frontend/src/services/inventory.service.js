import api from './api.client';

export const inventoryApi = {
  getInventory: (params) => api.get('/inventory', { params }),
  getLowStock: () => api.get('/inventory/low-stock'),
  updateInventory: (productId, data) => api.put(`/inventory/${productId}`, data),
  submitStockTake: (productId, data) => api.post(`/inventory/${productId}/stock-take`, data),
  getTransactions: (params) => api.get('/inventory/transactions', { params }),
};
