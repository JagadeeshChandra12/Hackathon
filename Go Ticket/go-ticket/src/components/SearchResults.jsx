import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  DirectionsBus as BusIcon,
  Train as TrainIcon,
  Flight as FlightIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const SearchResults = () => {
  // Mock data for demonstration
  const results = [
    {
      id: 1,
      type: 'bus',
      from: 'New York',
      to: 'Boston',
      departure: '08:00 AM',
      arrival: '12:00 PM',
      duration: '4h',
      price: 45,
      operator: 'Greyhound',
      stops: 2,
    },
    {
      id: 2,
      type: 'train',
      from: 'New York',
      to: 'Boston',
      departure: '09:30 AM',
      arrival: '01:30 PM',
      duration: '4h',
      price: 65,
      operator: 'Amtrak',
      stops: 1,
    },
    {
      id: 3,
      type: 'flight',
      from: 'New York',
      to: 'Boston',
      departure: '10:15 AM',
      arrival: '11:15 AM',
      duration: '1h',
      price: 120,
      operator: 'Delta',
      stops: 0,
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'bus':
        return <BusIcon />;
      case 'train':
        return <TrainIcon />;
      case 'flight':
        return <FlightIcon />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Search Results
      </Typography>
      <Grid container spacing={3}>
        {results.map((result) => (
          <Grid item xs={12} key={result.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getIcon(result.type)}
                      <Typography variant="h6" component="div">
                        {result.operator}
                      </Typography>
                    </Box>
                    <Chip
                      label={result.type.toUpperCase()}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box>
                        <Typography variant="h6">{result.departure}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.from}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Divider>
                          <TimeIcon fontSize="small" />
                        </Divider>
                        <Typography variant="body2" color="text.secondary" align="center">
                          {result.duration}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6">{result.arrival}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {result.to}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h5" color="primary" gutterBottom>
                        ${result.price}
                      </Typography>
                      <Button variant="contained" fullWidth>
                        Book Now
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SearchResults; 