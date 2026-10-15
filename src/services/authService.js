import axios from "axios";

const API_URL = "https://ironpulse-backend-tvu3.onrender.com/api/";

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}login/`, {
      username: email,
      email: email,
      password: password,
    });
    
    const userData = response.data; // Nhận về từ Django: { message, username, email, fullName, role }
    
    return {
      token: "django-auth-token", // Token định danh phiên làm việc
      user: {
        email: userData.email,
        fullName: userData.fullName || userData.username,
        role: userData.role, // "Admin" hoặc "Member"
      },
    };
  } catch (error) {
    const message = error.response?.data?.error || "Email hoặc mật khẩu không đúng";
    throw new Error(message);
  }
};

export const register = async (data) => {
  try {
    const response = await axios.post(`${API_URL}register/`, {
      username: data.email,
      email: data.email,
      password: data.password,
      fullName: data.fullName,
    });

    const userData = response.data;
    
    return {
      token: "django-auth-token",
      user: {
        email: data.email,
        fullName: data.fullName,
        role: "Member", // Mặc định tài khoản đăng ký mới là Member
      },
    };
  } catch (error) {
    const message = error.response?.data?.error || "Đăng ký thất bại, vui lòng thử lại!";
    throw new Error(message);
  }
};