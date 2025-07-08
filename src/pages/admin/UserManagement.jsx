import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Button, Box, IconButton,
    CircularProgress, Alert, Chip, TextField, MenuItem, InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import dayjs from "dayjs";
import AddUserModal from "./AddUserModal";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchField, setSearchField] = useState("username");
    const [searchValue, setSearchValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openAddModal, setOpenAddModal] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:8080/users", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                }
            });
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
                    }}
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
                    <MenuItem value="name">Name</MenuItem>
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
                            <TableCell><strong>Username</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Full Name</strong></TableCell>
                            <TableCell><strong>Date of Birth</strong></TableCell>
                            <TableCell><strong>Roles</strong></TableCell>
                            <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.username}>
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
                                    <IconButton><VisibilityIcon /></IconButton>
                                    <IconButton color="warning"><EditIcon /></IconButton>
                                    <IconButton color="error"><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default UserManagement;
