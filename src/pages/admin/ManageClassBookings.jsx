
import { useEffect, useState } from "react";

import {
  getClassRegistrations,
  updateRegistrationStatus,
} from "../../services/memberService";

import {
  Check,
  X,
  RotateCcw,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  CalendarDays,
  Phone,
  UserRound,
  Crown,
  CreditCard,
  AlertCircle,
} from "lucide-react";

export default function ManageClassBookings() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Đăng ký đang chờ Admin xác nhận duyệt
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ==================== TẢI DANH SÁCH ====================

  const load = async () => {
    try {
      setLoading(true);

      const data = await getClassRegistrations();

      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải đăng ký lớp học:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ==================== ĐỊNH DẠNG TIỀN ====================

  const formatCurrency = (amount) => {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
      return "Chưa xác định";
    }

    if (value === 0) {
      return "Miễn phí";
    }

    return `${value.toLocaleString("vi-VN")} VNĐ`;
  };

  // ==================== MỞ HỘP THOẠI DUYỆT ====================

  const handleApproveClick = (item) => {
    setSelectedBooking(item);
  };

  // ==================== XÁC NHẬN DUYỆT ====================

  const confirmApprove = async () => {
    if (!selectedBooking) return;

    const id = selectedBooking.id;

    try {
      setProcessingId(id);

      await updateRegistrationStatus(id, "APPROVED");

      setSelectedBooking(null);

      await load();
    } catch (error) {
      console.error("Lỗi duyệt đăng ký:", error);

      alert(
        error.message ||
          "Không thể duyệt đăng ký lớp học!"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==================== TỪ CHỐI / HOÀN TÁC ====================

  const handleAction = async (id, status) => {
    try {
      setProcessingId(id);

      await updateRegistrationStatus(id, status);

      await load();
    } catch (error) {
      console.error("Lỗi cập nhật đăng ký:", error);

      alert(
        error.message ||
          "Không thể cập nhật trạng thái đăng ký!"
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==================== THỐNG KÊ ====================

  const pendingCount = list.filter(
    (item) => item.status === "PENDING"
  ).length;

  const approvedCount = list.filter(
    (item) => item.status === "APPROVED"
  ).length;

  const rejectedCount = list.filter(
    (item) => item.status === "REJECTED"
  ).length;

  // ==================== TRẠNG THÁI ====================

  const getStatus = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          label: "Đã duyệt",
          className: "booking-status-approved",
          icon: <CheckCircle size={14} />,
        };

      case "REJECTED":
        return {
          label: "Đã từ chối",
          className: "booking-status-rejected",
          icon: <XCircle size={14} />,
        };

      default:
        return {
          label: "Chờ duyệt",
          className: "booking-status-pending",
          icon: <Clock size={14} />,
        };
    }
  };

  // ==================== THÔNG TIN PHÍ ====================

  const selectedFee = selectedBooking
    ? Number(selectedBooking.feeAmount)
    : NaN;

  const hasValidFee =
    selectedBooking &&
    selectedBooking.feeAmount !== undefined &&
    selectedBooking.feeAmount !== null &&
    Number.isFinite(selectedFee);

  const isVip = selectedBooking?.packageName
    ?.toUpperCase()
    .includes("VIP");

  return (
    <div className="manage-class-bookings">
      {/* ==================== HEADER ==================== */}

      <div className="bookings-header">
        <div>
          <h1 className="bookings-title">
            Quản lý đăng ký lớp học
          </h1>

          <p className="bookings-subtitle">
            Theo dõi và xử lý yêu cầu đăng ký lớp học của hội viên
          </p>
        </div>
      </div>

      {/* ==================== THỐNG KÊ ==================== */}

      <div className="bookings-stats">
        <div className="bookings-stat-card">
          <div className="bookings-stat-icon">
            <ClipboardList size={21} />
          </div>

          <div>
            <span>Tổng đăng ký</span>
            <strong>{list.length}</strong>
          </div>
        </div>

        <div className="bookings-stat-card">
          <div className="bookings-stat-icon pending">
            <Clock size={21} />
          </div>

          <div>
            <span>Chờ duyệt</span>
            <strong>{pendingCount}</strong>
          </div>
        </div>

        <div className="bookings-stat-card">
          <div className="bookings-stat-icon approved">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>Đã duyệt</span>
            <strong>{approvedCount}</strong>
          </div>
        </div>

        <div className="bookings-stat-card">
          <div className="bookings-stat-icon rejected">
            <XCircle size={21} />
          </div>

          <div>
            <span>Đã từ chối</span>
            <strong>{rejectedCount}</strong>
          </div>
        </div>
      </div>

      {/* ==================== BẢNG ĐĂNG KÝ ==================== */}

      <div className="bookings-panel">
        <div className="bookings-panel-header">
          <div>
            <h2>Danh sách đăng ký</h2>
            <p>Các yêu cầu đăng ký lớp học từ hội viên</p>
          </div>

          <span className="bookings-count">
            {list.length} yêu cầu
          </span>
        </div>

        <div className="bookings-table-wrap">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>HỘI VIÊN</th>
                <th>SỐ ĐIỆN THOẠI</th>
                <th>LỚP HỌC</th>
                <th>LỊCH HỌC</th>
                <th>TRẠNG THÁI</th>
                <th className="bookings-action-heading">
                  HÀNH ĐỘNG
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="bookings-message">
                    Đang tải danh sách đăng ký...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="6" className="bookings-message">
                    <div className="bookings-empty">
                      <ClipboardList size={35} />

                      <strong>
                        Chưa có đăng ký lớp học
                      </strong>

                      <span>
                        Các yêu cầu đăng ký từ hội viên sẽ hiển thị tại đây
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((item) => {
                  const status = getStatus(item.status);

                  const isProcessing =
                    processingId === item.id;

                  return (
                    <tr key={item.id}>
                      {/* HỘI VIÊN */}

                      <td>
                        <div className="bookings-member">
                          <div className="bookings-avatar">
                            <UserRound size={18} />
                          </div>

                          <strong>
                            {item.memberName || "Chưa cập nhật"}
                          </strong>
                        </div>
                      </td>

                      {/* SỐ ĐIỆN THOẠI */}

                      <td>
                        <div className="bookings-phone">
                          <Phone size={14} />

                          {item.phone || "Chưa cập nhật"}
                        </div>
                      </td>

                      {/* LỚP HỌC */}

                      <td>
                        <span className="bookings-class-name">
                          {item.className || "Chưa cập nhật"}
                        </span>
                      </td>

                      {/* LỊCH HỌC */}

                      <td>
                        <div className="bookings-schedule">
                          <CalendarDays size={14} />

                          {item.schedule || "Chưa cập nhật"}
                        </div>
                      </td>

                      {/* TRẠNG THÁI */}

                      <td>
                        <span
                          className={`bookings-status ${status.className}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </td>

                      {/* HÀNH ĐỘNG */}

                      <td>
                        <div className="bookings-actions">
                          {item.status === "PENDING" ? (
                            <>
                              <button
                                className="bookings-approve-btn"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleApproveClick(item)
                                }
                                title="Xem phí và duyệt đăng ký"
                              >
                                <Check size={14} />
                                Duyệt
                              </button>

                              <button
                                className="bookings-reject-btn"
                                disabled={isProcessing}
                                onClick={() =>
                                  handleAction(
                                    item.id,
                                    "REJECTED"
                                  )
                                }
                                title="Từ chối đăng ký"
                              >
                                <X size={14} />
                                Từ chối
                              </button>
                            </>
                          ) : (
                            <button
                              className="bookings-undo-btn"
                              disabled={isProcessing}
                              onClick={() =>
                                handleAction(
                                  item.id,
                                  "PENDING"
                                )
                              }
                              title="Đưa về trạng thái chờ duyệt"
                            >
                              <RotateCcw size={14} />
                              Hoàn tác
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== MODAL XÁC NHẬN DUYỆT ==================== */}

      {selectedBooking && (
        <div
          className="booking-confirm-overlay"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !processingId
            ) {
              setSelectedBooking(null);
            }
          }}
        >
          <div
            className="booking-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-confirm-title"
          >
            {/* HEADER MODAL */}

            <div className="booking-confirm-header">
              <div className="booking-confirm-icon">
                <ClipboardList size={25} />
              </div>

              <button
                type="button"
                className="booking-confirm-close"
                onClick={() => setSelectedBooking(null)}
                disabled={Boolean(processingId)}
                aria-label="Đóng"
              >
                <X size={20} />
              </button>
            </div>

            <h2 id="booking-confirm-title">
              Xác nhận duyệt đăng ký
            </h2>

            <p className="booking-confirm-description">
              Vui lòng kiểm tra thông tin và khoản phí trước khi
              xác nhận duyệt yêu cầu đăng ký lớp học.
            </p>

            {/* THÔNG TIN HỘI VIÊN */}

            <div className="booking-confirm-info">
              <div className="booking-confirm-info-row">
                <span>Hội viên</span>

                <strong>
                  {selectedBooking.memberName || "Chưa cập nhật"}
                </strong>
              </div>

              <div className="booking-confirm-info-row">
                <span>Số điện thoại</span>

                <strong>
                  {selectedBooking.phone || "Chưa cập nhật"}
                </strong>
              </div>

              <div className="booking-confirm-info-row">
                <span>Lớp học</span>

                <strong>
                  {selectedBooking.className || "Chưa cập nhật"}
                </strong>
              </div>

              <div className="booking-confirm-info-row">
                <span>Lịch học</span>

                <strong>
                  {selectedBooking.schedule || "Chưa cập nhật"}
                </strong>
              </div>
            </div>

            {/* THÔNG TIN GÓI TẬP */}

            <div className="booking-package-box">
              <div className="booking-package-heading">
                {isVip ? (
                  <Crown size={19} />
                ) : (
                  <CreditCard size={19} />
                )}

                <strong>Thông tin gói tập</strong>
              </div>

              <div className="booking-confirm-info-row">
                <span>Gói tập hiện tại</span>

                <strong>
                  {selectedBooking.packageName || "Chưa xác định"}
                </strong>
              </div>

              <div className="booking-fee-row">
                <div>
                  <span>Phí đăng ký lớp học</span>

                  <small>
                    {isVip
                      ? "Quyền lợi dành cho hội viên VIP"
                      : "Phụ thu dành cho hội viên gói thường"}
                  </small>
                </div>

                <strong
                  className={
                    hasValidFee && selectedFee === 0
                      ? "booking-fee-free"
                      : "booking-fee-paid"
                  }
                >
                  {hasValidFee
                    ? formatCurrency(selectedFee)
                    : "Chưa xác định"}
                </strong>
              </div>
            </div>

            {/* CẢNH BÁO */}

            <div className="booking-confirm-notice">
              <AlertCircle size={18} />

              <p>
                {hasValidFee && selectedFee === 0
                  ? "Hội viên được miễn phí đăng ký lớp học theo gói tập hiện tại."
                  : hasValidFee
                    ? "Hội viên cần thanh toán khoản phụ thu theo gói tập hiện tại. Việc duyệt ở đây chưa xác nhận đã thu tiền."
                    : "Chưa nhận được thông tin phí từ máy chủ. Vui lòng kiểm tra lại dữ liệu trước khi duyệt."}
              </p>
            </div>

            {/* BUTTON */}

            <div className="booking-confirm-actions">
              <button
                type="button"
                className="booking-confirm-cancel"
                disabled={Boolean(processingId)}
                onClick={() => setSelectedBooking(null)}
              >
                Hủy
              </button>

              <button
                type="button"
                className="booking-confirm-submit"
                disabled={
                  Boolean(processingId) ||
                  !hasValidFee
                }
                onClick={confirmApprove}
              >
                {processingId === selectedBooking.id ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <Check size={17} />
                    Xác nhận duyệt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
