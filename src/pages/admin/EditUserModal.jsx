import React, { useState, useEffect } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Grid, Alert, Avatar
} from "@mui/material";
import axios from "axios";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dwatrt5tw/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "game-manager";

const EditUserModal = ({ open, onClose, onUserUpdated, user }) => {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        dob: '',
        avatar: ''
    });

    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Populate form when user prop changes
    useEffect(() => {
        if (user) {
            setForm({
                username: user.username || '',
                email: user.email || '',
                password: '', // Keep password empty for security
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                dob: user.dob || '',
                avatar: user.avatar || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)");
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError("File không được vượt quá 5MB");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "users");

        try {
            setUploading(true);
            setError(null);
            const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData);
            setForm(prev => ({ ...prev, avatar: res.data.secure_url }));
        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!user?.id) {
            setError("User ID not found");
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Prepare update payload (exclude empty password)
            const updatePayload = { ...form };
            if (!updatePayload.password) {
                delete updatePayload.password;
            }
            console.log("Update payload:", updatePayload);

            const response = await axios.put(`http://localhost:8080/users/${user.id}`, updatePayload, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            onUserUpdated(response.data.result);
            console.log("User updated:", response.data.result);
            onClose();
        } catch (err) {
            console.error("Error updating user", err);
            console.log("Response data:", err.response?.data);
            const msg = err.response?.data?.message || "Failed to update user";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>Edit User</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                fullWidth
                                placeholder="Leave empty to keep current password"
                                helperText="Leave empty to keep current password"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Date of Birth"
                                name="dob"
                                type="date"
                                value={form.dob}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="First Name"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Last Name"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    disabled={uploading}
                                >
                                    {uploading ? "Uploading..." : "Change Avatar"}
                                    <input type="file" hidden onChange={handleFileChange} />
                                </Button>

                                {form.avatar && (
                                    <Avatar
                                        src={form.avatar}
                                        alt="avatar"
                                        sx={{ width: 80, height: 80 }}
                                    />
                                )}
                            </Box>
                        </Grid>
                    </Grid>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} disabled={submitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={submitting || uploading}
                >
                    {submitting ? "Updating..." : "Update"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditUserModal;