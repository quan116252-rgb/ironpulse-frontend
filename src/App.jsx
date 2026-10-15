import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminContacts from "./pages/admin/AdminContacts";

import Home from "./pages/public/Home";
import Packages from "./pages/public/Packages";
import Classes from "./pages/public/Classes";
import Trainers from "./pages/public/Trainers";
import Contact from "./pages/public/Contact";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

import MemberDashboard from "./pages/member/MemberDashboard";
import MySchedule from "./pages/member/MySchedule";
import BodyMetrics from "./pages/member/BodyMetrics";
import MemberRegister from "./pages/member/RegisterMember";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageMembers from "./pages/admin/ManageMembers";
import ManagePackages from "./pages/admin/ManagePackages";
import ManageTrainers from "./pages/admin/ManageTrainers";
import ManageClasses from "./pages/admin/ManageClasses"; // 1. Bổ sung import Quản lý lớp học
import ManageClassBookings from "./pages/admin/ManageClassBookings";
import PaymentHistory from "./pages/member/PaymentHistory";
// 1. Import component trang Tài khoản của tôi
import MemberProfile from "./pages/member/MemberProfile";

// Layout Public
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Layout Dashboard cho Member/Admin
function DashboardLayout({ role }) {
  return (
    <div className="dashboard">
      <Sidebar role={role} />
      <section className="dashboard-content">
        <Outlet />
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Member Routes */}
      <Route element={<ProtectedRoute allow={["Member", "member"]} />}>
        <Route path="/member" element={<DashboardLayout role="Member" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="schedule" element={<MySchedule />} />
          <Route path="metrics" element={<BodyMetrics />} />
          <Route path="packages" element={<MemberRegister />} />
          <Route path="/member/payments" element={<PaymentHistory />} />
          <Route path="/member/profile" element={<MemberProfile />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allow={["Admin", "admin"]} />}>
        <Route path="/admin" element={<DashboardLayout role="Admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="members" element={<ManageMembers />} />
          <Route path="packages" element={<ManagePackages />} />
          <Route path="trainers" element={<ManageTrainers />} />
          <Route path="classes" element={<ManageClasses />} /> {/* 2. Bổ sung Route Quản lý lớp học */}
          <Route path="class-bookings" element={<ManageClassBookings />} />
          <Route path="contacts" element={<AdminContacts />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}