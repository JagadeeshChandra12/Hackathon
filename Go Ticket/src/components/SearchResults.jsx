import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Grid,
  Container,
  Stack,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrainIcon from '@mui/icons-material/Train';
import FlightIcon from '@mui/icons-material/Flight';
import DirectionsSubwayFilledIcon from '@mui/icons-material/DirectionsSubwayFilled';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import StarsIcon from '@mui/icons-material/Stars';
import { useNavigate } from 'react-router-dom';
import { computeRoutes, PREFERENCES } from '../services/routeEngine';

const modeIcon = (mode, props = {}) => {
  // Normalize mode defensively so we never pass unexpected values
  const normalizedMode = String(mode || '').toLowerCase();

  // MUI SvgIcon expects fontSize to be a string token like 'small' | 'medium' | 'large'.
  // If a numeric fontSize is provided, move it into the sx prop instead to avoid
  // triggering MUI's internal capitalize() on a non-string value.
  const safeProps = { ...props };
  if (typeof safeProps.fontSize === 'number') {
    safeProps.sx = { ...(safeProps.sx || {}), fontSize: safeProps.fontSize };
    delete safeProps.fontSize;
  }

  switch (normalizedMode) {
    case 'bus':
      return <DirectionsBusIcon {...safeProps} />;
    case 'train':
      return <TrainIcon {...safeProps} />;
    case 'metro':
      return <DirectionsSubwayFilledIcon {...safeProps} />;
    case 'cab':
      return <LocalTaxiIcon {...safeProps} />;
    case 'flight':
      return <FlightIcon {...safeProps} />;
    default:
      return null;
  }
};

const formatDuration = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
};

const preferenceLabel = (preference) => {
  switch (preference) {
    case PREFERENCES.FAST:
      return 'Fast Travel';
    case PREFERENCES.LUXURY:
      return 'Luxury / Comfort';
    default:
      return 'Low Budget';
  }
};

const SearchResults = ({ from, to, date, preference }) => {
  const navigate = useNavigate();

  const routes = useMemo(
    () => computeRoutes(from, to, date, preference),
    [from, to, date, preference],
  );

  const topRoute = routes[0];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Smart Routes from {from} to {to}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {routes.length
            ? `Personalized for: ${preferenceLabel(preference)} on ${
                topRoute?.dateLabel
              }`
            : 'No routes found for the selected cities. Try a different pair.'}
        </Typography>
      </Box>

      {topRoute && (
        <Paper
          elevation={2}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3,
            border: '1px solid #e0f2fe',
            background:
              'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 35%, #f9fafb 100%)',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <Chip
                  icon={<StarsIcon />}
                  label={`Top Match • Rank #${topRoute.rank}`}
                  color="primary"
                  size="small"
                />
                {topRoute.preferenceMatchLabel && (
                  <Chip
                    label={topRoute.preferenceMatchLabel}
                    color="secondary"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Stack>
              <Typography variant="h6" gutterBottom>
                Recommended Route via{' '}
                {topRoute.segments.map((s) => s.mode).join(' + ').toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {from} → {to} • {topRoute.dateLabel}
              </Typography>

              <Box sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  {topRoute.segments.map((segment, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Chip
                        icon={modeIcon(segment.mode, { fontSize: 18 })}
                        label={`${segment.mode.toUpperCase()} • ${
                          segment.from
                        } → ${segment.to}`}
                        size="small"
                        variant="outlined"
                      />
                      {idx < topRoute.segments.length - 1 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mx: 0.5 }}
                        >
                          +
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="h5" fontWeight="bold">
                  ₹{topRoute.totalCost}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total estimated cost
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {formatDuration(topRoute.totalDurationMinutes)} •{' '}
                  {topRoute.transfers} transfer
                  {topRoute.transfers !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Route score: {topRoute.score}/100
                </Typography>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#1a73e8', '&:hover': { bgcolor: '#1557b0' } }}
                  fullWidth
                  onClick={() => navigate('/payment')}
                >
                  Book Recommended Route
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* All ranked routes */}
      <Box>
        {routes.slice(1).map((route) => (
          <Paper
            key={route.id}
            elevation={1}
            sx={{
              p: 3,
              mb: 2,
              borderRadius: 2,
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Chip
                    label={`Rank #${route.rank}`}
                    size="small"
                    color="default"
                  />
                  <Chip
                    icon={modeIcon(route.primaryMode, { fontSize: 18 })}
                    label={route.primaryMode.toUpperCase()}
                    size="small"
                    color={
                      route.primaryMode === 'bus'
                        ? 'primary'
                        : route.primaryMode === 'train'
                        ? 'success'
                        : route.primaryMode === 'flight'
                        ? 'secondary'
                        : 'default'
                    }
                  />
                  {route.preferenceMatchLabel && (
                    <Chip
                      label={route.preferenceMatchLabel}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Typography variant="subtitle1" gutterBottom>
                  {from} → {to} • {route.dateLabel}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  {route.segments.map((segment, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Chip
                        icon={modeIcon(segment.mode, { fontSize: 18 })}
                        label={`${segment.mode.toUpperCase()} • ${
                          segment.from
                        } → ${segment.to}`}
                        size="small"
                        variant="outlined"
                      />
                      {idx < route.segments.length - 1 && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mx: 0.5 }}
                        >
                          +
                        </Typography>
                      )}
                    </Stack>
                  ))}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography variant="h6" gutterBottom>
                  ₹{route.totalCost}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total cost
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {formatDuration(route.totalDurationMinutes)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {route.transfers} transfer
                  {route.transfers !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Score: {route.score}/100
                </Typography>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/payment')}
                >
                  Book This
                </Button>
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default SearchResults;