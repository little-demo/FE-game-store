import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Alert, MenuItem, Box, Typography
} from "@mui/material";
import axios from "axios";

import { CardService } from "../../services/CardService";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dwatrt5tw/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "game-manager";

const cardTypes = ["MINION", "SPELL"];

const EditCardModal = ({ open, onClose, card, onCardUpdated }) => {
    const [form, setForm] = useState({
        name: '',
        description: '',
        cardType: 'MINION',
        imageUrl: '',
        overallImageUrl: '',
        mana: 0,
        attack: 0,
        health: 0,
        marketPrice: 0
    });

    const [uploading, setUploading] = useState(false);
    const [uploadTarget, setUploadTarget] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (card) {
            setForm({ ...card });
        }
    }, [card]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadTarget) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "cards");

        try {
            setUploading(true);
            const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
            setForm(prev => ({ ...prev, [uploadTarget]: res.data.secure_url }));
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError(null);

            const updatedCard = await CardService.updateCard(card.id, form);
            onCardUpdated(updatedCard);
            onClose();
        } catch (err) {
            console.error("Failed to update card", err);
            setError(err.response?.data?.message || "Failed to update card");
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle><strong>Chỉnh sửa thẻ bài</strong></DialogTitle>
            <DialogContent>
                <Box mt={2}>
                    <Grid container spacing={3}>
                        {/* Cột trái: Thông tin thẻ */}
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField label="Tên thẻ bài" name="name" value={form.name} onChange={handleChange} fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Loại thẻ"
                                        name="cardType"
                                        value={form.cardType}
                                        onChange={handleChange}
                                        select
                                        fullWidth
                                    >
                                        {cardTypes.map(type => (
                                            <MenuItem key={type} value={type}>{type}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Mô tả"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label="Năng lượng" name="mana" type="number" value={form.mana} onChange={handleChange} fullWidth />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label="Tấn công" name="attack" type="number" value={form.attack} onChange={handleChange} fullWidth />
                                </Grid>
                                <Grid item xs={4}>
                                    <TextField label="Máu" name="health" type="number" value={form.health} onChange={handleChange} fullWidth />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Giá bán"
                                        name="marketPrice"
                                        type="number"
                                        value={form.marketPrice}
                                        onChange={handleChange}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Cột phải: Upload hình ảnh */}
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>Ảnh phụ</Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        disabled={uploading}
                                        onClick={() => setUploadTarget("imageUrl")}
                                    >
                                        Upload ảnh phụ
                                        <input type="file" hidden onChange={handleFileChange} />
                                    </Button>
                                    {form.imageUrl && (
                                        <Box mt={1}>
                                            <img src={form.imageUrl} alt="card" width={180} style={{ borderRadius: 8 }} />
                                        </Box>
                                    )}
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>Ảnh thẻ bài</Typography>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        disabled={uploading}
                                        onClick={() => setUploadTarget("overallImageUrl")}
                                    >
                                        Upload ảnh thẻ bài
                                        <input type="file" hidden onChange={handleFileChange} />
                                    </Button>
                                    {form.overallImageUrl && (
                                        <Box mt={1}>
                                            <img src={form.overallImageUrl} alt="overall" width={180} style={{ borderRadius: 8 }} />
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting || uploading}>
                    {submitting ? "Updating..." : "Cập nhật"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditCardModal;
