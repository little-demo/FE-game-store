// MarketPlace.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardMedia, Chip,
    CircularProgress, Tabs, Tab, Snackbar, Alert, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider, Stack
} from '@mui/material';
import { getToken, getUserIdFromToken } from '../../services/localStorageService';

const MarketPlace = () => {
    const [tab, setTab] = useState(0); // 0: My Listings, 1: All Listings
    const [myListings, setMyListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All'); // All, Minion, Spell

    const [viewCard, setViewCard] = useState(null);

    const [buyDialog, setBuyDialog] = useState({ open: false, listing: null });
    const [buyQuantity, setBuyQuantity] = useState(1);

    const [currentUsername, setCurrentUsername] = useState(null);

    useEffect(() => {
        const id = getUserIdFromToken();
        setCurrentUsername(id);
    }, []);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };
    const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const [myRes, allRes] = await Promise.all([
                    fetch('http://localhost:8080/listings/myListing', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }),
                    fetch('http://localhost:8080/listings', {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    })
                ]);

                if (!myRes.ok) {
                    const errorText = await myRes.text(); // lấy lỗi raw từ server
                    console.error("My Listing Fetch Failed:", errorText);
                    throw new Error("My Listing failed: " + myRes.status);
                }
                const myData = await myRes.json();
                const allData = await allRes.json();

                console.log("My Listings:", myData);
                console.log("All Listings:", allData);
                setMyListings(myData.result || []);
                setAllListings(allData.result || []);
            } catch (error) {
                console.error(error);
                showSnackbar("Tải dữ liệu thất bại", "error");
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const handleCancelListing = async (listingId) => {
        try {
            const token = getToken();
            const res = await fetch(`http://localhost:8080/listings/${listingId}/cancel`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) throw new Error('Hủy bán thất bại');

            setMyListings(prev => prev.filter(listing => listing.id !== listingId));
            showSnackbar("Hủy bán thành công!");
        } catch (err) {
            console.error(err);
            showSnackbar("Hủy bán thất bại", "error");
        }
    };

    const filterListings = (listings) => {
        return listings.filter(listing => {
            const matchesName = listing.cardName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || listing.cardType === filterType;
            return matchesName && matchesType;
        });
    };

    const buyListing = async (listingId, quantity, token) => {
        const res = await fetch(`http://localhost:8080/listings/${listingId}/buy`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText);
        }

        return await res.json(); // nếu backend trả về dữ liệu
    };

    const handleBuy = async () => {
        try {
            const token = getToken();
            await buyListing(buyDialog.listing.id, buyQuantity, token);

            showSnackbar("Mua thẻ thành công!");
            setBuyDialog({ open: false, listing: null });

            // Cập nhật lại danh sách
            const updatedListings = allListings.map(item =>
                item.id === buyDialog.listing.id
                    ? { ...item, quantity: item.quantity - buyQuantity }
                    : item
            ).filter(item => item.quantity > 0);
            setAllListings(updatedListings);
            setBuyQuantity(1); // reset quantity input
        } catch (err) {
            console.error("Buy failed:", err);
            showSnackbar(err.message || "Mua thẻ thất bại", "error");
        }
    };

    const renderListingCards = (listings, isMy = false) => (
        listings.length === 0 ? (
            <Typography textAlign="center" mt={4}>Không có thẻ nào.</Typography>
        ) : (
            <Grid container spacing={2} wrap="nowrap" sx={{ overflowX: 'auto', pb: 1 }}>
                {listings.map(listing => (
                    <Grid item sx={{ minWidth: 180 }} key={listing.id}>

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
                                position: "relative"
                            }}>
                                <CardMedia
                                    component="img"
                                    image={listing.cardImageUrl}
                                    alt={listing.cardName}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover"
                                    }}
                                />

                                {/* Số lượng & trạng thái */}
                                <Box sx={{
                                    position: "absolute",
                                    top: 2,
                                    left: 2,
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    px: 1.2,
                                    py: 0.3,
                                    borderRadius: 2,
                                    fontSize: 13,
                                    fontWeight: 'bold',
                                    boxShadow: 1
                                }}>
                                    x{listing.quantity}
                                </Box>

                                <Box sx={{
                                    position: "absolute",
                                    top: 2,
                                    right: 2,
                                }}>
                                    <Chip
                                        label={listing.status}
                                        color={listing.status === "Đã bán" ? "success" : "warning"}
                                        size="small"
                                    />
                                </Box>
                            </Card>

                            {listing.status === "Đang bán" && (
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
                                        background: "rgba(0,0,0,0.5)",
                                        opacity: 0,
                                        transform: "translateY(20%)",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => setViewCard(listing)}
                                    >
                                        Xem
                                    </Button>

                                    {!isMy ? (
                                        currentUsername !== listing.sellerName && ( // hoặc listing.sellerId nếu backend trả theo kiểu đó
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => setBuyDialog({ open: true, listing })}
                                            >
                                                Mua
                                            </Button>
                                        )
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleCancelListing(listing.id)}
                                        >
                                            Hủy bán
                                        </Button>
                                    )}

                                </Box>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>
        )
    );

    return (
        <Box sx={{ textAlign: 'center' }}>
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

            <Box textAlign="center">
                <Typography variant="h4" color="primary"><strong>CỬA HÀNG</strong></Typography>
            </Box>

            <Box
                mt={1}
                mb={1}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
            >
                {/* Tabs bên trái */}
                <Tabs
                    value={tab}
                    onChange={(e, newTab) => setTab(newTab)}
                    aria-label="Tabs"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ minWidth: "300px" }}
                >
                    <Tab label="Thẻ bài của tôi đang bán" />
                    <Tab label="Cửa hàng hệ thống" />
                </Tabs>

                {/* Filter bên phải */}
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    <TextField
                        label="Tìm theo tên thẻ"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <TextField
                        select
                        label="Loại thẻ"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 150 }}
                        SelectProps={{ native: true }}
                    >
                        <option value="All">Tất cả</option>
                        <option value="MINION">Minion</option>
                        <option value="SPELL">Spell</option>
                    </TextField>
                </Box>
            </Box>


            <Box mt={3}>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {tab === 0 && renderListingCards(filterListings(myListings), true)}
                        {tab === 1 && renderListingCards(filterListings(allListings), false)}
                    </>
                )}
            </Box>
            <Dialog open={!!viewCard} onClose={() => setViewCard(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <strong>Chi tiết thẻ bài</strong>
                </DialogTitle>

                <DialogContent>
                    {viewCard && (
                        <Stack spacing={2} alignItems="center">
                            <img
                                src={viewCard.cardImageUrl}
                                alt="Card Detail"
                                style={{
                                    width: 180,
                                    height: "auto",
                                    borderRadius: 8,
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                                }}
                            />

                            <Typography variant="h6" align="center" fontWeight="bold">
                                {viewCard.cardName}
                            </Typography>

                            <Chip
                                label={viewCard.cardType}
                                color={viewCard.cardType === "MINION" ? "primary" : "secondary"}
                                variant="outlined"
                            />

                            <Stack spacing={1} sx={{ width: "100%" }}>
                                <Typography variant="body2"><strong>Người bán:</strong> {viewCard.sellerName || 'N/A'}</Typography>

                                <Typography variant="body2">
                                    <strong>Ngày đăng:</strong>{" "}
                                    {new Date(viewCard.postedAt).toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </Typography>

                                <Typography variant="body2"><strong>Số lượng:</strong> {viewCard.quantity}</Typography>
                                <Typography variant="body2"><strong>Giá mỗi thẻ:</strong> ${viewCard.sellingPrice}</Typography>
                            </Stack>

                            <Divider sx={{ width: "100%", borderBottom: "2px solid #000", my: 1 }} />

                            <Typography variant="h6" fontWeight="bold">
                                Tổng tiền: ${viewCard.sellingPrice * viewCard.quantity}
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setViewCard(null)} variant="contained">Đóng</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!viewCard} onClose={() => setViewCard(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <strong>Chi tiết thẻ bài</strong>
                </DialogTitle>

                <DialogContent>
                    {viewCard && (
                        <Stack spacing={2} alignItems="center">
                            <img
                                src={viewCard.cardImageUrl}
                                alt="Card Detail"
                                style={{
                                    width: 180,
                                    height: "auto",
                                    borderRadius: 8,
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                                }}
                            />

                            <Typography variant="h6" align="center" fontWeight="bold">
                                {viewCard.cardName}
                            </Typography>

                            <Chip
                                label={viewCard.cardType}
                                color={viewCard.cardType === "MINION" ? "primary" : "secondary"}
                                variant="outlined"
                            />

                            <Stack spacing={1} sx={{ width: "100%" }}>
                                <Typography variant="body2"><strong>Người bán:</strong> {viewCard.sellerName || 'N/A'}</Typography>

                                <Typography variant="body2">
                                    <strong>Ngày đăng:</strong>{" "}
                                    {new Date(viewCard.postedAt).toLocaleString("vi-VN", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    })}
                                </Typography>

                                <Typography variant="body2"><strong>Số lượng:</strong> {viewCard.quantity}</Typography>
                                <Typography variant="body2"><strong>Giá mỗi thẻ:</strong> ${viewCard.sellingPrice}</Typography>
                            </Stack>

                            <Divider sx={{ width: "100%", borderBottom: "2px solid #000", my: 1 }} />

                            <Typography variant="h6" fontWeight="bold">
                                Tổng tiền: ${viewCard.sellingPrice * viewCard.quantity}
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setViewCard(null)} variant="contained">Đóng</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={buyDialog.open} onClose={() => setBuyDialog({ open: false, listing: null })} maxWidth="xs" fullWidth>
                <DialogTitle><strong>Mua thẻ</strong></DialogTitle>

                <DialogContent>
                    {buyDialog.listing && (
                        <Stack spacing={2} alignItems="center">
                            <img
                                src={buyDialog.listing.cardImageUrl}
                                alt="Card Buy"
                                style={{
                                    width: 150,
                                    height: "auto",
                                    borderRadius: 8,
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
                                }}
                            />

                            <Typography variant="h6" fontWeight="bold">{buyDialog.listing.cardName}</Typography>

                            <Typography variant="body2">Giá mỗi thẻ: ${buyDialog.listing.sellingPrice}</Typography>
                            <Typography variant="body2">Số lượng còn lại: {buyDialog.listing.quantity}</Typography>

                            <TextField
                                type="number"
                                label="Số lượng muốn mua"
                                variant="outlined"
                                size="small"
                                inputProps={{ min: 1, max: buyDialog.listing.quantity }}
                                value={buyQuantity}
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > 0 && val <= buyDialog.listing.quantity) {
                                        setBuyQuantity(val);
                                    }
                                }}
                            />

                            <Typography variant="h6" fontWeight="bold">
                                Tổng tiền: ${buyDialog.listing.sellingPrice * buyQuantity}
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setBuyDialog({ open: false, listing: null })}>Hủy</Button>
                    <Button variant="contained" color="success" onClick={handleBuy}>Xác nhận mua</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default MarketPlace;
