import React, { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Box, Grid, Alert, Avatar
} from "@mui/material";
import axios from "axios";

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dwatrt5tw/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "game-manager";

const AddUserModal = ({ open, onClose, onUserAdded }) => {
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

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "users");

        try {
            setUploading(true);
            const res = await axios.post(CLOUDINARY_UPLOAD_URL, formData);

            console.log("✅ Cloudinary secure_url:", res.data.secure_url);

            // Kiểm tra form state trước khi update
            console.log("📋 Form state TRƯỚC khi update:", form);

            setForm(prev => {
                console.log("📋 Previous form state:", prev);
                const newForm = { ...prev, avatar: res.data.secure_url };
                console.log("📋 New form state:", newForm);
                console.log("📋 Avatar field:", newForm.avatar);
                return newForm;
            });

        } catch (err) {
            console.error("Upload failed", err);
            setError("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        console.log("🚀 SUBMIT - Form data gửi đến backend:");
        console.log(JSON.stringify(form, null, 2));
        console.log("🚀 Avatar URL:", form.avatar);
        try {
            setSubmitting(true);
            setError(null);

            const response = await axios.post("http://localhost:8080/users", form, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            onUserAdded(response.data.result);
            console.log("User created:", response.data.result);
            onClose();
            setForm({
                username: '',
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                dob: '',
                avatar: ''
            });
        } catch (err) {
            console.error("Error creating user", err);
            console.log("Response data:", err.response?.data);
            const msg = err.response?.data?.message || "Failed to create user";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Password" name="password" type="password" value={form.password} onChange={handleChange} fullWidth required />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="First Name" name="first_name" value={form.first_name} onChange={handleChange} fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} fullWidth />
                        </Grid>

                        <Grid item xs={12}>
                            <Button variant="outlined" component="label" disabled={uploading}>
                                {uploading ? "Uploading..." : "Upload Avatar"}
                                <input type="file" hidden onChange={handleFileChange} />
                            </Button>
                            {form.avatar && (
                                <Box mt={2}>
                                    <Avatar
                                        src={form.avatar}
                                        alt="avatar"
                                        sx={{ width: 80, height: 80 }}
                                    />
                                </Box>
                            )}
                        </Grid>
                    </Grid>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={submitting}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={submitting || uploading}>
                    {submitting ? "Submitting..." : "Add"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddUserModal;
