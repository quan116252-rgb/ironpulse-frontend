
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dumbbell,
  CalendarCheck,
  Users,
  HeartPulse,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=2000&q=90",
    alt: "Vận động viên tập luyện với tạ",
  },
  {
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=2000&q=90",
    alt: "Người tập thể hình",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=2000&q=90",
    alt: "Tập luyện thể lực",
  },
  {
    image:
      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=2000&q=90",
    alt: "Không gian tập luyện",
  },
];

const HIGHLIGHTS = [
  {
    icon: Dumbbell,
    title: "Thiết bị hiện đại",
    text: "Hơn 200 máy tập nhập khẩu, khu tạ tự do rộng rãi.",
  },
  {
    icon: CalendarCheck,
    title: "Lớp học đa dạng",
    text: "Yoga, Zumba, Boxing, Strength... lịch linh hoạt cả ngày.",
  },
  {
    icon: Users,
    title: "HLV chuyên nghiệp",
    text: "Đội ngũ huấn luyện viên có chuyên môn, đồng hành cùng bạn.",
  },
  {
    icon: HeartPulse,
    title: "Theo dõi sức khỏe",
    text: "Đo InBody, theo dõi tiến độ tập luyện trên tài khoản.",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Kiểm tra trạng thái đăng nhập
  // Token được lưu trong localStorage với key gym_token
  const isLoggedIn = Boolean(localStorage.getItem("gym_token"));

  // Tự động chuyển ảnh sau mỗi 5 giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const previousSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + SLIDES.length) % SLIDES.length
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="ipx-home">
      {/* BANNER TRANG CHỦ */}
      <section className="ipx-hero">
        {/* HÌNH NỀN TỰ ĐỘNG THAY ĐỔI */}
        <div className="ipx-hero-background">
          {SLIDES.map((slide, index) => (
            <div
              key={slide.image}
              className={`ipx-hero-image ${
                currentSlide === index ? "active" : ""
              }`}
              style={{
                backgroundImage: `url("${slide.image}")`,
              }}
              role="img"
              aria-label={slide.alt}
            />
          ))}
        </div>

        {/* LỚP PHỦ TỐI */}
        <div className="ipx-hero-shade" />

        {/* NỘI DUNG CỐ ĐỊNH */}
        <div className="ipx-hero-container">
          <div className="ipx-hero-copy">
            <div className="ipx-eyebrow">
              <span />
              I R O N P U L S E
              <span />
            </div>

            <h1>
              TẬP LUYỆN
              <br />
              BỨT PHÁ.
              <br />
              SỐNG <strong>MẠNH MẼ.</strong>
            </h1>

            <h2>Thể hình cao cấp. Kết quả thực chất.</h2>

            <p>
              Gia nhập IronPulse – nơi kỷ luật tạo nên sức mạnh,
              nỗ lực tạo nên thành công và mỗi buổi tập đưa bạn
              đến gần hơn với phiên bản tốt nhất của chính mình.
            </p>

            <div className="ipx-hero-buttons">
              <Link to="/packages" className="ipx-button-primary">
                Xem gói tập
                <ArrowRight size={17} />
              </Link>

              <Link to="/classes" className="ipx-button-tour">
                <span className="ipx-play-icon">▶</span>
                Khám phá lớp tập
              </Link>
            </div>
          </div>
        </div>

        {/* NÚT CHUYỂN ẢNH */}
        <div className="ipx-slider-controls">
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Ảnh trước"
          >
            <ChevronLeft size={19} />
          </button>

          <div className="ipx-slider-dots">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.image}
                type="button"
                className={currentSlide === index ? "active" : ""}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Chuyển đến ảnh ${index + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight size={19} />
          </button>
        </div>

        {/* 4 TIỆN ÍCH */}
        <div className="ipx-feature-container">
          <div className="ipx-feature-grid">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="ipx-feature-card">
                <div className="ipx-feature-icon">
                  <Icon size={32} />
                </div>

                <div className="ipx-feature-text">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHƯƠNG TRÌNH TẬP LUYỆN */}
      <section className="ipx-programs">
        <div className="ipx-program-container">
          <div className="ipx-program-heading">
            <div className="ipx-program-title">
              <div className="ipx-section-eyebrow">
                <span />
                CHƯƠNG TRÌNH TẬP LUYỆN
                <span />
              </div>

              <h2>
                THỂ HÌNH CHO MỌI <strong>MỤC TIÊU.</strong>
              </h2>
            </div>

            <Link to="/classes" className="ipx-program-more">
              Khám phá tất cả
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="ipx-program-grid">
            <Link to="/classes" className="ipx-program-card">
              <img
                src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=85"
                alt="Tập luyện sức mạnh"
              />
              <div className="ipx-program-overlay" />
              <span className="ipx-program-number">01</span>
              <div className="ipx-program-info">
                <h3>TẬP LUYỆN SỨC MẠNH</h3>
                <p>Phát triển cơ bắp và xây dựng vóc dáng khỏe đẹp.</p>
                <span className="ipx-program-link">
                  Tìm hiểu thêm <ArrowRight size={15} />
                </span>
              </div>
            </Link>

            <Link to="/classes" className="ipx-program-card">
              <img
                src="https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=900&q=85"
                alt="Rèn luyện thể lực"
              />
              <div className="ipx-program-overlay" />
              <span className="ipx-program-number">02</span>
              <div className="ipx-program-info">
                <h3>RÈN LUYỆN THỂ LỰC</h3>
                <p>Cải thiện sức bền, tim mạch và khả năng vận động.</p>
                <span className="ipx-program-link">
                  Tìm hiểu thêm <ArrowRight size={15} />
                </span>
              </div>
            </Link>

            <Link to="/classes" className="ipx-program-card">
              <img
                src="https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=900&q=85"
                alt="Boxing và HIIT"
              />
              <div className="ipx-program-overlay" />
              <span className="ipx-program-number">03</span>
              <div className="ipx-program-info">
                <h3>BOXING & HIIT</h3>
                <p>Giải phóng năng lượng, tăng tốc độ và sức bền.</p>
                <span className="ipx-program-link">
                  Tìm hiểu thêm <ArrowRight size={15} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* KÊU GỌI HÀNH ĐỘNG */}
      <section className="ipx-join">
        <div className="ipx-join-content">
          <div className="ipx-section-eyebrow">
            <span />
            BẮT ĐẦU HÀNH TRÌNH CỦA BẠN
            <span />
          </div>

          <h2>
            HÔM NAY MẠNH HƠN
            <br />
            <strong>HÔM QUA.</strong>
          </h2>

          <p>
            {isLoggedIn
              ? "Tiếp tục hành trình chinh phục mục tiêu cùng IronPulse!"
              : "Hãy bắt đầu thay đổi bản thân cùng IronPulse ngay hôm nay."}
          </p>

          {isLoggedIn ? (
            <Link to="/classes" className="ipx-button-primary">
              Khám phá lớp tập
              <ArrowRight size={17} />
            </Link>
          ) : (
            <Link to="/register" className="ipx-button-primary">
              Đăng ký ngay
              <ArrowRight size={17} />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
