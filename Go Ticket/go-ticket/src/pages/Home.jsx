import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  DirectionsBus as BusIcon,
  Train as TrainIcon,
  Flight as FlightIcon,
} from '@mui/icons-material';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Book Your Journey
              </Typography>
              <Typography variant="h5" paragraph>
                Find and book tickets for buses, trains, and flights all in one place.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ maxWidth: 500, mx: 'auto' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Search Tickets
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Where do you want to go?"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ bgcolor: 'primary.main' }}
                  >
                    Search
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Our Services
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <BusIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Bus Tickets
                </Typography>
                <Typography color="text.secondary">
                  Book bus tickets for your journey with the best prices and comfort.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrainIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Train Tickets
                </Typography>
                <Typography color="text.secondary">
                  Find and book train tickets for your next adventure.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <FlightIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" component="h3" gutterBottom>
                  Flight Tickets
                </Typography>
                <Typography color="text.secondary">
                  Book flights to your favorite destinations with ease.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 