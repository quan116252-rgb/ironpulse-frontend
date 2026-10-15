import { NavLink, Link, useNavigate } from "react-router-dom";
import { Dumbbell, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  // Xác định đúng đường dẫn trang chủ theo phân quyền (hỗ trợ cả chữ hoa/thường)
  const dashboardLink = 
    user?.role?.toLowerCase() === "admin" 
      ? "/admin/dashboard" 
      : "/member/dashboard";

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <Dumbbell size={26} /> IronPulse
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/classes">Lớp học</NavLink>
          <NavLink to="/trainers">Huấn luyện viên</NavLink>
          <NavLink to="/contact">Liên hệ</NavLink>
        </nav>

        <div className="nav-actions">
          {items.length > 0 && (
            <span className="cart-chip" title="Gói đã chọn">
              <ShoppingCart size={16} /> {items.length}
            </span>
          )}
          {user ? (
            <>
              <Link to={dashboardLink} className="btn btn-ghost btn-sm">
                {user.fullName || user.email}
              </Link>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  navigate(dashboardLink);
                }}
              >
                <LogOut size={16} /> Quay lại
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}