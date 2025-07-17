import React, { useState, useEffect } from "react";
import {
    Box, Grid, Card, CardMedia, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Snackbar, Alert, Typography, TextField
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import axios from "axios";
import AddCardModal from "./AddCardModal";
import EditCardModal from "./EditCardModal";
import { CardService } from "../../services/CardService";

const CardManagementGrid = () => {
    const [allCards, setAllCards] = useState([]);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [viewCard, setViewCard] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [filterType, setFilterType] = useState('All'); // All | MINION | SPELL

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const fetchCards = async () => {
        try {
            setLoading(true);
            const data = await CardService.getAllCards();
            setAllCards(data);
            setCards(data);
            console.log("cards", data);
        } catch (err) {
            console.error("Failed to load cards", err);
            showSnackbar("Failed to load cards", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCard = async (cardId) => {
        try {
            await CardService.deleteCard(cardId);
            setAllCards(prev => prev.filter(c => c.id !== cardId));
            setCards(prev => prev.filter(c => c.id !== cardId));
            showSnackbar("Card deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            showSnackbar("Failed to delete card", "error");
        }
    };

    const filteredCards = allCards.filter(card => {
        const matchesName = card.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || card.cardType === filterType;
        return matchesName && matchesType;
    });

    useEffect(() => {
        fetchCards();
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
                {/* Dòng đầu tiên: Tiêu đề + Nút thêm */}
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    mb={2}
                >
                    <Typography variant="h5" fontWeight="bold">
                        QUẢN LÝ THẺ BÀI
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenAddModal(true)}
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        Thêm thẻ bài
                    </Button>
                </Box>

                {/* Dòng thứ hai: Tìm kiếm + Lọc loại thẻ */}
                <Box
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    gap={2}
                    flexWrap="wrap"
                >
                    <TextField
                        variant="outlined"
                        placeholder="Tìm theo tên..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: 400 }}
                    />
                    <TextField
                        select
                        size="small"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        sx={{ minWidth: 120 }}
                        SelectProps={{ native: true }}
                    >
                        <option value="All">Tất cả</option>
                        <option value="MINION">Minion</option>
                        <option value="SPELL">Spell</option>
                    </TextField>
                </Box>
            </Box>


            <Grid container spacing={2}>
                {filteredCards.map(card => (
                    <Grid item xs={12} sm={6} md={2.4} key={card.id}>
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                "&:hover .actions": {
                                    opacity: 1,
                                    transform: "translateY(0)"
                                }
                            }}
                        >
                            <Card
                                sx={{
                                    width: "100%",
                                    boxShadow: 3,
                                    borderRadius: 2,
                                    overflow: "hidden"
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={card.overallImageUrl}
                                    alt={card.name}
                                    sx={{
                                        width: "100%",
                                        height: "auto",
                                        display: "block"
                                    }}
                                />
                            </Card>

                            <Box
                                className="actions"
                                sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 1,
                                    p: 1,
                                    background: "rgba(0,0,0,0.6)",
                                    opacity: 0,
                                    transform: "translateY(20%)",
                                    transition: "all 0.3s ease",
                                    zIndex: 2
                                }}
                            >
                                <IconButton color="primary" onClick={() => setViewCard(card)}>
                                    <VisibilityIcon />
                                </IconButton>
                                <IconButton color="warning" onClick={() => {
                                    setSelectedCard(card);
                                    setOpenEditModal(true);
                                }}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => setConfirmDeleteId(card.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog xem chi tiết thẻ */}
            <Dialog open={!!viewCard} onClose={() => setViewCard(null)} maxWidth="xs" fullWidth>
                <DialogTitle><strong>Chi tiết thẻ bài</strong></DialogTitle>
                <DialogContent>
                    {viewCard && (
                        <>
                            <Box textAlign="center">
                                <img
                                    src={viewCard.overallImageUrl}
                                    alt="Card Detail"
                                    style={{
                                        width: 180,
                                        height: "auto",
                                        borderRadius: 8,
                                        marginBottom: 16,
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                                    }}
                                />
                                <Typography variant="h6" gutterBottom><strong>{viewCard.name}</strong></Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {viewCard.cardType}
                            </Typography>
                            <Box mt={1} mb={1}>
                                <Typography variant="body2"><strong>Năng lượng:</strong> {viewCard.mana}</Typography>
                                <Typography variant="body2"><strong>Tấn công:</strong> {viewCard.attack}</Typography>
                                <Typography variant="body2"><strong>Máu:</strong> {viewCard.health}</Typography>
                                <Typography variant="body2"><strong>Giá bán:</strong> ${viewCard.marketPrice}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                <strong>Mô tả:</strong> {viewCard.description}
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewCard(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Thêm & Sửa */}
            <AddCardModal
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                onCardAdded={(newCard) => {
                    setAllCards(prev => [...prev, newCard]);
                    setCards(prev => [...prev, newCard]);
                    showSnackbar("Card added successfully");
                }}
            />
            <EditCardModal
                open={openEditModal}
                onClose={() => {
                    setOpenEditModal(false);
                    setSelectedCard(null);
                }}
                card={selectedCard}
                onCardUpdated={(updatedCard) => {
                    setAllCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
                    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
                    showSnackbar("Card updated successfully");
                }}
            />

            {/* Dialog xác nhận xóa */}
            <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>Bạn có chắc chắc muốn xóa thẻ bài này không?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteId(null)}>Hủy</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                            handleDeleteCard(confirmDeleteId);
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

export default CardManagementGrid;
