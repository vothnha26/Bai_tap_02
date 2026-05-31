import apiClient from './api.client';

export const getProfile = async () => {
  return await apiClient.get('/users/profile');
};

export const updateProfile = async (profileData) => {
  return await apiClient.put('/users/profile', profileData);
};
