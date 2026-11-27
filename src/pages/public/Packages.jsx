
import { useEffect, useState } from "react";
import {
  Check,
  Dumbbell,
  Clock,
  RefreshCw,
} from "lucide-react";

import { getPackages } from "../../services/packageService";
import { formatVND } from "../../data/mockData";

// ==================================================
// CHUYỂN ĐỔI DỮ LIỆU GÓI TẬP TỪ API
// ==================================================

const normalizePackage = (item) => {
  // Lấy danh sách quyền lợi
  let features = item.features ?? item.description ?? [];

  if (typeof features === "string") {
    features = features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(features)) {
    features = [];
  }

  return {
    id: item.id,
    name: item.name || "Gói tập",
    price: Number(item.price) || 0,

    durationMonths: Number(
      item.durationMonths ??
      item.duration_months ??
      1
    ),

    features,
  };
};

// ==================================================
// COMPONENT PACKAGES
// ==================================================

export default function Packages() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // LẤY DANH SÁCH GÓI TẬP MỚI NHẤT TỪ API
  // ==================================================

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPackages();

      // Hỗ trợ cả trường hợp API trả về mảng
      // hoặc dữ liệu phân trang của Django REST Framework
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
          ? response.results
          : [];

      const normalizedData = data.map(normalizePackage);

      setList(normalizedData);
    } catch (err) {
      console.error("Không thể tải danh sách gói tập:", err);

      setError(
        "Không thể tải danh sách gói tập. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // ==================================================
  // GIAO DIỆN
  // ==================================================

  return (
    <div className="ipx-packages">

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="ipx-packages-hero">
        <div className="ipx-packages-hero-overlay" />

        <div className="ipx-packages-hero-content">

          <span className="ipx-packages-eyebrow">
            <Dumbbell size={15} />
            IRONPULSE FITNESS CLUB
          </span>

          <h1>
            CHỌN GÓI TẬP.
            <br />
            <span>VƯỢT GIỚI HẠN.</span>
          </h1>

          <p>
            Đầu tư cho sức khỏe hôm nay.
            <br />
            Xây dựng phiên bản mạnh mẽ hơn của chính bạn.
          </p>

          <a
            href="#ipx-package-list"
            className="ipx-packages-hero-btn"
          >
            KHÁM PHÁ GÓI TẬP
          </a>

        </div>
      </section>

      {/* ==========================================
          DANH SÁCH GÓI TẬP
      ========================================== */}

      <section
        className="ipx-packages-section"
        id="ipx-package-list"
      >

        {/* TIÊU ĐỀ */}

        <div className="ipx-packages-heading">
          <div>

            <span className="ipx-packages-label">
              LỰA CHỌN CỦA BẠN
            </span>

            <h2>
              BẢNG GIÁ <span>GÓI TẬP</span>
            </h2>

            <p>
              Tìm kiếm chương trình phù hợp với mục tiêu luyện tập của bạn.
            </p>

          </div>
        </div>

        {/* ==========================================
            ĐANG TẢI
        ========================================== */}

        {loading && (
          <div className="ipx-packages-empty">
            <Dumbbell size={30} />

            <p>Đang tải danh sách gói tập...</p>
          </div>
        )}

        {/* ==========================================
            LỖI TẢI DỮ LIỆU
        ========================================== */}

        {!loading && error && (
          <div className="ipx-packages-empty">

            <p>{error}</p>

            <button
              type="button"
              onClick={fetchPackages}
              className="ipx-packages-hero-btn"
            >
              <RefreshCw size={15} />
              THỬ LẠI
            </button>

          </div>
        )}

        {/* ==========================================
            KHÔNG CÓ GÓI TẬP
        ========================================== */}

        {!loading && !error && list.length === 0 && (
          <div className="ipx-packages-empty">

            <Dumbbell size={30} />

            <p>Hiện chưa có gói tập nào.</p>

          </div>
        )}

        {/* ==========================================
            HIỂN THỊ DANH SÁCH GÓI TẬP
        ========================================== */}

        {!loading && !error && list.length > 0 && (
          <div className="ipx-packages-grid">

            {list.map((p, i) => (
              <div
                className="ipx-package-card"
                key={p.id}
              >

                {/* GÓI PHỔ BIẾN */}

                {i === 1 && (
                  <div className="ipx-package-popular">
                    PHỔ BIẾN
                  </div>
                )}

                {/* PHẦN ĐẦU CARD */}

                <div className="ipx-package-card-top">

                  <span className="ipx-package-number">
                    GÓI {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="ipx-package-icon">
                    <Dumbbell size={23} />
                  </div>

                </div>

                {/* TÊN GÓI */}

                <h3>{p.name}</h3>

                {/* THỜI HẠN */}

                <div className="ipx-package-duration">

                  <Clock size={15} />

                  Thời hạn {p.durationMonths} tháng

                </div>

                {/* GIÁ GÓI */}

                <div className="ipx-package-price">
                  {formatVND(p.price)}
                </div>

                <div className="ipx-package-divider" />

                {/* QUYỀN LỢI */}

                <div className="ipx-package-features">

                  {p.features.length > 0 ? (
                    p.features.map((feature, index) => (
                      <div key={index}>

                        <Check size={16} />

                        <span>{feature}</span>

                      </div>
                    ))
                  ) : (
                    <div>
                      <Check size={16} />
                      <span>Thông tin quyền lợi đang được cập nhật.</span>
                    </div>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

        {/* ==========================================
            LỢI ÍCH
        ========================================== */}

        <div className="ipx-packages-benefits">

          <div>
            <Dumbbell size={22} />
            <span>Trang thiết bị hiện đại</span>
          </div>

          <div>
            <Clock size={22} />
            <span>Linh hoạt thời gian luyện tập</span>
          </div>

          <div>
            <Check size={22} />
            <span>Thông tin gói tập minh bạch</span>
          </div>

        </div>

      </section>

    </div>
  );
}
