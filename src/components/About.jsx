
import { Link } from "react-router-dom";
import {
  Dumbbell,
  Target,
  HeartPulse,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Zap,
} from "lucide-react";

const VALUES = [
  {
    icon: Target,
    title: "Tập trung mục tiêu",
    text: "Mỗi hội viên có mục tiêu và lộ trình tập luyện phù hợp với thể trạng.",
  },
  {
    icon: HeartPulse,
    title: "Sức khỏe là ưu tiên",
    text: "Chúng tôi hướng đến một cơ thể khỏe mạnh, cân bằng và bền bỉ.",
  },
  {
    icon: Users,
    title: "Đồng hành cùng nhau",
    text: "Huấn luyện viên và cộng đồng luôn hỗ trợ bạn trên hành trình tập luyện.",
  },
  {
    icon: Trophy,
    title: "Không ngừng tiến bộ",
    text: "Từng buổi tập là một bước tiến để bạn trở thành phiên bản tốt hơn.",
  },
];

const BENEFITS = [
  "Không gian tập luyện hiện đại",
  "Trang thiết bị đa dạng",
  "Đội ngũ huấn luyện viên chuyên nghiệp",
  "Nhiều lớp học phù hợp với từng mục tiêu",
  "Lộ trình tập luyện linh hoạt",
];

export default function About() {
  return (
    <div className="ipx-about-page">
      {/* BANNER GIỚI THIỆU */}
      <section className="ipx-about-hero">
        <div className="ipx-about-hero-bg" />

        <div className="ipx-about-hero-overlay" />

        <div className="ipx-about-hero-content">
          <div className="ipx-section-eyebrow">
            <span />
            CÂU CHUYỆN IRONPULSE
            <span />
          </div>

          <h1>
            KHÔNG CHỈ LÀ
            <br />
            PHÒNG TẬP.
            <br />
            ĐÓ LÀ <strong>PHONG CÁCH SỐNG.</strong>
          </h1>

          <p>
            IronPulse là nơi sức mạnh được xây dựng bằng kỷ luật,
            sự kiên trì và tinh thần không ngừng tiến về phía trước.
          </p>

          <Link to="/packages" className="ipx-button-primary">
            Khám phá gói tập
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* GIỚI THIỆU CHUNG */}
      <section className="ipx-about-intro">
        <div className="ipx-about-intro-container">
          <div className="ipx-about-intro-image">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=90"
              alt="Không gian phòng tập IronPulse"
            />
            <div className="ipx-about-image-label">
              <Dumbbell size={23} />
              <span>IRONPULSE FITNESS CLUB</span>
            </div>
          </div>

          <div className="ipx-about-intro-content">
            <div className="ipx-section-eyebrow ipx-about-left-eyebrow">
              <span />
              CHÚNG TÔI LÀ AI?
            </div>

            <h2>
              XÂY DỰNG SỨC MẠNH.
              <br />
              <strong>THAY ĐỔI CUỘC SỐNG.</strong>
            </h2>

            <p>
              IronPulse Fitness Club được xây dựng với mong muốn
              mang đến một môi trường tập luyện hiện đại, năng động
              và truyền cảm hứng cho tất cả mọi người.
            </p>

            <p>
              Chúng tôi tin rằng thể hình không chỉ là việc nâng tạ
              hay thay đổi vóc dáng. Đó còn là hành trình rèn luyện
              ý chí, xây dựng thói quen tích cực và chinh phục giới
              hạn của chính mình.
            </p>

            <div className="ipx-about-benefits">
              {BENEFITS.map((benefit) => (
                <div key={benefit}>
                  <CheckCircle2 size={17} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <Link to="/trainers" className="ipx-button-primary">
              Gặp gỡ đội ngũ huấn luyện viên
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* THỐNG KÊ */}
      <section className="ipx-about-stats">
        <div className="ipx-about-stats-container">
          <div className="ipx-about-stat">
            <strong>200+</strong>
            <span>Thiết bị tập luyện</span>
          </div>

          <div className="ipx-about-stat">
            <strong>20+</strong>
            <span>Lớp học đa dạng</span>
          </div>

          <div className="ipx-about-stat">
            <strong>100%</strong>
            <span>Tinh thần đồng hành</span>
          </div>

          <div className="ipx-about-stat">
            <strong>24/7</strong>
            <span>Truy cập tài khoản trực tuyến</span>
          </div>
        </div>
      </section>

      {/* SỨ MỆNH VÀ TẦM NHÌN */}
      <section className="ipx-about-mission">
        <div className="ipx-about-mission-heading">
          <div className="ipx-section-eyebrow">
            <span />
            ĐIỀU TẠO NÊN IRONPULSE
            <span />
          </div>

          <h2>
            MỤC TIÊU CỦA CHÚNG TÔI.
            <br />
            <strong>GIÁ TRỊ CỦA BẠN.</strong>
          </h2>
        </div>

        <div className="ipx-about-mission-grid">
          <article className="ipx-about-mission-card">
            <div className="ipx-about-mission-icon">
              <Target size={30} />
            </div>
            <span>01 / SỨ MỆNH</span>
            <h3>Truyền cảm hứng vận động</h3>
            <p>
              Tạo điều kiện để mọi người tiếp cận môi trường tập
              luyện chất lượng và xây dựng lối sống khỏe mạnh.
            </p>
          </article>

          <article className="ipx-about-mission-card">
            <div className="ipx-about-mission-icon">
              <Zap size={30} />
            </div>
            <span>02 / TẦM NHÌN</span>
            <h3>Trở thành phiên bản tốt hơn</h3>
            <p>
              Không ngừng cải thiện chất lượng dịch vụ, không gian
              và trải nghiệm tập luyện của mỗi hội viên.
            </p>
          </article>

          <article className="ipx-about-mission-card">
            <div className="ipx-about-mission-icon">
              <HeartPulse size={30} />
            </div>
            <span>03 / GIÁ TRỊ</span>
            <h3>Kỷ luật tạo nên sức mạnh</h3>
            <p>
              Đề cao sự kiên trì, tinh thần tích cực và nỗ lực
              trong từng bước tiến của mỗi người.
            </p>
          </article>
        </div>
      </section>

      {/* GIÁ TRỊ CỐT LÕI */}
      <section className="ipx-about-values">
        <div className="ipx-about-values-heading">
          <div className="ipx-section-eyebrow">
            <span />
            TINH THẦN IRONPULSE
            <span />
          </div>

          <h2>
            TẬP LUYỆN CÓ MỤC ĐÍCH.
            <br />
            <strong>PHÁT TRIỂN BỀN VỮNG.</strong>
          </h2>

          <p>
            Những giá trị tạo nên môi trường tập luyện mà chúng tôi
            luôn hướng đến.
          </p>
        </div>

        <div className="ipx-about-values-grid">
          {VALUES.map(({ icon: Icon, title, text }, index) => (
            <article className="ipx-about-value-card" key={title}>
              <div className="ipx-about-value-top">
                <Icon size={30} />
                <span>0{index + 1}</span>
              </div>

              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* KÊU GỌI THAM GIA */}
      <section className="ipx-about-cta">
        <div className="ipx-about-cta-content">
          <div className="ipx-section-eyebrow">
            <span />
            ĐÃ ĐẾN LÚC BẮT ĐẦU
            <span />
          </div>

          <h2>
            SỨC MẠNH KHÔNG ĐẾN
            <br />
            TỪ SỰ CHỜ ĐỢI.
            <br />
            <strong>NÓ ĐẾN TỪ HÀNH ĐỘNG.</strong>
          </h2>

          <p>
            Hãy bắt đầu hành trình thay đổi bản thân cùng IronPulse.
          </p>

          <Link to="/register" className="ipx-button-primary">
            Trở thành hội viên
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}
