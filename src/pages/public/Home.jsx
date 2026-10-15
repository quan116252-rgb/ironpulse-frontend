import { Link } from "react-router-dom";
import { Dumbbell, CalendarCheck, Users, HeartPulse } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Dumbbell, title: "Thiết bị hiện đại", text: "Hơn 200 máy tập nhập khẩu, khu free weight rộng rãi." },
  { icon: CalendarCheck, title: "Lớp học đa dạng", text: "Yoga, Zumba, Boxing, Strength... lịch linh hoạt cả ngày." },
  { icon: Users, title: "HLV chuyên nghiệp", text: "Đội ngũ PT có chứng chỉ quốc tế, kèm sát từng người." },
  { icon: HeartPulse, title: "Theo dõi sức khỏe", text: "Đo InBody miễn phí, theo dõi tiến độ trên tài khoản." },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">IronPulse Fitness Club</span>
          <h1>Rèn thể lực.<br />Thay đổi chính mình.</h1>
          <p>Đăng ký gói tập online, đặt lịch lớp và theo dõi tiến độ chỉ trong vài bước.</p>
          <div className="hero-actions">
            <Link to="/packages" className="btn btn-primary">Xem gói tập</Link>
            <Link to="/classes" className="btn btn-outline-light">Lịch lớp học</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Vì sao chọn IronPulse?</h2>
        <div className="grid grid-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="feature">
              <div className="feature-icon"><Icon size={26} /></div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Sẵn sàng bắt đầu?</h2>
          <p>Tạo tài khoản và nhận buổi tập thử miễn phí.</p>
          <Link to="/register" className="btn btn-primary">Đăng ký ngay</Link>
        </div>
      </section>
    </>
  );
}
