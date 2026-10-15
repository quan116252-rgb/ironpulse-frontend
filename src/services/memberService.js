import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "https://ironpulse-backend-tvu3.onrender.com/api/";

export const getRevenueStats = async () => {
  try {
    const response = await axios.get(`${API_URL}revenue/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu doanh thu:", error);
    throw error;
  }
};

export const getMembers = async () => {
  try {
    const response = await axios.get(`${API_URL}members/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách hội viên từ Django:", error);
    return [];
  }
};

export const addMember = async (formData) => {
  try {
    const response = await axios.post(`${API_URL}members/`, {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      packageName: formData.packageName,
      startDate: formData.startDate,
      endDate: formData.endDate
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Thêm hội viên thất bại!";
    throw new Error(message);
  }
};

export const deleteMember = async (id) => {
  try {
    const numericId = typeof id === "string" && id.startsWith("M00") ? id.replace("M00", "") : id;
    const response = await axios.delete(`${API_URL}members/${numericId}/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa hội viên:", error);
    throw new Error("Xóa hội viên thất bại!");
  }
};

export const getTodayVisits = async () => {
  try {
    const response = await axios.get(`${API_URL}visits/today/`);
    return response.data.today_visits || 0;
  } catch (error) {
    console.error("Lỗi khi tải số lượt tập hôm nay:", error);
    return 0;
  }
};

export const checkInMember = async (checkInData) => {
  try {
    const response = await axios.post(`${API_URL}checkin/`, {
      full_name: checkInData.fullName,
      phone: checkInData.phone
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Check-in thất bại!";
    throw new Error(message);
  }
};

export const getTrainers = async () => {
  try {
    const response = await axios.get(`${API_URL}trainers/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách huấn luyện viên từ Django:", error);
    return [];
  }
};

export const addTrainer = async (trainerData) => {
  try {
    const response = await axios.post(`${API_URL}trainers/`, trainerData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Thêm huấn luyện viên thất bại!";
    throw new Error(message);
  }
};

export const deleteTrainer = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}trainers/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa huấn luyện viên:", error);
    throw new Error("Xóa huấn luyện viên thất bại!");
  }
};

export const getWeeklyVisits = async () => {
  try {
    const response = await axios.get(`${API_URL}visits/weekly/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu lượt tập theo tuần:", error);
    return [];
  }
};

export const getExpiringSoonCount = async () => {
  try {
    const response = await axios.get(`${API_URL}members/expiring-soon/`);
    return response.data.expiring_count || 0;
  } catch (error) {
    console.error("Lỗi khi tải số hội viên sắp hết hạn:", error);
    return 0;
  }
};

export const getPackages = async () => {
  try {
    const response = await axios.get(`${API_URL}packages/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách gói tập:", error);
    return [];
  }
};

export const addPackage = async (packageData) => {
  try {
    const payload = {
      name: packageData.name,
      price: Number(packageData.price),
      duration_months: Number(packageData.durationMonths || packageData.duration_months || 1),
      description: Array.isArray(packageData.features) ? packageData.features.join(", ") : (packageData.features || "")
    };
    const response = await axios.post(`${API_URL}packages/`, payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data ? JSON.stringify(error.response.data) : "Thêm gói tập thất bại!";
    throw new Error(message);
  }
};

export const updatePackage = async (id, packageData) => {
  try {
    const payload = {
      name: packageData.name,
      price: Number(packageData.price),
      duration_months: Number(packageData.durationMonths || packageData.duration_months || 1),
      description: Array.isArray(packageData.features) ? packageData.features.join(", ") : (packageData.features || "")
    };
    const response = await axios.put(`${API_URL}packages/${id}/`, payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data ? JSON.stringify(error.response.data) : "Cập nhật gói tập thất bại!";
    throw new Error(message);
  }
};

export const deletePackage = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}packages/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa gói tập:", error);
    throw new Error("Xóa gói tập thất bại!");
  }
};

export const getClasses = async () => {
  try {
    const response = await axios.get(`${API_URL}classes/`);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const getClassRegistrations = async (phone = "") => {
  try {
    const url = phone ? `${API_URL}class-registrations/?phone=${phone}` : `${API_URL}class-registrations/`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    return [];
  }
};

export const requestBookClass = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}class-registrations/`, bookingData);
    return response.data;
  } catch (error) {
    throw new Error("Gửi yêu cầu đặt lớp thất bại!");
  }
};

export const updateRegistrationStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}class-registrations/${id}/status/`, { status });
    return response.data;
  } catch (error) {
    throw new Error("Cập nhật trạng thái thất bại!");
  }
};

export const registerPackage = async (data) => {
  try {
    const response = await axios.post(`${API_URL}register-package/`, data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.error || "Đăng ký gói thất bại!";
    throw new Error(message);
  }
};

export const updateMemberProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_URL}members/update-profile/`, profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Lỗi cập nhật thông tin cá nhân!");
  }
};