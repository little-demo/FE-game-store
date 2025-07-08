import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    CssBaseline,
    Toolbar,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import StyleIcon from "@mui/icons-material/Style";
import EventIcon from "@mui/icons-material/Event";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import Header from "../components/header/Header";

const drawerWidth = 240;

const AdminLayout = () => {
    const navigate = useNavigate();

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
        { text: "Quản lý người dùng", icon: <PeopleIcon />, path: "/admin/users" },
        { text: "Quản lý thẻ bài", icon: <StyleIcon />, path: "/admin/cards" },
        { text: "Quản lý sự kiện", icon: <EventIcon />, path: "/admin/events" },
        { text: "Quản lý doanh thu", icon: <MonetizationOnIcon />, path: "/admin/revenue" },
    ];

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            <CssBaseline />
            <Header />
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
            >
                <Toolbar /> {/* Toolbar này để đẩy content xuống dưới header */}
                <Box sx={{ overflow: "auto" }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                sx={{
                                    "&:hover": {
                                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                                    },
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: "100vh",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Toolbar /> {/* Toolbar này để bù lại chiều cao của header */}
                <Box sx={{ p: 3, flex: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;