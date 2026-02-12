import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Button, Typography, Box, Container } from '@mui/material';

function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
    } else {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Go Ticket
        </Typography>
        {user ? (
          <Box>
            <Typography variant="body1" gutterBottom>
              Logged in as: {profile?.full_name || user.email}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              Please login to continue
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 2, mr: 2 }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
            >
              Register
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Home; 