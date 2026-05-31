import api from './api.client';

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyOtp: (otpData) => api.post('/auth/verify-otp', otpData),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  logout: () => api.post('/auth/logout'),
};
