
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Dumbbell,
  Mail,
  Lock,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("1. Đang gọi hàm login từ AuthContext...");

      const user = await login(form.email, form.password);

      console.log("2. Đăng nhập thành công, thông tin user:", user);

      const isUserAdmin =
        user.role === "Admin" || user.role === "admin";

      const fallback = isUserAdmin
        ? "/admin/dashboard"
        : "/member/dashboard";

      console.log("3. Chuẩn bị điều hướng tới:", fallback);

      navigate(
        location.state?.from?.pathname || fallback,
        { replace: true }
      );
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
    <div className="ipx-login-page">

      {/* HÌNH ẢNH BÊN TRÁI */}
      <div className="ipx-login-visual">
        <div className="ipx-login-visual-bg" />
        <div className="ipx-login-visual-overlay" />

        <Link to="/" className="ipx-login-brand">
          <Dumbbell size={27} />
          <span>IRON<span>PULSE</span></span>
        </Link>

        <div className="ipx-login-visual-content">
          <div className="ipx-login-eyebrow">
            <span />
            IRONPULSE FITNESS CLUB
          </div>

          <h1>
            KHÔNG CÓ
            <br />
            GIỚI HẠN.
            <br />
            CHỈ CÓ <strong>BỨT PHÁ.</strong>
          </h1>

          <p>
            Mỗi ngày là một cơ hội để mạnh mẽ hơn.
            Tiếp tục hành trình chinh phục phiên bản tốt nhất
            của chính bạn.
          </p>

          <div className="ipx-login-visual-bottom">
            <span>01</span>
            <div />
            <span>TRAIN HARDER. LIVE STRONGER.</span>
          </div>
        </div>
      </div>

      {/* FORM ĐĂNG NHẬP */}
      <div className="ipx-login-form-side">
        <div className="ipx-login-form-wrapper">

          <Link to="/" className="ipx-login-mobile-brand">
            <Dumbbell size={25} />
            IRON<span>PULSE</span>
          </Link>

          <div className="ipx-login-heading">
            <div className="ipx-login-eyebrow">
              <span />
              CHÀO MỪNG QUAY TRỞ LẠI
            </div>

            <h2>
              ĐĂNG <strong>NHẬP.</strong>
            </h2>

            <p>
              Đăng nhập để tiếp tục hành trình tập luyện
              cùng IronPulse.
            </p>
          </div>

          <form className="ipx-login-form" onSubmit={submit}>

            <label>
              EMAIL / TÊN ĐĂNG NHẬP

              <div className="ipx-login-input-wrap">
                <Mail size={18} />

                <input
                  type="text"
                  required
                  placeholder="Nhập email hoặc tên đăng nhập"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </label>

            <label>
              MẬT KHẨU

              <div className="ipx-login-input-wrap">
                <Lock size={18} />

                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />
              </div>
            </label>

            {error && (
              <div className="ipx-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="ipx-login-submit"
              disabled={loading}
            >
              <LogIn size={17} />
              {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
              {!loading && <ArrowRight size={17} />}
            </button>

          </form>

          <div className="ipx-login-register">
            Chưa có tài khoản?
            <Link to="/register"> Đăng ký ngay</Link>
          </div>

          <div className="ipx-login-footer">
            <span>IRONPULSE FITNESS CLUB</span>
            <span>KỶ LUẬT TẠO NÊN SỨC MẠNH</span>
          </div>

        </div>
      </div>

    </div>
  );
}
