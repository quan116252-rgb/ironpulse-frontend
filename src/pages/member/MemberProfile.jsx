
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMembers,
  updateMemberProfile,
} from "../../services/memberService";

import {
  User,
  Phone,
  Mail,
  Calendar,
  Award,
  Clock,
  Edit,
  X,
  Lock,
  ShieldCheck,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Camera,
  ImagePlus,
  Trash2,
  Upload,
} from "lucide-react";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=85";

export default function MemberProfile() {
  const { user } = useAuth();

  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });

  const [saving, setSaving] = useState(false);

  // Ảnh hồ sơ
  const [avatar, setAvatar] = useState("");
  const [cover, setCover] = useState("");

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const accountKey = (
    user?.email || user?.username || "ironpulse_member"
  ).toLowerCase();

  const avatarStorageKey = `ironpulse_avatar_${accountKey}`;
  const coverStorageKey = `ironpulse_cover_${accountKey}`;

  // Tải ảnh đã lưu theo tài khoản
  useEffect(() => {
    try {
      setAvatar(localStorage.getItem(avatarStorageKey) || "");
      setCover(localStorage.getItem(coverStorageKey) || "");
    } catch (error) {
      console.error("Không thể tải ảnh hồ sơ:", error);
    }
  }, [avatarStorageKey, coverStorageKey]);

  // Nén ảnh trước khi lưu để hạn chế đầy localStorage
  const compressImage = (file, maxSize = 1400) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const image = new Image();

        image.onload = () => {
          const scale = Math.min(
            1,
            maxSize / Math.max(image.width, image.height)
          );

          const canvas = document.createElement("canvas");
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);

          const context = canvas.getContext("2d");
          context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );

          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };

        image.onerror = reject;
        image.src = event.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event, type) => {
    const file = event.target.files?.[0];

    // Cho phép chọn lại cùng một ảnh
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tệp hình ảnh!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.");
      return;
    }

    try {
      const imageData = await compressImage(
        file,
        type === "cover" ? 1800 : 800
      );

      const storageKey =
        type === "avatar" ? avatarStorageKey : coverStorageKey;

      // Lưu trước, chỉ cập nhật giao diện khi lưu thành công
      localStorage.setItem(storageKey, imageData);

      if (type === "avatar") {
        setAvatar(imageData);
      } else {
        setCover(imageData);
      }

      alert(
        type === "avatar"
          ? "Đã cập nhật ảnh đại diện!"
          : "Đã cập nhật ảnh bìa!"
      );
    } catch (error) {
      console.error("Lỗi xử lý ảnh:", error);
      alert(
        "Không thể lưu ảnh. Bộ nhớ trình duyệt có thể đã đầy."
      );
    }
  };

  const removeImage = (type) => {
    const isAvatar = type === "avatar";

    if (
      !window.confirm(
        `Bạn có chắc muốn xóa ${
          isAvatar ? "ảnh đại diện" : "ảnh bìa"
        }?`
      )
    ) {
      return;
    }

    try {
      localStorage.removeItem(
        isAvatar ? avatarStorageKey : coverStorageKey
      );

      if (isAvatar) {
        setAvatar("");
      } else {
        setCover("");
      }
    } catch (error) {
      console.error("Lỗi xóa ảnh:", error);
      alert("Không thể xóa ảnh.");
    }
  };

  const fetchMemberData = async () => {
    try {
      setLoading(true);

      const members = await getMembers();

      const current = (members || []).find(
        (m) =>
          (user?.email &&
            m.email?.toLowerCase() === user.email.toLowerCase()) ||
          (user?.phone && m.phone === user.phone) ||
          (user?.username &&
            m.email?.toLowerCase() === user.username.toLowerCase())
      );

      const selectedMember =
        current || (members && members.length > 0 ? members[0] : null);

      if (selectedMember) {
        setMemberInfo(selectedMember);

        setEditForm({
          fullName: selectedMember.fullName || "",
          phone: selectedMember.phone || "",
          email: selectedMember.email || "",
          password: "",
        });
      } else {
        setMemberInfo(null);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin hội viên:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemberData();
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!editForm.password) {
      alert("⚠️ Vui lòng nhập mật khẩu tài khoản để xác nhận thay đổi!");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        realId: memberInfo?.realId,
        oldEmail: memberInfo?.email || user?.email,
        oldPhone: memberInfo?.phone || user?.phone,
        fullName: editForm.fullName,
        phone: editForm.phone,
        email: editForm.email,
        password: editForm.password,
      };

      const res = await updateMemberProfile(payload);

      alert("🎉 " + (res.message || "Cập nhật thành công!"));

      setIsEditing(false);
      setEditForm((prev) => ({ ...prev, password: "" }));

      await fetchMemberData();
    } catch (error) {
      alert("❌ " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateDaysRemaining = (endDateStr) => {
    if (!endDateStr) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(endDateStr);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(
      diffTime / (1000 * 60 * 60 * 24)
    );

    return diffDays > 0 ? diffDays : 0;
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setEditForm((prev) => ({
      ...prev,
      password: "",
    }));
  };

  if (loading) {
    return (
      <div className="mp-loading">
        <div className="mp-spinner"></div>
        <p>Đang tải thông tin tài khoản...</p>
        <style>{`
          .mp-loading {
            min-height: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background: #101010;
            color: #aaa;
          }
          .mp-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid #333;
            border-top-color: #e31824;
            border-radius: 50%;
            animation: mp-spin .8s linear infinite;
          }
          @keyframes mp-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const daysRemaining = calculateDaysRemaining(memberInfo?.endDate);
  const isActive = daysRemaining > 0;

  const displayName =
    memberInfo?.fullName || user?.fullName || "Hội viên IronPulse";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="mp-page">
      <style>{`
        .mp-page {
          min-height: 100vh;
          padding: 30px;
          background: #101010;
          color: #f5f5f5;
          box-sizing: border-box;
        }

        .mp-page * { box-sizing: border-box; }

        .mp-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        /* COVER */
        .mp-cover {
          position: relative;
          height: 280px;
          margin-bottom: 85px;
          border-radius: 17px;
          background-color: #211719;
          background-size: cover;
          background-position: center;
          border: 1px solid #383030;
          overflow: visible;
          isolation: isolate;
        }

        .mp-cover::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 17px;
          background: linear-gradient(
            90deg,
            rgba(0,0,0,.88) 0%,
            rgba(0,0,0,.55) 52%,
            rgba(0,0,0,.18) 100%
          );
          z-index: -1;
        }

        .mp-cover-content {
          position: absolute;
          left: 225px;
          right: 25px;
          bottom: 28px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .mp-cover-title {
          min-width: 0;
        }

        .mp-eyebrow {
          color: #ff414d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          margin: 0 0 7px;
        }

        .mp-title {
          color: #fff;
          font-size: 29px;
          font-weight: 850;
          margin: 0;
        }

        .mp-subtitle {
          color: #c5c5c5;
          font-size: 13px;
          margin: 7px 0 0;
        }

        .mp-cover-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 9px;
        }

        .mp-cover-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 13px;
          border: 1px solid rgba(255,255,255,.3);
          border-radius: 8px;
          background: rgba(0,0,0,.65);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s;
          backdrop-filter: blur(5px);
        }

        .mp-cover-button:hover {
          background: #e31824;
          border-color: #e31824;
        }

        .mp-avatar-wrap {
          position: absolute;
          left: 28px;
          bottom: -55px;
          width: 155px;
          height: 155px;
          z-index: 2;
        }

        .mp-avatar {
          width: 155px;
          height: 155px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 50%;
          background: linear-gradient(145deg,#e31824,#761018);
          border: 5px solid #171717;
          outline: 2px solid #e31824;
          color: white;
          font-size: 55px;
          font-weight: 850;
          box-shadow: 0 8px 30px rgba(0,0,0,.5);
        }

        .mp-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .mp-avatar-edit {
          position: absolute;
          right: 0;
          bottom: 7px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #171717;
          border-radius: 50%;
          background: #e31824;
          color: white;
          cursor: pointer;
          transition: .2s;
        }

        .mp-avatar-edit:hover {
          background: #ff3945;
          transform: scale(1.08);
        }

        .mp-avatar-remove {
          position: absolute;
          top: 5px;
          right: 2px;
          width: 29px;
          height: 29px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #555;
          border-radius: 50%;
          background: #252525;
          color: #fff;
          cursor: pointer;
        }

        .mp-avatar-remove:hover { background: #e31824; }

        .mp-edit-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 18px;
          background: #e31824;
          color: #fff;
          border: 1px solid #e31824;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s;
          white-space: nowrap;
        }

        .mp-edit-button:hover {
          background: #bd101b;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(227,24,36,.2);
        }

        .mp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }

        .mp-card {
          background: #191919;
          border: 1px solid #2b2b2b;
          border-radius: 15px;
          padding: 25px;
          min-width: 0;
          box-shadow: 0 8px 25px rgba(0,0,0,.15);
        }

        .mp-card-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 23px;
        }

        .mp-card-title {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #f5f5f5;
          font-size: 16px;
          font-weight: 750;
          margin: 0;
        }

        .mp-red-icon { color: #ef343f; }

        .mp-profile-top {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 22px;
          border-bottom: 1px solid #303030;
          margin-bottom: 22px;
        }

        .mp-member-name {
          color: #fff;
          font-size: 18px;
          font-weight: 750;
          margin: 0 0 9px;
          word-break: break-word;
        }

        .mp-member-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(227,24,36,.12);
          color: #ff5962;
          border: 1px solid rgba(227,24,36,.25);
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
        }

        .mp-info-list {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }

        .mp-info-item {
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .mp-info-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #252020;
          color: #f0444e;
        }

        .mp-info-content { min-width: 0; }

        .mp-info-label {
          display: block;
          color: #858585;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .mp-info-value {
          display: block;
          color: #eee;
          font-size: 13px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .mp-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .mp-status.active {
          color: #4ade80;
          background: rgba(34,197,94,.1);
          border: 1px solid rgba(34,197,94,.2);
        }

        .mp-status.expired {
          color: #fb7185;
          background: rgba(244,63,94,.1);
          border: 1px solid rgba(244,63,94,.2);
        }

        .mp-package-box {
          padding: 22px;
          border-radius: 12px;
          border: 1px solid rgba(227,24,36,.25);
          background:
            radial-gradient(circle at top right,rgba(227,24,36,.13),transparent 55%),
            #211719;
          margin-bottom: 20px;
        }

        .mp-package-label {
          display: block;
          color: #b5a0a1;
          font-size: 11px;
          font-weight: 650;
          margin-bottom: 9px;
        }

        .mp-package-name {
          color: #ff414d;
          font-size: 23px;
          font-weight: 850;
          margin: 0 0 20px;
          overflow-wrap: anywhere;
        }

        .mp-package-date {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-top: 13px;
          border-top: 1px solid rgba(255,255,255,.08);
          color: #aaa;
          font-size: 12px;
        }

        .mp-package-date strong { color: #eee; }

        .mp-days-box {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px;
          background: #222;
          border: 1px solid #333;
          border-radius: 11px;
        }

        .mp-days-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(227,24,36,.12);
          color: #ff414d;
          flex-shrink: 0;
        }

        .mp-days-label {
          color: #999;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .mp-days-value {
          font-size: 20px;
          font-weight: 850;
          color: #ff414d;
        }

        .mp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 35px 15px;
          color: #999;
        }

        .mp-empty-icon { color: #555; margin-bottom: 12px; }
        .mp-empty strong { color: #ddd; font-size: 14px; margin-bottom: 6px; }
        .mp-empty span { font-size: 12px; }

        .mp-security {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 18px;
          margin-top: 22px;
          background: #191919;
          border: 1px solid #2b2b2b;
          border-radius: 12px;
        }

        .mp-security-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 9px;
          background: rgba(34,197,94,.1);
          color: #4ade80;
        }

        .mp-security strong {
          display: block;
          color: #ddd;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .mp-security span { color: #858585; font-size: 11px; }

        /* MODAL */
        .mp-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(0,0,0,.78);
          backdrop-filter: blur(6px);
        }

        .mp-modal {
          width: 100%;
          max-width: 470px;
          max-height: 92vh;
          overflow-y: auto;
          background: #191919;
          border: 1px solid #373737;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 25px 80px rgba(0,0,0,.55);
          animation: mp-modal-in .25s ease;
        }

        @keyframes mp-modal-in {
          from { opacity: 0; transform: translateY(15px) scale(.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .mp-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 17px;
          border-bottom: 1px solid #333;
          margin-bottom: 22px;
        }

        .mp-modal-title {
          color: #fff;
          font-size: 18px;
          font-weight: 800;
          margin: 0;
        }

        .mp-close {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #292929;
          color: #aaa;
          border: 1px solid #3a3a3a;
          border-radius: 8px;
          cursor: pointer;
        }

        .mp-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mp-field label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #ccc;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .mp-field input {
          width: 100%;
          height: 44px;
          padding: 0 13px;
          background: #101010;
          color: #f5f5f5;
          border: 1px solid #383838;
          border-radius: 8px;
          outline: none;
          font-size: 13px;
        }

        .mp-field input:focus {
          border-color: #e31824;
          box-shadow: 0 0 0 3px rgba(227,24,36,.1);
        }

        .mp-field input::placeholder { color: #666; }

        .mp-password-box {
          padding: 15px;
          background: rgba(227,24,36,.07);
          border: 1px solid rgba(227,24,36,.25);
          border-radius: 10px;
        }

        .mp-password-box .mp-field label { color: #ff6972; }

        .mp-password-note {
          display: block;
          color: #b87b7f;
          font-size: 10px;
          line-height: 1.5;
          margin-top: 8px;
        }

        .mp-modal-actions {
          display: flex;
          gap: 11px;
          margin-top: 7px;
        }

        .mp-cancel-button,
        .mp-save-button {
          flex: 1;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
        }

        .mp-cancel-button {
          color: #ccc;
          background: #292929;
          border: 1px solid #404040;
        }

        .mp-save-button {
          color: #fff;
          background: #e31824;
          border: 1px solid #e31824;
        }

        .mp-save-button:disabled,
        .mp-cancel-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .mp-security-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          color: #888;
          font-size: 11px;
          line-height: 1.5;
          margin-top: 18px;
        }

        @media(max-width: 750px) {
          .mp-page { padding: 20px 15px; }
          .mp-grid { grid-template-columns: 1fr; }
          .mp-cover { height: 310px; margin-bottom: 90px; }
          .mp-cover-content {
            left: 20px;
            right: 20px;
            bottom: 20px;
            align-items: flex-start;
            flex-direction: column;
          }
          .mp-cover-actions { justify-content: flex-start; }
          .mp-avatar-wrap { left: 20px; }
        }

        @media(max-width: 520px) {
          .mp-cover { height: 330px; }
          .mp-avatar-wrap { width: 115px; height: 115px; bottom: -50px; }
          .mp-avatar { width: 115px; height: 115px; font-size: 40px; }
          .mp-avatar-edit { width: 34px; height: 34px; }
          .mp-cover-content { left: 150px; }
          .mp-title { font-size: 21px; }
          .mp-subtitle { font-size: 11px; }
          .mp-cover-button { padding: 8px 10px; font-size: 10px; }
          .mp-card { padding: 19px; }
          .mp-card-heading { align-items: flex-start; flex-wrap: wrap; }
          .mp-modal { padding: 19px; }
          .mp-cover-actions { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="mp-container">

        {/* ẢNH BÌA VÀ ẢNH ĐẠI DIỆN */}
        <section
          className="mp-cover"
          style={{
            backgroundImage: `url("${cover || DEFAULT_COVER}")`,
          }}
        >
          <div className="mp-avatar-wrap">
            <div className="mp-avatar">
              {avatar ? (
                <img src={avatar} alt="Ảnh đại diện hội viên" />
              ) : (
                initial
              )}
            </div>

            <button
              className="mp-avatar-edit"
              title="Thay đổi ảnh đại diện"
              onClick={() => avatarInputRef.current?.click()}
            >
              <Camera size={19} />
            </button>

            {avatar && (
              <button
                className="mp-avatar-remove"
                title="Xóa ảnh đại diện"
                onClick={() => removeImage("avatar")}
              >
                <Trash2 size={13} />
              </button>
            )}

            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageUpload(e, "avatar")}
            />
          </div>

          <div className="mp-cover-content">
            <div className="mp-cover-title">
              <p className="mp-eyebrow">IRONPULSE MEMBER</p>
              <h1 className="mp-title">Tài khoản của tôi</h1>
              <p className="mp-subtitle">
                Quản lý thông tin cá nhân và gói tập của bạn
              </p>
            </div>

            <div className="mp-cover-actions">
              <button
                className="mp-cover-button"
                onClick={() => coverInputRef.current?.click()}
              >
                <ImagePlus size={16} />
                Đổi ảnh bìa
              </button>

              {cover && (
                <button
                  className="mp-cover-button"
                  onClick={() => removeImage("cover")}
                >
                  <Trash2 size={15} />
                  Xóa ảnh bìa
                </button>
              )}

              <button
                className="mp-edit-button"
                onClick={() => {
                  setEditForm((prev) => ({
                    ...prev,
                    password: "",
                  }));
                  setIsEditing(true);
                }}
              >
                <Edit size={16} />
                Chỉnh sửa thông tin
              </button>
            </div>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageUpload(e, "cover")}
            />
          </div>
        </section>

        {/* THÔNG TIN CHÍNH */}
        <div className="mp-grid">

          <section className="mp-card">
            <div className="mp-card-heading">
              <h3 className="mp-card-title">
                <User size={19} className="mp-red-icon" />
                Thông tin cá nhân
              </h3>
              <ShieldCheck size={19} color="#4ade80" />
            </div>

            <div className="mp-profile-top">
              <div>
                <h2 className="mp-member-name">{displayName}</h2>
                <span className="mp-member-tag">
                  <CheckCircle2 size={12} />
                  HỘI VIÊN CHÍNH THỨC
                </span>
              </div>
            </div>

            <div className="mp-info-list">
              <div className="mp-info-item">
                <div className="mp-info-icon"><Mail size={19} /></div>
                <div className="mp-info-content">
                  <span className="mp-info-label">Địa chỉ Email</span>
                  <strong className="mp-info-value">
                    {memberInfo?.email || user?.email || "Chưa cập nhật"}
                  </strong>
                </div>
              </div>

              <div className="mp-info-item">
                <div className="mp-info-icon"><Phone size={19} /></div>
                <div className="mp-info-content">
                  <span className="mp-info-label">Số điện thoại</span>
                  <strong className="mp-info-value">
                    {memberInfo?.phone || user?.phone || "Chưa cập nhật"}
                  </strong>
                </div>
              </div>

              <div className="mp-info-item">
                <div className="mp-info-icon"><Calendar size={19} /></div>
                <div className="mp-info-content">
                  <span className="mp-info-label">Ngày gia nhập</span>
                  <strong className="mp-info-value">
                    {memberInfo?.startDate || "Chưa rõ"}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          <section className="mp-card">
            <div className="mp-card-heading">
              <h3 className="mp-card-title">
                <Award size={20} className="mp-red-icon" />
                Gói tập của bạn
              </h3>

              <span className={`mp-status ${isActive ? "active" : "expired"}`}>
                ● {isActive ? "ĐANG HOẠT ĐỘNG" : "ĐÃ HẾT HẠN"}
              </span>
            </div>

            {memberInfo?.packageName &&
            memberInfo.packageName !== "Chưa đăng ký gói" ? (
              <>
                <div className="mp-package-box">
                  <span className="mp-package-label">GÓI TẬP HIỆN TẠI</span>

                  <h2 className="mp-package-name">
                    {memberInfo.packageName}
                  </h2>

                  {memberInfo?.endDate && (
                    <div className="mp-package-date">
                      <span>Ngày hết hạn</span>
                      <strong>{memberInfo.endDate}</strong>
                    </div>
                  )}
                </div>

                <div className="mp-days-box">
                  <div className="mp-days-icon"><Clock size={22} /></div>
                  <div>
                    <div className="mp-days-label">Thời gian còn lại</div>
                    <div
                      className="mp-days-value"
                      style={{ color: isActive ? "#ff414d" : "#fb7185" }}
                    >
                      {daysRemaining} ngày
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="mp-empty">
                <div className="mp-empty-icon"><Dumbbell size={42} /></div>
                <strong>Bạn chưa đăng ký gói tập</strong>
                <span>
                  Hãy đăng ký gói tập để bắt đầu hành trình luyện tập
                  tại IronPulse.
                </span>
              </div>
            )}
          </section>
        </div>

        <div className="mp-security">
          <div className="mp-security-icon">
            <ShieldCheck size={19} />
          </div>
          <div>
            <strong>Thông tin tài khoản được bảo vệ</strong>
            <span>
              Bạn cần xác nhận bằng mật khẩu hiện tại khi cập nhật
              thông tin cá nhân.
            </span>
          </div>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA */}
      {isEditing && (
        <div
          className="mp-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !saving) {
              closeEditModal();
            }
          }}
        >
          <div className="mp-modal">
            <div className="mp-modal-header">
              <div>
                <p className="mp-eyebrow">ACCOUNT SETTINGS</p>
                <h3 className="mp-modal-title">Chỉnh sửa thông tin</h3>
              </div>

              <button
                type="button"
                className="mp-close"
                onClick={closeEditModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="mp-form">
              <div className="mp-field">
                <label><User size={14} /> Họ và tên</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="mp-field">
                <label><Phone size={14} /> Số điện thoại</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              <div className="mp-field">
                <label><Mail size={14} /> Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="Nhập địa chỉ email"
                  required
                />
              </div>

              <div className="mp-password-box">
                <div className="mp-field">
                  <label><Lock size={15} /> Mật khẩu xác nhận</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu hiện tại"
                    value={editForm.password}
                    onChange={(e) =>
                      setEditForm({ ...editForm, password: e.target.value })
                    }
                    required
                  />
                </div>

                <span className="mp-password-note">
                  * Bắt buộc nhập mật khẩu tài khoản để xác nhận
                  và lưu các thay đổi.
                </span>
              </div>

              <div className="mp-modal-actions">
                <button
                  type="button"
                  className="mp-cancel-button"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  <X size={15} /> Hủy
                </button>

                <button
                  type="submit"
                  className="mp-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save size={15} /> Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mp-security-note">
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              Mật khẩu chỉ được sử dụng để xác nhận thay đổi,
              không hiển thị công khai trên hồ sơ.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
