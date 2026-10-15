import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import axios from "axios";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    // 1. Lấy dữ liệu từ form thông qua thuộc tính name
    const formData = new FormData(e.target);
    const newContact = {
      full_name: formData.get("fullName"), // Khớp với trường full_name bên Django Model
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      // 2. Gửi dữ liệu trực tiếp lên API Django Backend thay vì localStorage
      await axios.post("http://127.0.0.1:8000/api/contacts/", newContact);

      // 3. Hiển thị thông báo thành công và reset form
      setSent(true);
      e.target.reset();
    } catch (error) {
      console.error("Lỗi khi gửi liên hệ lên Django:", error);
      alert("Gửi thất bại, vui lòng kiểm tra lại kết nối server!");
    }
  };

  return (
    <div className="container section">
      <h1 className="page-title">Liên hệ</h1>
      <div className="grid grid-2">
        <div>
          <ul className="info-list big">
            <li><MapPin size={20} /> 23 Đoàn Quý Phi, Đà Nẵng</li>
            <li><Phone size={20} /> 0986562043</li>
            <li><Mail size={20} /> quan116252@donga.edu.vn</li>
          </ul>
        </div>
        
        <form className="form" onSubmit={submit}>
          <label>
            Họ và tên
            <input name="fullName" required placeholder="Nguyễn Văn A" />
          </label>
          <label>
            Email
            <input name="email" type="email" required placeholder="email@example.com" />
          </label>
          <label>
            Nội dung
            <textarea name="message" rows={4} required placeholder="Bạn cần tư vấn gì?" />
          </label>
          
          <button className="btn btn-primary">Gửi liên hệ</button>
          {sent && <p className="success" style={{ color: "green", marginTop: "10px" }}>Đã gửi thành công vào Database Django!</p>}
        </form>
      </div>
    </div>
  );
}