import apiClient from './api.client';

export const getProfile = async () => {
  return await apiClient.get('/users/profile');
};

export const updateProfile = async (profileData) => {
  return await apiClient.put('/users/profile', profileData);
};

export const getAddresses = async () => {
  return await apiClient.get('/users/addresses');
};

export const addAddress = async (addressData) => {
  return await apiClient.post('/users/addresses', addressData);
};

export const updateAddress = async (addressId, addressData) => {
  return await apiClient.put(`/users/addresses/${addressId}`, addressData);
};

export const deleteAddress = async (addressId) => {
  return await apiClient.delete(`/users/addresses/${addressId}`);
};

export const setDefaultAddress = async (addressId) => {
  return await apiClient.patch(`/users/addresses/${addressId}/default`);
};

