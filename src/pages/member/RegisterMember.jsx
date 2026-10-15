import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMembers, registerPackage } from "../../services/memberService";

export default function RegisterMember() {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState("vip");
  const [fullName, setFullName] = useState(user?.fullName || "Nguyễn Văn A");
  const [phone, setPhone] = useState("");
  const [membersList, setMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // Tải danh sách hội viên để kiểm tra gói đang hoạt động
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getMembers();
        setMembersList(data || []);
      } catch (error) {
        console.error("Lỗi tải danh sách hội viên:", error);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, []);

  // Danh sách 2 gói tập
  const packagesList = [
    {
      id: "basic",
      name: "Gói Chuẩn (Basic Gym)",
      duration: "Thời hạn 1 tháng",
      price: "500.000đ",
      priceValue: 500000,
      durationMonths: 1,
      popular: false,
      features: [
        "Giới hạn khung giờ: 8-15h hoặc sau 20h",
        "Sử dụng phòng tắm cơ bản, sử dụng máy tập, tủ đồ chung",
        "Đo chỉ số InBody miễn phí",
        "Mua thêm vé hoặc giới hạn số lớp/tuần"
      ],
    },
    {
      id: "vip",
      name: "Gói VIP (Gym + Class + PT)",
      duration: "Thời hạn 1 tháng",
      price: "1.200.000đ",
      priceValue: 1200000,
      durationMonths: 1,
      popular: true,
      features: [
        "Tủ đồ riêng, dịch vụ khăn tắm miễn phí, phòng xông hơi (Sauna/Steam), nước uống VIP.",
        "Tham gia không giới hạn các lớp Yoga, Zumba, Boxing, Cycling...",
        "Có 2 buổi tập cùng HLV cá nhân",
        "Tự do 24/7 hoặc ra vào bất kỳ khung giờ nào."
      ],
    },
  ];

  const currentPkg = packagesList.find((p) => p.id === selectedPackage);

  // Kiểm tra xem số điện thoại hoặc email này có đang sở hữu gói còn hạn hay không
  const checkActivePackage = () => {
    const searchPhone = phone.trim();
    const searchEmail = user?.email || "hoivien@gmail.com";

    const found = membersList.find(
      (m) => (searchPhone && m.phone === searchPhone) || (searchEmail && m.email === searchEmail)
    );

    if (!found) return null;

    const packageName = found.packageName;
    if (!packageName || packageName === "Chưa đăng ký gói" || packageName.trim() === "") {
      return null;
    }

    const endDateStr = found.endDate;
    if (!endDateStr) {
      return { packageName, endDate: "Đang hoạt động" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expiryDate = null;
    try {
      const parts = endDateStr.split(/[-/]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          expiryDate = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          expiryDate = new Date(parts[2], parts[1] - 1, parts[0]);
        }
      } else {
        expiryDate = new Date(endDateStr);
      }
    } catch (e) {
      console.error("Lỗi định dạng ngày:", e);
    }

    // Nếu ngày hết hạn lớn hơn hoặc bằng hôm nay -> Còn hạn
    if (expiryDate && !isNaN(expiryDate) && expiryDate >= today) {
      return { packageName, endDate: endDateStr };
    }

    return null;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // 1. Kiểm tra chặn ngay trên giao diện trước khi gửi request
    const activePkg = checkActivePackage();
    if (activePkg) {
      alert(
        `⚠️ Bạn đang sử dụng gói "${activePkg.packageName}" và vẫn còn hạn đến ngày ${activePkg.endDate}.\n\n` +
        `Vui lòng đợi gói hiện tại hết hạn trước khi đăng ký gói mới!`
      );
      return;
    }

    const newMemberData = {
      fullName: fullName,
      email: user?.email || "hoivien@gmail.com",
      phone: phone || "0901234567",
      packageName: currentPkg?.name,
      price: currentPkg?.priceValue,
      durationMonths: currentPkg?.durationMonths || 1,
    };

    try {
      // 2. Gọi API đăng ký qua /api/register-package/ để Backend kiểm tra chặn một lần nữa
      await registerPackage(newMemberData);
      alert(`🎉 Đăng ký thành công ${currentPkg?.name}! Tài khoản của bạn đã được cập nhật hệ thống.`);
      
      // Tải lại danh sách hội viên sau khi đăng ký thành công
      const data = await getMembers();
      setMembersList(data || []);
    } catch (error) {
      console.error("Lỗi đăng ký gói:", error);
      // Hiển thị thông báo lỗi chặn chi tiết từ Django trả về
      alert(error.message || "Đăng ký thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* HEADER PAGE */}
      <div>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a" }}>
          Bảng giá gói tập
        </h1>
        <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
          Chọn gói phù hợp với mục tiêu của bạn.
        </p>
      </div>

      {/* DANH SÁCH 2 GÓI TẬP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", maxWidth: "960px" }}>
        {packagesList.map((pkg) => {
          const isSelected = selectedPackage === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "32px",
                border: isSelected ? "2px solid #f97316" : "1px solid #e2e8f0",
                boxShadow: isSelected ? "0 10px 25px -5px rgba(249, 115, 22, 0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.2s ease",
              }}
            >
              {pkg.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: "-14px",
                    right: "24px",
                    backgroundColor: "#f97316",
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "bold",
                    padding: "4px 16px",
                    borderRadius: "20px",
                  }}
                >
                  Phổ biến
                </span>
              )}

              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "6px" }}>
                  {pkg.name}
                </h3>
                <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "20px" }}>
                  {pkg.duration}
                </p>

                <div style={{ marginBottom: "24px" }}>
                  <span style={{ fontSize: "32px", fontWeight: "800", color: "#ea580c" }}>
                    {pkg.price}
                  </span>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px 0", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {pkg.features.map((feat, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#334155" }}>
                      <Check size={18} color="#16a34a" strokeWidth={2.5} style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#ea580c" : "#f97316",
                  color: "#ffffff",
                  transition: "background-color 0.2s",
                }}
              >
                {isSelected ? "Đã chọn gói này" : "Đăng ký gói này"}
              </button>
            </div>
          );
        })}
      </div>

      {/* FORM XÁC NHẬN ĐĂNG KÝ */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "28px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          maxWidth: "960px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", marginBottom: "4px" }}>
          Xác nhận thông tin đăng ký
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
          Vui lòng kiểm tra lại thông tin trước khi hoàn tất
        </p>

        <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "6px" }}>
                Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
          </div>

          <div
            style={{
              padding: "16px 20px",
              backgroundColor: "#fff7ed",
              borderRadius: "12px",
              border: "1px solid #ffedd5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: "14px", fontWeight: "bold", color: "#0f172a", margin: 0 }}>
                Gói đã chọn: {currentPkg?.name}
              </p>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Thanh toán tại quầy lễ tân hoặc chuyển khoản</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "12px", color: "#64748b" }}>Tổng tiền: </span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#ea580c" }}>
                {currentPkg?.price}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingMembers}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: "#f97316",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "14px",
              borderRadius: "10px",
              border: "none",
              cursor: loadingMembers ? "not-allowed" : "pointer",
              opacity: loadingMembers ? 0.7 : 1,
            }}
          >
            {loadingMembers ? "Đang tải dữ liệu..." : "Hoàn tất đăng ký ngay"}
          </button>
        </form>
      </div>
    </div>
  );
}