import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const Success = () => {
  const navigate = useNavigate();
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Thank you for your payment. Your booking is confirmed.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>Go to Home</Button>
          <Button variant="outlined" color="success" onClick={() => navigate('/profile')}>View Profile</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Success; 