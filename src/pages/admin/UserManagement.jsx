import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Button, Box, IconButton,
    CircularProgress, Alert, Chip, TextField, MenuItem, InputAdornment, Switch, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import axios from "axios";
import dayjs from "dayjs";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchField, setSearchField] = useState("username");
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:8080/users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                }
            });
            console.log("Fetched user IDs:", response.data.result);
            setUsers(response.data.result);
            setFilteredUsers(response.data.result);
            setError(null);
        } catch (err) {
            console.error("Error loading users", err);
            setError("Failed to load user list");
        } finally {
            setLoading(false);
        }
    };

    const searchUsersFromApi = async (field, value) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            params.append(field, value);

            const response = await axios.get(`http://localhost:8080/users/search?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                }
            });

            setFilteredUsers(response.data.result);
        } catch (err) {
            console.error("Search failed", err);
            setError("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Handle edit user
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setOpenEditModal(true);
    };

    // Handle close edit modal
    const handleCloseEditModal = () => {
        setOpenEditModal(false);
        setSelectedUser(null);
    };

    // Handle user updated
    const handleUserUpdated = (updatedUser) => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === updatedUser.id ? { ...updatedUser } : user
            )
        );
        setFilteredUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === updatedUser.id ? { ...updatedUser } : user
            )
        );
        showSnackbar("User updated successfully");
        console.log('User updated successfully:', updatedUser);
    };


    // Handle delete user
    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`http://localhost:8080/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                }
            });

            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            console.log('User deleted successfully');
            showSnackbar("User deleted successfully");
        } catch (err) {
            console.error("Error deleting user", err);
            setError("Failed to delete user");
            showSnackbar("Failed to delete user", "error");
        }
    };

    const handleToggleUser = async (userId) => {
        try {
            const res = await axios.patch(`http://localhost:8080/users/${userId}/toggle`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            });

            const updated = res.data.result;
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setFilteredUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        } catch (err) {
            console.error("Toggle failed", err);
            alert("Failed to toggle user status");
        }
    };



    const formatRoles = (roles) => {
        return roles?.map(role => (
            <Chip
                key={role.id || role.name}
                label={role.name || role}
                size="small"
                sx={{ mr: 1, mb: 1 }}
            />
        )) || null;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                p: 3,
                gap: 2
            }}>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <Typography variant="h4">User Management</Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddModal(true)}>
                        Add User
                    </Button>

                    <AddUserModal
                        open={openAddModal}
                        onClose={() => setOpenAddModal(false)}
                        onUserAdded={(newUser) => {
                            setUsers(prev => [...prev, newUser]);
                            setFilteredUsers(prev => [...prev, newUser]);
                            showSnackbar("User added successfully");
                        }}
                    />
                    <EditUserModal
                        open={openEditModal}
                        onClose={handleCloseEditModal}
                        onUserUpdated={handleUserUpdated}
                        user={selectedUser}
                    />
                </Box>

                {/* Bộ lọc */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        select
                        label="Filter by"
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        size="small"
                        sx={{ minWidth: 140 }}
                    >
                        <MenuItem value="username">Username</MenuItem>
                        <MenuItem value="email">Email</MenuItem>
                    </TextField>

                    <TextField
                        placeholder="Enter search keyword..."
                        variant="outlined"
                        size="small"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                        sx={{ flex: 1 }}
                    />

                    <Button
                        variant="contained"
                        onClick={() => {
                            const trimmed = searchValue.trim();
                            if (trimmed) {
                                searchUsersFromApi(searchField, trimmed);
                            } else {
                                setFilteredUsers(users); // nếu rỗng thì hiển thị lại danh sách đầy đủ
                            }
                        }}
                    >
                        Search
                    </Button>
                </Box>


                <TableContainer component={Paper} sx={{ flex: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell><strong>Avatar</strong></TableCell>
                                <TableCell><strong>Username</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Full Name</strong></TableCell>
                                <TableCell><strong>Date of Birth</strong></TableCell>
                                <TableCell><strong>Roles</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.username}>
                                    <TableCell>
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar ? `${user.avatar}?t=${Date.now()}` : ""}
                                                alt="avatar"
                                                width={40}
                                                height={40}
                                                style={{ borderRadius: '50%' }}
                                            />

                                        ) : 'N/A'}
                                    </TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.first_name} {user.last_name}</TableCell>
                                    <TableCell>
                                        {user.dob ? dayjs(user.dob).format('DD/MM/YYYY') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                            {formatRoles(user.roles)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={user.enabled}
                                            onChange={() => handleToggleUser(user.id)}
                                            color="success"
                                            inputProps={{ 'aria-label': 'Enable user' }}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <IconButton><VisibilityIcon /></IconButton>
                                        <IconButton
                                            color="warning"
                                            onClick={() => handleEditUser(user)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => setConfirmDeleteId(user.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box >

            <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this user?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                    <Button
                        onClick={() => {
                            handleDeleteUser(confirmDeleteId);
                            setConfirmDeleteId(null);
                        }}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserManagement;
