// src/data/mockData.js

export const packages = [
  {
    id: 1,
    name: "Gói Chuẩn (Basic Gym)",
    price: 500000,
    durationMonths: 1,
    features: [
      "Giới hạn khung giờ: 8-15h hoặc sau 20h",
      "Sử dụng phòng tắm cơ bản, sử dụng máy tập, tủ đồ chung",
      "Đo chỉ số InBody miễn phí",
      "Mua thêm vé hoặc giới hạn số lớp/tuần"
    ],
  },
  {
    id: 2,
    name: "Gói VIP (Gym + Class + PT)",
    price: 1200000,
    durationMonths: 1,
    features: [
      "Tủ đồ riêng, dịch vụ khăn tắm miễn phí, phòng xông hơi (Sauna/Steam), nước uống VIP.",
      "Tham gia không giới hạn các lớp Yoga, Zumba, Boxing, Cycling...",
      "Có 2 buổi tập cùng HLV cá nhân",
      "Tự do 24/7 hoặc ra vào bất kỳ khung giờ nào.",
    ],
  },
];

// Hàm khởi tạo danh sách hội viên từ localStorage kèm cơ chế dự phòng an toàn
const getStoredMembers = () => {
  const saved = localStorage.getItem("gym_members");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // Bỏ qua lỗi parse
    }
  }
  // Mảng dữ liệu mặc định để không bị crash trang Dashboard nếu chưa có ai
  return [
    {
      id: "M001",
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@gmail.com",
      phone: "0905123456",
      packageName: "Gói VIP",
      startDate: "2026-01-01",
      endDate: "2026-06-01",
      status: "Active",
    }
  ];
};

export const members = getStoredMembers();

export const revenueByMonth = [
  { month: "T5", revenue: 38 },
  { month: "T6", revenue: 45 },
  { month: "T7", revenue: 52 },
  { month: "T8", revenue: 49 },
  { month: "T9", revenue: 61 },
  { month: "T10", revenue: 67 },
];

export const visitsByDay = [
  { day: "T2", visits: 120 },
  { day: "T3", visits: 98 },
  { day: "T4", visits: 135 },
  { day: "T5", visits: 110 },
  { day: "T6", visits: 142 },
  { day: "T7", visits: 160 },
  { day: "CN", visits: 90 },
];

export const bodyMetrics = [
  { date: "01/07", weight: 74, bmi: 24.2 },
  { date: "01/08", weight: 72.5, bmi: 23.7 },
  { date: "01/09", weight: 71.2, bmi: 23.3 },
  { date: "01/10", weight: 70.4, bmi: 23.0 },
];

export const mySchedule = []; 

export const generateDefaultSchedule = (packageName) => {
  return [
    { id: 1, title: `Buổi 1: Thể lực & Cardio (${packageName})`, date: "Thứ 2", time: "18:00", place: "Khu Cardio" },
    { id: 2, title: `Buổi 2: Sức mạnh nhóm cơ trên`, date: "Thứ 4", time: "18:00", place: "Phòng Gym chính" },
    { id: 3, title: `Buổi 3: Sức mạnh nhóm cơ dưới`, date: "Thứ 6", time: "18:00", place: "Phòng Gym chính" },
    { id: 4, title: `Buổi 4: Yoga / Stretching thư giãn`, date: "Chủ Nhật", time: "09:00", place: "Phòng Studio 1" },
  ];
};

// Hàm format tiền tệ chuẩn xác, xử lý cả trường hợp giá trị rỗng hoặc phân tách sai thập phân
export const formatVND = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return "0đ";
  }
  const num = Number(price);
  return num.toLocaleString("vi-VN") + "đ";
};