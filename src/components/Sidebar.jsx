import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Package, UserCog, CalendarDays, Activity, LogOut, Dumbbell, CreditCard, Home, MessageSquare, BookOpen, Receipt, User
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const MENUS = {
  Admin: [
    { to: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/admin/members", label: "Hội viên", icon: Users },
    { to: "/admin/packages", label: "Gói tập", icon: Package },
    { to: "/admin/trainers", label: "Huấn luyện viên", icon: UserCog },
    { to: "/admin/classes", label: "Lớp học", icon: BookOpen },
    { to: "/admin/class-bookings", label: "Duyệt lịch tập", icon: CalendarDays },
    { to: "/admin/contacts", label: "Tin nhắn tư vấn", icon: MessageSquare },
  ],
  Member: [
    { to: "/", label: "Trang chủ", icon: Home },
    { to: "/member/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/member/schedule", label: "Lịch tập", icon: CalendarDays },
    { to: "/member/metrics", label: "Chỉ số cơ thể", icon: Activity },
    { to: "/member/packages", label: "Đăng ký gói", icon: CreditCard },
    { to: "/member/payments", label: "Lịch sử thanh toán", icon: Receipt },
    { to: "/member/profile", label: "Tài khoản của tôi", icon: User }, // Đã chuẩn hóa đúng cấu trúc mảng
  ],
};

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Kiểm tra nếu role không hợp lệ để tránh crash app
  const menuList = MENUS[role] || MENUS.Member;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Dumbbell size={24} /> IronPulse
      </div>
      <div className="sidebar-user">
        <div className="avatar">{user?.fullName?.[0] || "U"}</div>
        <div>
          <strong>{user?.fullName || "Người dùng"}</strong>
          <small>{role === "Admin" ? "Quản trị viên" : "Hội viên"}</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        {menuList.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <button
        className="sidebar-logout"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        <LogOut size={18} /> Đăng xuất
      </button>
    </aside>
  );
}