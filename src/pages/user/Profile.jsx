import React, { useState, useEffect } from 'react';
import {
    Avatar, Box, Button, Card, CardMedia, Grid, Typography, Paper, CircularProgress,
    Alert, Snackbar, TextField, InputAdornment, IconButton, Dialog,
    DialogTitle, DialogContent, DialogActions, Tooltip, Tabs, Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

import ChangePasswordModal from './ChangePasswordModal';
import EditUserModal from '../admin/EditUserModal';
import SellCardModal from './SellCardModal';
import { getToken } from '../../services/localStorageService';

const Profile = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [userInfo, setUserInfo] = useState(null);
    const [cards, setCards] = useState([]);
    const [deckCards, setDeckCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewCard, setViewCard] = useState(null);
    const [openSellModal, setOpenSellModal] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };
    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));
    const deckFull = cards.reduce((total, c) => total + c.deckQuantity, 0) >= 30;

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

    const fetchDeckCards = async () => {
        try {
            const token = getToken();
            const res = await fetch('http://localhost:8080/cards/deck', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setDeckCards(data.result);
        } catch { }
    };

    const handleAddToDeck = async (cardId) => {
        try {
            const token = getToken();
            const res = await fetch('http://localhost:8080/cards/deck/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ cardId, quantity: 1 })
            });
            if (!res.ok) throw new Error();
            await res.json();
            setCards(prev => prev.map(c => c.cardId === cardId ? { ...c, deckQuantity: c.deckQuantity + 1 } : c));
            fetchDeckCards();
            showSnackbar('Đã thêm vào deck');
        } catch {
            showSnackbar('Lỗi khi thêm vào deck', 'error');
        }
    };

    const handleRemoveFromDeck = async (cardId) => {
        try {
            const token = getToken();
            const res = await fetch('http://localhost:8080/cards/deck/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ cardId })
            });
            if (!res.ok) throw new Error();
            await res.json();
            setCards(prev => prev.map(c => c.cardId === cardId ? { ...c, deckQuantity: c.deckQuantity - 1 } : c));
            fetchDeckCards();
            showSnackbar('Đã gỡ khỏi deck');
        } catch {
            showSnackbar('Lỗi khi gỡ khỏi deck', 'error');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getToken();
                const [userRes, cardsRes] = await Promise.all([
                    fetch('http://localhost:8080/users/myInfo', { headers: { Authorization: `Bearer ${token}` } }),
                    fetch('http://localhost:8080/cards/myCards', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                const userData = await userRes.json();
                const cardData = await cardsRes.json();

                console.log("Card Data:", cardData);
                setUserInfo(userData.result);
                setCards(cardData.result);
            } catch {
                showSnackbar("Lỗi tải dữ liệu", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        fetchDeckCards();
    }, []);

    const filteredDeckCards = deckCards.filter(c =>
        (filterType === 'All' || c.cardType === filterType) &&
        c.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCards = cards.filter(c =>
        (filterType === 'All' || c.cardType === filterType) &&
        c.cardName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="50vh"><CircularProgress /></Box>;

    return (
        <Box>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>

            <Box textAlign="center" mb={3}>
                <Typography variant="h4" color="primary"><strong>HỒ SƠ CÁ NHÂN</strong></Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar src={userInfo.avatar} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }} />
                        <Typography variant="h6"><strong>{userInfo.first_name} {userInfo.last_name}</strong></Typography>
                        <Typography variant="body2">Email: {userInfo.email}</Typography>
                        <Typography variant="body2">Ngày sinh: {userInfo.dob}</Typography>
                        <Typography sx={{ mt: 1 }}><strong>Số thẻ sở hữu:</strong> {cards.reduce((a, c) => a + c.quantity, 0)}</Typography>
                        <Box mt={2} display="flex" gap={1} justifyContent="center">
                            <Button variant="contained" onClick={() => setOpenEditModal(true)}>Chỉnh sửa</Button>
                            <Button variant="outlined" onClick={() => setOpenChangePassword(true)}>Đổi mật khẩu</Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" justifyContent="space-between" mt={2}>
                            {/* Tabs */}
                            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                                <Tab label="Bộ sưu tập thẻ bài" />
                                <Tab label="Bộ bài của tôi" />
                            </Tabs>

                            {/* Tìm kiếm + lọc */}
                            <Box display="flex" gap={2} flexWrap="nowrap">
                                <TextField
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
                                    sx={{ width: 200 }}
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


                        <Grid container spacing={2} mt={1}>
                            {(activeTab === 0 ? filteredCards : filteredDeckCards).map(card => (
                                <Grid item xs={12} sm={6} md={2.4} key={card.cardId}>
                                    <Box sx={{ position: "relative", "&:hover .actions": { opacity: 1, transform: "translateY(0)" } }}>
                                        <Card sx={{ height: 260, display: "flex", flexDirection: "column", boxShadow: 3, borderRadius: 2, overflow: "hidden", position: "relative" }}>
                                            <CardMedia component="img" image={card.overallImageUrl} alt={card.cardName} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            <Box sx={{ position: "absolute", top: 2, right: 2, bgcolor: 'error.main', color: 'white', px: 1.2, py: 0.3, borderRadius: 2, fontSize: 13, fontWeight: 'bold', boxShadow: 1 }}>x{activeTab === 0 ? card.quantity : card.deckQuantity}</Box>
                                        </Card>
                                        <Box className="actions" sx={{ position: "absolute", bottom: 0, width: "100%", display: "flex", justifyContent: "center", p: 1, background: "rgba(0,0,0,0.5)", opacity: 0, transform: "translateY(20%)", transition: "all 0.3s ease" }}>
                                            <IconButton color="primary" onClick={() => setViewCard(card)}><VisibilityIcon /></IconButton>
                                            {activeTab === 0 ? (
                                                <>
                                                    <IconButton color="secondary" onClick={() => { setSelectedCard(card); setOpenSellModal(true); }}><AttachMoneyIcon /></IconButton>
                                                    <Tooltip title={`Thêm vào deck (${card.deckQuantity}/${card.quantity})`}>
                                                        <span>
                                                            <IconButton color="primary" onClick={() => handleAddToDeck(card.cardId)} disabled={card.deckQuantity >= card.quantity || deckFull}>
                                                                <AddCircleIcon />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </>
                                            ) : (
                                                <Tooltip title="Gỡ khỏi deck">
                                                    <IconButton color="error" onClick={() => handleRemoveFromDeck(card.cardId)}>
                                                        <RemoveCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <Dialog open={!!viewCard} onClose={() => setViewCard(null)} maxWidth="xs" fullWidth>
                <DialogTitle><strong>Chi tiết thẻ bài</strong></DialogTitle>
                <DialogContent>
                    {viewCard && (
                        <Box textAlign="center">
                            <img src={viewCard.overallImageUrl} alt={viewCard.cardName} style={{ width: 180 }} />
                            <Typography variant="h6" gutterBottom>{viewCard.cardName}</Typography>
                            <Typography variant="body2">{viewCard.cardType} | Mana: {viewCard.mana} | ATK: {viewCard.attack} | HP: {viewCard.health}</Typography>
                            <Typography variant="body2">Số lượng: {activeTab === 0 ? viewCard.quantity : viewCard.deckQuantity}</Typography>
                            <Typography variant="body2">Giá thị trường: ${viewCard.marketPrice}</Typography>
                            <Typography variant="body2">Mô tả: {viewCard.description}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewCard(null)}>Đóng</Button>
                </DialogActions>
            </Dialog>

            <ChangePasswordModal open={openChangePassword} onClose={() => setOpenChangePassword(false)} onPasswordChanged={() => showSnackbar("Đổi mật khẩu thành công")} userId={userInfo.id} />
            <EditUserModal open={openEditModal} onClose={() => setOpenEditModal(false)} onUserUpdated={updated => { setUserInfo(updated); showSnackbar("Cập nhật thành công"); }} user={userInfo} />
            <SellCardModal open={openSellModal} onClose={() => setOpenSellModal(false)} card={selectedCard} onConfirm={handleSellCard} />
        </Box>
    );
};

export default Profile;
