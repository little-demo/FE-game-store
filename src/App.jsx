import AppRoutes from "./routes/AppRoutes";
import axios from "axios";
import {
  getToken,
  setToken,
  isTokenExpiringSoon,
} from "./services/localStorageService";
import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

function App() {
  // const [loading, setLoading] = useState(true);
  // const [refreshFailed, setRefreshFailed] = useState(false);

  // useEffect(() => {
  //   const checkToken = async () => {
  //     const token = getToken();

  //     if (isTokenExpiringSoon()) {
  //       try {
  //         const response = await axios.post("http://localhost:8080/auth/refresh", { token });
  //         const newToken = response.data.result.token;
  //         setToken(newToken);
  //         console.log("🔁 Token đã được refresh");
  //       } catch (error) {
  //         console.error("❌ Refresh token thất bại:", error);
  //         setRefreshFailed(true);
  //         return;
  //       }
  //     }

  //     setLoading(false);
  //   };

  //   checkToken();
  // }, []);

  // const handleLoginAgain = () => {
  //   setLoading(false);
  //   localStorage.clear();
  //   window.location.href = "/login";
  // };

  // if (loading) {
  //   return (
  //     <Box
  //       height="100vh"
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //     >
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  // if (refreshFailed) {
  //   return (
  //     <Container maxWidth="sm">
  //       <Box
  //         mt={10}
  //         p={4}
  //         textAlign="center"
  //         borderRadius={2}
  //         boxShadow={3}
  //         bgcolor="#fff"
  //       >
  //         <Alert severity="warning" sx={{ mb: 2 }}>
  //           Phiên đăng nhập đã hết hạn
  //         </Alert>
  //         <Typography variant="h6" gutterBottom>
  //           Vui lòng đăng nhập lại để tiếp tục sử dụng hệ thống.
  //         </Typography>
  //         <Button
  //           variant="contained"
  //           color="primary"
  //           onClick={handleLoginAgain}
  //           sx={{ mt: 2 }}
  //         >
  //           Đăng nhập lại
  //         </Button>
  //       </Box>
  //     </Container>
  //   );
  // }

  return <AppRoutes />;
}

export default App;
