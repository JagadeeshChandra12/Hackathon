import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Paper, Typography, Button, Box, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';

function formatRupees(amount) {
  return amount ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '';
}

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) {
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const fetchPayments = async () => {
      setPaymentsLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('payment_date', { ascending: false });
      if (!error) setPayments(data || []);
      setPaymentsLoading(false);
    };
    fetchPayments();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (!profile) return <Typography>Profile not found.</Typography>;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Profile</Typography>
          <Typography variant="body1"><b>Full Name:</b> {profile.full_name}</Typography>
          <Typography variant="body1"><b>Email:</b> {profile.email}</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/')}>Back to Home</Button>
        </Paper>
        <Divider sx={{ my: 4 }} />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Booking & Payment History</Typography>
          {paymentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : payments.length === 0 ? (
            <Typography>No bookings or payments found.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatRupees(p.amount)}</TableCell>
                      <TableCell>{p.status}</TableCell>
                      <TableCell>{new Date(p.payment_date).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Profile; 