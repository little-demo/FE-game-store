import React, { useEffect, useState } from "react";
import {
    Typography,
    Box,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    CircularProgress,
} from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import axios from "axios";

const RevenueManagement = () => {
    const [transactions, setTransactions] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);

    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [transRes, revenueRes] = await Promise.all([
                    axios.get("http://localhost:8080/api/vnpayment/allPaymentTransactions", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    axios.get("http://localhost:8080/api/vnpayment/revenue-by-date", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                // ✅ Lấy đúng mảng dữ liệu từ result
                setTransactions(transRes.data.result);
                setChartData(revenueRes.data); // vì revenueRes là mảng [{date, totalRevenue}]

                // ✅ Tính tổng doanh thu
                const total = revenueRes.data.reduce((sum, item) => sum + item.totalRevenue, 0);
                setRevenue(total);

            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Quản lý doanh thu
            </Typography>

            <Typography variant="h6" color="green" gutterBottom>
                Tổng doanh thu: {revenue.toLocaleString()} đ
            </Typography>

            {/* Bảng giao dịch */}
            <Paper sx={{ mt: 4 }}>
                <Typography variant="h6" p={2}>
                    Danh sách giao dịch
                </Typography>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Người dùng</TableCell>
                            <TableCell>Mã giao dịch</TableCell>
                            <TableCell>Tiền (VNĐ)</TableCell>
                            <TableCell>Số kim cương</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Thời gian</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell>{tx.username}</TableCell>
                                <TableCell>{tx.orderId}</TableCell>
                                <TableCell>{tx.amountVND.toLocaleString()} đ</TableCell>
                                <TableCell>{tx.diamonds}</TableCell>
                                <TableCell>{tx.status}</TableCell>
                                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            <Paper sx={{ mt: 4, p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Biểu đồ doanh thu theo ngày
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalRevenue" fill="#1976d2" />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>

        </Box>
    );
};

export default RevenueManagement;
