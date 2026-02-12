import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

const About = () => {
  const features = [
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Booking',
      description: 'Your transactions are protected with industry-standard security measures.',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '24/7 Support',
      description: 'Our customer support team is always ready to help you.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Fast & Easy',
      description: 'Book your tickets in minutes with our streamlined process.',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          About Go-Ticket
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph align="center" sx={{ mb: 6 }}>
          Your one-stop solution for all travel bookings
        </Typography>

        {/* Mission Statement */}
        <Paper elevation={3} sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Our Mission
          </Typography>
          <Typography paragraph>
            At Go-Ticket, we're committed to making travel booking simple, secure, and accessible to everyone.
            We believe that everyone should have the opportunity to explore the world, and we're here to make
            that journey easier.
          </Typography>
        </Paper>

        {/* Features */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom align="center">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary" align="center">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Why Choose Us */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Why Choose Go-Ticket?
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Wide Range of Options"
                secondary="Choose from multiple transportation options including buses, trains, and flights."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Best Price Guarantee"
                secondary="We ensure you get the best prices for your travel bookings."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Easy Cancellation"
                secondary="Flexible cancellation policies to suit your needs."
              />
            </ListItem>
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default About; 