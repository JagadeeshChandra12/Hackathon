import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Paper,
  InputAdornment,
  Autocomplete,
  Alert,
  Snackbar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchResults from '../components/SearchResults';
import dayjs from 'dayjs';
import Divider from '@mui/material/Divider';

const Home = () => {
  // Cities data
  const cities = [
    'Hyderabad',
    'Bangalore',
    'Chennai',
    'Mumbai',
    'Delhi',
    'Kolkata',
    'Pune',
    'Ahmedabad'
  ];

  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: dayjs(),
    preference: 'low_budget',
  });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchParams.from || !searchParams.to) {
      setError('Please select both source and destination');
      setShowResults(false);
      return;
    }
    if (searchParams.from === searchParams.to) {
      setError('Source and destination cannot be the same!');
      setShowResults(false);
      return;
    }
    setError('');
    setShowResults(true);
  };

  const handleAddressChange = (type, newValue) => {
    setSearchParams({ ...searchParams, [type]: newValue });
    if (error) {
      setError('');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          background: showResults ? '#fff' : '#1a73e8',
          minHeight: '100vh',
          pt: { xs: 4, md: 12 },
          pb: { xs: 6, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          {!showResults && (
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 8 } }}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  mb: 2,
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }}
              >
                RouteCraft – Intelligent Travel Routes
              </Typography>
              <Divider sx={{
                width: 80,
                mx: 'auto',
                borderColor: 'rgba(255,255,255,0.4)',
                borderBottomWidth: 3,
                mb: 3
              }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#ffffff',
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  maxWidth: '800px',
                  margin: '0 auto',
                  opacity: 0.92
                }}
              >
                Personalized, multi-modal routes crafted around your time, budget, and comfort.
              </Typography>
            </Box>
          )}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 4,
              backgroundColor: '#ffffff',
              maxWidth: showResults ? 'none' : '1000px',
              margin: '0 auto',
              border: '1px solid #e0e0e0',
              boxShadow: '0 8px 32px 0 rgba(30,58,138,0.10), 0 1.5px 8px 0 rgba(30,58,138,0.08)',
              mt: { xs: 2, md: 6 },
            }}
          >
            <form onSubmit={handleSearch}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                    From
                  </Typography>
                  <Autocomplete
                    options={cities}
                    value={searchParams.from}
                    onChange={(event, newValue) => {
                      handleAddressChange('from', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Enter city"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon sx={{ color: '#666' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': {
                              backgroundColor: '#f1f3f5',
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                    To
                  </Typography>
                  <Autocomplete
                    options={cities}
                    value={searchParams.to}
                    onChange={(event, newValue) => {
                      handleAddressChange('to', newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="Enter city"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon sx={{ color: '#666' }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': {
                              backgroundColor: '#f1f3f5',
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom sx={{ ml: 1, fontWeight: 500, color: '#333' }}>
                    Date
                  </Typography>
                  <DatePicker
                    value={searchParams.date}
                    onChange={(newValue) => setSearchParams({ ...searchParams, date: newValue })}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon sx={{ color: '#666' }} />
                            </InputAdornment>
                          ),
                        },
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: '#f8f9fa',
                            '&:hover': {
                              backgroundColor: '#f1f3f5',
                            },
                          },
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ ml: 1, fontWeight: 500, color: '#333' }}
                  >
                    Travel Preference
                  </Typography>
                  <ToggleButtonGroup
                    color="primary"
                    exclusive
                    fullWidth
                    value={searchParams.preference}
                    onChange={(event, value) => {
                      if (!value) return;
                      setSearchParams({ ...searchParams, preference: value });
                    }}
                    sx={{
                      display: 'flex',
                      '& .MuiToggleButton-root': {
                        flex: 1,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 2,
                        borderColor: '#e0e0e0 !important',
                      },
                    }}
                  >
                    <ToggleButton value="low_budget">Low Budget</ToggleButton>
                    <ToggleButton value="fast">Fast Travel</ToggleButton>
                    <ToggleButton value="luxury">Luxury / Comfort</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      mt: 2,
                      height: 56,
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      backgroundColor: '#1a73e8',
                      '&:hover': {
                        backgroundColor: '#1557b0',
                      }
                    }}
                  >
                    Search Tickets
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>

          {showResults && (
            <SearchResults
              from={searchParams.from}
              to={searchParams.to}
              date={searchParams.date}
              preference={searchParams.preference}
            />
          )}

          <Snackbar 
            open={!!error} 
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setError('')} 
              severity="error" 
              sx={{ width: '100%' }}
            >
              {error}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default Home; 