import React, { useEffect, useState } from "react";
import {
    Box, Typography, Card, CardContent, CardMedia, Grid, CircularProgress,
    Snackbar, Alert, TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { getToken } from "../../services/localStorageService";

const Transaction = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const res = await fetch("http://localhost:8080/transactions/myTransactions", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) throw new Error("Tải giao dịch thất bại");

                const data = await res.json();
                console.log("Transactions:", data);
                setTransactions(data.result || []);
            } catch (err) {
                console.error(err);
                setSnackbar({ open: true, message: err.message || "Có lỗi xảy ra", severity: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    useEffect(() => {
        const filtered = transactions.filter(txn => {
            const matchSearch = txn.cardName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = filterType === 'ALL' || txn.transactionType === filterType;

            const txnDate = new Date(txn.transactionDate);
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            const matchDate =
                (!from || txnDate >= from) &&
                (!to || txnDate <= to);

            return matchSearch && matchType && matchDate;
        });

        setFilteredTransactions(filtered);
    }, [searchTerm, filterType, fromDate, toDate, transactions]);

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

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

            <Typography variant="h4" color="primary" align="center" gutterBottom>
                <strong>GIAO DỊCH</strong>
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        label="Tìm kiếm theo tên thẻ"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        type="date"
                        label="Từ ngày"
                        InputLabelProps={{ shrink: true }}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                    <TextField
                        fullWidth
                        type="date"
                        label="Đến ngày"
                        InputLabelProps={{ shrink: true }}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                        <InputLabel>Lọc theo loại giao dịch</InputLabel>
                        <Select
                            value={filterType}
                            label="Lọc theo loại giao dịch"
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <MenuItem value="ALL">Tất cả</MenuItem>
                            <MenuItem value="BUY">Mua</MenuItem>
                            <MenuItem value="SELL">Bán</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                </Box>
            ) : transactions.length === 0 ? (
                <Typography textAlign="center" mt={4}>Không có giao dịch nào.</Typography>
            ) : (
                <Grid container spacing={2}>
                    {filteredTransactions.map((tx) => (
                        <Grid item xs={12} sm={6} md={4} key={tx.id}>
                            <Card sx={{ display: "flex", boxShadow: 3 }}>
                                <CardMedia
                                    component="img"
                                    image={tx.cardImageUrl}
                                    alt={tx.cardName}
                                    sx={{ width: 100, objectFit: "contain", p: 1 }}
                                />
                                <CardContent sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {tx.cardName}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Mã giao dịch: {tx.transactionCode}
                                    </Typography>
                                    <Typography variant="body2">Người mua: {tx.buyerName}</Typography>
                                    <Typography variant="body2">Người bán: {tx.sellerName}</Typography>
                                    <Typography variant="body2">Số lượng: {tx.quantity}</Typography>
                                    <Typography variant="body2">Tổng tiền: ${tx.amount}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Ngày: {new Date(tx.transactionDate).toLocaleString("vi-VN")}
                                    </Typography>
                                    <Typography variant="h6">
                                        Loại giao dịch:{" "}
                                        <strong style={{ color: tx.transactionType === "BUY" ? "green" : "blue" }}>
                                            {tx.transactionType === "BUY" ? "ĐÃ MUA" : "ĐÃ BÁN"}
                                        </strong>
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Transaction;
