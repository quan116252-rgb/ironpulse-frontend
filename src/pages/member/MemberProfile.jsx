import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMembers, updateMemberProfile } from "../../services/memberService";
import { User, Phone, Mail, Calendar, Award, Clock, Edit, X, Lock } from "lucide-react";

export default function MemberProfile() {
  const { user } = useAuth();
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const members = await getMembers();
      
      const current = (members || []).find(
        (m) =>
          (user?.email && m.email?.toLowerCase() === user.email.toLowerCase()) ||
          (user?.phone && m.phone === user.phone) ||
          (user?.username && m.email?.toLowerCase() === user.username.toLowerCase())
      );

      if (current) {
        setMemberInfo(current);
        setEditForm({
          fullName: current.fullName || "",
          phone: current.phone || "",
          email: current.email || "",
          password: ""
        });
      } else if (members && members.length > 0) {
        setMemberInfo(members[0]);
        setEditForm({
          fullName: members[0].fullName || "",
          phone: members[0].phone || "",
          email: members[0].email || "",
          password: ""
        });
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
        password: editForm.password
      };

      const res = await updateMemberProfile(payload);
      alert("🎉 " + (res.message || "Cập nhật thành công!"));
      
      setIsEditing(false);
      setEditForm(prev => ({ ...prev, password: "" }));
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

    let expiryDate = new Date(endDateStr);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return <div style={{ padding: "32px", color: "#64748b" }}>Đang tải thông tin tài khoản...</div>;
  }

  const daysRemaining = calculateDaysRemaining(memberInfo?.endDate);
  const isActive = daysRemaining > 0;

  return (
    <div style={{ padding: "32px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", maxWidth: "1000px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Tài khoản của tôi
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
            Quản lý thông tin cá nhân và gói tập đồng bộ với hệ thống
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditForm(prev => ({ ...prev, password: "" }));
            setIsEditing(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            backgroundColor: "#ea580c",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          <Edit size={16} /> Chỉnh sửa thông tin
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", maxWidth: "1000px" }}>
        {/* CARD THÔNG TIN CÁ NHÂN */}
        <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#ffedd5", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold" }}>
              {(memberInfo?.fullName || user?.fullName || "HV").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#0f172a" }}>
                {memberInfo?.fullName || user?.fullName || "Hội viên IronPulse"}
              </h3>
              <span style={{ fontSize: "12px", backgroundColor: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "12px", fontWeight: "600", marginTop: "4px", display: "inline-block" }}>
                Hội viên chính thức
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#334155", fontSize: "14px" }}>
              <Mail size={18} color="#ea580c" />
              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>Email</span>
                <strong>{memberInfo?.email || user?.email || "Chưa cập nhật"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#334155", fontSize: "14px" }}>
              <Phone size={18} color="#ea580c" />
              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>Số điện thoại</span>
                <strong>{memberInfo?.phone || user?.phone || "Chưa cập nhật"}</strong>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#334155", fontSize: "14px" }}>
              <Calendar size={18} color="#ea580c" />
              <div>
                <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>Ngày gia nhập</span>
                <strong>{memberInfo?.startDate || "Chưa rõ"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CARD GÓI TẬP HIỆN TẠI (ĐÃ BỎ BUTTON GIA HẠN / ĐỔI GÓI TẬP) */}
        <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={20} color="#ea580c" /> Gói tập của bạn
              </h3>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", backgroundColor: isActive ? "#dcfce7" : "#fee2e2", color: isActive ? "#15803d" : "#b91c1c" }}>
                {isActive ? "Đang hoạt động" : "Hết hạn / Chưa đăng ký"}
              </span>
            </div>

            <div style={{ backgroundColor: "#fff7ed", padding: "20px", borderRadius: "12px", border: "1px solid #ffedd5", marginBottom: "20px" }}>
              <span style={{ fontSize: "13px", color: "#9a3412", fontWeight: "600" }}>Gói đang sử dụng</span>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#ea580c", margin: "4px 0 12px 0" }}>
                {memberInfo?.packageName || "Chưa đăng ký gói tập"}
              </h2>

              {memberInfo?.endDate && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569" }}>
                  <span>Ngày hết hạn:</span>
                  <strong>{memberInfo.endDate}</strong>
                </div>
              )}
            </div>

            {/* THÔNG BÁO SỐ NGÀY CÒN LẠI */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "14px", backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
              <Clock size={18} color="#ea580c" />
              <span>Thời gian còn lại: <strong style={{ color: isActive ? "#ea580c" : "#dc2626", fontSize: "16px" }}>{daysRemaining} ngày</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CẬP NHẬT THÔNG TIN (CÓ NHẬP MẬT KHẨU) */}
      {isEditing && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", width: "100%", maxWidth: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>Chỉnh sửa thông tin</h3>
              <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Họ và tên</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Số điện thoại</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div style={{ backgroundColor: "#fef2f2", padding: "12px", borderRadius: "8px", border: "1px solid #fecaca" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "bold", color: "#991b1b", marginBottom: "6px" }}>
                  <Lock size={14} /> Mật khẩu xác nhận
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu tài khoản của bạn"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #fca5a5", boxSizing: "border-box", backgroundColor: "#ffffff" }}
                  required
                />
                <span style={{ fontSize: "11px", color: "#b91c1c", marginTop: "4px", display: "block" }}>
                  * Bắt buộc nhập mật khẩu chính xác để lưu các thay đổi trên.
                </span>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", fontWeight: "bold", cursor: "pointer" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#ea580c", color: "#ffffff", fontWeight: "bold", cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}