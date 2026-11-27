
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ironpulse-backend-tvu3.onrender.com/api/";

// Chuẩn hóa dữ liệu người dùng trả về từ Django
const normalizeUser = (userData) => {
  const user = userData.user || userData;

  return {
    email: user.email || "",
    fullName: user.fullName || user.username || "",
    username: user.username || user.email || "",
    phone: user.phone || "",
    role: user.role || "Member",
  };
};

// Đăng nhập
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, {
      username: email,
      email: email,
      password: password,
    });

    const data = response.data;

    if (!data.token) {
      throw new Error("Backend không trả về token xác thực.");
    }

    return {
      token: data.token,
      user: normalizeUser(data),
    };
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "Email hoặc mật khẩu không đúng.";

    throw new Error(message);
  }
};

// Đăng ký
export const register = async (data) => {
  try {
    const response = await axios.post(`${API_URL}register/`, {
      username: data.email,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    });

    const result = response.data;

    if (!result.token) {
      throw new Error("Backend không trả về token xác thực.");
    }

    return {
      token: result.token,
      user: normalizeUser(result),
    };
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      "Đăng ký thất bại, vui lòng thử lại!";

    throw new Error(message);
  }
};
