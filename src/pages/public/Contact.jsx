
import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Send,
  Dumbbell,
} from "lucide-react";
import axios from "axios";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const newContact = {
      full_name: formData.get("fullName"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      await axios.post(
        "https://ironpulse-backend-tvu3.onrender.com/api/contacts/",
        newContact
      );

      setSent(true);
      e.target.reset();
    } catch (error) {
      console.error("Lỗi khi gửi liên hệ lên Django:", error);
      alert("Gửi thất bại, vui lòng kiểm tra lại kết nối server!");
    }
  };

  return (
    <div className="ipx-contact-page">

      {/* BANNER */}
      <section className="ipx-contact-hero">
        <div className="ipx-contact-hero-bg" />
        <div className="ipx-contact-hero-overlay" />

        <div className="ipx-contact-hero-content">
          <div className="ipx-contact-eyebrow">
            <span />
            IRONPULSE FITNESS CLUB
            <span />
          </div>

          <h1>
            KẾT NỐI
            <br />
            VỚI <strong>CHÚNG TÔI.</strong>
          </h1>

          <p>
            Bạn cần tư vấn về gói tập, lớp học hay chương trình
            luyện tập? IronPulse luôn sẵn sàng đồng hành cùng bạn.
          </p>

          <a href="#contact-form" className="ipx-contact-button">
            Gửi lời nhắn
            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* NỘI DUNG LIÊN HỆ */}
      <section className="ipx-contact-section">
        <div className="ipx-contact-container">

          {/* THÔNG TIN */}
          <div className="ipx-contact-info">

            <div className="ipx-contact-eyebrow">
              <span />
              THÔNG TIN LIÊN HỆ
            </div>

            <h2>
              CHÚNG TÔI
              <br />
              LUÔN <strong>LẮNG NGHE.</strong>
            </h2>

            <p className="ipx-contact-description">
              Đừng ngần ngại liên hệ với chúng tôi.
              Đội ngũ IronPulse sẽ hỗ trợ bạn giải đáp
              mọi thắc mắc và lựa chọn chương trình phù hợp.
            </p>

            <div className="ipx-contact-details">

              <div className="ipx-contact-detail">
                <div className="ipx-contact-detail-icon">
                  <MapPin size={22} />
                </div>

                <div>
                  <span>ĐỊA CHỈ</span>
                  <p>23 Đoàn Quý Phi, Đà Nẵng</p>
                </div>
              </div>

              <div className="ipx-contact-detail">
                <div className="ipx-contact-detail-icon">
                  <Phone size={22} />
                </div>

                <div>
                  <span>ĐIỆN THOẠI</span>
                  <p>0986562043</p>
                </div>
              </div>

              <div className="ipx-contact-detail">
                <div className="ipx-contact-detail-icon">
                  <Mail size={22} />
                </div>

                <div>
                  <span>EMAIL</span>
                  <p>quan116252@donga.edu.vn</p>
                </div>
              </div>

              <div className="ipx-contact-detail">
                <div className="ipx-contact-detail-icon">
                  <Clock size={22} />
                </div>

                <div>
                  <span>THỜI GIAN HỖ TRỢ</span>
                  <p>Liên hệ để được tư vấn lịch hoạt động</p>
                </div>
              </div>

            </div>

            <div className="ipx-contact-note">
              <Dumbbell size={23} />
              <div>
                <strong>IRONPULSE FITNESS CLUB</strong>
                <p>
                  Kỷ luật hôm nay. Sức mạnh ngày mai.
                </p>
              </div>
            </div>
          </div>

          {/* FORM GỬI LIÊN HỆ */}
          <div className="ipx-contact-form-wrapper" id="contact-form">

            <div className="ipx-contact-form-heading">
              <div className="ipx-contact-eyebrow">
                <span />
                GỬI TIN NHẮN
              </div>

              <h2>
                HÃY ĐỂ LẠI
                <br />
                <strong>LỜI NHẮN CỦA BẠN.</strong>
              </h2>

              <p>
                Điền thông tin bên dưới, chúng tôi sẽ tiếp nhận
                yêu cầu của bạn.
              </p>
            </div>

            <form className="ipx-contact-form" onSubmit={submit}>

              <label>
                HỌ VÀ TÊN
                <input
                  name="fullName"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                />
              </label>

              <label>
                ĐỊA CHỈ EMAIL
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="email@example.com"
                />
              </label>

              <label>
                NỘI DUNG LIÊN HỆ
                <textarea
                  name="message"
                  rows={5}
                  required
                  placeholder="Bạn cần tư vấn điều gì? Hãy chia sẻ với chúng tôi..."
                />
              </label>

              <button type="submit" className="ipx-contact-submit">
                <Send size={17} />
                GỬI LIÊN HỆ
                <ArrowRight size={17} />
              </button>

              {sent && (
                <div className="ipx-contact-success">
                  <span>✓</span>
                  Đã gửi liên hệ thành công! Dữ liệu đã được gửi đến hệ thống.
                </div>
              )}

            </form>
          </div>

        </div>
      </section>

      {/* BANNER CUỐI */}
      <section className="ipx-contact-cta">
        <div className="ipx-contact-cta-content">
          <div className="ipx-contact-eyebrow">
            <span />
            BẮT ĐẦU HÀNH TRÌNH CỦA BẠN
            <span />
          </div>

          <h2>
            SẴN SÀNG TRỞ NÊN
            <br />
            <strong>MẠNH MẼ HƠN?</strong>
          </h2>

          <p>
            Mỗi hành trình lớn đều bắt đầu từ một quyết định.
          </p>
        </div>
      </section>

    </div>
  );
}
