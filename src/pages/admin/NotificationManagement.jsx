import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
    MenuItem,
    InputAdornment
} from "@mui/material";
import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Add as AddIcon,
    Search as SearchIcon
} from "@mui/icons-material";
import axios from "axios";
import { getToken } from "../../services/localStorageService";

const NotificationManagement = () => {
    const [notifications, setNotifications] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "SYSTEM"
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    const fetchNotifications = async () => {
        try {
            const token = getToken();
            const response = await axios.get("http://localhost:8080/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data.result || []);
        } catch (error) {
            console.error("Lỗi lấy thông báo:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleOpenCreate = () => {
        setEditId(null);
        setFormData({ title: "", message: "", type: "SYSTEM" });
        setOpenDialog(true);
    };

    const openEditDialog = (notification) => {
        setEditId(notification.id);
        setFormData({
            title: notification.title,
            message: notification.message,
            type: notification.type
        });
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditId(null);
        setFormData({ title: "", message: "", type: "SYSTEM" });
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSaveNotification = async () => {
        try {
            const token = getToken();

            if (editId) {
                await axios.put(`http://localhost:8080/notifications/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar("Cập nhật thông báo thành công");
            } else {
                await axios.post("http://localhost:8080/notifications/create", formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showSnackbar("Tạo thông báo thành công");
            }

            handleCloseDialog();
            fetchNotifications();
        } catch (err) {
            console.error("Lưu thất bại", err);
            showSnackbar("Lưu thất bại", "error");
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            const token = getToken();
            await axios.delete(`http://localhost:8080/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSnackbar("Xóa thông báo thành công");
            setConfirmDeleteId(null);
            fetchNotifications();
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            showSnackbar("Xóa thất bại", "error");
        }
    };

    const filteredNotifications = notifications.filter((noti) =>
        noti.title.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>Quản lý thông báo</Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <TextField
                    label="Tìm kiếm"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                    size="small"
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                >
                    Tạo thông báo
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tiêu đề</TableCell>
                            <TableCell>Nội dung</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredNotifications.map((notification) => (
                            <TableRow key={notification.id}>
                                <TableCell>{notification.title}</TableCell>
                                <TableCell>{notification.message}</TableCell>
                                <TableCell>{notification.type}</TableCell>
                                <TableCell>{new Date(notification.createdAt).toLocaleString()}</TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => openEditDialog(notification)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => setConfirmDeleteId(notification.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredNotifications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Không có thông báo</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog Thêm/Sửa */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? "Sửa thông báo" : "Tạo thông báo"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tiêu đề"
                        fullWidth
                        margin="normal"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                    <TextField
                        label="Nội dung"
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                    <TextField
                        label="Loại"
                        fullWidth
                        margin="normal"
                        select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                        <MenuItem value="SYSTEM">SYSTEM</MenuItem>
                        <MenuItem value="EVENT">EVENT</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button variant="contained" onClick={handleSaveNotification}>
                        {editId ? "Cập nhật" : "Tạo"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>

            {/* Xác nhận xóa */}
            <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
                <DialogTitle>Bạn chắc chắn muốn xóa thông báo này?</DialogTitle>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteId(null)}>Hủy</Button>
                    <Button
                        onClick={() => handleDeleteNotification(confirmDeleteId)}
                        variant="contained"
                        color="error"
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NotificationManagement;
