import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Button,
    Card,
    CardContent,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';
import DiamondIcon from '@mui/icons-material/Diamond';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import axios from 'axios';

const denominations = [
    { money: 20000, diamonds: 20 },
    { money: 50000, diamonds: 60 },
    { money: 100000, diamonds: 130 },
    { money: 200000, diamonds: 270 },
    { money: 500000, diamonds: 700 },
];

const Payment = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Kiểm tra thông báo từ URL khi component mount
    useEffect(() => {
        const status = searchParams.get('status');
        const message = searchParams.get('message');

        if (status && message) {
            setAlert({ open: true, message: decodeURIComponent(message), severity: status });

            navigate('/payment', { replace: true });
        }
    }, [searchParams, navigate]);


    const [tab, setTab] = useState(0);
    const [selected, setSelected] = useState(null);
    const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
    const [history, setHistory] = useState([]);

    const token = localStorage.getItem("accessToken");

    const handlePayment = async () => {
        if (!selected) {
            setAlert({ open: true, message: 'Vui lòng chọn mệnh giá!', severity: 'warning' });
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:8080/api/vnpayment`,
                {
                    amount: selected.money.toString(),
                    diamonds: selected.diamonds
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            window.location.href = res.data;

        } catch (err) {
            console.error(err);
            setAlert({ open: true, message: 'Lỗi khi tạo yêu cầu thanh toán!', severity: 'error' });
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/vnpayment/myPaymentTransactions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const successfulTransactions = res.data.result.filter(
                transaction => transaction.status === 'SUCCESS'
            );

            setHistory(successfulTransactions || []);

        } catch (err) {
            console.error(err);
            setAlert({ open: true, message: 'Lỗi khi tải lịch sử nạp!', severity: 'error' });
        }
    };

    useEffect(() => {
        if (tab === 1) fetchHistory();
    }, [tab]);

    const renderStatus = (status) => {
        switch (status) {
            case 'SUCCESS':
                return <Chip label="Thành công" color="success" icon={<CheckCircleIcon />} />;
            case 'FAILED':
                return <Chip label="Thất bại" color="error" icon={<CancelIcon />} />;
            default:
                return <Chip label="Đang xử lý" color="warning" icon={<HourglassBottomIcon />} />;
        }
    };

    return (
        <Box>
            <Typography variant="h4" color="primary" gutterBottom textAlign="center">
                <strong>NẠP KIM CƯƠNG</strong>
            </Typography>
            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered>
                <Tab label="Nạp Kim Cương" />
                <Tab label="Lịch Sử Nạp" />
            </Tabs>

            {/* Nạp kim cương */}
            {tab === 0 && (
                <>
                    <Grid container spacing={2} justifyContent="center" sx={{ my: 1 }}>
                        {denominations.map((item, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                                <Card
                                    onClick={() => setSelected(item)}
                                    sx={{
                                        cursor: 'pointer',
                                        border: selected === item ? '2px solid #1976d2' : '1px solid #ccc',
                                        transition: '0.2s',
                                        '&:hover': { boxShadow: 3 },
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {item.money.toLocaleString()} VND
                                        </Typography>
                                        <Typography variant="body1" color="textSecondary">
                                            {item.diamonds} <DiamondIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {selected && (
                        <Box textAlign="center" sx={{ mb: 3 }}>
                            <Typography variant="h6">
                                Bạn sẽ nhận được <strong>{selected.diamonds}</strong> kim cương
                            </Typography>
                        </Box>
                    )}

                    <Box textAlign="center">
                        <Button variant="contained" size="large" color="primary" onClick={handlePayment}>
                            Thanh toán qua VNPay
                        </Button>
                    </Box>
                </>
            )}

            {/* Lịch sử nạp */}
            {tab === 1 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h5" textAlign="center" gutterBottom>
                        Lịch sử giao dịch nạp kim cương
                    </Typography>
                    {history.length === 0 ? (
                        <Typography textAlign="center" color="text.secondary">
                            Chưa có giao dịch nào.
                        </Typography>
                    ) : (
                        <List sx={{ maxWidth: 700, margin: '0 auto' }}>
                            {history.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {item.amountVND != null ? item.amountVND.toLocaleString() : '0'} VNĐ
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2">
                                                        Thời gian: {new Date(item.createdAt).toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Mã giao dịch: {item.orderId}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Người dùng: {item.username}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Kim cương đã nạp:{' '}
                                                        <Box component="span" sx={{ color: 'green', fontWeight: 'bold' }}>
                                                            +{item.diamonds?.toLocaleString() ?? '0'}
                                                        </Box>
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>{renderStatus(item.status)}</Box>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Box>
            )}

            <Snackbar
                open={alert.open}
                autoHideDuration={3000}
                onClose={() => setAlert({ ...alert, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Payment;
