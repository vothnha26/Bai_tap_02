import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Biến để tránh gọi refresh nhiều lần cùng lúc
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor cho Response: Xử lý dữ liệu và lỗi tập trung
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử lại lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Nếu là request login hoặc verify-otp bị lỗi 401 thì không refresh
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/verify-otp')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token sử dụng instance api để thừa hưởng baseURL và config
        await api.post('/auth/refresh');
        
        isRefreshing = false;
        processQueue(null);

        // Retry chính request bị lỗi ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // Dọn dẹp localStorage để đồng bộ trạng thái logout ở FE
        localStorage.removeItem('user');
        localStorage.clear();

        // Chuyển hướng về login nếu refresh thất bại
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);

export default api;
