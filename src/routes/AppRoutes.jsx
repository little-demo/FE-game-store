import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getRoleFromToken, getToken } from "../services/localStorageService";

import Login from "../components/Login";
import Home from "../components/Home";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import CardManagement from "../pages/admin/CardManagement";
import EventManagement from "../pages/admin/EventManagement";
import RevenueManagement from "../pages/admin/RevenueManagement";
import { useEffect, useState } from "react";

const AppRoutes = () => {
  const [accessToken, setAccessToken] = useState(getToken());
  const [role, setRole] = useState(getRoleFromToken());

  // Khi token thay đổi, cập nhật lại role
  useEffect(() => {
    setRole(getRoleFromToken());
  }, [accessToken]);

  // Callback cho Login
  const handleLoginSuccess = () => {
    setAccessToken(getToken());
  };

  // Kiểm tra quyền truy cập
  const hasUserAccess = role === "USER" || role === "ADMIN";
  const hasAdminAccess = role === "ADMIN";

  return (
    <Router>
      <Routes>
        {/* Route đăng nhập */}
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />

        {/* Routes cho ADMIN - có thể truy cập tất cả */}
        {hasAdminAccess && (
          <>
            {/* Admin Layout với các trang quản lý */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="cards" element={<CardManagement />} />
              <Route path="events" element={<EventManagement />} />
              <Route path="revenue" element={<RevenueManagement />} />
            </Route>

            {/* ADMIN cũng có thể truy cập trang Home như USER */}
            <Route path="/" element={<Home accessToken={accessToken} />} />
          </>
        )}

        {/* Routes cho USER - chỉ có thể truy cập Home */}
        {hasUserAccess && !hasAdminAccess && (
          <Route path="/" element={<Home accessToken={accessToken} />} />
        )}

        {/* Redirect logic */}
        {!role && <Route path="*" element={<Navigate to="/login" replace />} />}

        {/* Redirect cho ADMIN - mặc định về Home thay vì admin */}
        {hasAdminAccess && (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}

        {/* Redirect cho USER thuần */}
        {role === "USER" && <Route path="*" element={<Navigate to="/" replace />} />}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
