import { useEffect, useState } from "react";
import { getClasses, getClassRegistrations, requestBookClass, getMembers } from "../../services/memberService";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

export default function MySchedule() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentPhone = user?.phone || "";
  const currentName = user?.fullName || "Hội viên";
  const currentEmail = user?.email || "";

  const loadData = async () => {
    setLoading(true);
    try {
      const [classList, membersList] = await Promise.all([
        getClasses(),
        getMembers()
      ]);
      setClasses(classList || []);

      const found = (membersList || []).find(
        (m) => m.email === currentEmail || (currentPhone && m.phone === currentPhone)
      );
      setMemberInfo(found);

      if (found && found.phone) {
        const regList = await getClassRegistrations(found.phone);
        setRegistrations(regList || []);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch tập:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const isRegistered = memberInfo && memberInfo.packageName && memberInfo.packageName !== "Chưa đăng ký gói";
  const packageName = memberInfo?.packageName || "";
  const isVip = packageName.toUpperCase().includes("VIP");

  // Định nghĩa lịch tập cá nhân (4 buổi/tuần) theo gói
  const vipSchedule = [
    { id: "p1", className: "Buổi 1: Thể lực nâng cao & HIIT Cardio", trainer: "PT Kèm riêng", schedule: "Thứ 2 - 18:00", status: "APPROVED", type: "Gói cá nhân" },
    { id: "p2", className: "Buổi 2: Sức mạnh cơ trên chuyên sâu", trainer: "PT Kèm riêng", schedule: "Thứ 4 - 18:00", status: "APPROVED", type: "Gói cá nhân" },
    { id: "p3", className: "Buổi 3: Sức mạnh cơ dưới & Đốt mỡ", trainer: "PT Kèm riêng", schedule: "Thứ 6 - 18:00", status: "APPROVED", type: "Gói cá nhân" },
    { id: "p4", className: "Buổi 4: Yoga trị liệu & Stretching", trainer: "PT Kèm riêng", schedule: "Chủ Nhật - 09:00", status: "APPROVED", type: "Gói cá nhân" }
  ];

  const basicSchedule = [
    { id: "p1", className: "Buổi 1: Thể hình cơ bản toàn thân (Full Body)", trainer: "HLV Hướng dẫn", schedule: "Thứ 2 - 07:00", status: "APPROVED", type: "Gói cá nhân" },
    { id: "p2", className: "Buổi 2: Tập nhóm cơ ngực & tay trước", trainer: "HLV Hướng dẫn", schedule: "Thứ 3 - 17:30", status: "APPROVED", type: "Gói cá nhân" },
    { id: "p3", className: "Buổi 3: Tập nhóm cơ lưng & tay sau", trainer: "HLV Hướng dẫn", schedule: "Thứ 5 - 17:30", status: "APPROVED", type: "Gói cá nhân" },
    { id: "p4", className: "Buổi 4: Cardio cơ bản & Thư giãn", trainer: "HLV Hướng dẫn", schedule: "Thứ 7 - 08:00", status: "APPROVED", type: "Gói cá nhân" }
  ];

  const defaultPersonalSchedule = isRegistered ? (isVip ? vipSchedule : basicSchedule) : [];

  // Lọc các lớp đăng ký đã được Admin duyệt (APPROVED) để đưa vào danh sách hiển thị chung
  const approvedExtraClasses = registrations
    .filter((r) => r.status === "APPROVED")
    .map((r) => ({ ...r, type: "Lớp đặt thêm" }));

  // Gộp lịch cá nhân mặc định và các lớp đã đăng ký được duyệt
  const combinedMyClasses = [...defaultPersonalSchedule, ...approvedExtraClasses];

  const handleBookClass = async (cls) => {
    if (!isRegistered) {
      alert("Bạn chưa đăng ký gói hội viên! Vui lòng đăng ký gói tập trước khi đặt lớp.");
      return;
    }

    const scheduleText = cls.schedule || (cls.day && cls.time ? `${cls.day} - ${cls.time}` : "Theo lịch CLB");
    const classFee = cls.price || 300000;

    if (!isVip) {
      const confirmPay = window.confirm(
        `Gói ${packageName} yêu cầu trả phí theo từng lớp.\n` +
        `Chi phí đăng ký lớp "${cls.name}": ${classFee.toLocaleString()} VNĐ.\n\n` +
        `Bạn có muốn xác nhận gửi yêu cầu đăng ký không?`
      );
      if (!confirmPay) return;
    }

    try {
      await requestBookClass({
        memberName: currentName,
        phone: memberInfo.phone || currentPhone,
        className: cls.name,
        trainer: cls.trainer || "Chưa xếp",
        schedule: scheduleText
      });
      alert("Đã gửi yêu cầu đăng ký lớp thành công! Vui lòng chờ Admin phê duyệt.");
      loadData();
    } catch (error) {
      alert("Đăng ký thất bại: " + error.message);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "APPROVED":
        return <span style={{ color: "#10b981", fontWeight: 600 }}>✓ Đã duyệt</span>;
      case "REJECTED":
        return <span style={{ color: "#ef4444", fontWeight: 600 }}>✕ Từ chối</span>;
      default:
        return <span style={{ color: "#f59e0b", fontWeight: 600 }}>⏳ Chờ phê duyệt</span>;
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h1 className="page-title">Lịch tập của tôi</h1>
      </div>

      {!isRegistered && (
        <div className="panel" style={{ padding: "20px", marginBottom: "24px", backgroundColor: "#fff7ed", border: "1px solid #ffedd5" }}>
          <p style={{ margin: "0 0 10px 0", color: "#9a3412", fontWeight: "bold" }}>
            ⚠️ Bạn chưa đăng ký gói hội viên nên chưa thể xem lịch cá nhân hoặc đặt lớp học!
          </p>
          <Link to="/member/packages" className="btn btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
            Đăng ký gói tập ngay
          </Link>
        </div>
      )}

      {/* BLOCK 1: Lớp học của tôi (Bao gồm lịch cá nhân mặc định + các lớp đặt thêm đã được duyệt) */}
      {isRegistered && (
        <div className="panel" style={{ marginBottom: "24px" }}>
          <h3>Lớp học của tôi ({isVip ? "Gói VIP" : "Gói Basic"})</h3>
          <div className="table-wrap" style={{ marginTop: "12px" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tên lớp</th>
                  <th>Huấn luyện viên</th>
                  <th>Lịch học</th>
                  <th>Phân loại</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {combinedMyClasses.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td><strong>{item.className || item.name}</strong></td>
                    <td>{item.trainer}</td>
                    <td>{item.schedule}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: item.type === "Gói cá nhân" ? "#e0f2fe" : "#fef3c7", color: item.type === "Gói cá nhân" ? "#0369a1" : "#b45309", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
                        {item.type}
                      </span>
                    </td>
                    <td>{renderStatus(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BLOCK 2: Đặt thêm lớp học */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3>Đặt thêm lớp học</h3>
          <span style={{ fontSize: "13px", color: isVip ? "#10b981" : "#f97316", fontWeight: 600 }}>
            {isRegistered ? (isVip ? "⭐ Gói VIP: Đăng ký lớp Miễn phí" : "💡 Gói Basic: Trả phí theo lớp") : "Vui lòng đăng ký gói để đặt lớp"}
          </span>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Lớp</th>
                <th>HLV</th>
                <th>Lịch học</th>
                <th>Học phí</th>
                <th style={{ textAlign: "right" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => {
                const existingReg = registrations.find((r) => r.className === c.name);
                const scheduleText = c.schedule || (c.day && c.time ? `${c.day} - ${c.time}` : "Theo lịch CLB");
                const priceDisplay = isVip ? "Miễn phí (VIP)" : `${(c.price || 300000).toLocaleString()} VNĐ`;

                return (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.trainer}</td>
                    <td>{scheduleText}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: isVip ? "#ecfdf5" : "#fff7ed", color: isVip ? "#047857" : "#c2410c", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>
                        {priceDisplay}
                      </span>
                    </td>
                    <td className="actions" style={{ textAlign: "right" }}>
                      {!isRegistered ? (
                        <span style={{ color: "#9ca3af", fontSize: "13px" }}>Cần đăng ký gói</span>
                      ) : existingReg ? (
                        renderStatus(existingReg.status)
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: "6px 12px", fontSize: "13px" }}
                          onClick={() => handleBookClass(c)}
                        >
                          Đặt lớp
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}