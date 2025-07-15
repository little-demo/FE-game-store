import React from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
import Header from "../components/header/Header";

const UserLayout = () => {
    return (
        <Box>
            <CssBaseline />
            <Header />
            <Box component="main" sx={{ p: 3 }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default UserLayout;
