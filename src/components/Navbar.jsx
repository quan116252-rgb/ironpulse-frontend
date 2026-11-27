
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Dumbbell, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  const dashboardLink =
    user?.role?.toLowerCase() === "admin"
      ? "/admin/dashboard"
      : "/member/dashboard";

  return (
    <header className={`navbar ${isHome ? "navbar-home" : ""}`}>
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <Dumbbell size={25} />
          <span>IronPulse</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>Trang chủ</NavLink>
          <NavLink to="/packages">Gói tập</NavLink>
          <NavLink to="/classes">Lớp tập</NavLink>
          <NavLink to="/trainers">Huấn luyện viên</NavLink>
          <NavLink to="/About">Giới thiệu</NavLink>
          <NavLink to="/contact">Liên hệ</NavLink>
        </nav>

        <div className="nav-actions">
          {items.length > 0 && (
            <span className="cart-chip" title="Gói đã chọn">
              <ShoppingCart size={16} />
              {items.length}
            </span>
          )}

          {user ? (
            <>
              <Link to={dashboardLink} className="btn btn-ghost btn-sm">
                {user.fullName || user.email}
              </Link>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => navigate(dashboardLink)}
              >
                <LogOut size={16} />
                Quay lại
              </button>
            </>
          ) : (
            <Link to="/register" className="ipx-nav-join">
              Tham gia ngay
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
