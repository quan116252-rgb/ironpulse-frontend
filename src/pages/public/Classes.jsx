
import { useEffect, useState } from "react";
import {
  Clock,
  User,
  CalendarDays,
  Dumbbell,
  ArrowRight,
} from "lucide-react";
import Card from "../../components/Card";
import { getClasses } from "../../services/memberService";

export default function Classes() {
  const [list, setList] = useState([]);

  useEffect(() => {
    getClasses().then(setList);
  }, []);

  return (
    <div className="ipx-classes-page">

      {/* BANNER ĐẦU TRANG */}
      <section className="ipx-classes-hero">
        <div className="ipx-classes-hero-bg" />
        <div className="ipx-classes-hero-overlay" />

        <div className="ipx-classes-hero-content">
          <div className="ipx-classes-eyebrow">
            <span />
            IRONPULSE FITNESS CLUB
            <span />
          </div>

          <h1>
            CHINH PHỤC
            <br />
            GIỚI HẠN <strong>BẢN THÂN.</strong>
          </h1>

          <p>
            Khám phá các lớp học đa dạng, rèn luyện thể lực,
            nâng cao sức bền và phát triển vóc dáng cùng IronPulse.
          </p>

          <a href="#danh-sach-lop" className="ipx-classes-button">
            Khám phá lớp học
            <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* DANH SÁCH LỚP HỌC */}
      <section className="ipx-classes-list-section" id="danh-sach-lop">
        <div className="ipx-classes-container">

          <div className="ipx-classes-heading">
            <div>
              <div className="ipx-classes-eyebrow">
                <span />
                LỊCH TẬP LUYỆN
                <span />
              </div>

              <h2>
                CÁC LỚP HỌC <strong>IRONPULSE.</strong>
              </h2>

              <p>
                Lựa chọn chương trình tập luyện phù hợp với mục tiêu của bạn.
              </p>
            </div>

            <div className="ipx-classes-total">
              <Dumbbell size={22} />
              <div>
                <strong>{list.length}</strong>
                <span>Lớp học hiện có</span>
              </div>
            </div>
          </div>

          <div className="ipx-classes-grid">
            {list.map((c) => (
              <div className="ipx-class-item" key={c.id}>
                <Card
                  title={c.name}
                  subtitle={`Tối đa ${
                    c.slots ||
                    c.capacity ||
                    c.max_participants ||
                    20
                  } người`}
                >
                  <div className="ipx-class-content">
                    <div className="ipx-class-icon">
                      <Dumbbell size={27} />
                    </div>

                    <div className="ipx-class-info">
                      <div className="ipx-class-info-row">
                        <User size={17} />
                        <span>
                          {c.trainer || "Chưa cập nhật HLV"}
                        </span>
                      </div>

                      <div className="ipx-class-info-row">
                        <CalendarDays size={17} />
                        <span>
                          {c.day || c.schedule || "Thứ 2, 4, 6"}
                        </span>
                      </div>

                      {c.time && (
                        <div className="ipx-class-info-row">
                          <Clock size={17} />
                          <span>{c.time}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ipx-class-bottom">
                    <span>IRONPULSE TRAINING</span>
                    <Dumbbell size={17} />
                  </div>
                </Card>
              </div>
            ))}
          </div>

          {list.length === 0 && (
            <div className="ipx-classes-empty">
              <Dumbbell size={38} />
              <h3>Chưa có lớp học nào</h3>
              <p>
                Các lớp học sẽ được cập nhật tại đây.
                Vui lòng quay lại sau nhé!
              </p>
            </div>
          )}

        </div>
      </section>

      {/* BANNER CUỐI TRANG */}
      <section className="ipx-classes-cta">
        <div className="ipx-classes-cta-content">
          <div className="ipx-classes-eyebrow">
            <span />
            BẮT ĐẦU NGAY HÔM NAY
            <span />
          </div>

          <h2>
            MỖI BUỔI TẬP
            <br />
            LÀ MỘT <strong>BƯỚC TIẾN.</strong>
          </h2>

          <p>
            Kiên trì hôm nay, mạnh mẽ hơn ngày mai.
          </p>
        </div>
      </section>

    </div>
  );
}
