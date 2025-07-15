// Profile.js
import React from 'react';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Typography,
    Paper,
} from '@mui/material';

const cardData = [
    { name: 'Rồng Vàng', rarity: 'legendary', icon: '★' },
    { name: 'Phù Thủy', rarity: 'epic', icon: '⚡' },
    { name: 'Chiến Binh', rarity: 'rare', icon: '🗡️' },
    { name: 'Lính Canh', rarity: 'common', icon: '🛡️' },
    { name: 'Pháp Sư', rarity: 'epic', icon: '🔥' },
    { name: 'Cung Thủ', rarity: 'rare', icon: '🏹' },
];

const rarityColors = {
    legendary: '#f39c12',
    epic: '#e74c3c',
    rare: '#9b59b6',
    common: '#95a5a6',
};

const Profile = () => {
    return (
        <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" color="primary" gutterBottom>
                <strong>GIAO DỊCH</strong>
            </Typography>
        </Box>
    );
};

export default Profile;
