import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Sử dụng hàm login chuẩn từ AuthContext
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("1. Đang gọi hàm login từ AuthContext...");
      
      // Gọi trực tiếp hàm login từ AuthContext (hàm này đã tự động gọi service, lưu token/user vào đúng key và cập nhật state)
      const user = await login(form.email, form.password);

      console.log("2. Đăng nhập thành công, thông tin user:", user);

      // Phân quyền điều hướng dựa trên role trả về từ backend
      const isUserAdmin = user.role === "Admin" || user.role === "admin";
      const fallback = isUserAdmin ? "/admin/dashboard" : "/member/dashboard";
      
      console.log("3. Chuẩn bị điều hướng tới:", fallback);
      
      navigate(location.state?.from?.pathname || fallback, { replace: true });
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Sai tên đăng nhập hoặc mật khẩu!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card form" onSubmit={submit}>
        <h1>Đăng nhập</h1>
        <label>
          Email / Tên đăng nhập
          <input
            type="text"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && (
          <p className="error" style={{ color: "#ef4444", fontSize: "13px" }}>
            {error}
          </p>
        )}
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng nhập"}
        </button>
        <p className="muted center">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}