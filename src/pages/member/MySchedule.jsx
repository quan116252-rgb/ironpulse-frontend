
import { useEffect, useState } from "react";
import {
  getClasses,
  getClassRegistrations,
  requestBookClass,
  getMembers,
  cancelClassRegistration,
} from "../../services/memberService";

import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

import {
  CalendarDays,
  Clock3,
  Dumbbell,
  UserRound,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Crown,
  AlertCircle,
  Ban,
  LoaderCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function MySchedule() {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // ==================== CHUẨN HÓA DỮ LIỆU ====================

  const getMemberPackage = (member) =>
    member?.packageName || member?.package_name || "";

  const getRegistrationClassName = (registration) =>
    registration?.className || registration?.class_name || "";

  const getRegistrationSchedule = (registration) =>
    registration?.schedule || "Chưa cập nhật";

  const getRegistrationStatus = (registration) =>
    String(registration?.status || "PENDING")
      .trim()
      .toUpperCase();

  // Ngày hiện tại theo múi giờ máy người dùng
  const getTodayKey = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Kiểm tra ngày hết hạn
  const isDateActive = (member) => {
    const startDate = member?.startDate || member?.start_date;
    const endDate = member?.endDate || member?.end_date;

    if (!startDate || !endDate) return false;

    const today = getTodayKey();

    return startDate <= today && today < endDate;
  };

  // Lấy đăng ký mới nhất của một lớp
  const getLatestRegistrationForClass = (className) => {
    const normalizedName = String(className || "")
      .trim()
      .toLowerCase();

    return (
      registrations
        .filter(
          (registration) =>
            String(getRegistrationClassName(registration))
              .trim()
              .toLowerCase() === normalizedName
        )
        .sort(
          (a, b) => Number(b.id || 0) - Number(a.id || 0)
        )[0] || null
    );
  };

  // ==================== TẢI DỮ LIỆU ====================

  const loadData = async (showLoading = true) => {
    if (!user) {
      setMemberInfo(null);
      setRegistrations([]);
      setClasses([]);
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }

    try {
      const [classList, membersList, registrationList] =
        await Promise.all([
          getClasses(),
          getMembers(),
          getClassRegistrations(),
        ]);

      setClasses(
        Array.isArray(classList) ? classList : []
      );

      const currentMember = Array.isArray(membersList)
        ? membersList[0] || null
        : null;

      setMemberInfo(currentMember);

      const sortedRegistrations = Array.isArray(registrationList)
        ? [...registrationList].sort(
            (a, b) => Number(b.id || 0) - Number(a.id || 0)
          )
        : [];

      setRegistrations(sortedRegistrations);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch tập:", error);

      setMemberInfo(null);
      setRegistrations([]);
      setClasses([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ==================== KIỂM TRA GÓI HỘI VIÊN ====================

  const packageName = getMemberPackage(memberInfo);

  // Hội viên đã từng có gói
  const hasPackage =
    Boolean(packageName) &&
    packageName.trim().toLowerCase() !== "chưa đăng ký gói";

  // Trạng thái gói từ Backend
  const packageStatus = String(memberInfo?.status || "")
    .trim()
    .toUpperCase();

  // Kiểm tra gói còn hạn
  const isPackageActive =
    hasPackage &&
    (
      packageStatus === "ACTIVE" ||
      (!packageStatus && isDateActive(memberInfo))
    );

  // Kiểm tra gói đã hết hạn
  const isPackageExpired =
    hasPackage && !isPackageActive;

  // Chỉ xác định VIP khi gói còn hiệu lực
  const isVip =
    isPackageActive &&
    packageName.toUpperCase().includes("VIP");

  const endDate =
    memberInfo?.endDate || memberInfo?.end_date || "";

  const formattedEndDate = endDate
    ? new Date(`${endDate}T00:00:00`).toLocaleDateString("vi-VN")
    : "";

  // ==================== LỊCH TẬP CÁ NHÂN ====================

  // Chỉ lấy các lớp đã được Admin phê duyệt
  const approvedExtraClasses = registrations
    .filter(
      (registration) =>
        getRegistrationStatus(registration) === "APPROVED"
    )
    .map((registration) => ({
      ...registration,
      className: getRegistrationClassName(registration),
      schedule: getRegistrationSchedule(registration),
      type: "Lớp đặt thêm",
    }));

  const combinedMyClasses = approvedExtraClasses;

  // ==================== ĐẶT LỚP ====================

  const handleBookClass = async (cls) => {
    if (!isPackageActive) {
      alert(
        "Gói hội viên của bạn đã hết hạn hoặc chưa được đăng ký. Vui lòng đăng ký gói tập để tiếp tục."
      );
      return;
    }

    const scheduleText =
      cls.schedule ||
      (cls.day && cls.time
        ? `${cls.day} - ${cls.time}`
        : "Theo lịch CLB");

    const classFee = Number(cls.price) || 300000;

    if (!isVip) {
      const confirmPay = window.confirm(
        `Gói ${packageName} yêu cầu trả phí theo từng lớp.\n` +
          `Chi phí đăng ký lớp "${cls.name}": ${classFee.toLocaleString(
            "vi-VN"
          )} VNĐ.\n\n` +
          "Bạn có muốn xác nhận gửi yêu cầu đăng ký không?"
      );

      if (!confirmPay) return;
    }

    try {
      const response = await requestBookClass({
        className: cls.name,
        trainer: cls.trainer || "Chưa xếp",
        schedule: scheduleText,
      });

      console.log("Kết quả đăng ký lớp:", response);

      alert(
        "Đã gửi yêu cầu đăng ký lớp thành công! Vui lòng chờ Admin phê duyệt."
      );

      await loadData(false);
    } catch (error) {
      console.error("Lỗi đăng ký lớp:", error);
      alert("Đăng ký thất bại: " + error.message);
    }
  };

  // ==================== HỦY YÊU CẦU ĐĂNG KÝ ====================

  const handleCancelRegistration = async (registration) => {
    const status = getRegistrationStatus(registration);

    if (status !== "PENDING") {
      alert("Chỉ có thể hủy yêu cầu đang chờ Admin phê duyệt.");
      return;
    }

    const className = getRegistrationClassName(registration);

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn hủy yêu cầu đăng ký lớp "${className}" không?\n\n` +
        "Yêu cầu này sẽ không còn nằm trong danh sách chờ duyệt của Admin."
    );

    if (!confirmed) return;

    try {
      setCancellingId(registration.id);

      await cancelClassRegistration(registration.id);

      alert("Đã hủy yêu cầu đăng ký lớp thành công!");

      await loadData(false);
    } catch (error) {
      console.error("Lỗi hủy yêu cầu đăng ký:", error);

      alert(
        "Hủy yêu cầu thất bại: " +
          (error.message || "Vui lòng thử lại!")
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ==================== HIỂN THỊ TRẠNG THÁI ====================

  const renderStatus = (status) => {
    const normalizedStatus = String(status || "PENDING")
      .trim()
      .toUpperCase();

    switch (normalizedStatus) {
      case "APPROVED":
        return (
          <span className="ipx-schedule-status approved">
            <CheckCircle2 size={14} />
            Đã duyệt
          </span>
        );

      case "REJECTED":
        return (
          <span className="ipx-schedule-status rejected">
            <XCircle size={14} />
            Từ chối
          </span>
        );

      case "CANCELLED":
        return (
          <span className="ipx-schedule-status cancelled">
            <Ban size={14} />
            Đã hủy
          </span>
        );

      case "PENDING":
      default:
        return (
          <span className="ipx-schedule-status pending">
            <Clock size={14} />
            Chờ duyệt
          </span>
        );
    }
  };

  // ==================== GIAO DIỆN ====================

  return (
    <div className="ipx-schedule-page">
      {/* HEADER */}
      <div className="ipx-schedule-heading">
        <div>
          <span className="ipx-schedule-eyebrow">
            IRONPULSE FITNESS CLUB
          </span>

          <h1>LỊCH TẬP CỦA TÔI</h1>

          <p>
            Theo dõi lịch tập và quản lý các lớp học của bạn.
          </p>
        </div>

        <div className="ipx-schedule-heading-icon">
          <CalendarDays size={28} />
        </div>
      </div>

      {loading ? (
        <div className="ipx-schedule-loading">
          Đang tải thông tin hội viên...
        </div>
      ) : (
        <>
          {/* ==================== GÓI CÒN HẠN ==================== */}

          {isPackageActive && (
            <div className="ipx-schedule-package">
              <div className="ipx-schedule-package-icon">
                {isVip ? (
                  <Crown size={23} />
                ) : (
                  <Dumbbell size={23} />
                )}
              </div>

              <div className="ipx-schedule-package-info">
                <span>GÓI HỘI VIÊN HIỆN TẠI</span>
                <h3>{packageName}</h3>
              </div>

              <span
                className={`ipx-schedule-package-tag ${
                  isVip ? "vip" : "basic"
                }`}
              >
                {isVip ? "THÀNH VIÊN VIP" : "THÀNH VIÊN BASIC"}
              </span>
            </div>
          )}

          {/* ==================== GÓI ĐÃ HẾT HẠN ==================== */}

          {isPackageExpired && (
            <div className="ipx-schedule-expired">
              <div className="ipx-schedule-expired-icon">
                <AlertCircle size={28} />
              </div>

              <div className="ipx-schedule-expired-content">
                <span className="ipx-schedule-expired-label">
                  MEMBERSHIP EXPIRED
                </span>

                <h2>GÓI TẬP CỦA BẠN ĐÃ HẾT HẠN!</h2>

                <p>
                  Gói <strong>{packageName}</strong> của bạn đã hết
                  thời hạn sử dụng
                  {formattedEndDate && (
                    <>
                      {" "}vào ngày{" "}
                      <strong>{formattedEndDate}</strong>
                    </>
                  )}.
                </p>

                <p>
                  Lịch tập cá nhân và các lớp đăng ký bổ sung hiện
                  đã được ẩn. Vui lòng gia hạn gói cũ hoặc lựa chọn
                  một gói tập mới để tiếp tục sử dụng dịch vụ tại
                  IronPulse.
                </p>

                <Link
                  to="/member/packages"
                  className="ipx-schedule-renew-btn"
                >
                  <RefreshCw size={17} />
                  GIA HẠN / ĐĂNG KÝ GÓI MỚI
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          )}

          {/* ==================== CHƯA ĐĂNG KÝ GÓI ==================== */}

          {!hasPackage && (
            <div className="ipx-schedule-warning">
              <div className="ipx-schedule-warning-icon">
                <AlertCircle size={23} />
              </div>

              <div className="ipx-schedule-warning-content">
                <h3>Bạn chưa đăng ký gói hội viên</h3>

                <p>
                  Hãy đăng ký gói tập để xem lịch cá nhân và sử dụng
                  tính năng đặt lớp học.
                </p>

                <Link
                  to="/member/packages"
                  className="ipx-schedule-primary-btn"
                >
                  XEM CÁC GÓI TẬP
                </Link>
              </div>
            </div>
          )}

          {/* ==================== LỊCH CÁ NHÂN ==================== */}

          {isPackageActive && (
            <section className="ipx-schedule-section">
              <div className="ipx-schedule-section-heading">
                <div>
                  <span className="ipx-schedule-section-label">
                    LỊCH TRÌNH CÁ NHÂN
                  </span>

                  <h2>Lớp học thêm của tôi</h2>
                </div>

                <span className="ipx-schedule-count">
                  {combinedMyClasses.length} BUỔI TẬP
                </span>
              </div>

              {combinedMyClasses.length === 0 ? (
                <div className="ipx-schedule-empty">
                  Bạn chưa có lớp học nào được phê duyệt.
                  Hãy đăng ký lớp học bên dưới để bắt đầu.
                </div>
              ) : (
                <div className="ipx-schedule-table-wrap">
                  <table className="ipx-schedule-table">
                    <thead>
                      <tr>
                        <th>TÊN LỚP HỌC</th>
                        <th>HUẤN LUYỆN VIÊN</th>
                        <th>LỊCH HỌC</th>
                        <th>PHÂN LOẠI</th>
                        <th>TRẠNG THÁI</th>
                      </tr>
                    </thead>

                    <tbody>
                      {combinedMyClasses.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td>
                            <div className="ipx-schedule-class-name">
                              <span className="ipx-schedule-class-icon">
                                <Dumbbell size={16} />
                              </span>

                              <strong>
                                {item.className || item.name}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span className="ipx-schedule-trainer">
                              <UserRound size={14} />
                              {item.trainer || "Chưa cập nhật"}
                            </span>
                          </td>

                          <td>
                            <span className="ipx-schedule-time">
                              <Clock3 size={14} />
                              {item.schedule}
                            </span>
                          </td>

                          <td>
                            <span className="ipx-schedule-type extra">
                              {item.type}
                            </span>
                          </td>

                          <td>{renderStatus(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ==================== ĐẶT THÊM LỚP ==================== */}

          {isPackageActive && (
            <section className="ipx-schedule-section">
              <div className="ipx-schedule-section-heading">
                <div>
                  <span className="ipx-schedule-section-label">
                    KHÁM PHÁ CÁC LỚP HỌC
                  </span>

                  <h2>Đặt thêm lớp học</h2>
                </div>

                <span
                  className={`ipx-schedule-booking-note ${
                    isVip ? "vip" : ""
                  }`}
                >
                  {isVip
                    ? "VIP · MIỄN PHÍ"
                    : "BASIC · TÍNH PHÍ THEO LỚP"}
                </span>
              </div>

              <div className="ipx-schedule-table-wrap">
                {classes.length === 0 ? (
                  <div className="ipx-schedule-empty">
                    Hiện chưa có lớp học nào.
                  </div>
                ) : (
                  <table className="ipx-schedule-table">
                    <thead>
                      <tr>
                        <th>LỚP HỌC</th>
                        <th>HUẤN LUYỆN VIÊN</th>
                        <th>LỊCH HỌC</th>
                        <th>HỌC PHÍ</th>
                        <th className="text-right">THAO TÁC</th>
                      </tr>
                    </thead>

                    <tbody>
                      {classes.map((c) => {
                        const existingReg =
                          getLatestRegistrationForClass(c.name);

                        const existingStatus = existingReg
                          ? getRegistrationStatus(existingReg)
                          : null;

                        const scheduleText =
                          c.schedule ||
                          (c.day && c.time
                            ? `${c.day} - ${c.time}`
                            : "Theo lịch CLB");

                        const priceDisplay = isVip
                          ? "Miễn phí (VIP)"
                          : `${(
                              Number(c.price) || 300000
                            ).toLocaleString("vi-VN")} VNĐ`;

                        const canBookAgain =
                          !existingReg ||
                          existingStatus === "REJECTED" ||
                          existingStatus === "CANCELLED";

                        return (
                          <tr key={c.id}>
                            <td>
                              <div className="ipx-schedule-class-name">
                                <span className="ipx-schedule-class-icon">
                                  <Dumbbell size={16} />
                                </span>

                                <strong>{c.name}</strong>
                              </div>
                            </td>

                            <td>
                              <span className="ipx-schedule-trainer">
                                <UserRound size={14} />
                                {c.trainer || "Chưa cập nhật"}
                              </span>
                            </td>

                            <td>
                              <span className="ipx-schedule-time">
                                <Clock3 size={14} />
                                {scheduleText}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`ipx-schedule-price ${
                                  isVip ? "free" : ""
                                }`}
                              >
                                {priceDisplay}
                              </span>
                            </td>

                            <td className="ipx-schedule-action-cell">
                              {canBookAgain ? (
                                <button
                                  type="button"
                                  className="ipx-schedule-book-btn"
                                  onClick={() => handleBookClass(c)}
                                >
                                  <Plus size={15} />
                                  Đặt lớp
                                </button>
                              ) : existingStatus === "PENDING" ? (
                                <div className="ipx-schedule-pending-actions">
                                  {renderStatus(existingStatus)}

                                  <button
                                    type="button"
                                    className="ipx-schedule-cancel-btn"
                                    disabled={
                                      cancellingId === existingReg.id
                                    }
                                    onClick={() =>
                                      handleCancelRegistration(existingReg)
                                    }
                                  >
                                    {cancellingId === existingReg.id ? (
                                      <LoaderCircle
                                        size={14}
                                        className="ipx-schedule-spin"
                                      />
                                    ) : (
                                      <Ban size={14} />
                                    )}

                                    {cancellingId === existingReg.id
                                      ? "Đang hủy..."
                                      : "Hủy yêu cầu"}
                                  </button>
                                </div>
                              ) : (
                                renderStatus(existingStatus)
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
