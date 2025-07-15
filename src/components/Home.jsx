import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/localStorageService";
import Header from "./header/Header";
import { Box, Card, CircularProgress, Typography, Button, Grid, Paper } from "@mui/material";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import StyleIcon from "@mui/icons-material/Style";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";


export default function Home({ accessToken }) {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState({});

  const getUserDetails = async (accessToken) => {
    const response = await fetch(
      "http://localhost:8080/users/myInfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`, // Set Authorization header
        },
      }
    );

    const data = await response.json();

    console.log(data);

    setUserDetails(data.result);
  };

  useEffect(() => {
    if (accessToken) {
      getUserDetails(accessToken);
    }
  }, [accessToken]);

  const features = [
    {
      icon: <SportsEsportsIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Trải nghiệm Game",
      desc: "Tùy chỉnh giao diện, đăng nhập dễ dàng và trải nghiệm mượt mà",
    },
    {
      icon: <StyleIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Bộ sưu tập thẻ",
      desc: "Quản lý bộ sưu tập thẻ bài cá nhân với hệ thống túi đồ thông minh",
    },
    {
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Thị trường giao dịch",
      desc: "Mua bán thẻ bài với cộng đồng, giá cả minh bạch",
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#667eea' }} />,
      title: "Giải đấu",
      desc: "Tham gia các giải đấu và sự kiện để nhận thưởng hấp dẫn",
    },
  ];

  return (
    <>
      <Box
        sx={{
          p: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 2,
          textAlign: 'center',
          mb: 4,
        }}
      >
        <Typography variant="h3" sx={{ mb: 2, color: '#333' }}>
          <strong>Chào mừng đến AHP GAME</strong>
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, color: '#666' }}>
          Nền tảng giao dịch thẻ bài và kết nối game hàng đầu
        </Typography>

        <Grid container spacing={3} mt={5}>
          {features.map((f, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                elevation={3}
                sx={{
                  height: "100%", // đảm bảo chiếm đủ chiều cao của Grid
                  minHeight: 100, // thiết lập chiều cao tối thiểu
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  borderRadius: 2,
                  textAlign: 'center',
                  transition: '0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                  },
                }}
              >
                {f.icon}
                <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
                  <strong>{f.title}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {f.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
