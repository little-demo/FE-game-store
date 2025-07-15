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
  Divider,
  Menu, MenuItem, IconButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from '@mui/icons-material/Notifications';

import { styled } from "@mui/system";
import { useNavigate, useLocation } from "react-router-dom";
import { getRoleFromToken } from "../../services/localStorageService";
import { logOut } from "../../services/authenticationService";

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
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:768px)");
  const role = getRoleFromToken();
  const isAdmin = role === "ADMIN";

  const navLinks = [
    { label: "Cửa hàng", path: "/marketplace" },
    { label: "Thông tin sự kiện", path: "/event" },
    ...(!isAdmin ? [{ label: "Hồ sơ", path: "/profile" }] : []),
    ...(!isAdmin ? [{ label: "Giao dịch", path: "/transaction" }] : []),
    ...(isAdmin ? [{ label: "Quản trị", path: "/admin" }] : []),
  ];

  // Menu thông báo
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

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
                <Box display="flex" alignItems="center" gap={3}>
                  <Tooltip title="Thông báo">
                    <IconButton onClick={handleOpenNotifications} sx={{ color: "#fff" }}>
                      <Badge badgeContent={mockNotifications.length} color="error">
                        <NotificationsIcon />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  {/* Hiển thị menu thông báo */}
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleCloseNotifications}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        width: 380,
                        maxHeight: 500,
                        mt: 1.5,
                        borderRadius: 2
                      }
                    }}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <Typography variant="h6" sx={{ px: 2, py: 1 }}>
                      <strong>Thông báo</strong>
                    </Typography>
                    <Divider />
                    {mockNotifications.map((notif) => (
                      <MenuItem key={notif.id} sx={{ alignItems: "flex-start" }} onClick={handleCloseNotifications}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: "#1976d2" }}>🔔</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600} sx={{ whiteSpace: 'normal' }}>
                              {notif.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" color="text.secondary">
                                {notif.time}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{ whiteSpace: 'normal', mt: 0.5 }}
                              >
                                {notif.content}
                              </Typography>
                            </>
                          }
                        />
                      </MenuItem>
                    ))}
                  </Menu>


                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Xin chào, <strong>{role}!</strong>
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
