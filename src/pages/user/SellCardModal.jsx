import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Typography, Grid
} from '@mui/material';

const SellCardModal = ({ open, onClose, card, onConfirm }) => {
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (card) {
            setPrice(card.marketPrice || '');
            setQuantity('');
            setError('');
        }
    }, [card]);

    const handleConfirm = () => {
        const priceValue = parseFloat(price);
        const quantityValue = parseInt(quantity);

        if (isNaN(priceValue) || priceValue <= 0) {
            setError('Giá bán không hợp lệ');
            return;
        }
        if (isNaN(quantityValue) || quantityValue <= 0) {
            setError('Số lượng không hợp lệ');
            return;
        }
        if (quantityValue > card.quantity) {
            setError(`Bạn chỉ có ${card.quantity} thẻ`);
            return;
        }

        setError('');
        onConfirm({ card, price: priceValue, quantity: quantityValue }); // gọi cha xử lý API
    };


    const totalPrice = (() => {
        const p = parseFloat(price);
        const q = parseInt(quantity);
        if (isNaN(p) || isNaN(q) || p <= 0 || q <= 0) return 0;
        return p * q;
    })();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle><strong>Bán thẻ bài</strong></DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    {/* Bên trái: ảnh thẻ */}
                    <Grid item xs={12} md={5}>
                        <Box textAlign="center">
                            <img
                                src={card?.overallImageUrl}
                                alt={card?.cardName}
                                style={{ width: '100%', borderRadius: 8 }}
                            />
                            <Typography variant="subtitle1" mt={1}>
                                <strong>{card?.cardName}</strong>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Sở hữu: {card?.quantity}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Bên phải: form nhập */}
                    <Grid item xs={12} md={7} mt={2}>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="Giá bán mỗi thẻ ($)"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                fullWidth
                                InputProps={{ inputProps: { min: 0 } }}
                            />

                            <TextField
                                label="Số lượng muốn bán"
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                fullWidth
                                InputProps={{ inputProps: { min: 1, max: card?.quantity || 1 } }}
                            />

                            <Typography variant="subtitle2" fontSize={16} mt={1}>
                                <strong>Tổng tiền:</strong> ${totalPrice.toFixed(2)}
                            </Typography>

                            {error && (
                                <Typography color="error">{error}</Typography>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button variant="contained" onClick={handleConfirm}>Xác nhận bán</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SellCardModal;
