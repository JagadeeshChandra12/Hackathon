import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { supabase } from '../supabaseClient';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#2c3e50' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo and Brand */}
          <Box component={Link} to="/" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'inherit' 
          }}>
            <DirectionsBusIcon sx={{ mr: 1, fontSize: 32 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: '.1rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              RouteCraft
            </Typography>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Button 
                color="inherit" 
                component={Link} 
                to="/about"
                sx={{ textTransform: 'none' }}
              >
                About
              </Button>
            )}
            {user ? (
              <>
                <Button
                  color="inherit"
                  startIcon={<AccountCircleIcon />}
                  component={Link}
                  to="/profile"
                  sx={{ textTransform: 'none' }}
                >
                  Profile
                </Button>
                <Button
                  color="inherit"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ textTransform: 'none' }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit"
                  startIcon={<LoginIcon />}
                  component={Link}
                  to="/login"
                  sx={{ 
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  startIcon={<AccountCircleIcon />}
                  component={Link}
                  to="/register"
                  sx={{ 
                    bgcolor: '#27ae60',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#219653'
                    }
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 