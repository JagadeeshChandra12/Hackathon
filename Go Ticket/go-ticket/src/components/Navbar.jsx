import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Train as TrainIcon,
  Flight as FlightIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: 'white', boxShadow: 'none' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              mr: 4,
              fontWeight: 700,
              color: '#1a73e8',
              textDecoration: 'none',
              fontSize: '1.5rem',
            }}
          >
            Go-Ticket
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Button
              component={Link}
              to="/"
              sx={{ color: 'text.primary' }}
            >
              Home
            </Button>

            <Button
              component={Link}
              to="/buses"
              startIcon={<BusIcon />}
              sx={{ color: 'text.primary' }}
            >
              Buses
            </Button>

            <Button
              component={Link}
              to="/trains"
              startIcon={<TrainIcon />}
              sx={{ color: 'text.primary' }}
            >
              Trains
            </Button>

            <Button
              component={Link}
              to="/flights"
              startIcon={<FlightIcon />}
              sx={{ color: 'text.primary' }}
            >
              Flights
            </Button>

            <Button
              component={Link}
              to="/offers"
              startIcon={<OfferIcon />}
              sx={{ color: 'text.primary' }}
            >
              Offers
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={Link}
              to="/login"
              sx={{ color: 'text.primary' }}
            >
              Login
            </Button>

            <Button
              component={Link}
              to="/master-login"
              sx={{ color: 'text.primary' }}
            >
              Master Login
            </Button>

            <Button
              component={Link}
              to="/admin-login"
              sx={{ color: 'text.primary' }}
            >
              Admin Login
            </Button>

            <Button
              component={Link}
              to="/signup"
              variant="contained"
              sx={{
                backgroundColor: '#1a73e8',
                '&:hover': {
                  backgroundColor: '#1557b0',
                },
                borderRadius: '8px',
              }}
            >
              Sign Up
            </Button>

            <Button
              component={Link}
              to="/about"
              sx={{ color: 'text.primary' }}
            >
              About
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 