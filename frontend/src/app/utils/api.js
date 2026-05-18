const BASE_URL = 'http://localhost:3000/api';

const apiFetch = async (endpoint, options = {}) => {
  const { body, ...customConfig } = options;
  const headers = { 'Content-Type': 'application/json', ...customConfig.headers };

  // Thêm token từ localStorage nếu có (backup cho cookie)
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: body ? (options.method || 'POST') : (options.method || 'GET'),
    ...customConfig,
    headers,
    credentials: 'include',
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Có lỗi xảy ra');
    }
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const authApi = {
  login: (credentials) => apiFetch('/auth/login', { body: credentials }),
  register: (userData) => apiFetch('/auth/register', { body: userData }),
  verifyOtp: (otpData) => apiFetch('/auth/verify-otp', { body: otpData }),
  resendOtp: (email) => apiFetch('/auth/resend-otp', { body: { email } }),
};

export const productApi = {
  getHomePage: () => apiFetch('/products/home'),
  getDetail: (slug) => apiFetch(`/products/${slug}`),
  search: (params) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/products/search?${query}`);
  },
  create: (productData) => apiFetch('/products', { body: productData }),
  update: (id, productData) => apiFetch(`/products/${id}`, { method: 'PUT', body: productData }),
  delete: (id) => apiFetch(`/products/${id}`, { method: 'DELETE' }),
};

export const categoryApi = {
  getAll: () => apiFetch('/categories'),
  create: (data) => apiFetch('/categories', { body: data }),
  update: (id, data) => apiFetch(`/categories/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' }),
};

export const statisticsApi = {
  getAdminStats: () => apiFetch('/statistics'),
};
