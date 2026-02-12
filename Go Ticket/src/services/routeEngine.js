// RouteCraft route engine
// Generates multi‑modal routes (bus, train, metro, cab) between cities
// and scores them based on cost, time, and comfort for a given preference.

// Preference values expected from UI
export const PREFERENCES = {
  LOW_BUDGET: 'low_budget',
  FAST: 'fast',
  LUXURY: 'luxury',
};

// Base speed (km/h), cost (₹ per km) and comfort score for each mode
const MODE_PROFILES = {
  bus:    { speed: 55,  costPerKm: 3,  comfort: 0.6 },
  train:  { speed: 70,  costPerKm: 2.5, comfort: 0.7 },
  metro:  { speed: 40,  costPerKm: 2,  comfort: 0.75 },
  cab:    { speed: 35,  costPerKm: 10, comfort: 0.85 },
  flight: { speed: 650, costPerKm: 8,  comfort: 0.9 },
};

// Simple distance map between major cities in km (approximate, for demo)
const DISTANCES = {
  Hyderabad: { Bangalore: 570, Chennai: 630, Mumbai: 710, Delhi: 1550 },
  Bangalore: { Hyderabad: 570, Chennai: 350, Mumbai: 980, Delhi: 2150 },
  Chennai:   { Hyderabad: 630, Bangalore: 350, Mumbai: 1330, Delhi: 2200 },
  Mumbai:    { Hyderabad: 710, Bangalore: 980, Chennai: 1330, Delhi: 1400 },
  Delhi:     { Hyderabad: 1550, Bangalore: 2150, Chennai: 2200, Mumbai: 1400 },
};

const HUBS = ['Hyderabad', 'Bangalore', 'Chennai', 'Mumbai', 'Delhi'];

const getDistance = (from, to) => {
  if (from === to) return 0;
  if (DISTANCES[from] && DISTANCES[from][to]) return DISTANCES[from][to];
  if (DISTANCES[to] && DISTANCES[to][from]) return DISTANCES[to][from];
  // Fallback demo distance if pair not in map
  return 500;
};

const minutesBetween = (km, mode) => {
  const profile = MODE_PROFILES[mode];
  if (!profile) return 0;
  return Math.round((km / profile.speed) * 60);
};

const costForLeg = (km, mode) => {
  const profile = MODE_PROFILES[mode];
  if (!profile) return 0;
  const base = km * profile.costPerKm;
  // Add small randomisation so routes look different but stable for same search
  const variation = base * 0.08;
  return Math.round(base + variation);
};

const comfortForMode = (mode) => {
  const profile = MODE_PROFILES[mode];
  return profile ? profile.comfort : 0.6;
};

// Build a single leg segment
const buildSegment = ({ from, to, mode, startTime }) => {
  const km = getDistance(from, to);
  const durationMinutes = minutesBetween(km, mode);
  const cost = costForLeg(km, mode);
  const comfort = comfortForMode(mode);

  // Very simple time handling: treat startTime as "HH:mm"
  const [h, m] = startTime.split(':').map(Number);
  const startTotal = h * 60 + m;
  const endTotal = startTotal + durationMinutes;
  const endH = Math.floor((endTotal % (24 * 60)) / 60);
  const endM = endTotal % 60;
  const pad = (n) => String(n).padStart(2, '0');

  return {
    from,
    to,
    mode,
    distanceKm: km,
    durationMinutes,
    cost,
    comfort,
    departureTime: startTime,
    arrivalTime: `${pad(endH)}:${pad(endM)}`,
  };
};

// Generate candidate route templates between two cities
const generateCandidateTemplates = (from, to) => {
  const directTemplates = [
    [{ mode: 'bus' }],
    [{ mode: 'train' }],
    [{ mode: 'flight' }],
    [{ mode: 'cab' }], // premium door‑to‑door
  ];

  const multiModalTemplates = [];

  // Allow via one hub for bus + train, bus + metro, train + cab, etc.
  HUBS.forEach((hub) => {
    if (hub === from || hub === to) return;

    multiModalTemplates.push(
      // Bus + Train
      [
        { mode: 'bus', via: hub },
        { mode: 'train', via: hub },
      ],
      // Train + Metro
      [
        { mode: 'train', via: hub },
        { mode: 'metro', via: hub },
      ],
      // Flight + Cab
      [
        { mode: 'flight', via: hub },
        { mode: 'cab', via: hub },
      ],
    );
  });

  return [...directTemplates, ...multiModalTemplates];
};

// Build a concrete route instance from a template
const buildRouteFromTemplate = (from, to, template, dateLabel) => {
  const segments = [];
  let currentFrom = from;
  let totalCost = 0;
  let totalDurationMinutes = 0;

  // Start at 08:00 and add 30 minutes buffer between segments
  let nextStartMinutes = 8 * 60;
  const pad = (n) => String(n).padStart(2, '0');

  template.forEach((step, index) => {
    const isLast = index === template.length - 1;
    const stepTo = isLast ? to : step.via;
    const startTime = `${pad(Math.floor(nextStartMinutes / 60))}:${pad(
      nextStartMinutes % 60,
    )}`;

    const segment = buildSegment({
      from: currentFrom,
      to: stepTo,
      mode: step.mode,
      startTime,
    });

    segments.push(segment);
    totalCost += segment.cost;
    totalDurationMinutes += segment.durationMinutes;
    nextStartMinutes += segment.durationMinutes + 30; // 30 min transfer buffer
    currentFrom = stepTo;
  });

  const transfers = Math.max(0, segments.length - 1);
  const comfort =
    segments.reduce((sum, s) => sum + s.comfort, 0) / segments.length;

  return {
    id: `${from}-${to}-${segments.map((s) => s.mode).join('+')}`,
    from,
    to,
    dateLabel,
    segments,
    totalCost,
    totalDurationMinutes,
    transfers,
    comfort,
    primaryMode: segments[0]?.mode || 'bus',
  };
};

// Preference aware scoring
const scoreRoutes = (routes, preference) => {
  if (!routes.length) return [];

  const costs = routes.map((r) => r.totalCost);
  const durations = routes.map((r) => r.totalDurationMinutes);
  const comforts = routes.map((r) => r.comfort);

  const min = (arr) => Math.min(...arr);
  const max = (arr) => Math.max(...arr);

  const minCost = min(costs);
  const maxCost = max(costs);
  const minDur = min(durations);
  const maxDur = max(durations);
  const minComfort = min(comforts);
  const maxComfort = max(comforts);

  const normalizeBetterLow = (value, lo, hi) => {
    if (hi === lo) return 1;
    return (hi - value) / (hi - lo);
  };

  const normalizeBetterHigh = (value, lo, hi) => {
    if (hi === lo) return 1;
    return (value - lo) / (hi - lo);
  };

  const weights =
    preference === PREFERENCES.FAST
      ? { cost: 0.2, time: 0.6, comfort: 0.2 }
      : preference === PREFERENCES.LUXURY
      ? { cost: 0.15, time: 0.25, comfort: 0.6 }
      : // default: low budget
        { cost: 0.6, time: 0.25, comfort: 0.15 };

  return routes
    .map((route) => {
      const costScore = normalizeBetterLow(
        route.totalCost,
        minCost,
        maxCost,
      );
      const timeScore = normalizeBetterLow(
        route.totalDurationMinutes,
        minDur,
        maxDur,
      );
      const comfortScore = normalizeBetterHigh(
        route.comfort,
        minComfort,
        maxComfort,
      );

      const score =
        (costScore * weights.cost +
          timeScore * weights.time +
          comfortScore * weights.comfort) *
        100;

      let preferenceMatchLabel = '';
      if (preference === PREFERENCES.LOW_BUDGET) {
        if (costScore > 0.8) preferenceMatchLabel = 'Cheapest choice';
        else if (costScore > 0.6) preferenceMatchLabel = 'Budget‑friendly';
      } else if (preference === PREFERENCES.FAST) {
        if (timeScore > 0.8) preferenceMatchLabel = 'Fastest choice';
        else if (timeScore > 0.6) preferenceMatchLabel = 'Time‑efficient';
      } else if (preference === PREFERENCES.LUXURY) {
        if (comfortScore > 0.8) preferenceMatchLabel = 'Most comfortable';
        else if (comfortScore > 0.6) preferenceMatchLabel = 'High comfort';
      }

      return {
        ...route,
        score: Math.round(score),
        preferenceMatchLabel,
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((route, index) => ({
      ...route,
      rank: index + 1,
    }));
};

export const computeRoutes = (from, to, date, preference) => {
  if (!from || !to || from === to) return [];

  const dateLabel = date?.format ? date.format('DD MMM YYYY') : String(date || '');

  const templates = generateCandidateTemplates(from, to);

  const rawRoutes = templates.map((tpl) =>
    buildRouteFromTemplate(from, to, tpl, dateLabel),
  );

  return scoreRoutes(rawRoutes, preference || PREFERENCES.LOW_BUDGET);
};

