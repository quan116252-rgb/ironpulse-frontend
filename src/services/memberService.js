import api from "./api";

// ==================== DOANH THU ====================

export const getRevenueStats = async () => {
  try {
    const response = await api.get("revenue/");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu doanh thu:", error);
    throw error;
  }
};

// ==================== HỘI VIÊN ====================

export const getMembers = async () => {
  try {
    const response = await api.get("members/");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách hội viên từ Django:", error);
    return [];
  }
};

export const addMember = async (formData) => {
  try {
    const response = await api.post("members/", {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      packageName: formData.packageName,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Thêm hội viên thất bại!";

    throw new Error(message);
  }
};

export const updateMember = async (id, formData) => {
  try {
    const numericId =
      typeof id === "string" && id.startsWith("M00")
        ? id.replace("M00", "")
        : id;

    const response = await api.put(`members/${numericId}/`, {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      packageName: formData.packageName,
      startDate: formData.startDate,
      endDate: formData.endDate,
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      `Cập nhật hội viên thất bại! (Mã lỗi: ${
        error.response?.status || "Network Error"
      })`;

    throw new Error(message);
  }
};

export const deleteMember = async (id) => {
  try {
    const numericId =
      typeof id === "string" && id.startsWith("M00")
        ? id.replace("M00", "")
        : id;

    const response = await api.delete(`members/${numericId}/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa hội viên:", error);

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Xóa hội viên thất bại!";

    throw new Error(message);
  }
};

// ==================== CHECK-IN ====================

export const getTodayVisits = async () => {
  try {
    const response = await api.get("visits/today/");
    return response.data.today_visits || 0;
  } catch (error) {
    console.error("Lỗi khi tải số lượt tập hôm nay:", error);
    return 0;
  }
};

export const checkInMember = async (checkInData) => {
  try {
    const response = await api.post("checkin/", {
      full_name: checkInData.fullName,
      phone: checkInData.phone,
    });

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error || "Check-in thất bại!";

    throw new Error(message);
  }
};

export const getWeeklyVisits = async () => {
  try {
    const response = await api.get("visits/weekly/");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu lượt tập theo tuần:", error);
    return [];
  }
};

// ==================== HỘI VIÊN SẮP HẾT HẠN ====================

export const getExpiringSoonCount = async () => {
  try {
    const response = await api.get("members/expiring-soon/");
    return response.data.expiring_count || 0;
  } catch (error) {
    console.error("Lỗi khi tải số hội viên sắp hết hạn:", error);
    return 0;
  }
};

// ==================== HUẤN LUYỆN VIÊN ====================

export const getTrainers = async () => {
  try {
    const response = await api.get("trainers/");
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi tải danh sách huấn luyện viên từ Django:",
      error
    );

    return [];
  }
};

export const addTrainer = async (trainerData) => {
  try {
    const response = await api.post("trainers/", trainerData);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Thêm huấn luyện viên thất bại!";

    throw new Error(message);
  }
};

export const updateTrainer = async (id, trainerData) => {
  try {
    const response = await api.put(`trainers/${id}/`, {
      name: trainerData.name,
      specialty: trainerData.specialty,
      experience_years: Number(trainerData.experience_years),
      phone: trainerData.phone,
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật huấn luyện viên:", error);

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      (error.response?.data
        ? JSON.stringify(error.response.data)
        : "Cập nhật huấn luyện viên thất bại!");

    throw new Error(message);
  }
};

export const deleteTrainer = async (id) => {
  try {
    const response = await api.delete(`trainers/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa huấn luyện viên:", error);

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Xóa huấn luyện viên thất bại!";

    throw new Error(message);
  }
};

// ==================== GÓI TẬP ====================

export const getPackages = async () => {
  try {
    const response = await api.get("packages/");
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
      duration_months: Number(
        packageData.durationMonths ||
          packageData.duration_months ||
          1
      ),
      description: Array.isArray(packageData.features)
        ? packageData.features.join(", ")
        : packageData.features || "",
    };

    const response = await api.post("packages/", payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data
      ? JSON.stringify(error.response.data)
      : "Thêm gói tập thất bại!";

    throw new Error(message);
  }
};

export const updatePackage = async (id, packageData) => {
  try {
    const payload = {
      name: packageData.name,
      price: Number(packageData.price),
      duration_months: Number(
        packageData.durationMonths ||
          packageData.duration_months ||
          1
      ),
      description: Array.isArray(packageData.features)
        ? packageData.features.join(", ")
        : packageData.features || "",
    };

    const response = await api.put(`packages/${id}/`, payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data
      ? JSON.stringify(error.response.data)
      : "Cập nhật gói tập thất bại!";

    throw new Error(message);
  }
};

export const deletePackage = async (id) => {
  try {
    const response = await api.delete(`packages/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa gói tập:", error);
    throw new Error("Xóa gói tập thất bại!");
  }
};

// ==================== LỚP HỌC ====================

export const getClasses = async () => {
  try {
    const response = await api.get("classes/");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải danh sách lớp học:", error);
    return [];
  }
};

// ==================== ĐĂNG KÝ LỚP HỌC ====================

export const getClassRegistrations = async (phone = "") => {
  try {
    const response = await api.get("class-registrations/", {
      params: phone ? { phone } : {},
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi tải lịch đăng ký lớp:", error);
    return [];
  }
};

// Hội viên gửi yêu cầu đăng ký lớp
export const requestBookClass = async (bookingData) => {
  try {
    const response = await api.post(
      "class-registrations/",
      bookingData
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Gửi yêu cầu đặt lớp thất bại!";

    throw new Error(message);
  }
};

// Hội viên hủy yêu cầu đăng ký lớp đang chờ Admin phê duyệt
export const cancelClassRegistration = async (id) => {
  try {
    const response = await api.post(
      `class-registrations/${id}/cancel/`
    );

    return response.data;
  } catch (error) {
    console.error("CHI TIẾT LỖI HỦY ĐĂNG KÝ:", error);
    console.error("HTTP STATUS:", error.response?.status);
    console.error("BACKEND RESPONSE:", error.response?.data);
    console.error("REQUEST URL:", error.config?.url);

    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.response?.data?.message ||
      `Hủy yêu cầu thất bại (HTTP ${
        error.response?.status || "Network Error"
      })`;

    throw new Error(message);
  }
};

// Admin duyệt, từ chối hoặc đưa yêu cầu về trạng thái chờ
export const updateRegistrationStatus = async (id, status) => {
  try {
    const response = await api.patch(
      `class-registrations/${id}/status/`,
      { status }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Cập nhật trạng thái đăng ký lớp thất bại!";

    throw new Error(message);
  }
};

// ==================== ĐĂNG KÝ GÓI TẬP ====================

export const registerPackage = async (data) => {
  try {
    const response = await api.post("register-package/", data);
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Đăng ký gói thất bại!";

    throw new Error(message);
  }
};

// ==================== CẬP NHẬT HỒ SƠ CÁ NHÂN ====================

export const updateMemberProfile = async (profileData) => {
  try {
    const response = await api.put(
      "members/update-profile/",
      profileData
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      "Lỗi cập nhật thông tin cá nhân!";

    throw new Error(message);
  }
};