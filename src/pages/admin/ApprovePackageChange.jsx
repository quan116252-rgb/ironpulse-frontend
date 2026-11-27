
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ClipboardCheck,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
  UserRound,
  Package,
  Banknote,
  FileText,
  X,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " đ";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusInfo = (status) => {
  switch (status) {
    case "APPROVED":
      return {
        label: "Đã phê duyệt",
        className: "approved",
        icon: CheckCircle2,
      };
    case "REJECTED":
      return {
        label: "Đã từ chối",
        className: "rejected",
        icon: XCircle,
      };
    default:
      return {
        label: "Chờ phê duyệt",
        className: "pending",
        icon: Clock3,
      };
  }
};

const getErrorMessage = (error) => {
  const data = error.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.error) return data.error;
  if (data?.message) return data.message;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : String(value);
        return `${key}: ${message}`;
      })
      .join("\n");
  }

  if (error.response?.status === 401) {
    return "Phiên đăng nhập đã hết hạn hoặc token không hợp lệ. Vui lòng đăng nhập lại.";
  }

  if (error.response?.status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }

  return error.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
};

export default function ApprovePackageChange() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewRequest, setReviewRequest] = useState(null);

  const [reviewStatus, setReviewStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });

    window.setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("package-change-requests/");
      const result = response.data;

      setRequests(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Lỗi tải yêu cầu đổi gói:", error);
      showNotification(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const statistics = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((item) => item.status === "PENDING").length,
      approved: requests.filter((item) => item.status === "APPROVED").length,
      rejected: requests.filter((item) => item.status === "REJECTED").length,
    }),
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return requests.filter((item) => {
      const matchesStatus =
        filterStatus === "ALL" || item.status === filterStatus;

      const matchesSearch =
        !keyword ||
        String(item.member_name || "").toLowerCase().includes(keyword) ||
        String(item.member_email || "").toLowerCase().includes(keyword) ||
        String(item.old_package_name || "").toLowerCase().includes(keyword) ||
        String(item.new_package_name || "").toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [requests, filterStatus, searchTerm]);

  const openReviewDialog = (request, status) => {
    if (request.status !== "PENDING") {
      showNotification("Yêu cầu này đã được xử lý.", "error");
      return;
    }

    setReviewRequest(request);
    setReviewStatus(status);
    setAdminNote("");
    setSelectedRequest(null);
  };

  const handleReview = async () => {
    if (!reviewRequest || !reviewStatus) return;

    try {
      setSubmitting(true);

      const response = await api.patch(
        `package-change-requests/${reviewRequest.id}/review/`,
        {
          status: reviewStatus,
          admin_note: adminNote.trim(),
        }
      );

      const updatedRequest = response.data?.data || response.data;

      setRequests((previous) =>
        previous.map((item) =>
          item.id === reviewRequest.id
            ? { ...item, ...updatedRequest }
            : item
        )
      );

      setReviewRequest(null);
      setReviewStatus("");
      setAdminNote("");

      showNotification(
        reviewStatus === "APPROVED"
          ? "Đã phê duyệt yêu cầu đổi gói tập thành công!"
          : "Đã từ chối yêu cầu đổi gói tập."
      );

      await fetchRequests(true);
    } catch (error) {
      console.error("Lỗi xử lý yêu cầu:", error);
      showNotification(getErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStatus = selectedRequest
    ? getStatusInfo(selectedRequest.status)
    : null;

  const difference = Number(selectedRequest?.amount_difference || 0);

  return (
    <div className="acr-page">
      <style>{`
        .acr-page {
          min-height: 100vh;
          padding: 30px;
          background: #090909;
          color: #FFFFFF;
          font-family: inherit;
          box-sizing: border-box;
        }

        .acr-page *,
        .acr-page *::before,
        .acr-page *::after {
          box-sizing: border-box;
        }

        .acr-page button,
        .acr-page input,
        .acr-page select,
        .acr-page textarea {
          font-family: inherit;
        }

        .acr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .acr-heading {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .acr-heading-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: rgba(243,24,36,.13);
          color: #F31824;
          border: 1px solid rgba(243,24,36,.25);
        }

        .acr-heading h1 {
          margin: 0;
          font-size: 25px;
          font-weight: 850;
          letter-spacing: .3px;
          color: #FFFFFF;
        }

        .acr-heading p {
          margin: 7px 0 0;
          font-size: 13px;
          color: #929292;
        }

        .acr-refresh {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 11px 17px;
          border: 1px solid #333333;
          border-radius: 9px;
          background: #151515;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: .2s ease;
        }

        .acr-refresh:hover {
          background: #F31824;
          border-color: #F31824;
          color: #FFFFFF;
          transform: translateY(-1px);
        }

        .acr-refresh:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .acr-spin {
          animation: acr-spin 1s linear infinite;
        }

        @keyframes acr-spin {
          to { transform: rotate(360deg); }
        }

        .acr-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 25px;
        }

        .acr-stat {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          padding: 20px;
          background: linear-gradient(145deg, #171717, #101010);
          border: 1px solid #292929;
          border-radius: 13px;
          transition: .25s ease;
        }

        .acr-stat:hover {
          border-color: rgba(243,24,36,.65);
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0,0,0,.25);
        }

        .acr-stat-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
        }

        .acr-stat-icon.total {
          color: #FFFFFF;
          background: #292929;
        }

        .acr-stat-icon.pending {
          color: #F5B942;
          background: rgba(245,185,66,.12);
        }

        .acr-stat-icon.approved {
          color: #35C77A;
          background: rgba(53,199,122,.12);
        }

        .acr-stat-icon.rejected {
          color: #F31824;
          background: rgba(243,24,36,.13);
        }

        .acr-stat-label {
          color: #999999;
          font-size: 11px;
          margin-bottom: 6px;
        }

        .acr-stat-value {
          font-size: 25px;
          font-weight: 850;
          color: #FFFFFF;
          line-height: 1;
        }

        .acr-panel {
          background: #111111;
          border: 1px solid #292929;
          border-radius: 13px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,.2);
        }

        .acr-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 20px;
          border-bottom: 1px solid #292929;
          flex-wrap: wrap;
        }

        .acr-toolbar h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          color: #FFFFFF;
        }

        .acr-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .acr-search {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 255px;
          padding: 0 12px;
          border: 1px solid #333333;
          border-radius: 8px;
          background: #090909;
          transition: .2s;
        }

        .acr-search:focus-within {
          border-color: #F31824;
          box-shadow: 0 0 0 2px rgba(243,24,36,.1);
        }

        .acr-search svg {
          color: #777777;
          flex-shrink: 0;
        }

        .acr-search input {
          width: 100%;
          height: 40px;
          border: none;
          outline: none;
          font-size: 12px;
          background: transparent;
          color: #FFFFFF;
        }

        .acr-search input::placeholder {
          color: #777777;
        }

        .acr-select {
          height: 42px;
          min-width: 165px;
          padding: 0 12px;
          border: 1px solid #333333;
          border-radius: 8px;
          background: #090909;
          color: #FFFFFF;
          outline: none;
          font-size: 12px;
          cursor: pointer;
        }

        .acr-select:focus {
          border-color: #F31824;
        }

        .acr-select option {
          background: #151515;
          color: #FFFFFF;
        }

        .acr-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .acr-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
        }

        .acr-table th {
          padding: 15px 16px;
          background: #191919;
          color: #A5A5A5;
          font-size: 10px;
          font-weight: 800;
          text-align: left;
          white-space: nowrap;
          letter-spacing: .7px;
        }

        .acr-table td {
          padding: 17px 16px;
          border-top: 1px solid #252525;
          vertical-align: middle;
          font-size: 12px;
          color: #D0D0D0;
        }

        .acr-table tbody tr {
          transition: background .2s ease;
        }

        .acr-table tbody tr:hover td {
          background: #1A1A1A;
        }

        .acr-member-name {
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 5px;
        }

        .acr-member-email {
          color: #858585;
          font-size: 11px;
        }

        .acr-package-name {
          font-weight: 750;
          color: #EEEEEE;
          margin-bottom: 5px;
        }

        .acr-package-price {
          color: #888888;
          font-size: 11px;
        }

        .acr-money {
          font-weight: 850;
          color: #FFFFFF;
          white-space: nowrap;
        }

        .acr-money.pay {
          color: #F5B942;
        }

        .acr-money.refund {
          color: #35C77A;
        }

        .acr-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .acr-status.pending {
          color: #F5B942;
          background: rgba(245,185,66,.12);
          border: 1px solid rgba(245,185,66,.2);
        }

        .acr-status.approved {
          color: #35C77A;
          background: rgba(53,199,122,.12);
          border: 1px solid rgba(53,199,122,.2);
        }

        .acr-status.rejected {
          color: #FF5962;
          background: rgba(243,24,36,.12);
          border: 1px solid rgba(243,24,36,.2);
        }

        .acr-actions {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .acr-action-btn {
          width: 33px;
          height: 33px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #383838;
          border-radius: 8px;
          background: #1A1A1A;
          color: #BBBBBB;
          cursor: pointer;
          transition: .2s;
        }

        .acr-action-btn:hover {
          border-color: #F31824;
          background: rgba(243,24,36,.12);
          color: #F31824;
        }

        .acr-action-btn.approve:hover {
          border-color: #35C77A;
          background: rgba(53,199,122,.12);
          color: #35C77A;
        }

        .acr-action-btn.reject:hover {
          border-color: #F31824;
          background: rgba(243,24,36,.12);
          color: #F31824;
        }

        .acr-empty {
          padding: 60px 20px;
          text-align: center;
          color: #888888;
        }

        .acr-empty svg {
          margin-bottom: 13px;
          color: #555555;
        }

        .acr-empty h3 {
          color: #EEEEEE;
          font-size: 15px;
          margin: 0 0 7px;
        }

        .acr-empty p {
          font-size: 12px;
          margin: 0;
          color: #888888;
        }

        .acr-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          padding: 60px;
          color: #AAAAAA;
          font-size: 13px;
        }

        .acr-loading svg {
          color: #F31824;
          animation: acr-spin 1s linear infinite;
        }

        .acr-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,.82);
          backdrop-filter: blur(5px);
        }

        .acr-modal {
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          background: #141414;
          border: 1px solid #333333;
          border-radius: 14px;
          box-shadow: 0 25px 80px rgba(0,0,0,.65);
          color: #FFFFFF;
        }

        .acr-modal::-webkit-scrollbar {
          width: 6px;
        }

        .acr-modal::-webkit-scrollbar-thumb {
          background: #444444;
          border-radius: 10px;
        }

        .acr-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 23px;
          border-bottom: 1px solid #2D2D2D;
        }

        .acr-modal-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 850;
          color: #FFFFFF;
        }

        .acr-close {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #383838;
          border-radius: 8px;
          background: #222222;
          color: #BBBBBB;
          cursor: pointer;
          transition: .2s;
        }

        .acr-close:hover {
          color: #FFFFFF;
          background: #F31824;
          border-color: #F31824;
        }

        .acr-close:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .acr-modal-body {
          padding: 22px;
        }

        .acr-section-title {
          display: flex;
          align-items: center;
          gap: 9px;
          margin: 0 0 14px;
          font-size: 13px;
          font-weight: 850;
          color: #FFFFFF;
        }

        .acr-section-title svg {
          color: #F31824;
        }

        .acr-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 23px;
        }

        .acr-info-item {
          padding: 14px;
          background: #1C1C1C;
          border: 1px solid #303030;
          border-radius: 9px;
          min-width: 0;
        }

        .acr-info-label {
          color: #929292;
          font-size: 10px;
          margin-bottom: 7px;
        }

        .acr-info-value {
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .acr-package-comparison {
          display: grid;
          grid-template-columns: 1fr 35px 1fr;
          align-items: center;
          gap: 9px;
          margin-bottom: 21px;
        }

        .acr-package-box {
          padding: 16px;
          background: #1C1C1C;
          border: 1px solid #353535;
          border-radius: 10px;
          min-width: 0;
        }

        .acr-package-box.new {
          background: rgba(243,24,36,.07);
          border-color: rgba(243,24,36,.45);
        }

        .acr-package-box small {
          color: #999999;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: .4px;
        }

        .acr-package-box strong {
          display: block;
          margin: 9px 0;
          font-size: 13px;
          color: #FFFFFF;
          overflow-wrap: anywhere;
        }

        .acr-package-box span {
          color: #F31824;
          font-weight: 850;
          font-size: 13px;
        }

        .acr-difference {
          padding: 15px;
          margin-bottom: 21px;
          border-radius: 10px;
          background: #1B1B1B;
          border: 1px solid #303030;
        }

        .acr-difference-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          font-size: 12px;
          color: #AFAFAF;
        }

        .acr-difference-row + .acr-difference-row {
          border-top: 1px solid #292929;
        }

        .acr-difference-row strong {
          color: #FFFFFF;
          text-align: right;
        }

        .acr-reason {
          padding: 14px;
          border-left: 3px solid #F31824;
          background: #1D1D1D;
          border-radius: 4px 9px 9px 4px;
          margin-bottom: 21px;
          color: #DDDDDD;
          font-size: 12px;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .acr-bank {
          padding: 15px;
          margin-bottom: 21px;
          border: 1px solid rgba(53,199,122,.3);
          background: rgba(53,199,122,.07);
          border-radius: 10px;
        }

        .acr-bank h3 {
          margin: 0 0 12px;
          font-size: 13px;
          color: #35C77A;
        }

        .acr-bank p {
          margin: 8px 0;
          font-size: 12px;
          color: #DDDDDD;
          overflow-wrap: anywhere;
        }

        .acr-bank p strong {
          color: #FFFFFF;
        }

        .acr-review-note {
          width: 100%;
          min-height: 95px;
          padding: 12px;
          resize: vertical;
          border: 1px solid #383838;
          border-radius: 9px;
          outline: none;
          background: #090909;
          color: #FFFFFF;
          font-size: 12px;
          line-height: 1.6;
        }

        .acr-review-note::placeholder {
          color: #777777;
        }

        .acr-review-note:focus {
          border-color: #F31824;
          box-shadow: 0 0 0 2px rgba(243,24,36,.1);
        }

        .acr-review-note:disabled {
          opacity: .6;
        }

        .acr-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 17px 22px;
          border-top: 1px solid #2D2D2D;
          flex-wrap: wrap;
        }

        .acr-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 16px;
          border: 1px solid transparent;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }

        .acr-btn:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .acr-btn.cancel {
          background: #292929;
          border-color: #3A3A3A;
          color: #DDDDDD;
        }

        .acr-btn.cancel:hover {
          background: #383838;
        }

        .acr-btn.approve {
          background: #238B55;
          color: #FFFFFF;
        }

        .acr-btn.approve:hover {
          background: #2BA768;
          transform: translateY(-1px);
        }

        .acr-btn.reject {
          background: #F31824;
          color: #FFFFFF;
        }

        .acr-btn.reject:hover {
          background: #D9101C;
          transform: translateY(-1px);
        }

        .acr-notification {
          position: fixed;
          right: 25px;
          bottom: 25px;
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: min(420px, calc(100vw - 40px));
          padding: 15px 18px;
          border: 1px solid rgba(53,199,122,.3);
          border-radius: 10px;
          background: #153B29;
          color: #FFFFFF;
          box-shadow: 0 8px 30px rgba(0,0,0,.45);
          font-size: 12px;
          font-weight: 650;
          white-space: pre-line;
        }

        .acr-notification.error {
          background: #481619;
          border-color: rgba(243,24,36,.4);
        }

        .acr-notification svg {
          flex-shrink: 0;
        }

        @media(max-width: 1050px) {
          .acr-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media(max-width: 650px) {
          .acr-page {
            padding: 17px;
          }

          .acr-heading {
            gap: 11px;
          }

          .acr-heading-icon {
            width: 45px;
            height: 45px;
          }

          .acr-heading h1 {
            font-size: 19px;
          }

          .acr-heading p {
            font-size: 11px;
          }

          .acr-stats {
            gap: 9px;
          }

          .acr-stat {
            padding: 13px 10px;
            gap: 9px;
          }

          .acr-stat-icon {
            width: 35px;
            height: 35px;
          }

          .acr-stat-value {
            font-size: 20px;
          }

          .acr-stat-label {
            font-size: 10px;
          }

          .acr-toolbar {
            align-items: stretch;
            padding: 15px;
          }

          .acr-filters {
            width: 100%;
          }

          .acr-search,
          .acr-select {
            width: 100%;
          }

          .acr-info-grid {
            grid-template-columns: 1fr;
          }

          .acr-package-comparison {
            grid-template-columns: 1fr;
          }

          .acr-package-comparison > div:nth-child(2) {
            transform: rotate(90deg);
          }

          .acr-modal-body {
            padding: 16px;
          }

          .acr-modal-header,
          .acr-modal-footer {
            padding: 15px 16px;
          }

          .acr-modal-footer .acr-btn {
            flex: 1;
          }

          .acr-notification {
            right: 12px;
            bottom: 12px;
            left: 12px;
            max-width: none;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="acr-header">
        <div className="acr-heading">
          <div className="acr-heading-icon">
            <ClipboardCheck size={27} />
          </div>

          <div>
            <h1>Duyệt đổi gói tập</h1>
            <p>Quản lý và xử lý yêu cầu chuyển đổi gói tập của hội viên</p>
          </div>
        </div>

        <button
          className="acr-refresh"
          onClick={() => fetchRequests(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={15}
            className={refreshing ? "acr-spin" : ""}
          />
          Làm mới dữ liệu
        </button>
      </div>

      {/* STATISTICS */}
      <div className="acr-stats">
        <div className="acr-stat">
          <div className="acr-stat-icon total">
            <FileText size={21} />
          </div>
          <div>
            <div className="acr-stat-label">Tổng yêu cầu</div>
            <div className="acr-stat-value">{statistics.total}</div>
          </div>
        </div>

        <div className="acr-stat">
          <div className="acr-stat-icon pending">
            <Clock3 size={21} />
          </div>
          <div>
            <div className="acr-stat-label">Chờ phê duyệt</div>
            <div className="acr-stat-value">{statistics.pending}</div>
          </div>
        </div>

        <div className="acr-stat">
          <div className="acr-stat-icon approved">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <div className="acr-stat-label">Đã phê duyệt</div>
            <div className="acr-stat-value">{statistics.approved}</div>
          </div>
        </div>

        <div className="acr-stat">
          <div className="acr-stat-icon rejected">
            <XCircle size={21} />
          </div>
          <div>
            <div className="acr-stat-label">Đã từ chối</div>
            <div className="acr-stat-value">{statistics.rejected}</div>
          </div>
        </div>
      </div>

      {/* REQUEST LIST */}
      <div className="acr-panel">
        <div className="acr-toolbar">
          <h2>Danh sách yêu cầu đổi gói</h2>

          <div className="acr-filters">
            <div className="acr-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Tìm tên, email, gói tập..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="acr-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ phê duyệt</option>
              <option value="APPROVED">Đã phê duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="acr-loading">
            <LoaderCircle size={20} />
            Đang tải danh sách yêu cầu...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="acr-empty">
            <ClipboardCheck size={42} />
            <h3>Không có yêu cầu nào</h3>
            <p>Chưa tìm thấy yêu cầu đổi gói tập phù hợp.</p>
          </div>
        ) : (
          <div className="acr-table-wrap">
            <table className="acr-table">
              <thead>
                <tr>
                  <th>HỘI VIÊN</th>
                  <th>GÓI HIỆN TẠI</th>
                  <th>GÓI MUỐN ĐỔI</th>
                  <th>CHÊNH LỆCH</th>
                  <th>NGÀY GỬI</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  const StatusIcon = statusInfo.icon;

                  const itemDifference = Number(
                    item.amount_difference || 0
                  );

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="acr-member-name">
                          {item.member_name || "Hội viên"}
                        </div>
                        <div className="acr-member-email">
                          {item.member_email || "—"}
                        </div>
                      </td>

                      <td>
                        <div className="acr-package-name">
                          {item.old_package_name || "—"}
                        </div>
                        <div className="acr-package-price">
                          {formatMoney(item.old_package_price)}
                        </div>
                      </td>

                      <td>
                        <div className="acr-package-name">
                          {item.new_package_name || "—"}
                        </div>
                        <div className="acr-package-price">
                          {formatMoney(item.new_package_price)}
                        </div>
                      </td>

                      <td>
                        <div
                          className={`acr-money ${
                            itemDifference > 0
                              ? "pay"
                              : itemDifference < 0
                              ? "refund"
                              : ""
                          }`}
                        >
                          {itemDifference > 0
                            ? `+${formatMoney(itemDifference)}`
                            : itemDifference < 0
                            ? `-${formatMoney(Math.abs(itemDifference))}`
                            : "0 đ"}
                        </div>

                        <div className="acr-package-price">
                          {itemDifference > 0
                            ? "Cần thanh toán"
                            : itemDifference < 0
                            ? "Cần hoàn tiền"
                            : "Không chênh lệch"}
                        </div>
                      </td>

                      <td>{formatDate(item.created_at)}</td>

                      <td>
                        <span className={`acr-status ${statusInfo.className}`}>
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td>
                        <div className="acr-actions">
                          <button
                            className="acr-action-btn"
                            title="Xem chi tiết"
                            onClick={() => setSelectedRequest(item)}
                          >
                            <Eye size={15} />
                          </button>

                          {item.status === "PENDING" && (
                            <>
                              <button
                                className="acr-action-btn approve"
                                title="Phê duyệt"
                                onClick={() =>
                                  openReviewDialog(item, "APPROVED")
                                }
                              >
                                <CheckCircle2 size={15} />
                              </button>

                              <button
                                className="acr-action-btn reject"
                                title="Từ chối"
                                onClick={() =>
                                  openReviewDialog(item, "REJECTED")
                                }
                              >
                                <XCircle size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedRequest && (
        <div
          className="acr-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <div className="acr-modal">
            <div className="acr-modal-header">
              <h2>Chi tiết yêu cầu đổi gói</h2>

              <button
                className="acr-close"
                onClick={() => setSelectedRequest(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="acr-modal-body">
              <h3 className="acr-section-title">
                <UserRound size={16} />
                Thông tin hội viên
              </h3>

              <div className="acr-info-grid">
                <div className="acr-info-item">
                  <div className="acr-info-label">Họ và tên</div>
                  <div className="acr-info-value">
                    {selectedRequest.member_name || "—"}
                  </div>
                </div>

                <div className="acr-info-item">
                  <div className="acr-info-label">Email</div>
                  <div className="acr-info-value">
                    {selectedRequest.member_email || "—"}
                  </div>
                </div>

                <div className="acr-info-item">
                  <div className="acr-info-label">Số điện thoại</div>
                  <div className="acr-info-value">
                    {selectedRequest.member_phone || "—"}
                  </div>
                </div>

                <div className="acr-info-item">
                  <div className="acr-info-label">Ngày gửi yêu cầu</div>
                  <div className="acr-info-value">
                    {formatDate(selectedRequest.created_at)}
                  </div>
                </div>
              </div>

              <h3 className="acr-section-title">
                <Package size={16} />
                Thông tin chuyển đổi
              </h3>

              <div className="acr-package-comparison">
                <div className="acr-package-box">
                  <small>GÓI HIỆN TẠI</small>
                  <strong>
                    {selectedRequest.old_package_name || "—"}
                  </strong>
                  <span>
                    {formatMoney(selectedRequest.old_package_price)}
                  </span>
                </div>

                <div style={{ textAlign: "center", color: "#F31824" }}>
                  <ClipboardCheck size={21} />
                </div>

                <div className="acr-package-box new">
                  <small>GÓI MUỐN ĐỔI</small>
                  <strong>
                    {selectedRequest.new_package_name || "—"}
                  </strong>
                  <span>
                    {formatMoney(selectedRequest.new_package_price)}
                  </span>
                </div>
              </div>

              <div className="acr-difference">
                <div className="acr-difference-row">
                  <span>Tổng số ngày gói cũ</span>
                  <strong>{selectedRequest.total_days ?? "—"} ngày</strong>
                </div>

                <div className="acr-difference-row">
                  <span>Số ngày đã sử dụng</span>
                  <strong>{selectedRequest.used_days ?? "—"} ngày</strong>
                </div>

                <div className="acr-difference-row">
                  <span>Số ngày còn lại</span>
                  <strong>{selectedRequest.remaining_days ?? "—"} ngày</strong>
                </div>

                <div className="acr-difference-row">
                  <span>Giá trị gói cũ còn lại</span>
                  <strong>
                    {formatMoney(selectedRequest.remaining_value)}
                  </strong>
                </div>

                <div className="acr-difference-row">
                  <span>Chênh lệch</span>
                  <strong
                    style={{
                      color:
                        difference > 0
                          ? "#F5B942"
                          : difference < 0
                          ? "#35C77A"
                          : "#FFFFFF",
                    }}
                  >
                    {difference > 0
                      ? `Cần thanh toán ${formatMoney(difference)}`
                      : difference < 0
                      ? `Cần hoàn ${formatMoney(Math.abs(difference))}`
                      : "Không chênh lệch"}
                  </strong>
                </div>
              </div>

              <h3 className="acr-section-title">
                <FileText size={16} />
                Lý do đổi gói
              </h3>

              <div className="acr-reason">
                {selectedRequest.reason || "Không có lý do"}
              </div>

              {difference < 0 && (
                <div className="acr-bank">
                  <h3>
                    <Banknote
                      size={16}
                      style={{ verticalAlign: "middle", marginRight: 6 }}
                    />
                    Thông tin tài khoản nhận hoàn tiền
                  </h3>

                  <p>
                    <strong>Ngân hàng:</strong>{" "}
                    {selectedRequest.bank_name || "—"}
                  </p>

                  <p>
                    <strong>Chủ tài khoản:</strong>{" "}
                    {selectedRequest.bank_account_name || "—"}
                  </p>

                  <p>
                    <strong>Số tài khoản:</strong>{" "}
                    {selectedRequest.bank_account_number || "—"}
                  </p>
                </div>
              )}

              <div className="acr-info-item">
                <div className="acr-info-label">Trạng thái hiện tại</div>
                <span className={`acr-status ${selectedStatus.className}`}>
                  {selectedStatus.label}
                </span>
              </div>

              {selectedRequest.admin_note && (
                <div style={{ marginTop: 15 }}>
                  <div className="acr-info-label">Ghi chú Admin</div>
                  <div className="acr-reason">
                    {selectedRequest.admin_note}
                  </div>
                </div>
              )}
            </div>

            <div className="acr-modal-footer">
              <button
                className="acr-btn cancel"
                onClick={() => setSelectedRequest(null)}
              >
                Đóng
              </button>

              {selectedRequest.status === "PENDING" && (
                <>
                  <button
                    className="acr-btn reject"
                    onClick={() =>
                      openReviewDialog(selectedRequest, "REJECTED")
                    }
                  >
                    <XCircle size={15} />
                    Từ chối
                  </button>

                  <button
                    className="acr-btn approve"
                    onClick={() =>
                      openReviewDialog(selectedRequest, "APPROVED")
                    }
                  >
                    <CheckCircle2 size={15} />
                    Phê duyệt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REVIEW CONFIRMATION MODAL */}
      {reviewRequest && (
        <div className="acr-overlay">
          <div className="acr-modal" style={{ maxWidth: 480 }}>
            <div className="acr-modal-header">
              <h2>
                {reviewStatus === "APPROVED"
                  ? "Phê duyệt đổi gói tập"
                  : "Từ chối yêu cầu đổi gói"}
              </h2>

              <button
                className="acr-close"
                onClick={() => setReviewRequest(null)}
                disabled={submitting}
              >
                <X size={18} />
              </button>
            </div>

            <div className="acr-modal-body">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: 14,
                  borderRadius: 9,
                  background:
                    reviewStatus === "APPROVED"
                      ? "rgba(53,199,122,.09)"
                      : "rgba(243,24,36,.09)",
                  border:
                    reviewStatus === "APPROVED"
                      ? "1px solid rgba(53,199,122,.2)"
                      : "1px solid rgba(243,24,36,.2)",
                  marginBottom: 18,
                }}
              >
                {reviewStatus === "APPROVED" ? (
                  <CheckCircle2 color="#35C77A" size={22} />
                ) : (
                  <AlertCircle color="#F31824" size={22} />
                )}

                <div style={{ fontSize: 12, lineHeight: 1.7, color: "#FFFFFF" }}>
                  <strong>
                    {reviewStatus === "APPROVED"
                      ? "Bạn chắc chắn muốn phê duyệt yêu cầu này?"
                      : "Bạn chắc chắn muốn từ chối yêu cầu này?"}
                  </strong>

                  <div style={{ color: "#AAAAAA", marginTop: 5 }}>
                    Hội viên: {reviewRequest.member_name || "—"}
                    <br />
                    Gói mới: {reviewRequest.new_package_name || "—"}
                  </div>
                </div>
              </div>

              <label
                style={{
                  display: "block",
                  marginBottom: 9,
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#EEEEEE",
                }}
              >
                Ghi chú của Admin (không bắt buộc)
              </label>

              <textarea
                className="acr-review-note"
                placeholder="Nhập ghi chú hoặc lý do từ chối..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="acr-modal-footer">
              <button
                className="acr-btn cancel"
                onClick={() => setReviewRequest(null)}
                disabled={submitting}
              >
                Hủy
              </button>

              <button
                className={`acr-btn ${
                  reviewStatus === "APPROVED" ? "approve" : "reject"
                }`}
                onClick={handleReview}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={15} className="acr-spin" />
                    Đang xử lý...
                  </>
                ) : reviewStatus === "APPROVED" ? (
                  <>
                    <CheckCircle2 size={15} />
                    Xác nhận phê duyệt
                  </>
                ) : (
                  <>
                    <XCircle size={15} />
                    Xác nhận từ chối
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION */}
      {notification && (
        <div
          className={`acr-notification ${
            notification.type === "error" ? "error" : ""
          }`}
        >
          {notification.type === "error" ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}

          {notification.message}
        </div>
      )}
    </div>
  );
}
