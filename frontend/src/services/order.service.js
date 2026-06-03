import apiClient from './api.client';

const orderService = {
  createOrder: async (orderData) => {
    return await apiClient.post('/orders', orderData);
  },

  // Alias dùng trong Checkout.jsx
  placeOrder: async (orderData) => {
    return await apiClient.post('/orders', orderData);
  },

  getUserOrders: async (params = {}) => {
    return await apiClient.get('/orders', { params });
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
