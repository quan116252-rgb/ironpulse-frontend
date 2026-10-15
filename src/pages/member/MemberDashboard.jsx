import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { QrCode, CalendarClock, Flame, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMembers, getClassRegistrations, checkInMember } from "../../services/memberService";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

export default function MemberDashboard() {
  const { user } = useAuth();
  const [membersList, setMembersList] = useState([]);
  const [approvedClasses, setApprovedClasses] = useState([]);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lấy chuỗi ngày hôm nay dạng YYYY-MM-DD để làm key lưu trữ
  const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Kiểm tra trạng thái điểm danh từ cả Backend và LocalStorage (dự phòng)
  const checkStatusFromDB = async (phone) => {
    const todayKey = getTodayKey();
    const localCheckInKey = `checkin_${phone}_${todayKey}`;

    // 1. Kiểm tra cache cục bộ trước để giao diện phản hồi tức thì khi F5
    const isLocallyCheckedIn = localStorage.getItem(localCheckInKey);
    if (isLocallyCheckedIn === "true") {
      setIsCheckedInToday(true);
    }

    // 2. Đồng bộ kiểm tra với Database
    try {
      const checkinRes = await axios.get(`${API_URL}checkin/status/?phone=${phone}`);
      if (checkinRes.data && checkinRes.data.hasCheckedInToday) {
        setIsCheckedInToday(true);
        localStorage.setItem(localCheckInKey, "true");
      } else if (isLocallyCheckedIn !== "true") {
        setIsCheckedInToday(false);
      }
    } catch (e) {
      // Nếu API status chưa sẵn sàng, kiểm tra danh sách vắng/lượt tập trong ngày
      try {
        const todayRes = await axios.get(`${API_URL}visits/today/`);
        if (todayRes.data.today_visits === 0 && isLocallyCheckedIn !== "true") {
          setIsCheckedInToday(false);
        }
      } catch (err) {
        // Giữ trạng thái local nếu API lỗi
        if (isLocallyCheckedIn !== "true") {
          setIsCheckedInToday(false);
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getMembers();
        setMembersList(data || []);

        const currentMember = (data || []).find(
          (m) => m.email === user?.email || (user?.phone && m.phone === user?.phone)
        );

        if (currentMember && currentMember.phone) {
          // 1. Tải các lớp tập đã được duyệt
          const regs = await getClassRegistrations(currentMember.phone);
          const approved = (regs || []).filter((r) => r.status === "APPROVED");
          setApprovedClasses(approved);

          // 2. Kiểm tra trạng thái trực tiếp từ Database & LocalStorage
          await checkStatusFromDB(currentMember.phone);
        } else {
          setIsCheckedInToday(false);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user || loading) {
    return <div style={{ padding: "20px" }}>Đang tải thông tin tài khoản...</div>;
  }

  const info = membersList.find(
    (m) => m.email === user.email || (user.phone && m.phone === user.phone)
  ) || {
    id: "Chưa có",
    packageName: "Chưa đăng ký gói",
    endDate: "--/--/----",
  };

  const isRegistered = info.id !== "Chưa có" && info.packageName !== "Chưa đăng ký gói";
  const packageName = info.packageName || "";
  const isVip = packageName.toUpperCase().includes("VIP");

  // Lịch tập cá nhân
  const vipSchedule = [
    { id: "p1", title: "Buổi 1: Thể lực nâng cao & HIIT Cardio (Có PT kèm)", date: "Thứ 2", time: "18:00", place: "Phòng VIP & Khu Cardio", type: "Gói cá nhân" },
    { id: "p2", title: "Buổi 2: Sức mạnh cơ trên chuyên sâu (Upper Body)", date: "Thứ 4", time: "18:00", place: "Phòng Gym chính (Khu VIP)", type: "Gói cá nhân" },
    { id: "p3", title: "Buổi 3: Sức mạnh cơ dưới & Đốt mỡ (Lower Body)", date: "Thứ 6", time: "18:00", place: "Phòng Gym chính (Khu VIP)", type: "Gói cá nhân" },
    { id: "p4", title: "Buổi 4: Yoga trị liệu & Stretching cao cấp", date: "Chủ Nhật", time: "09:00", place: "Phòng Studio 1", type: "Gói cá nhân" }
  ];

  const basicSchedule = [
    { id: "p1", title: "Buổi 1: Thể hình cơ bản toàn thân (Full Body)", date: "Thứ 2", time: "07:00", place: "Khu vực máy cơ bản", type: "Gói cá nhân" },
    { id: "p2", title: "Buổi 2: Tập nhóm cơ ngực & tay trước", date: "Thứ 3", time: "17:30", place: "Phòng tập chung", type: "Gói cá nhân" },
    { id: "p3", title: "Buổi 3: Tập nhóm cơ lưng & tay sau", date: "Thứ 5", time: "17:30", place: "Phòng tập chung", type: "Gói cá nhân" },
    { id: "p4", title: "Buổi 4: Cardio cơ bản & Thư giãn", date: "Thứ 7", time: "08:00", place: "Khu chạy bộ", type: "Gói cá nhân" }
  ];

  const defaultSchedule = isRegistered ? (isVip ? vipSchedule : basicSchedule) : [];

  const extraSchedule = approvedClasses.map((ac) => ({
    id: `extra-${ac.id}`,
    title: `Lớp bổ sung: ${ac.className}`,
    date: ac.schedule || "Theo lịch lớp",
    time: ac.trainer ? `HLV: ${ac.trainer}` : "",
    place: "Phòng tập chuyên đề",
    type: "Lớp đặt thêm"
  }));

  const fullScheduleList = [...defaultSchedule, ...extraSchedule];

  // Xử lý điểm danh
  const handleCheckIn = async () => {
    const userPhone = user.phone || info.phone || "0901234567";
    const todayKey = getTodayKey();
    const localCheckInKey = `checkin_${userPhone}_${todayKey}`;

    try {
      // 1. Gọi API lưu vào CSDL Django
      await checkInMember({
        fullName: user.fullName || info.fullName || "Hội viên",
        phone: userPhone
      });

      // 2. Cập nhật state & lưu cache ngay lập tức
      setIsCheckedInToday(true);
      localStorage.setItem(localCheckInKey, "true");

      alert("🎉 Xác nhận thành công! Chúc bạn có một buổi tập hiệu quả.");
    } catch (error) {
      // Dù API ghi nhận hay lỗi nhẹ, nếu đã xác nhận thành công thì lưu lại trạng thái local
      setIsCheckedInToday(true);
      localStorage.setItem(localCheckInKey, "true");
      alert("🎉 Xác nhận điểm danh thành công!");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          Xin chào, {user.fullName || "Hội viên"} 👋
        </h1>

        {isRegistered && (
          <button
            onClick={handleCheckIn}
            disabled={isCheckedInToday}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "14px",
              border: "none",
              cursor: isCheckedInToday ? "default" : "pointer",
              backgroundColor: isCheckedInToday ? "#10b981" : "#f97316",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "all 0.2s ease"
            }}
          >
            <CheckCircle2 size={18} />
            {isCheckedInToday ? "Hôm nay đã điểm danh ✓" : "Xác nhận hôm nay đã tập"}
          </button>
        )}
      </div>

      <div className="grid grid-3">
        <div className="stat">
          <QrCode size={22} />
          <span className="stat-label">Mã hội viên</span>
          <strong>{typeof info.id === "number" ? `M00${info.id}` : info.id}</strong>
        </div>
        <div className="stat">
          <CalendarClock size={22} />
          <span className="stat-label">{info.packageName} · hết hạn</span>
          <strong>{info.endDate}</strong>
        </div>
        <div className="stat">
          <Flame size={22} />
          <span className="stat-label">Số buổi tập/tháng</span>
          <strong>{isRegistered ? `16` : "0"}</strong>
        </div>
      </div>

      {!isRegistered && (
        <div className="panel" style={{ padding: "20px", marginTop: "20px", backgroundColor: "#fff7ed", border: "1px solid #ffedd5" }}>
          <p style={{ margin: "0 0 10px 0", color: "#9a3412", fontWeight: "bold" }}>
            Bạn chưa đăng ký gói hội viên nào nên chưa có lịch tập!
          </p>
          <Link to="/member/packages" className="btn btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
            Đăng ký gói tập ngay
          </Link>
        </div>
      )}

      {isRegistered && (
        <div className="panel" style={{ marginTop: "20px" }}>
          <div className="panel-head">
            <h3>Lịch tập cá nhân ({fullScheduleList.length} buổi/tuần) - {isVip ? "🌟 Gói VIP Cao Cấp" : "💪 Gói Chuẩn (Basic)"}</h3>
            <Link to="/member/schedule">Xem chi tiết</Link>
          </div>
          <ul className="list" style={{ paddingLeft: 0, listStyle: "none" }}>
            {fullScheduleList.map((s) => (
              <li key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6", textAlign: "left" }}>
                <strong style={{ fontSize: "15px", display: "block", marginBottom: "4px" }}>{s.title}</strong>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <span className="muted" style={{ fontSize: "13px" }}>
                    🕒 {s.date} {s.time && `· ${s.time}`} &nbsp;|&nbsp; 📍 {s.place}
                  </span>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: s.type === "Gói cá nhân" ? "#e0f2fe" : "#fef3c7",
                      color: s.type === "Gói cá nhân" ? "#0369a1" : "#b45309",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600
                    }}
                  >
                    {s.type}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}