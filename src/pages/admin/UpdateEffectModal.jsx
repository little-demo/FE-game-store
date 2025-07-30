import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Button
} from '@mui/material';
import axios from 'axios';

const EFFECT_TYPES = ["Damage", "Heal", "Draw", "Summon", "Taunt", "Buff"];
const EFFECT_TARGETS = [
    "None", "Self", "Enemy", "CurrentMinion", "All", "AllAlly", "AllEnemy",
    "AllMinions", "AllEnemyMinions", "AllAllyMinions", "RandomAllyMinion",
    "RandomEnemyMinion", "ChosenMinion", "ChosenTarget"
];

const EditEffectModal = ({ effect, onClose, onEffectUpdated }) => {
    const [form, setForm] = useState({ ...effect });
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("accessToken");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const res = await axios.put(`http://localhost:8080/cardEffects/${effect.id}`,
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const updatedEffect = res.data?.result;
            if (onEffectUpdated && updatedEffect) {
                onEffectUpdated(updatedEffect); // Gửi dữ liệu cập nhật về cha
            }
            onClose(); // Đóng modal
        } catch (err) {
            console.error('Cập nhật hiệu ứng thất bại:', err);
            alert('Cập nhật hiệu ứng thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onClose={() => onClose(null)}>
            <DialogTitle>Chỉnh sửa hiệu ứng</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth margin="dense" label="Tên"
                    name="name" value={form.name} onChange={handleChange}
                />
                <TextField
                    fullWidth select margin="dense" label="Loại"
                    name="type" value={form.type} onChange={handleChange}
                >
                    {EFFECT_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth select margin="dense" label="Mục tiêu"
                    name="target" value={form.target} onChange={handleChange}
                >
                    {EFFECT_TARGETS.map(t => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth type="number" margin="dense" label="Giá trị"
                    name="value" value={form.value} onChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose(null)} disabled={loading}>Huỷ</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditEffectModal;
