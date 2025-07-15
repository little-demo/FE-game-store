import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { getRoleFromToken, getToken } from "../services/localStorageService";

import Login from "../components/Login";
import Home from "../components/Home";
import Profile from "../pages/user/Profile";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import CardManagement from "../pages/admin/CardManagement";
import EventManagement from "../pages/admin/EventManagement";
import RevenueManagement from "../pages/admin/RevenueManagement";
import UserLayout from "../layouts/UserLayout";
import Marketplace from "../pages/user/MarketPlace";
import EventPage from "../pages/user/Event";
import { useEffect, useState } from "react";
import Transaction from "../pages/user/Transaction";

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

        {/* USER + ADMIN dùng chung layout này */}
        {(role === "USER" || role === "ADMIN") && (
          <Route element={<UserLayout />}>
            <Route index element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/event" element={<EventPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/transaction" element={<Transaction />} />
          </Route>
        )}

        {/* Admin layout riêng */}
        {hasAdminAccess && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="cards" element={<CardManagement />} />
            <Route path="events" element={<EventManagement />} />
            <Route path="revenue" element={<RevenueManagement />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
