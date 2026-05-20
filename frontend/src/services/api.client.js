import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor cho Request: Tự động thêm token vào Header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response: Xử lý dữ liệu và lỗi tập trung
api.interceptors.response.use(
  (response) => {
    // Axios trả về dữ liệu trong field 'data'
    return response.data;
  },
  (error) => {
    // Xử lý lỗi tập trung (ví dụ: log out nếu lỗi 401)
    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    console.error('API Error:', message);
    
    // Ném lỗi tiếp để component xử lý nếu cần
    return Promise.reject(new Error(message));
  }
);

export default api;
