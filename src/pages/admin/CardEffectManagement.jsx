import React, { useState, useEffect } from "react";
import {
    Box, Button, Snackbar, Alert, Typography, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions,
    IconButton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import AddEffectModal from "./AddEffectModal";
import EditEffectModal from "./UpdateEffectModal";

const CardEffectManagement = () => {
    const [effects, setEffects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedEffect, setSelectedEffect] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const token = localStorage.getItem("accessToken");

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const fetchEffects = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:8080/cardEffects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEffects(res.data.result || []);
        } catch (err) {
            console.error("Failed to load effects", err);
            showSnackbar("Failed to load effects", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEffect = async (effectId) => {
        try {
            await axios.delete(`http://localhost:8080/cardEffects/${effectId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEffects(prev => prev.filter(e => e.id !== effectId));
            showSnackbar("Effect deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            showSnackbar("Failed to delete effect", "error");
        }
    };

    const filteredEffects = effects.filter(effect =>
        effect.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchEffects();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>

            <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h5" fontWeight="bold">
                        QUẢN LÝ HIỆU ỨNG THẺ BÀI
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddModal(true)}
                    >
                        Thêm hiệu ứng
                    </Button>
                </Box>

                <TextField
                    variant="outlined"
                    placeholder="Tìm theo tên..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 400 }}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên hiệu ứng</strong></TableCell>
                            <TableCell><strong>Giá trị</strong></TableCell>
                            <TableCell><strong>Loại</strong></TableCell>
                            <TableCell><strong>Mục tiêu</strong></TableCell>
                            <TableCell align="center"><strong>Thao tác</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEffects.map(effect => (
                            <TableRow key={effect.id}>
                                <TableCell>{effect.name}</TableCell>
                                <TableCell>{effect.value}</TableCell>
                                <TableCell>{effect.type}</TableCell>
                                <TableCell>{effect.target}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="warning"
                                        onClick={() => {
                                            setSelectedEffect(effect);
                                            setOpenEditModal(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => setConfirmDeleteId(effect.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <AddEffectModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onEffectAdded={(newEffect) => {
                    setEffects(prev => [...prev, newEffect]);
                    showSnackbar("Effect added successfully");
                }}
            />

            {openEditModal && selectedEffect && (
                <EditEffectModal
                    effect={selectedEffect}
                    onClose={() => {
                        setOpenEditModal(false);
                        setSelectedEffect(null);
                    }}
                    onEffectUpdated={(updatedEffect) => {
                        setEffects(prev => prev.map(e => e.id === updatedEffect.id ? updatedEffect : e));
                        showSnackbar("Effect updated successfully");
                    }}
                />
            )}

            <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>Bạn có chắc chắn muốn xóa hiệu ứng này không?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteId(null)}>Hủy</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                            handleDeleteEffect(confirmDeleteId);
                            setConfirmDeleteId(null);
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CardEffectManagement;
