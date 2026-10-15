import { useEffect, useState } from "react";
import { Users, Wallet, Activity, AlarmClock } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { 
  getRevenueStats, 
  getTodayVisits, 
  getWeeklyVisits, 
  getExpiringSoonCount,
  getMembers,
  getClassRegistrations 
} from "../../services/memberService";

export default function AdminDashboard() {
  const [revenueData, setRevenueData] = useState({ total_revenue: 0, monthly_revenue: [] });
  const [todayVisits, setTodayVisits] = useState(0);
  const [weeklyVisits, setWeeklyVisits] = useState([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [revData, visitsCount, weeklyData, expiringVal, membersList, allRegistrations] = await Promise.all([
          getRevenueStats(), 
          getTodayVisits(), 
          getWeeklyVisits(),
          getExpiringSoonCount(),
          getMembers(),
          getClassRegistrations()
        ]);

        // 1. Tính doanh thu từ gói tập (VIP: 1.2tr, Basic: 500k)
        let packageRevTotal = 0;
        const packageCounts = {};

        (membersList || []).forEach((m) => {
          if (m.packageName && m.packageName.toLowerCase().includes("vip")) {
            packageRevTotal += 1200000;
            packageCounts["Gói VIP Cao Cấp"] = (packageCounts["Gói VIP Cao Cấp"] || 0) + 1200000;
          } else if (m.packageName && m.packageName.toLowerCase().includes("basic")) {
            packageRevTotal += 500000;
            packageCounts["Gói Chuẩn (Basic Gym)"] = (packageCounts["Gói Chuẩn (Basic Gym)"] || 0) + 500000;
          }
        });

        // 2. Tính doanh thu và tách cột chi tiết theo từng tên lớp học đã được duyệt (APPROVED) - 300k/lớp
        const approvedRegs = (allRegistrations || []).filter((r) => r.status === "APPROVED");
        const classRevenueMap = {};
        let classRevTotal = 0;

        approvedRegs.forEach((r) => {
          const className = r.className ? `Lớp: ${r.className}` : "Lớp đặt thêm";
          classRevenueMap[className] = (classRevenueMap[className] || 0) + 300000;
          classRevTotal += 300000;
        });

        // 3. Tổng doanh thu toàn hệ thống = Doanh thu gói + Doanh thu các lớp
        const combinedTotalRevenue = packageRevTotal + classRevTotal;

        // 4. Xây dựng danh sách hiển thị trên biểu đồ cột
        const chartList = [];
        Object.keys(packageCounts).forEach((pkgName) => {
          chartList.push({
            month: pkgName,
            revenue: packageCounts[pkgName],
          });
        });

        // Tự động sinh cột riêng cho từng tên lớp học khác nhau
        Object.keys(classRevenueMap).forEach((className) => {
          chartList.push({
            month: className,
            revenue: classRevenueMap[className],
          });
        });

        // Fallback dữ liệu từ backend nếu chưa có
        if (chartList.length === 0 && revData.monthly_revenue) {
          revData.monthly_revenue.forEach((item) => {
            chartList.push({
              month: item.packageName || "Gói tập",
              revenue: item.revenue || 0,
            });
          });
        }

        setRevenueData({
          total_revenue: combinedTotalRevenue > 0 ? combinedTotalRevenue : (revData.total_revenue || 0),
          monthly_revenue: chartList,
        });

        setTodayVisits(visitsCount);
        setWeeklyVisits(weeklyData || []);
        setExpiringCount(expiringVal);
        
        // Đếm số hội viên đang active
        const activeCount = (membersList || []).filter((m) => m.status === "Active").length;
        setActiveMembersCount(activeCount);

      } catch (err) {
        console.error("Lỗi tải dữ liệu Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalInMillions = (revenueData.total_revenue / 1000000).toFixed(1);

  const stats = [
    { icon: Users, label: "Hội viên đang hoạt động", value: loading ? "..." : activeMembersCount },
    { icon: Wallet, label: "Tổng doanh thu (triệu)", value: loading ? "..." : `${totalInMillions} tr` },
    { icon: Activity, label: "Lượt tập hôm nay", value: loading ? "..." : todayVisits },
    { icon: AlarmClock, label: "Sắp hết hạn (7 ngày)", value: loading ? "..." : expiringCount },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard quản trị</h1>

      <div className="grid grid-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div className="stat" key={label}>
            <Icon size={22} />
            <span className="stat-label">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <div className="panel">
          <h3>Doanh thu theo gói tập & lớp học (VNĐ)</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${Number(value).toLocaleString("vi-VN")} VNĐ`, "Doanh thu"]} />
                <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h3>Lượt tập theo ngày trong tuần</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyVisits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#111827" strokeWidth={3} name="Lượt tập" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}