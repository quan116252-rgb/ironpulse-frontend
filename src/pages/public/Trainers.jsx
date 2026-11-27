
import { useEffect, useState } from "react";
import {
  Dumbbell,
  Award,
  Clock,
  Target,
  Users,
} from "lucide-react";

import { getTrainers } from "../../services/memberService";

export default function Trainers() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getTrainers()
      .then(setList)
      .catch((error) => {
        console.error("Không thể tải danh sách huấn luyện viên:", error);
      });
  }, []);

  return (
    <div className="ipx-trainers">
      {/* HERO */}
      <section className="ipx-trainers-hero">
        <div className="ipx-trainers-hero-overlay" />

        <div className="ipx-trainers-hero-content">
          <span className="ipx-trainers-eyebrow">
            <Dumbbell size={15} />
            IRONPULSE FITNESS CLUB
          </span>

          <h1>
            ĐỘI NGŨ
            <br />
            <span>HUẤN LUYỆN VIÊN</span>
          </h1>

          <p>
            Những người đồng hành tận tâm.
            <br />
            Giúp bạn chinh phục giới hạn và xây dựng phiên bản tốt hơn.
          </p>

          <a href="#ipx-trainer-list" className="ipx-trainers-hero-btn">
            KHÁM PHÁ ĐỘI NGŨ
          </a>
        </div>
      </section>

      {/* INTRO */}
      <section className="ipx-trainers-intro">
        <div>
          <span className="ipx-trainers-label">ĐỘI NGŨ CHUYÊN NGHIỆP</span>
          <h2>
            CHINH PHỤC MỤC TIÊU
            <br />
            <span>CÙNG IRONPULSE</span>
          </h2>
        </div>

        <p>
          Mỗi huấn luyện viên đều mang đến kiến thức, kinh nghiệm
          và sự đồng hành để giúp bạn tập luyện đúng cách,
          an toàn và hiệu quả.
        </p>
      </section>

      {/* TRAINER LIST */}
      <section className="ipx-trainers-section" id="ipx-trainer-list">
        <div className="ipx-trainers-heading">
          <div>
            <span className="ipx-trainers-label">NHỮNG NGƯỜI TRUYỀN CẢM HỨNG</span>
            <h2>GẶP GỠ <span>HUẤN LUYỆN VIÊN</span></h2>
          </div>

          <div className="ipx-trainers-count">
            <Users size={17} />
            {list.length} huấn luyện viên
          </div>
        </div>

        {list.length === 0 ? (
          <div className="ipx-trainers-empty">
            <Dumbbell size={30} />
            <p>Đang tải danh sách huấn luyện viên...</p>
          </div>
        ) : (
          <div className="ipx-trainers-grid">
            {list.map((t, index) => {
              const experience =
                t.experience || t.years || t.experience_years || 5;

              const initial = t.name
                ? t.name.trim().split(" ").pop()[0]
                : "H";

              return (
                <article className="ipx-trainer-card" key={t.id}>
                  <div className="ipx-trainer-image">
                    <div className="ipx-trainer-image-placeholder">
                      <Dumbbell size={42} />
                      <span>{initial}</span>
                    </div>

                    <div className="ipx-trainer-index">
                      HLV {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="ipx-trainer-experience">
                      <Award size={15} />
                      {experience} năm kinh nghiệm
                    </div>
                  </div>

                  <div className="ipx-trainer-info">
                    <span className="ipx-trainer-role">
                      HUẤN LUYỆN VIÊN
                    </span>

                    <h3>{t.name}</h3>

                    <div className="ipx-trainer-specialty">
                      <Target size={16} />
                      <span>{t.specialty || "Huấn luyện thể hình"}</span>
                    </div>

                    <div className="ipx-trainer-divider" />

                    <div className="ipx-trainer-meta">
                      <span>
                        <Clock size={15} />
                        {experience} năm kinh nghiệm
                      </span>

                      <span>
                        <Dumbbell size={15} />
                        Chuyên nghiệp
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* BOTTOM BANNER */}
      <section className="ipx-trainers-cta">
        <div>
          <span>IRONPULSE FITNESS CLUB</span>
          <h2>
            BẠN ĐÃ SẴN SÀNG
            <br />
            <strong>BỨT PHÁ GIỚI HẠN?</strong>
          </h2>
          <p>
            Hãy bắt đầu hành trình tập luyện cùng đội ngũ huấn luyện viên của chúng tôi.
          </p>
        </div>

        <a href="/contact">
          LIÊN HỆ NGAY
        </a>
      </section>
    </div>
  );
}
