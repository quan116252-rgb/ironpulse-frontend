import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // 1. Import axios vào

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    username: "", // Thêm trường username nếu form của bạn cần, hoặc dùng email làm username
    fullName: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirm: "" 
  });
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự");
    if (form.password !== form.confirm) return setError("Mật khẩu xác nhận không khớp");
    setError("");

    try {
      // 2. Gửi dữ liệu đăng ký trực tiếp sang Django Backend
      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        username: form.email, // Dùng email làm username cho tiện, hoặc bạn có thể tạo thêm ô nhập username
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });

      alert(response.data.message || "Đăng ký thành công!");
      navigate("/login"); // Đăng ký thành công thì chuyển về trang đăng nhập
    } catch (err) {
      console.error("Lỗi đăng ký:", err);
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Đăng ký thất bại. Vui lòng thử lại!");
      }
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card form" onSubmit={submit}>
        <h1>Đăng ký thành viên</h1>
        <label>Họ và tên<input required value={form.fullName} onChange={set("fullName")} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set("email")} /></label>
        <label>Số điện thoại<input required pattern="[0-9]{9,11}" value={form.phone} onChange={set("phone")} /></label>
        <label>Mật khẩu<input type="password" required value={form.password} onChange={set("password")} /></label>
        <label>Xác nhận mật khẩu<input type="password" required value={form.confirm} onChange={set("confirm")} /></label>
        {error && <p className="error" style={{ color: "#ef4444", fontSize: "13px" }}>{error}</p>}
        <button className="btn btn-primary btn-block">Tạo tài khoản</button>
        <p className="muted center">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </form>
    </div>
  );
}