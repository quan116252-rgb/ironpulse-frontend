
import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Dumbbell } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <style>{`
        .footer {
          background: linear-gradient(135deg, #090909 0%, #151515 55%, #090909 100%);
          color: #ffffff;
          border-top: 2px solid #F31824;
          margin-top: 60px;
          position: relative;
          overflow: hidden;
        }

        .footer::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #F31824,
            transparent
          );
          box-shadow: 0 0 15px rgba(243, 24, 36, 0.6);
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 40px;
          padding-top: 48px;
          padding-bottom: 40px;
        }

        .footer-brand {
          max-width: 420px;
        }

        .footer-brand-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #ffffff;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 0.5px;
          margin-bottom: 22px;
          text-transform: uppercase;
        }

        .footer-brand-title svg {
          color: #F31824;
        }

        .footer-info {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #bdbdbd;
          margin: 14px 0;
          font-size: 14px;
          line-height: 1.6;
        }

        .footer-info svg {
          color: #F31824;
          flex-shrink: 0;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 160px;
        }

        .footer-links-title {
          color: #ffffff;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 8px;
          position: relative;
          padding-bottom: 12px;
        }

        .footer-links-title::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 38px;
          height: 3px;
          background: #F31824;
        }

        .footer-links a {
          color: #bdbdbd;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.25s ease;
          width: fit-content;
        }

        .footer-links a:hover {
          color: #F31824;
          transform: translateX(6px);
        }

        .footer-copy {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          padding: 20px 15px;
          color: #888888;
          font-size: 13px;
          background: #070707;
        }

        .footer-copy span {
          color: #F31824;
          font-weight: 700;
        }

        @media (max-width: 600px) {
          .footer-inner {
            flex-direction: column;
            gap: 32px;
            padding-top: 35px;
            padding-bottom: 30px;
          }

          .footer-brand-title {
            font-size: 19px;
          }

          .footer-links {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 20px;
          }

          .footer-links-title {
            width: 100%;
          }
        }
      `}</style>

      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="footer-brand-title">
            <Dumbbell size={26} />
            <strong>IronPulse Fitness Club</strong>
          </div>

          <p className="footer-info">
            <MapPin size={17} />
            23 Đoàn Quý Phi, Đà Nẵng
          </p>

          <p className="footer-info">
            <Phone size={17} />
            Hotline: 0986562043
          </p>

          <p className="footer-info">
            <Clock size={17} />
            Mở cửa 05:00 – 22:00
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-links-title">Khám phá</div>
          <Link to="/packages">Gói tập</Link>
          <Link to="/classes">Lớp học</Link>
          <Link to="/contact">Liên hệ</Link>
        </div>
      </div>

      <div className="footer-copy">
        © 2026 IronPulse. Dự án mẫu thiết kế giao diện.
      </div>
    </footer>
  );
}
