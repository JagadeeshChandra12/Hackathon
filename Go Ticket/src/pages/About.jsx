import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const About = () => {
  const features = [
    {
      icon: <CompareArrowsIcon color="primary" />,
      text: 'Seamless comparison of bus, train, and flight options'
    },
    {
      icon: <AccessTimeIcon color="primary" />,
      text: 'Real-time pricing and availability information'
    },
    {
      icon: <LocalOfferIcon color="primary" />,
      text: 'Exclusive deals and offers on various travel routes'
    },
    {
      icon: <SecurityIcon color="primary" />,
      text: 'Secure booking platform with multiple payment options'
    },
    {
      icon: <SupportAgentIcon color="primary" />,
      text: '24/7 customer support for all your travel needs'
    }
  ];

  const contactInfo = [
    {
      icon: <EmailIcon color="primary" />,
      title: 'Email',
      text: 'support@goticket.com'
    },
    {
      icon: <PhoneIcon color="primary" />,
      title: 'Phone',
      text: '+91 1234567890'
    },
    {
      icon: <LocationOnIcon color="primary" />,
      title: 'Address',
      text: '123 Travel Street, Digital City, Internet 10001'
    }
  ];

  return (
    <Box
      sx={{
        py: { xs: 4, md: 8 },
        backgroundColor: '#f5f5f5',
        minHeight: 'calc(100vh - 64px)'
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: '#2c3e50'
            }}
          >
            About RouteCraft
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              maxWidth: '800px',
              margin: '0 auto',
              fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
            }}
          >
            Your ultimate travel companion for comparing and booking tickets across multiple transport modes
          </Typography>
        </Box>

        {/* Mission Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            backgroundColor: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
            Our Mission
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            At RouteCraft, we're on a mission to simplify travel planning by providing a comprehensive platform where travelers can compare and book tickets for multiple modes of transportation in one place. We believe that finding the best travel option shouldn't be complicated or time-consuming.
          </Typography>
        </Paper>

        {/* Features Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            backgroundColor: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
            What We Offer
          </Typography>
          <List>
            {features.map((feature, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemIcon>
                  {feature.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={feature.text}
                  primaryTypographyProps={{
                    sx: { fontSize: '1.1rem' }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Story Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            backgroundColor: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
            Our Story
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            RouteCraft was founded in 2023 by a group of passionate travelers who were frustrated with having to visit multiple websites to find the best transport options. What started as a simple idea has now grown into a comprehensive travel booking platform serving thousands of travelers across the country.
          </Typography>
        </Paper>

        {/* Contact Section */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            backgroundColor: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
            Have questions or feedback? We'd love to hear from you!
          </Typography>
          <Grid container spacing={3}>
            {contactInfo.map((info, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 1
                  }}
                >
                  {info.icon}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {info.title}
                    </Typography>
                    <Typography variant="body1">
                      {info.text}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default About; 