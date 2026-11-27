
import axios from "axios";

// ==================== CẤU HÌNH API ====================

// Khi chạy Local, mặc định sử dụng Django trên máy tính.
// Khi deploy Online, Netlify sẽ cung cấp VITE_API_URL riêng.

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/";

// ==================== KHỞI TẠO AXIOS ====================

const api = axios.create({
  baseURL: API_URL.endsWith("/")
    ? API_URL
    : `${API_URL}/`,
  timeout: 30000,
});

// ==================== REQUEST INTERCEPTOR ====================

// Tự động gửi Token đăng nhập trong mỗi request.

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("gym_token");

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================

// Xử lý phản hồi và lỗi API.

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "Lỗi API:",
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;
