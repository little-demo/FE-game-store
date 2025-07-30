import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  Typography,
  useMediaQuery,
  Tooltip,
  Badge,
  Menu, MenuItem, IconButton
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DiamondIcon from '@mui/icons-material/Diamond';

import { styled } from "@mui/system";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoleFromToken, getUserIdFromToken, getExpirationFromToken, getToken } from "../../services/localStorageService";
import { logOut } from "../../services/authenticationService";

import { useState, useEffect } from "react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Custom styled AppBar
const GlassAppBar = styled(AppBar)(({ theme }) => ({
  background: "#1976d2", // Màu xanh dương đậm của MUI
  color: "#fff",
  boxShadow: "0 2px 20px rgba(0,0,0,0.2)",
}));

// Fake notifications data
const mockNotifications = [
  {
    id: 1,
    title: "Sự kiện mới",
    time: "5 phút trước",
    content: "Tham gia ngay sự kiện săn thẻ bài cực hấp dẫn!"
  },
  {
    id: 2,
    title: "Cập nhật hệ thống",
    time: "1 giờ trước",
    content: "Hệ thống sẽ bảo trì vào lúc 22:00 tối nay."
  },
  {
    id: 3,
    title: "Tặng quà đăng nhập",
    time: "Hôm qua",
    content: "Bạn đã nhận được 1 gói quà khi đăng nhập hôm nay."
  }
];

export default function Header() {
  const token = getToken();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const role = getRoleFromToken();
  const isAdmin = role === "ADMIN";
  const usename = getUserIdFromToken();
  const expiration = getExpirationFromToken();

  const navLinks = [
    { label: "Cửa hàng", path: "/marketplace" },
    { label: "Thông tin sự kiện", path: "/event" },
    ...(!isAdmin ? [{ label: "Hồ sơ", path: "/profile" }] : []),
    ...(!isAdmin ? [{ label: "Giao dịch", path: "/transaction" }] : []),
    ...(!isAdmin ? [{ label: "Nạp kim cương", path: "/payment" }] : []),
    ...(isAdmin ? [{ label: "Quản trị", path: "/admin" }] : []),
  ];

  const [userInfo, setUserInfo] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const socket = new SockJS(`http://localhost:8080/ws?username=${usename}`);
    const client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {},
      onConnect: () => {
        console.log("✅ Đã kết nối WebSocket");

        client.subscribe("/user/topic/notifications", (message) => {
          try {
            const body = JSON.parse(message.body);
            console.log("📩 Nhận thông báo riêng:", body);

            setNotifications((prev) => [body, ...prev]);
            setUnreadCount((prev) => prev + 1);
          } catch (error) {
            console.error("❌ Lỗi xử lý message:", error);
          }
        });

      },
      onStompError: (frame) => {
        console.error("❌ STOMP lỗi:", frame);
      },
      reconnectDelay: 5000, // Tự động reconnect nếu mất kết nối
      debug: (str) => console.log(str), // Debug log nếu cần
    });

    client.activate();

    return () => {
      client.deactivate(); // Đảm bảo hủy kết nối khi unmount
    };
  }, []);



  // Menu thông báo
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  const getMyNotifications = async () => {
    const token = getToken();

    try {
      const response = await fetch("http://localhost:8080/notifications/myNotifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể lấy thông báo");
      }

      const result = await response.json();
      setNotifications(result.result || []);
      setUnreadCount((result.result || []).filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    getMyNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = getToken();
    try {
      await fetch(`http://localhost:8080/notifications/${id}/markAsRead`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      getMyNotifications(); // Refresh list
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error);
    }
  };

  useEffect(() => {
    const token = getToken();

    if (token) {
      fetch("http://localhost:8080/users/myInfo", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("User info:", data);
          setUserInfo(data);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy thông tin người dùng:", err);
        });
    }
  }, []);

  return (
    <GlassAppBar position="sticky">
      <Toolbar className="container" sx={{ justifyContent: "space-between" }}>
        {/* LEFT SIDE */}
        <Box display="flex" alignItems="center" gap={4}>
          <Box
            component="img"
            src="/logo/logo.png"
            alt="logo"
            sx={{ width: 40, height: 40, borderRadius: 1, cursor: "pointer" }}
            onClick={() => navigate("/")}
          />

          {!isMobile && (
            <Box display="flex" gap={3}>
              {navLinks.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: isActive ? "#fff" : "#bbdefb", // Trắng khi active, xanh nhạt khi không active
                      fontWeight: isActive ? 600 : 500,
                      borderBottom: isActive ? "2px solid #fff" : "2px solid transparent",
                      borderRadius: 0,
                      transition: "color 0.3s, border-bottom 0.3s",
                    }}
                  >
                    <strong>{item.label}</strong>
                  </Button>
                );
              })}
            </Box>
          )}
        </Box>

        {/* RIGHT SIDE */}
        {!isMobile && (
          <Box display="flex" gap={1} alignItems="center">
            {!role ? (
              <>
                <Button
                  variant="outlined"
                  sx={{ color: "#667eea", borderColor: "#667eea" }}
                  onClick={() => navigate("/login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#667eea" }}
                  onClick={() => navigate("/register")}
                >
                  Đăng ký
                </Button>
              </>
            ) : (
              <>
                {userInfo && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalanceWalletIcon sx={{ color: "#fff", fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: "#fff", display: 'flex', alignItems: 'center' }}>
                      <strong>
                        {typeof userInfo?.result?.balance === "number"
                          ? userInfo.result.balance.toLocaleString()
                          : "0"}
                      </strong>
                      <DiamondIcon sx={{ fontSize: 16, color: "#00ffff", ml: 0.5 }} />
                    </Typography>
                  </Box>
                )}

                <Box display="flex" alignItems="center" gap={3}>
                  <Tooltip title="Thông báo">
                    <IconButton color="inherit" onClick={handleMenu}>
                      <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {/* Hiển thị menu thông báo */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    {notifications.length === 0 ? (
                      <MenuItem>Không có thông báo</MenuItem>
                    ) : (
                      notifications.map((notif) => (
                        <MenuItem
                          key={notif.id}
                          onClick={async () => {
                            await markAsRead(notif.id);
                            handleClose();
                          }}
                          sx={{
                            alignItems: "flex-start",
                            backgroundColor: notif.isRead ? "inherit" : "#e3f2fd",
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight={notif.isRead ? 400 : 600}>
                              {notif.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {notif.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notif.createdAt).toLocaleString("vi-VN")}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Menu>


                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Xin chào, <strong>{usename}!</strong>
                  </Typography>
                </Box>
                <Tooltip title="Đăng xuất">
                  <Button
                    variant="outlined"
                    sx={{
                      color: "#fff", borderColor: "#fff", minWidth: "40px", padding: "6px",
                      "&:hover": {
                        borderColor: "#64b5f6",
                        backgroundColor: "rgba(255,255,255,0.08)",
                      },
                    }}
                    onClick={handleLogout}
                  >
                    <LogoutIcon />
                  </Button>
                </Tooltip>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </GlassAppBar>
  );
}
