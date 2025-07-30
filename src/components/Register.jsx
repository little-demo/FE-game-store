import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    TextField,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        dob: "",
        avatar: "",
    });

    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const handleCloseSnackBar = () => {
        setSnackBarOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch("http://localhost:8080/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...formData,
                enabled: true,
            }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (data.code !== 1000) {
                    throw new Error(data.message);
                }
                setSuccess(true);
                setSnackBarMessage("Đăng kí thành công! Vui lòng đăng nhập.");
                setSnackBarOpen(true);
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            })
            .catch((error) => {
                setSnackBarMessage(error.message || "Đăng kí thất bại.");
                setSnackBarOpen(true);
            });
    };

    return (
        <>
            <Snackbar
                open={snackBarOpen}
                onClose={handleCloseSnackBar}
                autoHideDuration={4000}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={handleCloseSnackBar}
                    severity={success ? "success" : "error"}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackBarMessage}
                </Alert>
            </Snackbar>

            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f0f2f5">
                <Card sx={{ minWidth: 400, maxWidth: 600, boxShadow: 4, borderRadius: 4, padding: 4 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            <strong>Tạo tài khoản của bạn</strong>
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <TextField name="username" label="Username" fullWidth margin="normal" required value={formData.username} onChange={handleChange} />
                            <TextField name="email" label="Email" type="email" fullWidth margin="normal" required value={formData.email} onChange={handleChange} />
                            <TextField name="password" label="Password" type="password" fullWidth margin="normal" required value={formData.password} onChange={handleChange} />
                            <TextField name="first_name" label="First Name" fullWidth margin="normal" required value={formData.first_name} onChange={handleChange} />
                            <TextField name="last_name" label="Last Name" fullWidth margin="normal" required value={formData.last_name} onChange={handleChange} />
                            <TextField name="dob" label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} fullWidth margin="normal" required value={formData.dob} onChange={handleChange} />
                            <TextField name="avatar" label="Avatar URL (optional)" fullWidth margin="normal" value={formData.avatar} onChange={handleChange} />
                            <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 3 }}>
                                <strong>Đăng kí</strong>
                            </Button>
                            <Divider sx={{ my: 2 }} />
                            <Button variant="outlined" fullWidth onClick={() => navigate("/login")}>
                                <strong>Quay lại đăng nhập</strong>
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </>
    );
}
