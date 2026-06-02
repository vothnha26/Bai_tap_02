import apiClient from './api.client';

const orderService = {
  createOrder: async (orderData) => {
    return await apiClient.post('/orders', orderData);
  },

  getUserOrders: async () => {
    return await apiClient.get('/orders');
  },

  getOrderById: async (id) => {
    return await apiClient.get(`/orders/${id}`);
  },

  cancelOrder: async (id, reason) => {
    return await apiClient.post(`/orders/${id}/cancel`, { reason });
  },

  // Admin APIs
  getAllOrdersAdmin: async () => {
    return await apiClient.get('/orders/admin/all');
  },

  updateOrderStatusAdmin: async (id, status, rejectionReason = null) => {
    return await apiClient.put(`/orders/admin/${id}/status`, { status, rejectionReason });
  }
};

export default orderService;
