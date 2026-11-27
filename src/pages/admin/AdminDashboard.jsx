
import { useEffect, useState } from "react";

import {
  Users,
  Wallet,
  Activity,
  AlarmClock,
  TrendingUp,
  BarChart3,
  Dumbbell,
  Flame,
} from "lucide-react";

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
  getClassRegistrations,
} from "../../services/memberService";

export default function AdminDashboard() {
  // =====================================================
  // 1. STATE
  // =====================================================

  const [revenueData, setRevenueData] = useState({
    total_revenue: 0,
    monthly_revenue: [],
  });

  const [todayVisits, setTodayVisits] = useState(0);
  const [weeklyVisits, setWeeklyVisits] = useState([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // 2. FETCH DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          revData,
          visitsCount,
          weeklyData,
          expiringVal,
          membersList,
          allRegistrations,
        ] = await Promise.all([
          getRevenueStats(),
          getTodayVisits(),
          getWeeklyVisits(),
          getExpiringSoonCount(),
          getMembers(),
          getClassRegistrations(),
        ]);

        // -------------------------------------------------
        // TÍNH DOANH THU TỪ GÓI TẬP
        // -------------------------------------------------

        let packageRevTotal = 0;
        const packageCounts = {};

        (membersList || []).forEach((m) => {
          if (
            m.packageName &&
            m.packageName.toLowerCase().includes("vip")
          ) {
            packageRevTotal += 1200000;

            packageCounts["Gói VIP Cao Cấp"] =
              (packageCounts["Gói VIP Cao Cấp"] || 0) + 1200000;
          } else if (
            m.packageName &&
            m.packageName.toLowerCase().includes("basic")
          ) {
            packageRevTotal += 500000;

            packageCounts["Gói Chuẩn (Basic Gym)"] =
              (packageCounts["Gói Chuẩn (Basic Gym)"] || 0) + 500000;
          }
        });

        // -------------------------------------------------
        // TÍNH DOANH THU LỚP HỌC ĐÃ ĐƯỢC DUYỆT
        // -------------------------------------------------

        const approvedRegs = (allRegistrations || []).filter(
          (r) => r.status === "APPROVED"
        );

        const classRevenueMap = {};
        let classRevTotal = 0;

        approvedRegs.forEach((r) => {
          const className = r.className
            ? `Lớp: ${r.className}`
            : "Lớp đặt thêm";

          classRevenueMap[className] =
            (classRevenueMap[className] || 0) + 300000;

          classRevTotal += 300000;
        });

        // -------------------------------------------------
        // TỔNG DOANH THU
        // -------------------------------------------------

        const combinedTotalRevenue =
          packageRevTotal + classRevTotal;

        // -------------------------------------------------
        // DỮ LIỆU BIỂU ĐỒ DOANH THU
        // -------------------------------------------------

        const chartList = [];

        Object.keys(packageCounts).forEach((pkgName) => {
          chartList.push({
            month: pkgName,
            revenue: packageCounts[pkgName],
          });
        });

        Object.keys(classRevenueMap).forEach((className) => {
          chartList.push({
            month: className,
            revenue: classRevenueMap[className],
          });
        });

        // Dữ liệu dự phòng từ backend
        if (
          chartList.length === 0 &&
          revData.monthly_revenue
        ) {
          revData.monthly_revenue.forEach((item) => {
            chartList.push({
              month: item.packageName || "Gói tập",
              revenue: item.revenue || 0,
            });
          });
        }

        // Cập nhật doanh thu
        setRevenueData({
          total_revenue:
            combinedTotalRevenue > 0
              ? combinedTotalRevenue
              : revData.total_revenue || 0,

          monthly_revenue: chartList,
        });

        // -------------------------------------------------
        // CẬP NHẬT LƯỢT TẬP
        // -------------------------------------------------

        setTodayVisits(visitsCount);
        setWeeklyVisits(weeklyData || []);
        setExpiringCount(expiringVal);

        // -------------------------------------------------
        // ĐẾM HỘI VIÊN ĐANG HOẠT ĐỘNG
        // -------------------------------------------------

        const activeCount = (membersList || []).filter(
          (m) => m.status === "Active"
        ).length;

        setActiveMembersCount(activeCount);

      } catch (err) {
        console.error("Lỗi tải dữ liệu Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =====================================================
  // 3. FORMAT DATA
  // =====================================================

  const totalInMillions = (
    revenueData.total_revenue / 1000000
  ).toFixed(1);

  const formatCurrency = (value) =>
    `${Number(value).toLocaleString("vi-VN")} VNĐ`;

  // =====================================================
  // 4. STATISTICS
  // =====================================================

  const stats = [
    {
      icon: Users,
      label: "Hội viên đang hoạt động",
      value: loading ? "..." : activeMembersCount,
      description: "Tổng số hội viên Active",
      variant: "members",
      number: "01",
    },
    {
      icon: Wallet,
      label: "Tổng doanh thu",
      value: loading ? "..." : `${totalInMillions} tr`,
      description: "Doanh thu toàn hệ thống",
      variant: "revenue",
      number: "02",
    },
    {
      icon: Activity,
      label: "Lượt tập hôm nay",
      value: loading ? "..." : todayVisits,
      description: "Số lượt check-in hôm nay",
      variant: "visits",
      number: "03",
    },
    {
      icon: AlarmClock,
      label: "Sắp hết hạn",
      value: loading ? "..." : expiringCount,
      description: "Hội viên hết hạn trong 7 ngày",
      variant: "expiring",
      number: "04",
    },
  ];

  // =====================================================
  // 5. CHART THEME
  // =====================================================

  const chartTheme = {
    grid: "#303030",
    text: "#A8A8A8",
    tooltipBackground: "#171717",
    tooltipBorder: "#383838",
  };

  // =====================================================
  // 6. RENDER
  // =====================================================

  return (
    <div className="dashboard-container admin-dashboard">

      {/* =================================================
          HERO BANNER
      ================================================= */}

      <section className="admin-hero">

        <div className="admin-hero-content">

          <div className="admin-dashboard-eyebrow">
            <span className="admin-dashboard-dot"></span>
            IRONPULSE MANAGEMENT
          </div>

          <div className="admin-hero-heading">

            <span className="admin-hero-small">
              WELCOME TO IRONPULSE
            </span>

            <h1>
              QUẢN LÝ
              <br />
              <span>PHÒNG GYM</span>
            </h1>

          </div>

          <p className="admin-hero-description">
            Theo dõi hoạt động, quản lý hội viên và phát triển
            hệ thống phòng tập của bạn.
          </p>

          <div className="admin-hero-bottom">
            <div className="admin-hero-line"></div>
            <span>STRONGER EVERY DAY</span>
          </div>

        </div>

        <div className="admin-hero-overlay"></div>

        <div className="admin-hero-label">
          <Flame size={17} />
          <span>POWER YOUR LIMITS</span>
        </div>

        <div className="admin-hero-number">
          01 / OVERVIEW
        </div>

      </section>

      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div className="admin-dashboard-header">

        <div>

          <div className="admin-section-eyebrow">
            <span></span>
            PERFORMANCE CENTER
          </div>

          <h2 className="page-title">
            TỔNG QUAN HỆ THỐNG
          </h2>

          <p className="admin-dashboard-subtitle">
            Theo dõi các chỉ số quan trọng trong hoạt động kinh doanh.
          </p>

        </div>

        <div className="admin-dashboard-date">
          <BarChart3 size={18} />
          <span>DASHBOARD OVERVIEW</span>
        </div>

      </div>

      {/* =================================================
          STATISTICS CARDS
      ================================================= */}

      <div className="admin-stats-grid">

        {stats.map(
          ({
            icon: Icon,
            label,
            value,
            description,
            variant,
            number,
          }) => (

            <div
              className={`admin-stat-card stat-${variant}`}
              key={label}
            >

              <div className="admin-stat-card-background"></div>

              <div className="admin-stat-top">

                <div className="admin-stat-icon">
                  <Icon size={22} />
                </div>

                <span className="admin-stat-number">
                  {number}
                </span>

              </div>

              <div className="admin-stat-info">

                <span className="admin-stat-label">
                  {label}
                </span>

                <strong className="admin-stat-value">
                  {value}
                </strong>

                <span className="admin-stat-description">
                  {description}
                </span>

              </div>

              <div className="admin-stat-bottom">

                <span className="admin-stat-status">
                  <span></span>
                  LIVE STATISTICS
                </span>

                <TrendingUp size={17} />

              </div>

            </div>

          )
        )}

      </div>

      {/* =================================================
          CHARTS
      ================================================= */}

      <div className="admin-chart-grid">

        {/* ===============================================
            REVENUE CHART
        =============================================== */}

        <div className="admin-chart-panel">

          <div className="admin-panel-header">

            <div>

              <div className="admin-panel-title">

                <span className="admin-panel-icon">
                  <Wallet size={18} />
                </span>

                DOANH THU

              </div>

              <p>
                Thống kê doanh thu theo gói tập và lớp học
              </p>

            </div>

            <span className="admin-panel-tag">
              VNĐ
            </span>

          </div>

          <div className="admin-chart-content">

            {loading ? (

              <div className="admin-chart-loading">
                Đang tải dữ liệu...
              </div>

            ) : revenueData.monthly_revenue.length === 0 ? (

              <div className="admin-chart-empty">
                Chưa có dữ liệu doanh thu
              </div>

            ) : (

              <ResponsiveContainer width="100%" height="100%">

                <BarChart
                  data={revenueData.monthly_revenue}
                  margin={{
                    top: 15,
                    right: 15,
                    left: 5,
                    bottom: 55,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke={chartTheme.grid}
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={65}
                    tick={{
                      fill: chartTheme.text,
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: chartTheme.text,
                      fontSize: 12,
                    }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}tr`
                    }
                  />

                  <Tooltip
                    cursor={false}
                    formatter={(value) => [
                      formatCurrency(value),
                      "Doanh thu",
                    ]}
                    contentStyle={{
                      background: chartTheme.tooltipBackground,
                      borderRadius: 10,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      color: "#FFFFFF",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                    }}
                    itemStyle={{
                      color: "#E31824",
                    }}
                    labelStyle={{
                      color: "#FFFFFF",
                    }}
                  />

                  <Bar
                    dataKey="revenue"
                    fill="#E31824"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={55}
                    name="Doanh thu"
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* ===============================================
            WEEKLY VISITS CHART
        =============================================== */}

        <div className="admin-chart-panel">

          <div className="admin-panel-header">

            <div>

              <div className="admin-panel-title">

                <span className="admin-panel-icon">
                  <Activity size={18} />
                </span>

                LƯỢT TẬP TRONG TUẦN

              </div>

              <p>
                Thống kê lượt đến phòng gym theo ngày
              </p>

            </div>

            <span className="admin-panel-tag">
              TUẦN
            </span>

          </div>

          <div className="admin-chart-content">

            {loading ? (

              <div className="admin-chart-loading">
                Đang tải dữ liệu...
              </div>

            ) : weeklyVisits.length === 0 ? (

              <div className="admin-chart-empty">
                Chưa có dữ liệu lượt tập
              </div>

            ) : (

              <ResponsiveContainer width="100%" height="100%">

                <LineChart
                  data={weeklyVisits}
                  margin={{
                    top: 15,
                    right: 15,
                    left: 5,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke={chartTheme.grid}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: chartTheme.text,
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: chartTheme.text,
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      background: chartTheme.tooltipBackground,
                      borderRadius: 10,
                      border: `1px solid ${chartTheme.tooltipBorder}`,
                      color: "#FFFFFF",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                    }}
                    itemStyle={{
                      color: "#E31824",
                    }}
                    labelStyle={{
                      color: "#FFFFFF",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="#E31824"
                    strokeWidth={3}
                    name="Lượt tập"
                    dot={{
                      r: 5,
                      fill: "#E31824",
                      stroke: "#FFFFFF",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#FF303B",
                      stroke: "#FFFFFF",
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

      </div>

      {/* =================================================
          BOTTOM BRAND STRIP
      ================================================= */}

      <div className="admin-dashboard-footer">

        <div className="admin-footer-brand">
          <Dumbbell size={19} />
          <span>IRONPULSE FITNESS CLUB</span>
        </div>

        <span>
          DISCIPLINE · STRENGTH · PROGRESS
        </span>

      </div>

    </div>
  );
}
