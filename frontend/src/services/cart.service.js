import apiClient from './api.client';

const cartService = {
  getCart: async () => {
    return await apiClient.get('/cart');
  },

  addToCart: async (productId, quantity) => {
    return await apiClient.post('/cart', { productId, quantity });
  },

  updateQuantity: async (productId, quantity) => {
    return await apiClient.put(`/cart/${productId}`, { quantity });
  },

  removeFromCart: async (productId) => {
    return await apiClient.delete(`/cart/${productId}`);
  },

  clearCart: async () => {
    return await apiClient.delete('/cart');
  }
};

export default cartService;
