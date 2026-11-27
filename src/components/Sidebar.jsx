
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  UserCog,
  CalendarDays,
  Activity,
  LogOut,
  Dumbbell,
  CreditCard,
  Home,
  MessageSquare,
  BookOpen,
  Receipt,
  User,
  ChevronRight,
  ShieldCheck,
  ClipboardCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const MENUS = {
  Admin: [
    { to: "/admin/dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/admin/members", label: "Hội viên", icon: Users },
    { to: "/admin/packages", label: "Gói tập", icon: Package },
    {
      to: "/admin/package-change-requests",
      label: "Duyệt đổi gói tập",
      icon: ClipboardCheck,
    },
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
    { to: "/member/profile", label: "Tài khoản của tôi", icon: User },
  ],
};

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [avatar, setAvatar] = useState("");

  const currentRole = role || user?.role || "Member";
  const menuList = MENUS[currentRole] || MENUS.Member;

  const accountKey = (
    user?.email || user?.username || "ironpulse_member"
  ).toLowerCase();

  const avatarStorageKey = `ironpulse_avatar_${accountKey}`;

  useEffect(() => {
    const loadAvatar = () => {
      try {
        setAvatar(localStorage.getItem(avatarStorageKey) || "");
      } catch (error) {
        console.error("Không thể tải ảnh đại diện:", error);
      }
    };

    loadAvatar();

    // Cập nhật ảnh khi ảnh đại diện thay đổi
    window.addEventListener("storage", loadAvatar);
    window.addEventListener("ironpulse-avatar-updated", loadAvatar);

    return () => {
      window.removeEventListener("storage", loadAvatar);
      window.removeEventListener("ironpulse-avatar-updated", loadAvatar);
    };
  }, [avatarStorageKey]);

  const displayName =
    user?.fullName || user?.username || "Người dùng";

  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <style>{`
        .ip-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          background: #141414;
          color: #f5f5f5;
          border-right: 1px solid #2b2b2b;
          box-shadow: 8px 0 30px rgba(0,0,0,.18);
          z-index: 100;
          box-sizing: border-box;
        }

        .ip-sidebar * {
          box-sizing: border-box;
        }

        .ip-brand {
          height: 76px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 24px;
          border-bottom: 1px solid #292929;
          color: #fff;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: .5px;
        }

        .ip-brand-icon {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg,#f12b36,#a90e19);
          border-radius: 11px;
          color: white;
          box-shadow: 0 4px 15px rgba(227,24,36,.25);
        }

        .ip-brand-name span {
          color: #ed2733;
        }

        .ip-user {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 15px;
          padding: 14px 12px;
          background: #1c1c1c;
          border: 1px solid #303030;
          border-radius: 12px;
          min-width: 0;
        }

        .ip-avatar {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 50%;
          background: linear-gradient(145deg,#f12b36,#791018);
          border: 2px solid #e31824;
          color: white;
          font-size: 19px;
          font-weight: 800;
        }

        .ip-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ip-user-info {
          min-width: 0;
          flex: 1;
        }

        .ip-user-name {
          display: block;
          overflow: hidden;
          color: #fff;
          font-size: 12px;
          font-weight: 750;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ip-user-role {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 6px;
          color: #999;
          font-size: 10px;
        }

        .ip-user-role svg {
          color: #ef4444;
        }

        .ip-menu-label {
          padding: 0 25px;
          margin: 4px 0 12px;
          color: #666;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .ip-nav {
          flex: 1;
          overflow-y: auto;
          padding: 0 13px 15px;
        }

        .ip-nav::-webkit-scrollbar {
          width: 4px;
        }

        .ip-nav::-webkit-scrollbar-thumb {
          background: #383838;
          border-radius: 10px;
        }

        .ip-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 45px;
          padding: 0 13px;
          margin-bottom: 5px;
          border: 1px solid transparent;
          border-radius: 9px;
          color: #999;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          transition: all .2s ease;
        }

        .ip-nav-link svg {
          flex-shrink: 0;
          color: #777;
          transition: .2s;
        }

        .ip-nav-link:hover {
          background: #202020;
          color: #fff;
        }

        .ip-nav-link:hover svg {
          color: #f0444e;
        }

        .ip-nav-link.active {
          background: linear-gradient(
            90deg,
            rgba(227,24,36,.19),
            rgba(227,24,36,.06)
          );
          border-color: rgba(227,24,36,.25);
          color: #ff555f;
          font-weight: 750;
        }

        .ip-nav-link.active svg {
          color: #ff414d;
        }

        .ip-nav-link.active::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 9px;
          bottom: 9px;
          width: 3px;
          border-radius: 0 5px 5px 0;
          background: #e31824;
          box-shadow: 0 0 10px rgba(227,24,36,.5);
        }

        .ip-nav-arrow {
          margin-left: auto;
          opacity: 0;
          transition: .2s;
        }

        .ip-nav-link.active .ip-nav-arrow {
          opacity: 1;
        }

        .ip-sidebar-bottom {
          padding: 15px;
          border-top: 1px solid #292929;
        }

        .ip-logout {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: rgba(227,24,36,.08);
          border: 1px solid rgba(227,24,36,.2);
          border-radius: 9px;
          color: #ff5962;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: .2s;
        }

        .ip-logout:hover {
          background: #e31824;
          border-color: #e31824;
          color: white;
          transform: translateY(-1px);
        }

        .ip-sidebar-footer {
          margin-top: 13px;
          color: #555;
          font-size: 9px;
          text-align: center;
          letter-spacing: 1px;
        }

        @media(max-width: 900px) {
          .ip-sidebar {
            width: 225px;
            min-width: 225px;
          }

          .ip-brand {
            padding: 0 17px;
            font-size: 19px;
          }
        }
      `}</style>

      <aside className="ip-sidebar">
        {/* LOGO */}
        <div className="ip-brand">
          <div className="ip-brand-icon">
            <Dumbbell size={23} />
          </div>

          <div className="ip-brand-name">
            Iron<span>Pulse</span>
          </div>
        </div>

        {/* USER */}
        <div className="ip-user">
          <div className="ip-avatar">
            {avatar ? (
              <img src={avatar} alt="Ảnh đại diện" />
            ) : (
              initial
            )}
          </div>

          <div className="ip-user-info">
            <strong className="ip-user-name">
              {displayName}
            </strong>

            <div className="ip-user-role">
              <ShieldCheck size={12} />
              {currentRole === "Admin"
                ? "Quản trị viên"
                : "Hội viên"}
            </div>
          </div>
        </div>

        {/* MENU */}
        <p className="ip-menu-label">MENU CHÍNH</p>

        <nav className="ip-nav">
          {menuList.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `ip-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight
                size={14}
                className="ip-nav-arrow"
              />
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="ip-sidebar-bottom">
          <button
            className="ip-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Đăng xuất
          </button>

          <div className="ip-sidebar-footer">
            IRONPULSE FITNESS CLUB
          </div>
        </div>
      </aside>
    </>
  );
}
