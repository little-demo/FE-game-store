import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    CssBaseline,
    styled,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import StyleIcon from "@mui/icons-material/Style";
import EventIcon from "@mui/icons-material/Event";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import FlareIcon from '@mui/icons-material/Flare';
import Header from "../components/header/Header";

const drawerWidth = 240;

// Tạo một component Box tùy chỉnh để chứa layout chính
const MainContent = styled(Box)({
    display: "flex",
    height: "100vh",
    flexDirection: "column",
});

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
        { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
        { text: "Quản lý thẻ bài", icon: <StyleIcon />, path: "/admin/cards" },
        { text: "Hiệu ứng thẻ bài", icon: <FlareIcon />, path: "/admin/cardsEffect" },
        { text: "Quản lý thông báo", icon: <NotificationsActiveIcon />, path: "/admin/notifications" },
        { text: "Quản lý sự kiện", icon: <EventIcon />, path: "/admin/events" },
        { text: "Quản lý doanh thu", icon: <MonetizationOnIcon />, path: "/admin/revenue" },
    ];

    return (
        <MainContent>
            <CssBaseline />
            {/* Header nằm riêng ở trên cùng */}
            <Header />

            {/* Phần nội dung chính bao gồm sidebar và content */}
            <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
                {/* Sidebar */}
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: {
                            width: drawerWidth,
                            boxSizing: "border-box",
                            position: "relative", // Đảm bảo sidebar không bị đè lên header

                        },
                    }}
                >
                    <Box sx={{ overflow: "auto" }}>
                        <List>
                            {menuItems.map((item) => {
                                const isActive =
                                    location.pathname === item.path;

                                return (
                                    <ListItem
                                        button
                                        key={item.text}
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            backgroundColor: isActive ? "#e3f2fd" : "transparent",
                                            borderLeft: isActive ? "4px solid #1976d2" : "4px solid transparent",
                                            "&:hover": {
                                                backgroundColor: "#f1f1f1",
                                            },
                                            pl: 2, // Padding left để cân chỉnh khi có border
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{ color: isActive ? "#1976d2" : "inherit" }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: isActive ? "bold" : "normal",
                                                color: isActive ? "#1976d2" : "inherit",
                                            }}
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                </Drawer>

                {/* Nội dung chính */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        overflow: "auto",
                        p: 3,

                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </MainContent>
    );
};

export default AdminLayout;