import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Alert, MenuItem, Box, Typography
} from "@mui/material";
import axios from "axios";

import { CardService } from "../../services/CardService";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dwatrt5tw/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "game-manager";

const EFFECT_TIMINGS = ["onPlay", "onDeath", "onStartOfTurn", "onEndOfTurn"];

const AddCardModal = ({ open, onClose, onCardAdded }) => {
    const token = localStorage.getItem("accessToken");
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

    const [bindings, setBindings] = useState([{ effectId: "", timing: "onPlay" }]);
    const [effectsList, setEffectsList] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/cardEffects", {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setEffectsList(res.data.result || []);
            });
    }, []);

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
            const payload = {
                ...form,
                effects: bindings
            };
            const newCard = await CardService.addCard(payload);
            onCardAdded(newCard);
            onClose();
            setForm({ ...form, name: '', description: '', imageUrl: '', overallImageUrl: '', mana: 0, attack: 0, health: 0, marketPrice: 0 });
        } catch (err) {
            console.error("Create card failed", err);
            setError("Failed to create card");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle><strong>Thêm thẻ bài mới</strong></DialogTitle>
            <DialogContent>
                <Box mt={2}>
                    <Grid container spacing={3}>
                        {/* Cột trái: Thông tin cơ bản */}
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
                                        <MenuItem value="MINION">MINION</MenuItem>
                                        <MenuItem value="SPELL">SPELL</MenuItem>
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
                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>Hiệu ứng</Typography>
                    {bindings.map((binding, index) => (
                        <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
                            <Grid item xs={6}>
                                <TextField
                                    label="Hiệu ứng"
                                    select
                                    fullWidth
                                    value={binding.effectId}
                                    onChange={(e) => {
                                        const newBindings = [...bindings];
                                        newBindings[index].effectId = e.target.value;
                                        setBindings(newBindings);
                                    }}
                                >
                                    {effectsList.map(effect => (
                                        <MenuItem key={effect.id} value={effect.id}>{effect.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    label="Timing"
                                    select
                                    fullWidth
                                    value={binding.timing}
                                    onChange={(e) => {
                                        const newBindings = [...bindings];
                                        newBindings[index].timing = e.target.value;
                                        setBindings(newBindings);
                                    }}
                                >
                                    {EFFECT_TIMINGS.map(timing => (
                                        <MenuItem key={timing} value={timing}>{timing}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={2}>
                                <Button color="error" onClick={() => {
                                    const updated = [...bindings];
                                    updated.splice(index, 1);
                                    setBindings(updated);
                                }}>Xóa</Button>
                            </Grid>
                        </Grid>
                    ))}
                    <Button variant="outlined" onClick={() => setBindings([...bindings, { effectId: "", timing: "onPlay" }])}>
                        Thêm hiệu ứng
                    </Button>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting || uploading}>
                    {submitting ? "Submitting..." : "Thêm"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddCardModal;
