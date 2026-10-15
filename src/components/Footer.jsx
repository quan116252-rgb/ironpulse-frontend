import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>IronPulse Fitness Club</strong>
          <p>23 Đoàn Quý Phi, Đà Nẵng</p>
          <p>Hotline: 0986562043 · Mở cửa 05:00 – 22:00</p>
        </div>
        <div className="footer-links">
          <Link to="/packages">Gói tập</Link>
          <Link to="/classes">Lớp học</Link>
          <Link to="/contact">Liên hệ</Link>
        </div>
      </div>
      <div className="footer-copy">© 2026 IronPulse. Dự án mẫu thiết kế giao diện.</div>
    </footer>
  );
}
