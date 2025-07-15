// MarketPlace.js
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardMedia, Chip,
    CircularProgress, Tabs, Tab, Snackbar, Alert, Button
} from '@mui/material';
import { getToken } from '../../services/localStorageService';

const MarketPlace = () => {
    const [tab, setTab] = useState(0); // 0: My Listings, 1: All Listings
    const [myListings, setMyListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }),
                    fetch('http://localhost:8080/listings', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    })
                ]);

                const myData = await myRes.json();
                const allData = await allRes.json();

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


    const renderListingCards = (listings, isMy = false) => (
        listings.length === 0 ? (
            <Typography textAlign="center" mt={4}>Không có thẻ nào.</Typography>
        ) : (
            <Grid container spacing={2}>
                {listings.map(listing => (
                    <Grid item xs={12} sm={6} md={2.4} key={listing.id}>
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

                            {/* Action hủy bán nếu là của tôi và chưa bán */}
                            {isMy && listing.status === "Đang bán" && (
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
                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleCancelListing(listing.id)}
                                    >
                                        Hủy bán
                                    </Button>
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

            <Tabs value={tab} onChange={(e, newTab) => setTab(newTab)} centered>
                <Tab label="Thẻ bài của tôi đang bán" />
                <Tab label="Cửa hàng hệ thống" />
            </Tabs>

            <Box mt={3}>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={5}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {tab === 0 && renderListingCards(myListings, true)}
                        {tab === 1 && renderListingCards(allListings, false)}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default MarketPlace;
