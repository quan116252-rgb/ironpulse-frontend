import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useAuth } from "../../context/AuthContext";

const bmiLabel = (bmi) => {
  if (bmi <= 0 || !isFinite(bmi)) return "--";
  if (bmi < 18.5) return "Thiếu cân";
  if (bmi < 23) return "Bình thường";
  if (bmi < 25) return "Thừa cân nhẹ";
  return "Thừa cân";
};

export default function BodyMetrics() {
  const { user } = useAuth();

  // Khởi tạo state với giá trị mặc định an toàn tuyệt đối
  const [h, setH] = useState("0");
  const [w, setW] = useState("0");
  const [chartData, setChartData] = useState([]);
  const [hasChanged, setHasChanged] = useState(false);
  const [loading, setLoading] = useState(true);

  // Đọc dữ liệu an toàn từ localStorage bên trong useEffect
  useEffect(() => {
    try {
      if (user?.email) {
        const storageKey = `bodyMetrics_${user.email}`;
        const rawData = localStorage.getItem(storageKey);
        
        if (rawData) {
          const savedData = JSON.parse(rawData);
          if (savedData) {
            setH(savedData.height || "0");
            setW(savedData.weight || "0");
            setChartData(savedData.chart || []);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu từ localStorage:", error);
      // Nếu dữ liệu bị lỗi/hỏng, xóa key đó đi để tránh kẹt lỗi
      if (user?.email) {
        localStorage.removeItem(`bodyMetrics_${user.email}`);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  if (loading || !user) {
    return <div style={{ padding: "20px" }}>Đang tải thông tin chỉ số...</div>;
  }

  const heightNum = parseFloat(h) || 0;
  const weightNum = parseFloat(w) || 0;
  const bmi = heightNum > 0 ? weightNum / ((heightNum / 100) ** 2) : 0;

  const handleChangeH = (e) => {
    const val = e.target.value;
    const newH = (h === "0" && val.length > 1) ? val.replace(/^0+/, "") : (val === "" ? "0" : val);
    setH(newH);
    setHasChanged(true);
  };

  const handleChangeW = (e) => {
    const val = e.target.value;
    const newW = (w === "0" && val.length > 1) ? val.replace(/^0+/, "") : (val === "" ? "0" : val);
    setW(newW);
    setHasChanged(true);
  };

  const handleConfirm = () => {
    if (heightNum <= 0 || weightNum <= 0) {
      alert("Vui lòng nhập chiều cao và cân nặng lớn hơn 0!");
      return;
    }

    const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    const newPoint = {
      date: today,
      weight: weightNum,
      bmi: Number(bmi.toFixed(1)),
    };

    const updatedChart = [...chartData, newPoint];
    setChartData(updatedChart);
    setHasChanged(false);

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
      alert("Đã cập nhật chỉ số cơ thể thành công!");
    } catch (error) {
      console.error("Lỗi lưu localStorage:", error);
    }
  };

  return (
    <div>
      <h1 className="page-title">Chỉ số cơ thể</h1>

      <div className="grid grid-2">
        <div className="panel">
          <h3>Tính BMI</h3>
          <div className="form">
            <label>
              Chiều cao (cm)
              <input
                type="number"
                value={h}
                onChange={handleChangeH}
                onFocus={() => {
                  if (h === "0") setH("");
                }}
                onBlur={() => {
                  if (h === "") setH("0");
                }}
              />
            </label>
            <label>
              Cân nặng (kg)
              <input
                type="number"
                value={w}
                onChange={handleChangeW}
                onFocus={() => {
                  if (w === "0") setW("");
                }}
                onBlur={() => {
                  if (w === "") setW("0");
                }}
              />
            </label>
          </div>

          <div className="bmi-result">
            <strong>{bmi > 0 ? bmi.toFixed(1) : "--"}</strong>
            <span>{bmiLabel(bmi)}</span>
          </div>

          {hasChanged && (
            <div
              style={{
                marginTop: "15px",
                padding: "12px",
                backgroundColor: "#fff7ed",
                border: "1px solid #ffedd5",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "14px", color: "#9a3412" }}>
                Bạn có thay đổi chỉ số mới. Hãy xác nhận để cập nhật biểu đồ!
              </span>
              <button
                className="btn btn-primary"
                onClick={handleConfirm}
                style={{ padding: "6px 12px", fontSize: "13px", cursor: "pointer" }}
              >
                Xác nhận
              </button>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Cân nặng theo thời gian (kg)</h3>
          <div className="chart-box" style={{ minHeight: "250px" }}>
            {chartData.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#888",
                  fontSize: "14px",
                }}
              >
                Chưa có dữ liệu. Vui lòng nhập chỉ số và bấm xác nhận!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#f97316"
                    strokeWidth={3}
                    name="Cân nặng"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}