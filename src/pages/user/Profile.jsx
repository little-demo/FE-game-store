import React, { useState, useEffect } from 'react';
import {
    Avatar, Box, Button, Card, CardMedia, Grid, Typography, Paper, CircularProgress,
    Alert, Snackbar, TextField, InputAdornment, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import ChangePasswordModal from './ChangePasswordModal';
import EditUserModal from '../admin/EditUserModal';
import SellCardModal from './SellCardModal';
import { getToken } from '../../services/localStorageService';

const Profile = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewCard, setViewCard] = useState(null);
    const [openSellModal, setOpenSellModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleUserUpdated = (updatedUser) => {
        setUserInfo(updatedUser);
        setOpenEditModal(false);
        showSnackbar("Profile updated successfully");
    };

    const handlePasswordChanged = () => {
        setOpenChangePassword(false);
        showSnackbar("Password changed successfully");
    };

    const handleSellCard = async ({ card, price, quantity }) => {
        try {
            const token = getToken();
            const res = await fetch('http://localhost:8080/listings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cardId: card.cardId,
                    sellingPrice: price,
                    quantity: quantity,
                })
            });

            if (!res.ok) throw new Error('Đăng bán thất bại');

            const data = await res.json();

            showSnackbar("Đăng bán thành công!");
            setOpenSellModal(false);

            const updatedCards = cards.map(c => {
                if (c.cardId === card.cardId) {
                    return { ...c, quantity: c.quantity - quantity };
                }
                return c;
            });
            setCards(updatedCards);
        } catch (err) {
            console.error(err);
            showSnackbar("Đăng bán thất bại", "error");
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getToken();

                const [userRes, cardsRes] = await Promise.all([
                    fetch('http://localhost:8080/users/myInfo', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch('http://localhost:8080/cards/myCards', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    })
                ]);

                if (!userRes.ok || !cardsRes.ok) {
                    throw new Error('Failed to load user or cards');
                }

                const userData = await userRes.json();
                const cardData = await cardsRes.json();

                setUserInfo(userData.result);
                setCards(cardData.result);
            } catch (error) {
                console.error(error);
                showSnackbar("Failed to load profile data", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    const filteredCards = cards.filter(card =>
        card.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Box textAlign="center" mb={3}>
                <Typography variant="h4" color="primary"><strong>HỒ SƠ CÁ NHÂN</strong></Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                            src={userInfo.avatar}
                            sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                        />
                        <Typography variant="h6">
                            <strong>{userInfo.first_name} {userInfo.last_name}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">Email: {userInfo.email}</Typography>
                        <Typography variant="body2" color="textSecondary">Ngày sinh: {userInfo.dob}</Typography>
                        <Typography sx={{ mt: 1 }}><strong>Số thẻ sở hữu:</strong> {cards.reduce((total, card) => total + card.quantity, 0)}</Typography>
                        <Box mt={2} display="flex" gap={1} justifyContent="center">
                            <Button variant="contained" onClick={() => setOpenEditModal(true)}>Chỉnh sửa</Button>
                            <Button variant="outlined" onClick={() => setOpenChangePassword(true)}>Đổi mật khẩu</Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                    <Paper elevation={3} sx={{ p: 3, height: 'calc(100vh - 120px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <Grid container justifyContent="space-between" alignItems="center" mb={2}>
                            <Grid item>
                                <Typography variant="h5" color="primary" fontWeight="bold">Bộ sưu tập thẻ bài</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Tìm kiếm thẻ bài..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                            <Grid container spacing={2}>
                                {filteredCards.map(card => (
                                    <Grid item xs={12} sm={6} md={2.4} key={card.cardId}>
                                        <Box sx={{
                                            position: "relative",
                                            "&:hover .actions": {
                                                opacity: 1,
                                                transform: "translateY(0)"
                                            }
                                        }}>
                                            <Card sx={{
                                                width: "100%",
                                                height: 260,
                                                display: "flex",
                                                flexDirection: "column",
                                                boxShadow: 3,
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                position: "relative" // <== để chứa số lượng ở góc
                                            }}>
                                                {/* Ảnh thẻ bài */}
                                                <CardMedia
                                                    component="img"
                                                    image={card.overallImageUrl}
                                                    alt={card.cardName}
                                                    sx={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover"
                                                    }}
                                                />

                                                {/* Số lượng ở góc phải trên */}
                                                <Box sx={{
                                                    position: "absolute",
                                                    top: 2,
                                                    right: 2,
                                                    bgcolor: 'error.main',
                                                    color: 'white',
                                                    px: 1.2,
                                                    py: 0.3,
                                                    borderRadius: 2,
                                                    fontSize: 13,
                                                    fontWeight: 'bold',
                                                    boxShadow: 1
                                                }}>
                                                    x{card.quantity}
                                                </Box>
                                            </Card>

                                            <Box
                                                className="actions"
                                                sx={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    width: "100%",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    p: 1,
                                                    background: "rgba(0,0,0,0.5)",
                                                    opacity: 0,
                                                    transform: "translateY(20%)",
                                                    transition: "all 0.3s ease"
                                                }}
                                            >
                                                <IconButton color="primary" onClick={() => setViewCard(card)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton color="secondary" onClick={() => {
                                                    setSelectedCard(card);
                                                    setOpenSellModal(true);
                                                }}>
                                                    <AttachMoneyIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                    </Paper>
                </Grid>
            </Grid>

            {/* Dialog xem chi tiết thẻ */}
            <Dialog open={!!viewCard} onClose={() => setViewCard(null)} maxWidth="xs" fullWidth>
                <DialogTitle><strong>Chi tiết thẻ bài</strong></DialogTitle>
                <DialogContent>
                    {viewCard && (
                        <Box textAlign="center">
                            <img
                                src={viewCard.overallImageUrl}
                                alt={viewCard.cardName}
                                style={{ width: 180, borderRadius: 8, marginBottom: 16 }}
                            />
                            <Typography variant="h6" gutterBottom><strong>{viewCard.cardName}</strong></Typography>
                            <Typography variant="body2" gutterBottom>
                                {viewCard.cardType} | Mana: {viewCard.mana} | ATK: {viewCard.attack} | HP: {viewCard.health}
                            </Typography>
                            <Typography variant="body2"><strong>Số lượng:</strong> {viewCard.quantity}</Typography>
                            <Typography variant="body2" mt={1}><strong>Giá thị trường:</strong> ${viewCard.marketPrice}</Typography>
                            <Typography variant="body2" mt={1} sx={{ whiteSpace: 'pre-line' }}>
                                <strong>Mô tả:</strong> {viewCard.description}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewCard(null)}>Đóng</Button>
                </DialogActions>
            </Dialog>

            {/* Modal */}
            <ChangePasswordModal
                open={openChangePassword}
                onClose={() => setOpenChangePassword(false)}
                onPasswordChanged={handlePasswordChanged}
                userId={userInfo.id}
            />
            <EditUserModal
                open={openEditModal}
                onClose={() => setOpenEditModal(false)}
                onUserUpdated={handleUserUpdated}
                user={userInfo}
            />
            <SellCardModal
                open={openSellModal}
                onClose={() => setOpenSellModal(false)}
                card={selectedCard}
                onConfirm={handleSellCard}
            />
        </Box>
    );
};

export default Profile;
