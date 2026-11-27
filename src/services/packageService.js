
import api from "./api";

// ==================================================
// LẤY DANH SÁCH GÓI TẬP
// ==================================================

export const getPackages = async () => {
  const response = await api.get("packages/");

  // Hỗ trợ API trả về mảng hoặc dữ liệu phân trang
  const data = Array.isArray(response.data)
    ? response.data
    : response.data?.results || [];

  return data.map((p) => ({
    ...p,

    // Chuẩn hóa dữ liệu cho Frontend
    id: p.id,
    name: p.name,
    price: Number(p.price) || 0,

    durationMonths: Number(
      p.duration_months ?? p.durationMonths ?? 1
    ),

    features: Array.isArray(p.features)
      ? p.features
      : typeof p.description === "string"
        ? p.description
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
  }));
};

// ==================================================
// THÊM GÓI TẬP
// ==================================================

export const addPackage = async (p) => {
  const response = await api.post("packages/", {
    name: p.name,
    price: Number(p.price),

    duration_months: Number(
      p.durationMonths ?? p.duration_months ?? 1
    ),

    description: Array.isArray(p.features)
      ? p.features.join(", ")
      : p.description || "",
  });

  return response.data;
};

// ==================================================
// CẬP NHẬT GÓI TẬP
// ==================================================

export const updatePackage = async (id, data) => {
  const response = await api.patch(`packages/${id}/`, {
    name: data.name,
    price: Number(data.price),

    duration_months: Number(
      data.durationMonths ?? data.duration_months ?? 1
    ),

    description: Array.isArray(data.features)
      ? data.features.join(", ")
      : data.description || "",
  });

  return response.data;
};

// ==================================================
// XÓA GÓI TẬP
// ==================================================

export const deletePackage = async (id) => {
  const response = await api.delete(`packages/${id}/`);
  return response.data;
};
