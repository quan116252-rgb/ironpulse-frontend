
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useAuth } from "../../context/AuthContext";

import {
  Activity,
  Scale,
  Ruler,
  HeartPulse,
  TrendingUp,
  CalendarDays,
  Check,
  Save,
  Target,
  Info,
  Dumbbell,
} from "lucide-react";

const bmiLabel = (bmi) => {
  if (bmi <= 0 || !isFinite(bmi)) return "--";
  if (bmi < 18.5) return "Thiếu cân";
  if (bmi < 23) return "Bình thường";
  if (bmi < 25) return "Thừa cân nhẹ";
  return "Thừa cân";
};

const bmiColor = (bmi) => {
  if (bmi <= 0 || !isFinite(bmi)) return "#888";
  if (bmi < 18.5) return "#60a5fa";
  if (bmi < 23) return "#36c991";
  if (bmi < 25) return "#f59e0b";
  return "#ef4444";
};

export default function BodyMetrics() {
  const { user } = useAuth();

  const [h, setH] = useState("0");
  const [w, setW] = useState("0");
  const [chartData, setChartData] = useState([]);
  const [hasChanged, setHasChanged] = useState(false);
  const [loading, setLoading] = useState(true);

  // ==================== ĐỌC DỮ LIỆU ====================

  useEffect(() => {
    setLoading(true);

    try {
      if (user?.email) {
        const storageKey = `bodyMetrics_${user.email}`;
        const rawData = localStorage.getItem(storageKey);

        if (rawData) {
          const savedData = JSON.parse(rawData);

          if (savedData) {
            setH(savedData.height || "0");
            setW(savedData.weight || "0");
            setChartData(
              Array.isArray(savedData.chart)
                ? savedData.chart
                : []
            );
          }
        } else {
          setH("0");
          setW("0");
          setChartData([]);
        }
      } else {
        setH("0");
        setW("0");
        setChartData([]);
      }

      setHasChanged(false);
    } catch (error) {
      console.error("Lỗi đọc dữ liệu từ localStorage:", error);

      if (user?.email) {
        localStorage.removeItem(
          `bodyMetrics_${user.email}`
        );
      }

      setH("0");
      setW("0");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ==================== TÍNH BMI ====================

  const heightNum = parseFloat(h) || 0;
  const weightNum = parseFloat(w) || 0;

  const bmi =
    heightNum > 0
      ? weightNum / ((heightNum / 100) ** 2)
      : 0;

  const currentBmi = bmi > 0 ? bmi.toFixed(1) : "--";
  const currentBmiColor = bmiColor(bmi);

  // ==================== XỬ LÝ INPUT ====================

  const handleChangeH = (e) => {
    const val = e.target.value;

    const newH =
      h === "0" && val.length > 1
        ? val.replace(/^0+/, "")
        : val === ""
        ? "0"
        : val;

    setH(newH);
    setHasChanged(true);
  };

  const handleChangeW = (e) => {
    const val = e.target.value;

    const newW =
      w === "0" && val.length > 1
        ? val.replace(/^0+/, "")
        : val === ""
        ? "0"
        : val;

    setW(newW);
    setHasChanged(true);
  };

  // ==================== XÁC NHẬN CHỈ SỐ ====================

  const handleConfirm = () => {
    if (heightNum <= 0 || weightNum <= 0) {
      alert("Vui lòng nhập chiều cao và cân nặng lớn hơn 0!");
      return;
    }

    if (heightNum > 250 || weightNum > 500) {
      alert("Vui lòng kiểm tra lại chiều cao hoặc cân nặng!");
      return;
    }

    const today = new Date().toLocaleDateString(
      "vi-VN",
      {
        day: "2-digit",
        month: "2-digit",
      }
    );

    const newPoint = {
      date: today,
      weight: weightNum,
      bmi: Number(bmi.toFixed(1)),
    };

    const updatedChart = [...chartData, newPoint];

    try {
      const storageKey = `bodyMetrics_${user.email}`;

      localStorage.setItem(
        storageKey,
        JSON.stringify({
          height: h,
          weight: w,
          chart: updatedChart,
        })
      );

      setChartData(updatedChart);
      setHasChanged(false);

      alert("Đã cập nhật chỉ số cơ thể thành công!");
    } catch (error) {
      console.error("Lỗi lưu localStorage:", error);
      alert("Không thể lưu dữ liệu. Vui lòng thử lại!");
    }
  };

  // ==================== GIAO DIỆN LOADING ====================

  if (loading) {
    return (
      <div className="bm-loading">
        <div className="bm-spinner"></div>
        <p>Đang tải thông tin chỉ số...</p>

        <style>{`
          .bm-loading {
            min-height: 350px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 15px;
            color: #999;
            background: #101010;
            border-radius: 16px;
          }

          .bm-spinner {
            width: 38px;
            height: 38px;
            border: 3px solid #333;
            border-top-color: #e31824;
            border-radius: 50%;
            animation: bm-spin .8s linear infinite;
          }

          @keyframes bm-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bm-loading">
        Vui lòng đăng nhập để xem chỉ số cơ thể.
      </div>
    );
  }

  // ==================== GIAO DIỆN CHÍNH ====================

  return (
    <div className="body-metrics-page">
      <style>{`
        .body-metrics-page {
          width: 100%;
          min-height: 100%;
          padding: 26px;
          color: #fff;
          background: #101010;
          font-family: inherit;
          box-sizing: border-box;
        }

        .body-metrics-page * {
          box-sizing: border-box;
        }

        .bm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }

        .bm-heading {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .bm-heading-icon {
          width: 53px;
          height: 53px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff3945;
          background: rgba(227,24,36,.13);
          border: 1px solid rgba(227,24,36,.25);
          border-radius: 15px;
        }

        .bm-heading h1 {
          margin: 0 0 6px;
          color: #fff;
          font-size: 27px;
          font-weight: 850;
          letter-spacing: -.5px;
        }

        .bm-heading p {
          margin: 0;
          color: #888;
          font-size: 13px;
        }

        .bm-header-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          color: #ff626a;
          background: rgba(227,24,36,.1);
          border: 1px solid rgba(227,24,36,.22);
          border-radius: 30px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .bm-stats {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 16px;
          margin-bottom: 23px;
        }

        .bm-stat {
          display: flex;
          align-items: center;
          gap: 15px;
          min-width: 0;
          padding: 21px;
          background: linear-gradient(145deg,#1d1d1d,#131313);
          border: 1px solid #2d2d2d;
          border-radius: 15px;
          transition: .25s;
        }

        .bm-stat:hover {
          border-color: #92252b;
          transform: translateY(-3px);
        }

        .bm-stat-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff4650;
          background: rgba(227,24,36,.13);
          border-radius: 12px;
        }

        .bm-stat span {
          display: block;
          color: #858585;
          font-size: 12px;
          margin-bottom: 7px;
        }

        .bm-stat strong {
          color: #fff;
          font-size: 22px;
          font-weight: 850;
        }

        .bm-stat small {
          color: #888;
          font-size: 11px;
          margin-left: 4px;
        }

        .bm-main-grid {
          display: grid;
          grid-template-columns: minmax(0,.85fr) minmax(0,1.35fr);
          gap: 20px;
          align-items: stretch;
          margin-bottom: 20px;
        }

        .bm-panel {
          min-width: 0;
          padding: 23px;
          background: #171717;
          border: 1px solid #2d2d2d;
          border-radius: 16px;
        }

        .bm-panel-heading {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 22px;
        }

        .bm-panel-heading svg {
          color: #ff4650;
        }

        .bm-panel-heading h3 {
          margin: 0;
          color: #fff;
          font-size: 16px;
          font-weight: 800;
        }

        .bm-panel-heading p {
          margin: 5px 0 0;
          color: #858585;
          font-size: 11px;
        }

        .bm-form {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .bm-field label {
          display: block;
          margin-bottom: 9px;
          color: #c8c8c8;
          font-size: 12px;
          font-weight: 750;
        }

        .bm-input-wrap {
          position: relative;
        }

        .bm-input-wrap svg {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          color: #777;
          pointer-events: none;
        }

        .bm-input-wrap input {
          width: 100%;
          height: 47px;
          padding: 0 48px 0 43px;
          color: #fff;
          background: #222;
          border: 1px solid #3a3a3a;
          border-radius: 10px;
          outline: none;
          font-size: 14px;
          transition: .2s;
        }

        .bm-input-wrap input:focus {
          border-color: #e31824;
          box-shadow: 0 0 0 3px rgba(227,24,36,.1);
        }

        .bm-input-wrap input::-webkit-inner-spin-button,
        .bm-input-wrap input::-webkit-outer-spin-button {
          opacity: 1;
        }

        .bm-input-unit {
          position: absolute;
          top: 50%;
          right: 14px;
          transform: translateY(-50%);
          color: #888;
          font-size: 11px;
        }

        .bm-bmi-result {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px;
          margin-top: 22px;
          background: linear-gradient(110deg,#291719,#1c1718);
          border: 1px solid rgba(227,24,36,.25);
          border-radius: 13px;
        }

        .bm-bmi-label {
          margin-bottom: 6px;
          color: #ff6971;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .bm-bmi-value {
          color: #fff;
          font-size: 37px;
          font-weight: 900;
          line-height: 1;
        }

        .bm-bmi-status {
          padding: 8px 12px;
          border-radius: 25px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .bm-bmi-scale {
          margin-top: 21px;
        }

        .bm-scale-title {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 11px;
          color: #888;
          font-size: 11px;
        }

        .bm-scale-bar {
          display: flex;
          width: 100%;
          height: 9px;
          overflow: hidden;
          border-radius: 20px;
          background: #333;
        }

        .bm-scale-bar span:nth-child(1) {
          width: 32%;
          background: #60a5fa;
        }

        .bm-scale-bar span:nth-child(2) {
          width: 27%;
          background: #36c991;
        }

        .bm-scale-bar span:nth-child(3) {
          width: 15%;
          background: #f59e0b;
        }

        .bm-scale-bar span:nth-child(4) {
          flex: 1;
          background: #ef4444;
        }

        .bm-scale-legend {
          display: flex;
          justify-content: space-between;
          gap: 5px;
          margin-top: 9px;
          color: #888;
          font-size: 9px;
        }

        .bm-change-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px;
          margin-top: 19px;
          background: rgba(227,24,36,.09);
          border: 1px solid rgba(227,24,36,.25);
          border-radius: 10px;
        }

        .bm-change-box p {
          margin: 0;
          color: #ffb4b8;
          font-size: 11px;
          line-height: 1.5;
        }

        .bm-confirm-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          flex-shrink: 0;
          padding: 9px 13px;
          color: #fff;
          background: #e31824;
          border: none;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }

        .bm-confirm-button:hover {
          background: #c91520;
        }

        .bm-chart-panel {
          display: flex;
          flex-direction: column;
        }

        .bm-chart-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
        }

        .bm-chart-badge {
          padding: 6px 10px;
          color: #ff6a73;
          background: rgba(227,24,36,.1);
          border: 1px solid rgba(227,24,36,.2);
          border-radius: 20px;
          font-size: 10px;
          font-weight: 750;
        }

        .bm-chart-box {
          width: 100%;
          height: 300px;
          min-height: 260px;
        }

        .bm-empty-chart {
          flex: 1;
          min-height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #858585;
          text-align: center;
          font-size: 12px;
        }

        .bm-empty-chart-icon {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ff4650;
          background: rgba(227,24,36,.1);
          border-radius: 16px;
        }

        .bm-history {
          background: #171717;
          border: 1px solid #2d2d2d;
          border-radius: 16px;
          overflow: hidden;
        }

        .bm-history-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 23px;
          border-bottom: 1px solid #2d2d2d;
        }

        .bm-history-header h3 {
          margin: 0;
          color: #fff;
          font-size: 15px;
          font-weight: 800;
        }

        .bm-history-count {
          padding: 6px 10px;
          color: #ccc;
          background: #292929;
          border: 1px solid #383838;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 750;
        }

        .bm-history-table-wrap {
          overflow-x: auto;
        }

        .bm-history-table {
          width: 100%;
          min-width: 480px;
          border-collapse: collapse;
        }

        .bm-history-table th {
          padding: 13px 20px;
          color: #888;
          background: #1e1e1e;
          font-size: 10px;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: .6px;
        }

        .bm-history-table td {
          padding: 15px 20px;
          color: #ccc;
          border-top: 1px solid #292929;
          font-size: 12px;
        }

        .bm-history-table tbody tr:hover {
          background: #202020;
        }

        .bm-history-table td strong {
          color: #fff;
        }

        .bm-history-bmi {
          font-weight: 800;
        }

        .bm-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 16px;
          margin-top: 18px;
          color: #999;
          background: #191919;
          border: 1px solid #2c2c2c;
          border-radius: 11px;
          font-size: 11px;
          line-height: 1.6;
        }

        .bm-note svg {
          flex-shrink: 0;
          color: #ff4650;
        }

        @media (max-width: 1000px) {
          .bm-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .body-metrics-page {
            padding: 17px 13px;
          }

          .bm-stats {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .bm-heading h1 {
            font-size: 22px;
          }

          .bm-header-tag {
            font-size: 9px;
          }

          .bm-panel {
            padding: 17px;
          }

          .bm-chart-box {
            height: 260px;
          }

          .bm-change-box {
            align-items: flex-start;
            flex-direction: column;
          }

          .bm-confirm-button {
            width: 100%;
          }

          .bm-scale-legend {
            font-size: 8px;
          }
        }
      `}</style>

      {/* HEADER */}
      <div className="bm-header">
        <div className="bm-heading">
          <div className="bm-heading-icon">
            <Activity size={26} />
          </div>

          <div>
            <h1>Chỉ số cơ thể</h1>
            <p>
              Theo dõi sức khỏe và tiến trình tập luyện của bạn
            </p>
          </div>
        </div>

        <div className="bm-header-tag">
          <HeartPulse size={15} />
          BODY PERFORMANCE
        </div>
      </div>

      {/* STATISTICS */}
      <div className="bm-stats">
        <div className="bm-stat">
          <div className="bm-stat-icon">
            <Ruler size={22} />
          </div>

          <div>
            <span>Chiều cao hiện tại</span>
            <strong>{heightNum > 0 ? heightNum : "--"}</strong>
            <small>cm</small>
          </div>
        </div>

        <div className="bm-stat">
          <div className="bm-stat-icon">
            <Scale size={22} />
          </div>

          <div>
            <span>Cân nặng hiện tại</span>
            <strong>{weightNum > 0 ? weightNum : "--"}</strong>
            <small>kg</small>
          </div>
        </div>

        <div className="bm-stat">
          <div className="bm-stat-icon">
            <HeartPulse size={22} />
          </div>

          <div>
            <span>Chỉ số BMI</span>
            <strong style={{ color: currentBmiColor }}>
              {currentBmi}
            </strong>
            <small>{bmi > 0 ? bmiLabel(bmi) : ""}</small>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="bm-main-grid">

        {/* BMI CALCULATOR */}
        <div className="bm-panel">
          <div className="bm-panel-heading">
            <Target size={21} />
            <div>
              <h3>Tính chỉ số BMI</h3>
              <p>Nhập thông số cơ thể của bạn</p>
            </div>
          </div>

          <div className="bm-form">
            <div className="bm-field">
              <label>Chiều cao (cm)</label>

              <div className="bm-input-wrap">
                <Ruler size={17} />

                <input
                  type="number"
                  min="1"
                  max="250"
                  step="0.1"
                  value={h}
                  onChange={handleChangeH}
                  onFocus={() => {
                    if (h === "0") setH("");
                  }}
                  onBlur={() => {
                    if (h === "") setH("0");
                  }}
                />

                <span className="bm-input-unit">CM</span>
              </div>
            </div>

            <div className="bm-field">
              <label>Cân nặng (kg)</label>

              <div className="bm-input-wrap">
                <Scale size={17} />

                <input
                  type="number"
                  min="1"
                  max="500"
                  step="0.1"
                  value={w}
                  onChange={handleChangeW}
                  onFocus={() => {
                    if (w === "0") setW("");
                  }}
                  onBlur={() => {
                    if (w === "") setW("0");
                  }}
                />

                <span className="bm-input-unit">KG</span>
              </div>
            </div>
          </div>

          {/* BMI RESULT */}
          <div className="bm-bmi-result">
            <div>
              <div className="bm-bmi-label">
                BODY MASS INDEX
              </div>

              <div className="bm-bmi-value">
                {currentBmi}
              </div>
            </div>

            <span
              className="bm-bmi-status"
              style={{
                color: currentBmiColor,
                background: `${currentBmiColor}18`,
                border: `1px solid ${currentBmiColor}55`,
              }}
            >
              {bmiLabel(bmi)}
            </span>
          </div>

          {/* BMI SCALE */}
          <div className="bm-bmi-scale">
            <div className="bm-scale-title">
              <span>Phân loại chỉ số BMI</span>
              <span>Tham khảo</span>
            </div>

            <div className="bm-scale-bar">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="bm-scale-legend">
              <span>Thiếu cân</span>
              <span>Bình thường</span>
              <span>Thừa cân nhẹ</span>
              <span>Thừa cân</span>
            </div>
          </div>

          {/* CONFIRM BUTTON */}
          {hasChanged && (
            <div className="bm-change-box">
              <p>
                Bạn vừa thay đổi chỉ số cơ thể.
                Hãy xác nhận để lưu và cập nhật lịch sử.
              </p>

              <button
                type="button"
                className="bm-confirm-button"
                onClick={handleConfirm}
              >
                <Save size={15} />
                Xác nhận
              </button>
            </div>
          )}
        </div>

        {/* WEIGHT CHART */}
        <div className="bm-panel bm-chart-panel">
          <div className="bm-chart-heading">
            <div className="bm-panel-heading" style={{ margin: 0 }}>
              <TrendingUp size={21} />

              <div>
                <h3>Tiến trình cân nặng</h3>
                <p>Theo dõi sự thay đổi theo thời gian</p>
              </div>
            </div>

            <span className="bm-chart-badge">
              KG
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="bm-empty-chart">
              <div className="bm-empty-chart-icon">
                <Activity size={28} />
              </div>

              <strong style={{ color: "#ddd" }}>
                Chưa có dữ liệu biểu đồ
              </strong>

              <span>
                Nhập chiều cao, cân nặng và xác nhận để bắt đầu theo dõi.
              </span>
            </div>
          ) : (
            <div className="bm-chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    stroke="#303030"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    stroke="#777"
                    tick={{ fill: "#999", fontSize: 11 }}
                    axisLine={{ stroke: "#444" }}
                    tickLine={false}
                  />

                  <YAxis
                    domain={["dataMin - 2", "dataMax + 2"]}
                    stroke="#777"
                    tick={{ fill: "#999", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      background: "#222",
                      border: "1px solid #444",
                      borderRadius: "10px",
                      color: "#fff",
                    }}
                    labelStyle={{
                      color: "#ff626a",
                      marginBottom: "5px",
                    }}
                    formatter={(value) => [
                      `${value} kg`,
                      "Cân nặng",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#e31824"
                    strokeWidth={3}
                    name="Cân nặng"
                    dot={{
                      r: 5,
                      fill: "#e31824",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#ff3945",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* HISTORY TABLE */}
      <div className="bm-history">
        <div className="bm-history-header">
          <div className="bm-panel-heading" style={{ margin: 0 }}>
            <CalendarDays size={20} />

            <div>
              <h3>Lịch sử chỉ số cơ thể</h3>
            </div>
          </div>

          <span className="bm-history-count">
            {chartData.length} LẦN CẬP NHẬT
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="bm-empty-chart">
            <div className="bm-empty-chart-icon">
              <CalendarDays size={26} />
            </div>

            Chưa có lịch sử cập nhật chỉ số.
          </div>
        ) : (
          <div className="bm-history-table-wrap">
            <table className="bm-history-table">
              <thead>
                <tr>
                  <th>Ngày cập nhật</th>
                  <th>Cân nặng</th>
                  <th>Chỉ số BMI</th>
                  <th>Đánh giá</th>
                </tr>
              </thead>

              <tbody>
                {[...chartData].reverse().map((item, index) => (
                  <tr key={`${item.date}-${index}`}>
                    <td>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}>
                        <CalendarDays size={14} color="#ff4650" />
                        {item.date}
                      </span>
                    </td>

                    <td>
                      <strong>{item.weight} kg</strong>
                    </td>

                    <td>
                      <span
                        className="bm-history-bmi"
                        style={{ color: bmiColor(item.bmi) }}
                      >
                        {Number(item.bmi).toFixed(1)}
                      </span>
                    </td>

                    <td>
                      {bmiLabel(item.bmi)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* NOTE */}
      <div className="bm-note">
        <Info size={17} />

        <span>
          Chỉ số BMI chỉ mang tính tham khảo, không thay thế đánh giá
          y tế chuyên môn. Dữ liệu chỉ số cơ thể hiện được lưu trên
          trình duyệt của tài khoản này bằng localStorage.
        </span>
      </div>
    </div>
  );
}
