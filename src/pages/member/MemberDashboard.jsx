
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  QrCode,
  CalendarClock,
  Flame,
  CheckCircle2,
  Dumbbell,
  Clock,
  MapPin,
  Crown,
  CalendarDays,
  ArrowRight,
  Award,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  getMembers,
  getClassRegistrations,
  checkInMember,
} from "../../services/memberService";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://ironpulse-backend-tvu3.onrender.com/api/";

export default function MemberDashboard() {
  const { user } = useAuth();

  const [membersList, setMembersList] = useState([]);
  const [approvedClasses, setApprovedClasses] = useState([]);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lấy ngày hiện tại theo giờ địa phương
  const getTodayKey = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Kiểm tra trạng thái điểm danh
  const checkStatusFromDB = async (phone) => {
    const todayKey = getTodayKey();
    const localCheckInKey = `checkin_${phone}_${todayKey}`;

    const isLocallyCheckedIn = localStorage.getItem(localCheckInKey);

    if (isLocallyCheckedIn === "true") {
      setIsCheckedInToday(true);
    }

    try {
      const checkinRes = await axios.get(
        `${API_URL}checkin/status/?phone=${phone}`
      );

      if (
        checkinRes.data &&
        (
          checkinRes.data.hasCheckedInToday ||
          checkinRes.data.hasCheckedIn
        )
      ) {
        setIsCheckedInToday(true);
        localStorage.setItem(localCheckInKey, "true");
      } else if (isLocallyCheckedIn !== "true") {
        setIsCheckedInToday(false);
      }
    } catch (error) {
      if (isLocallyCheckedIn !== "true") {
        setIsCheckedInToday(false);
      }
    }
  };

  // Tải dữ liệu hội viên và lịch tập
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await getMembers();

        if (!isMounted) return;

        const members = data || [];
        setMembersList(members);

        const currentMember = members.find(
          (m) =>
            m.email === user?.email ||
            (user?.phone && m.phone === user?.phone)
        );

        if (currentMember && currentMember.phone) {
          // Chỉ tải lịch tập khi gói còn hạn
          if (currentMember.status === "Active") {
            const regs = await getClassRegistrations(
              currentMember.phone
            );

            if (!isMounted) return;

            const approved = (regs || []).filter(
              (r) => r.status === "APPROVED"
            );

            setApprovedClasses(approved);

            await checkStatusFromDB(currentMember.phone);
          } else {
            setApprovedClasses([]);
            setIsCheckedInToday(false);
          }
        } else {
          setApprovedClasses([]);
          setIsCheckedInToday(false);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user || loading) {
    return (
      <div className="ipx-member-loading">
        <Dumbbell size={28} />
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  // Thông tin hội viên hiện tại
  const info =
    membersList.find(
      (m) =>
        m.email === user.email ||
        (user.phone && m.phone === user.phone)
    ) || {
      id: "Chưa có",
      packageName: "Chưa đăng ký gói",
      startDate: "",
      endDate: "",
      status: "Expired",
    };

  // Đã từng đăng ký gói hay chưa
  const isRegistered =
    info.id !== "Chưa có" &&
    info.packageName !== "Chưa đăng ký gói";

  // Kiểm tra ngày hết hạn
  const todayKey = getTodayKey();

  const isDateActive =
    info.startDate &&
    info.endDate &&
    info.startDate <= todayKey &&
    todayKey < info.endDate;

  // Trạng thái gói hiện tại
  const isPackageActive =
    isRegistered &&
    (
      info.status === "Active" ||
      (!info.status && isDateActive)
    );

  const isPackageExpired =
    isRegistered && !isPackageActive;

  const packageName = info.packageName || "";
  const isVip = packageName.toUpperCase().includes("VIP");

  // Lịch tập gói VIP
  const vipSchedule = [
    {
      id: "p1",
      title: "Thể lực nâng cao & HIIT Cardio",
      date: "Thứ 2",
      time: "18:00",
      place: "Phòng VIP & Khu Cardio",
      type: "Gói cá nhân",
      note: "Có PT kèm",
    },
    {
      id: "p2",
      title: "Sức mạnh cơ trên chuyên sâu",
      date: "Thứ 4",
      time: "18:00",
      place: "Phòng Gym chính (Khu VIP)",
      type: "Gói cá nhân",
      note: "Upper Body",
    },
    {
      id: "p3",
      title: "Sức mạnh cơ dưới & Đốt mỡ",
      date: "Thứ 6",
      time: "18:00",
      place: "Phòng Gym chính (Khu VIP)",
      type: "Gói cá nhân",
      note: "Lower Body",
    },
    {
      id: "p4",
      title: "Yoga trị liệu & Stretching cao cấp",
      date: "Chủ Nhật",
      time: "09:00",
      place: "Phòng Studio 1",
      type: "Gói cá nhân",
      note: "Thư giãn và phục hồi",
    },
  ];

  // Lịch tập gói Basic
  const basicSchedule = [
    {
      id: "p1",
      title: "Thể hình cơ bản toàn thân",
      date: "Thứ 2",
      time: "07:00",
      place: "Khu vực máy cơ bản",
      type: "Gói cá nhân",
      note: "Full Body",
    },
    {
      id: "p2",
      title: "Tập nhóm cơ ngực & tay trước",
      date: "Thứ 3",
      time: "17:30",
      place: "Phòng tập chung",
      type: "Gói cá nhân",
      note: "Tập luyện sức mạnh",
    },
    {
      id: "p3",
      title: "Tập nhóm cơ lưng & tay sau",
      date: "Thứ 5",
      time: "17:30",
      place: "Phòng tập chung",
      type: "Gói cá nhân",
      note: "Tập luyện sức mạnh",
    },
    {
      id: "p4",
      title: "Cardio cơ bản & Thư giãn",
      date: "Thứ 7",
      time: "08:00",
      place: "Khu chạy bộ",
      type: "Gói cá nhân",
      note: "Cardio",
    },
  ];

  // Chỉ hiển thị lịch mặc định khi gói còn hạn
  const defaultSchedule = isPackageActive
    ? isVip
      ? vipSchedule
      : basicSchedule
    : [];

  // Các lớp tập đã được Admin duyệt
  const extraSchedule = isPackageActive
    ? approvedClasses.map((ac) => ({
        id: `extra-${ac.id}`,
        title: `Lớp bổ sung: ${ac.className}`,
        date: ac.schedule || "Theo lịch lớp",
        time: ac.trainer ? `HLV: ${ac.trainer}` : "",
        place: "Phòng tập chuyên đề",
        type: "Lớp đặt thêm",
        note: "Đã được xác nhận",
      }))
    : [];

  const fullScheduleList = [
    ...defaultSchedule,
    ...extraSchedule,
  ];

  // Xử lý điểm danh
  const handleCheckIn = async () => {
    if (!isPackageActive) {
      alert("Gói tập của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục tập luyện!");
      return;
    }

    const userPhone = user.phone || info.phone;

    if (!userPhone) {
      alert("Không tìm thấy số điện thoại hội viên!");
      return;
    }

    const todayKey = getTodayKey();
    const localCheckInKey = `checkin_${userPhone}_${todayKey}`;

    try {
      await checkInMember({
        fullName: user.fullName || info.fullName || "Hội viên",
        phone: userPhone,
      });

      setIsCheckedInToday(true);
      localStorage.setItem(localCheckInKey, "true");

      alert(
        "🎉 Xác nhận thành công! Chúc bạn có một buổi tập hiệu quả."
      );
    } catch (error) {
      console.error("Lỗi điểm danh:", error);

      alert(
        error.response?.data?.error ||
        error.message ||
        "Không thể xác nhận điểm danh. Vui lòng thử lại!"
      );
    }
  };

  return (
    <div className="ipx-member-dashboard">

      {/* HEADER */}
      <section className="ipx-member-header">
        <div>
          <span className="ipx-member-eyebrow">
            IRONPULSE FITNESS CLUB
          </span>

          <h1>
            XIN CHÀO,{" "}
            <span>{user.fullName || "HỘI VIÊN"}</span>
          </h1>

          <p>
            Hãy tiếp tục hành trình chinh phục mục tiêu của bạn.
          </p>
        </div>

        {isPackageActive && (
          <button
            onClick={handleCheckIn}
            disabled={isCheckedInToday}
            className={`ipx-member-checkin ${
              isCheckedInToday ? "checked" : ""
            }`}
          >
            <CheckCircle2 size={18} />

            {isCheckedInToday
              ? "HÔM NAY ĐÃ ĐIỂM DANH"
              : "XÁC NHẬN ĐIỂM DANH"}
          </button>
        )}
      </section>

      {/* MEMBER STATS */}
      <section className="ipx-member-stats">

        <div className="ipx-member-stat">
          <div className="ipx-member-stat-icon">
            <QrCode size={22} />
          </div>

          <div>
            <span>MÃ HỘI VIÊN</span>

            <strong>
              {typeof info.id === "number"
                ? `M00${info.id}`
                : info.id}
            </strong>
          </div>
        </div>

        <div className="ipx-member-stat">
          <div className="ipx-member-stat-icon">
            <CalendarClock size={22} />
          </div>

          <div>
            <span>
              {isRegistered
                ? `${info.packageName} · HẾT HẠN`
                : "GÓI HỘI VIÊN"}
            </span>

            <strong>
              {info.endDate || "--/--/----"}
            </strong>
          </div>
        </div>

        <div className="ipx-member-stat">
          <div className="ipx-member-stat-icon">
            {isPackageActive ? (
              <Flame size={22} />
            ) : (
              <AlertTriangle size={22} />
            )}
          </div>

          <div>
            <span>TRẠNG THÁI GÓI</span>

            <strong>
              {isPackageActive
                ? "ĐANG HOẠT ĐỘNG"
                : isPackageExpired
                ? "ĐÃ HẾT HẠN"
                : "CHƯA ĐĂNG KÝ"}
            </strong>
          </div>
        </div>

      </section>

      {/* CHƯA ĐĂNG KÝ GÓI */}
      {!isRegistered && (
        <section className="ipx-member-no-package">
          <div className="ipx-member-no-package-icon">
            <Dumbbell size={27} />
          </div>

          <div>
            <h3>BẠN CHƯA ĐĂNG KÝ GÓI HỘI VIÊN</h3>

            <p>
              Hãy lựa chọn gói tập phù hợp để bắt đầu hành trình
              luyện tập tại IronPulse.
            </p>
          </div>

          <Link to="/member/packages">
            ĐĂNG KÝ GÓI TẬP
            <ArrowRight size={17} />
          </Link>
        </section>
      )}

      {/* GÓI ĐÃ HẾT HẠN */}
      {isPackageExpired && (
        <section className="ipx-member-expired">

          <div className="ipx-member-expired-icon">
            <AlertTriangle size={30} />
          </div>

          <div className="ipx-member-expired-content">
            <span className="ipx-member-eyebrow">
              MEMBERSHIP EXPIRED
            </span>

            <h2>GÓI TẬP CỦA BẠN ĐÃ HẾT HẠN!</h2>

            <p>
              Gói <strong>{info.packageName}</strong> của bạn
              đã hết thời hạn sử dụng vào ngày{" "}
              <strong>{info.endDate}</strong>.
            </p>

            <p>
              Lịch tập cá nhân và các lớp đăng ký bổ sung
              hiện đã được ẩn. Vui lòng gia hạn gói cũ
              hoặc lựa chọn một gói tập mới để tiếp tục
              sử dụng các dịch vụ tại IronPulse.
            </p>

            <Link
              to="/member/packages"
              className="ipx-member-renew-button"
            >
              <RefreshCw size={18} />
              GIA HẠN / ĐĂNG KÝ GÓI MỚI
              <ArrowRight size={17} />
            </Link>
          </div>

        </section>
      )}

      {/* LỊCH TẬP - CHỈ HIỂN THỊ KHI GÓI CÒN HẠN */}
      {isPackageActive && (
        <section className="ipx-member-schedule">

          <div className="ipx-member-section-heading">
            <div>
              <span className="ipx-member-eyebrow">
                KẾ HOẠCH LUYỆN TẬP
              </span>

              <h2>
                LỊCH TẬP <span>CỦA BẠN</span>
              </h2>

              <p>
                Theo dõi các buổi tập cá nhân và lớp học đã đăng ký.
              </p>
            </div>

            <Link to="/member/schedule">
              XEM CHI TIẾT
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* GÓI HIỆN TẠI */}
          <div className="ipx-member-package-banner">

            <div className="ipx-member-package-icon">
              {isVip ? (
                <Crown size={23} />
              ) : (
                <Dumbbell size={23} />
              )}
            </div>

            <div>
              <span>GÓI HỘI VIÊN HIỆN TẠI</span>

              <h3>
                {isVip
                  ? "GÓI VIP CAO CẤP"
                  : "GÓI CHUẨN BASIC"}
              </h3>
            </div>

            <div className="ipx-member-package-badge">
              <Award size={15} />
              ĐANG HOẠT ĐỘNG
            </div>

          </div>

          {/* DANH SÁCH LỊCH TẬP */}
          <div className="ipx-member-schedule-list">

            {fullScheduleList.map((s, index) => (
              <article
                key={s.id}
                className="ipx-member-schedule-item"
              >
                <div className="ipx-member-schedule-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="ipx-member-schedule-main">

                  <div className="ipx-member-schedule-title">
                    <h3>{s.title}</h3>

                    <span
                      className={
                        s.type === "Gói cá nhân"
                          ? "ipx-member-type personal"
                          : "ipx-member-type extra"
                      }
                    >
                      {s.type}
                    </span>
                  </div>

                  {s.note && (
                    <p className="ipx-member-schedule-note">
                      {s.note}
                    </p>
                  )}

                  <div className="ipx-member-schedule-details">

                    <span>
                      <CalendarDays size={14} />
                      {s.date}
                    </span>

                    {s.time && (
                      <span>
                        <Clock size={14} />
                        {s.time}
                      </span>
                    )}

                    <span>
                      <MapPin size={14} />
                      {s.place}
                    </span>

                  </div>
                </div>
              </article>
            ))}

            {fullScheduleList.length === 0 && (
              <div className="ipx-member-empty">
                Chưa có lịch tập nào được hiển thị.
              </div>
            )}

          </div>
        </section>
      )}

    </div>
  );
}
