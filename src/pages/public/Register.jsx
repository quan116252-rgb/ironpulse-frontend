
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Dumbbell,
} from "lucide-react";
import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      return setError("Mật khẩu tối thiểu 6 ký tự");
    }

    if (form.password !== form.confirm) {
      return setError("Mật khẩu xác nhận không khớp");
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("register/", {
        username: form.email,
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      alert(response.data.message || "Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      console.error("Lỗi đăng ký:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ipx-register">
      <div className="ipx-register-visual">
        <div className="ipx-register-visual-overlay" />

        <div className="ipx-register-brand">
          <Dumbbell size={25} />
          <span>IRONPULSE</span>
        </div>

        <div className="ipx-register-visual-content">
          <span>IRONPULSE FITNESS CLUB</span>

          <h1>
            BẮT ĐẦU
            <br />
            <strong>HÀNH TRÌNH</strong>
            <br />
            CỦA BẠN.
          </h1>

          <p>
            Không có giới hạn cho những gì bạn có thể đạt được.
            Hãy bắt đầu thay đổi bản thân ngay hôm nay.
          </p>

          <div className="ipx-register-line" />
          <small>RÈN LUYỆN HÔM NAY. MẠNH MẼ NGÀY MAI.</small>
        </div>
      </div>

      <div className="ipx-register-panel">
        <div className="ipx-register-form-wrap">
          <div className="ipx-register-heading">
            <span>THAM GIA CÙNG CHÚNG TÔI</span>
            <h2>TẠO TÀI KHOẢN</h2>
            <p>Đăng ký để bắt đầu hành trình luyện tập của bạn.</p>
          </div>

          <form onSubmit={submit} className="ipx-register-form">
            <label>
              HỌ VÀ TÊN
              <div className="ipx-register-input">
                <UserRound size={17} />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={set("fullName")}
                  placeholder="Nhập họ và tên"
                />
              </div>
            </label>

            <label>
              EMAIL
              <div className="ipx-register-input">
                <Mail size={17} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  placeholder="Nhập địa chỉ email"
                />
              </div>
            </label>

            <label>
              SỐ ĐIỆN THOẠI
              <div className="ipx-register-input">
                <Phone size={17} />
                <input
                  type="tel"
                  required
                  pattern="[0-9]{9,11}"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </label>

            <label>
              MẬT KHẨU
              <div className="ipx-register-input">
                <Lock size={17} />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>
            </label>

            <label>
              XÁC NHẬN MẬT KHẨU
              <div className="ipx-register-input">
                <Lock size={17} />
                <input
                  type="password"
                  required
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Nhập lại mật khẩu"
                />
              </div>
            </label>

            {error && (
              <p className="ipx-register-error">{error}</p>
            )}

            <button
              type="submit"
              className="ipx-register-submit"
              disabled={loading}
            >
              {loading ? "ĐANG TẠO TÀI KHOẢN..." : "TẠO TÀI KHOẢN"}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div className="ipx-register-login">
              Đã có tài khoản?
              <Link to="/login"> Đăng nhập</Link>
            </div>
          </form>

          <div className="ipx-register-footer">
            IRONPULSE FITNESS CLUB
          </div>
        </div>
      </div>
    </div>
  );
}
