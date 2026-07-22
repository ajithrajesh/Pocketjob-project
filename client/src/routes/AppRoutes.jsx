import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import About from "../pages/About/About";
import Jobs from "../pages/Jobs/Jobs";
import JobDetails from "../pages/Jobs/JobDetails";


import UserDashboard from "../pages/Dashboard/UserDashboard";
import ProviderDashboard from "../pages/Dashboard/ProviderDashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import { useAuth } from "../context/AuthContext";


function DashboardHome() {
  const { user } = useAuth();

  if (user?.role === "company") {
    return <ProviderDashboard />;
  } else if (user?.role === "admin") {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      {}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/about" element={<About />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="jobs/:id" element={<JobDetails />} />
      </Route>

      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;