import React, { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem
} from "@mui/material";
import axios from "axios";

const EFFECT_TYPES = ["Damage", "Heal", "Draw", "Summon", "Taunt", "Buff"];
const EFFECT_TARGETS = [
    "None", "Self", "Enemy", "CurrentMinion", "All", "AllAlly", "AllEnemy",
    "AllMinions", "AllEnemyMinions", "AllAllyMinions", "RandomAllyMinion",
    "RandomEnemyMinion", "ChosenMinion", "ChosenTarget"
];

const AddEffectModal = ({ open, onClose, onEffectAdded }) => {
    const token = localStorage.getItem("accessToken");

    const [form, setForm] = useState({
        name: "",
        value: 0,
        type: "Buff",
        target: "Self"
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost:8080/cardEffects",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const newEffect = res.data.result;
            onEffectAdded(newEffect);
            onClose();
        } catch (error) {
            console.error("❌ Thêm hiệu ứng thất bại:", error);
            alert("Thêm hiệu ứng thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Thêm Hiệu Ứng</DialogTitle>
            <DialogContent>
                <TextField
                    margin="normal"
                    fullWidth
                    label="Tên"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    label="Giá trị"
                    name="value"
                    type="number"
                    value={form.value}
                    onChange={handleChange}
                />
                <TextField
                    select
                    margin="normal"
                    fullWidth
                    label="Loại"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                >
                    {EFFECT_TYPES.map(type => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    margin="normal"
                    fullWidth
                    label="Mục tiêu"
                    name="target"
                    value={form.target}
                    onChange={handleChange}
                >
                    {EFFECT_TARGETS.map(target => (
                        <MenuItem key={target} value={target}>{target}</MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Hủy</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    Thêm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddEffectModal;
