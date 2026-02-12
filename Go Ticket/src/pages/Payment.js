import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const formatRupees = (amount) => {
  return amount ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '';
};

const Payment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    amount: 1000 // Default amount, you can make this dynamic based on your needs
  });

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return month < 10 ? `0${month}` : `${month}`;
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: dbError } = await supabase
          .from('payments')
          .insert([
            {
              user_id: user.id,
              amount: parseFloat(formData.amount),
              status: 'completed',
              payment_date: new Date().toISOString()
            }
          ]);
        if (dbError) throw dbError;
      }
      setSuccess(true);
      setTimeout(() => {
        navigate('/success');
      }, 1500);
    } catch (err) {
      setError('Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  // UPI QR code (static image)
  const upiQR = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=demo@upi&pn=GoTicket&am=' + formData.amount;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Payment
        </Typography>
        <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Card" value="card" />
          <Tab label="UPI" value="upi" />
        </Tabs>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>Payment successful! Redirecting...</Alert>
        )}
        {tab === 'card' && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Number"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  inputProps={{ maxLength: 16 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Card Holder Name"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Expiry Month"
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleChange}
                  required
                >
                  {months.map((month) => (
                    <MenuItem key={month} value={month}>{month}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Expiry Year"
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleChange}
                  required
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleChange}
                  required
                  inputProps={{ maxLength: 3 }}
                  type="password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  type="number"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{ minWidth: 200, bgcolor: '#27ae60', '&:hover': { bgcolor: '#219653' } }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Pay Now'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        )}
        {tab === 'upi' && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Scan UPI QR to Pay</Typography>
            <img src={upiQR} alt="UPI QR" style={{ marginBottom: 16, width: 200, height: 200 }} />
            <Typography variant="body1" sx={{ mb: 2 }}>
              Amount: <b>{formatRupees(Number(formData.amount))}</b>
            </Typography>
            <Button
              variant="contained"
              color="success"
              disabled={loading}
              onClick={handleSubmit}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Mark as Paid'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Payment; 