// RouteCraft - Frontend-only Travel Planner
// Uses: Bootstrap, Leaflet, localStorage

// ===========================
// Shared Utilities
// ===========================

const RC_STORAGE_KEYS = {
  USER: 'rcUser',
  THEME: 'rcTheme',
  TRIPS: 'rcTrips',
};

const RC_CITIES = {
  Guntur: { name: 'Guntur', lat: 16.3067, lng: 80.4365, hasMetro: false },
  Vijayawada: { name: 'Vijayawada', lat: 16.5062, lng: 80.648, hasMetro: false },
  Hyderabad: { name: 'Hyderabad', lat: 17.385, lng: 78.4867, hasMetro: true },
  Chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707, hasMetro: true },
};

// Landmark destinations within cities
const RC_DESTINATIONS = {
  pvpMall: {
    key: 'pvpMall',
    label: 'PVP Mall, Vijayawada',
    city: 'Vijayawada',
    lat: 16.5085,
    lng: 80.646,
  },
  benzCircle: {
    key: 'benzCircle',
    label: 'Benz Circle, Vijayawada',
    city: 'Vijayawada',
    lat: 16.5055,
    lng: 80.6485,
  },
  charminar: {
    key: 'charminar',
    label: 'Charminar, Hyderabad',
    city: 'Hyderabad',
    lat: 17.3616,
    lng: 78.4747,
  },
  marinaBeach: {
    key: 'marinaBeach',
    label: 'Marina Beach, Chennai',
    city: 'Chennai',
    lat: 13.0500,
    lng: 80.2824,
  },
};

const PREFERENCES = {
  BUDGET: 'budget',
  FAST: 'fast',
  LUXURY: 'luxury',
};

// ===========================
// Theme Management
// ===========================

function rcApplyTheme() {
  const saved = localStorage.getItem(RC_STORAGE_KEYS.THEME);
  const theme = saved || 'light';
  document.body.classList.toggle('dark-theme', theme === 'dark');

  const iconSpan = document.getElementById('rc-theme-icon');
  const labelSpan = document.getElementById('rc-theme-label');
  if (iconSpan && labelSpan) {
    if (theme === 'dark') {
      iconSpan.textContent = '🌙';
      labelSpan.textContent = 'Dark';
    } else {
      iconSpan.textContent = '☀️';
      labelSpan.textContent = 'Light';
    }
  }
}

function rcInitThemeToggle() {
  rcApplyTheme();
  const toggle = document.getElementById('rc-theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const current = localStorage.getItem(RC_STORAGE_KEYS.THEME) || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(RC_STORAGE_KEYS.THEME, next);
    rcApplyTheme();
  });
}

// ===========================
// Auth Management (localStorage)
// ===========================

function rcGetUser() {
  const raw = localStorage.getItem(RC_STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function rcGetTrips() {
  const raw = localStorage.getItem(RC_STORAGE_KEYS.TRIPS);
  if (!raw) return [];
  try {
    const trips = JSON.parse(raw);
    return Array.isArray(trips) ? trips : [];
  } catch {
    return [];
  }
}

function rcSaveTrips(trips) {
  localStorage.setItem(RC_STORAGE_KEYS.TRIPS, JSON.stringify(trips || []));
}

function rcSetUser(user) {
  if (!user) {
    localStorage.removeItem(RC_STORAGE_KEYS.USER);
  } else {
    localStorage.setItem(RC_STORAGE_KEYS.USER, JSON.stringify(user));
  }
  rcRenderNavbarAuth();
}

function rcRenderNavbarAuth() {
  const user = rcGetUser();
  const authButtons = document.getElementById('rc-nav-auth');
  const userSection = document.getElementById('rc-nav-user');

  if (!authButtons || !userSection) return;

  if (user) {
    authButtons.classList.add('d-none');
    userSection.classList.remove('d-none');
    const nameSpan = document.getElementById('rc-nav-username');
    if (nameSpan) {
      nameSpan.textContent = user.name || 'Explorer';
    }
  } else {
    authButtons.classList.remove('d-none');
    userSection.classList.add('d-none');
  }

  const logoutBtn = document.getElementById('rc-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      rcSetUser(null);
    };
  }
}

// ===========================
// Home Page - Search & Routes
// ===========================

let rcMapInstance = null;
let rcMapMarkers = [];
let rcMapLines = [];

function rcInitMap() {
  const mapEl = document.getElementById('rc-map');
  if (!mapEl || typeof L === 'undefined') return;
  rcMapInstance = L.map('rc-map').setView([16.5, 79.5], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(rcMapInstance);
}

const RC_MODE_COLORS = {
  bus: '#3b82f6',
  train: '#22c55e',
  flight: '#a855f7',
  cab: '#f97316',
  metro: '#14b8a6',
  carpool: '#ec4899',
};

// Build multi‑modal route options between a city and a landmark destination
function rcBuildMultiModalRoutes(fromCityKey, destinationKey, preference, user) {
  const fromCity = RC_CITIES[fromCityKey];
  const cityTo = RC_CITIES[destinationKey];
  if (!fromCity || !cityTo || fromCityKey === destinationKey) return [];

  const dLat = Math.abs(fromCity.lat - cityTo.lat);
  const dLng = Math.abs(fromCity.lng - cityTo.lng);
  const approxDistance = Math.max(60, Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 140));

  const fmtTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (!h) return `${m}m`;
    if (!m) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const makeStep = (mode, fromName, toName, fromPoint, toPoint, speedKmH, pricePerKm) => {
    const distance = approxDistance;
    const minutes = (distance / speedKmH) * 60;
    const price = Math.round(distance * pricePerKm);
    return {
      mode,
      label: `${fromName} → ${toName}`,
      from: fromName,
      to: toName,
      fromLat: fromPoint.lat,
      fromLng: fromPoint.lng,
      toLat: toPoint.lat,
      toLng: toPoint.lng,
      durationMinutes: minutes,
      durationLabel: fmtTime(minutes),
      price,
      color: RC_MODE_COLORS[mode] || '#38bdf8',
    };
  };

  const cabLastMile = (fromName, fromPoint) =>
    makeStep('cab', fromName, cityTo.name, fromPoint, cityTo, 40, 9);

  // Mixes
  const budgetSteps = [
    makeStep('bus', fromCity.name, `${cityTo.name} Bus Stand`, fromCity, cityTo, 50, 1.5),
    cabLastMile(`${cityTo.name} Bus Stand`, cityTo),
  ];

  const fastSteps = [
    makeStep('flight', `${fromCity.name} Airport`, `${cityTo.name} Airport`, fromCity, cityTo, 600, 6),
    cabLastMile(`${cityTo.name} Airport`, cityTo),
  ];

  const luxurySteps = cityTo.hasMetro
    ? [
        makeStep('train', `${fromCity.name} Jn.`, `${cityTo.name} Jn.`, fromCity, cityTo, 70, 2),
        makeStep('metro', `${cityTo.name} Jn.`, `${cityTo.name} Metro`, cityTo, cityTo, 35, 1.2),
        cabLastMile(`${cityTo.name} Metro`, cityTo),
      ]
    : [
        makeStep('train', `${fromCity.name} Jn.`, `${cityTo.name} Jn.`, fromCity, cityTo, 70, 2),
        cabLastMile(`${cityTo.name} Jn.`, cityTo),
      ];

  const carpoolSteps = [
    makeStep('carpool', `${fromCity.name} Pickup`, `${cityTo.name} Drop`, fromCity, cityTo, 55, 3),
    cabLastMile(`${cityTo.name} Drop`, cityTo),
  ];

  const routeDefs = [
    { id: 'budget', label: 'Budget mix (Bus + Cab)', steps: budgetSteps },
    { id: 'fast', label: 'Fastest (Flight + Cab)', steps: fastSteps },
    { id: 'luxury', label: 'Comfort (Train + Metro + Cab)', steps: luxurySteps },
    { id: 'carpool', label: 'Carpool + Cab', steps: carpoolSteps },
  ];

  const routes = routeDefs.map((def) => {
    const totalMinutes = def.steps.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalPrice = def.steps.reduce((sum, s) => sum + s.price, 0);
    const cabSegments = def.steps.filter((s) => s.mode === 'cab').length;

    let baseScore = 80;
    if (def.id === 'budget') baseScore += 4;
    if (def.id === 'fast') baseScore += 8;
    if (def.id === 'luxury') baseScore += 6;

    const score = Math.min(
      99,
      Math.round(baseScore - totalMinutes / 220 + (12000 - totalPrice) / 900),
    );

    const route = {
      id: `${fromCityKey}-${cityTo.name}-${def.id}`,
      fromCity: fromCity.name,
      toCity: cityTo.name,
      destinationLabel: cityTo.name,
      steps: def.steps,
      totalMinutes,
      totalDurationLabel: fmtTime(totalMinutes),
      totalPrice,
      score,
      tags: [],
      primaryMode: def.steps[0]?.mode || 'bus',
      cabSegments,
    };

    if (def.id === 'budget') route.tags.push('💰 Cheapest');
    if (def.id === 'fast') route.tags.push('⚡ Fastest');
    if (def.id === 'luxury') route.tags.push('✨ Comfort');
    if (def.id === 'carpool') route.tags.push('🤝 Carpool');

    if (user && user.travelPreference === def.id) {
      route.tags.push('Best for you');
      route.personalized = true;
    }

    return route;
  });

  const pref = preference || PREFERENCES.BUDGET;
  routes.sort((a, b) => {
    if (pref === PREFERENCES.BUDGET && a.totalPrice !== b.totalPrice) {
      return a.totalPrice - b.totalPrice;
    }
    if (pref === PREFERENCES.FAST && a.totalMinutes !== b.totalMinutes) {
      return a.totalMinutes - b.totalMinutes;
    }
    if (pref === PREFERENCES.LUXURY && a.cabSegments !== b.cabSegments) {
      return b.cabSegments - a.cabSegments;
    }
    return b.score - a.score;
  });

  if (routes[0]) {
    if (!routes[0].tags.includes('🔥 Top Match')) {
      routes[0].tags.unshift('🔥 Top Match');
    }
    routes[0].isTop = true;
  }

  return routes;
}

function rcUpdateMapForRoute(route) {
  if (!rcMapInstance || !route || !route.steps) return;

  rcMapMarkers.forEach((m) => rcMapInstance.removeLayer(m));
  rcMapMarkers = [];
  rcMapLines.forEach((l) => rcMapInstance.removeLayer(l));
  rcMapLines = [];

  const boundsPoints = [];
  const markerKeys = new Set();

  route.steps.forEach((step) => {
    const from = [step.fromLat, step.fromLng];
    const to = [step.toLat, step.toLng];

    boundsPoints.push(from, to);

    const keyFrom = `${from[0]}:${from[1]}`;
    const keyTo = `${to[0]}:${to[1]}`;

    if (!markerKeys.has(keyFrom)) {
      const marker = L.marker(from).addTo(rcMapInstance);
      marker.bindPopup(step.from);
      rcMapMarkers.push(marker);
      markerKeys.add(keyFrom);
    }
    if (!markerKeys.has(keyTo)) {
      const marker = L.marker(to).addTo(rcMapInstance);
      marker.bindPopup(step.to);
      rcMapMarkers.push(marker);
      markerKeys.add(keyTo);
    }

    const line = L.polyline([from, to], {
      color: step.color,
      weight: 4,
      opacity: 0.9,
    }).addTo(rcMapInstance);
    rcMapLines.push(line);
  });

  if (boundsPoints.length) {
    const bounds = L.latLngBounds(boundsPoints);
    rcMapInstance.fitBounds(bounds, { padding: [40, 40] });
  }
}

function rcRenderRoutes(from, to, preference) {
  const container = document.getElementById('rc-routes');
  const emptyState = document.getElementById('rc-routes-empty');
  if (!container || !emptyState) return;

  const user = rcGetUser();
  const filtered = rcBuildMultiModalRoutes(from, to, preference, user);
  if (!filtered.length) {
    container.innerHTML = '';
    emptyState.classList.remove('d-none');
    return;
  }

  const pref = preference || PREFERENCES.BUDGET;

  container.innerHTML = '';
  emptyState.classList.add('d-none');

  filtered.forEach((route, index) => {
    const transportChain = route.steps
      .map((s) =>
        s.mode === 'bus'
          ? '🚌'
          : s.mode === 'train'
          ? '🚆'
          : s.mode === 'flight'
          ? '✈️'
          : s.mode === 'metro'
          ? '🚇'
          : s.mode === 'carpool'
          ? '🚗'
          : '🚕',
      )
      .join('  →  ');

    const tags = [...(route.tags || [])];
    const scoreWidth = Math.max(55, Math.min(route.score, 100));

    const bestForYou = route.personalized || route.isTop;

    const card = document.createElement('div');
    card.className = 'card rc-route-card mb-3 rc-fade-in';
    card.innerHTML = `
      <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span class="rc-transport-badge rc-badge-train">
              ${transportChain}
            </span>
            ${tags
              .map(
                (t) =>
                  `<span class="rc-badge-tag ${
                    t.includes('Cheapest')
                      ? 'bg-success-subtle text-success-emphasis'
                      : t.includes('Fastest')
                      ? 'bg-info-subtle text-info-emphasis'
                      : t.includes('Best for you') || bestForYou
                      ? 'bg-primary-subtle text-primary-emphasis'
                      : 'bg-secondary-subtle text-secondary-emphasis'
                  }">${t}</span>`,
              )
              .join('')}
            ${
              bestForYou && !tags.includes('Best for you')
                ? '<span class="rc-badge-tag bg-primary-subtle text-primary-emphasis">Best for you</span>'
                : ''
            }
          </div>
          <h6 class="mb-1">${route.fromCity} → ${route.destinationLabel}</h6>
          <ul class="rc-step-list mb-2">
            ${route.steps
              .map(
                (step, idx) => `
              <li class="rc-step-item">
                <div class="rc-step-dot" style="background:${step.color};"></div>
                ${
                  idx < route.steps.length - 1
                    ? '<div class="rc-step-line"></div>'
                    : ''
                }
                <div>
                  <div class="small"><strong>${step.label}</strong></div>
                  <div class="small rc-muted">
                    ${
                      step.mode === 'bus'
                        ? '🚌 Bus'
                        : step.mode === 'train'
                        ? '🚆 Train'
                        : step.mode === 'flight'
                        ? '✈️ Flight'
                        : step.mode === 'metro'
                        ? '🚇 Metro'
                        : step.mode === 'carpool'
                        ? '🚗 Carpool'
                        : '🚕 Cab'
                    }
                    • ${step.durationLabel} • ₹${step.price}
                  </div>
                </div>
              </li>`,
              )
              .join('')}
          </ul>
          <div>
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="rc-muted">Route score</small>
              <small><strong>${route.score}</strong> / 100</small>
            </div>
            <div class="rc-progress">
              <div class="rc-progress-bar" style="width: ${scoreWidth}%;"></div>
            </div>
          </div>
        </div>
        <div class="d-flex flex-column align-items-md-end align-items-start gap-2">
          <p class="mb-0 rc-muted small text-md-end">
            Preference: ${
              pref === PREFERENCES.BUDGET
                ? 'Low Budget'
                : pref === PREFERENCES.FAST
                ? 'Fast Travel'
                : 'Luxury / Comfort'
            }
          </p>
          <div class="text-md-end">
            <div class="fw-semibold">₹${route.totalPrice}</div>
            <div class="rc-muted small">${route.totalDurationLabel}</div>
          </div>
          <button class="btn btn-primary px-4 rc-book-btn" type="button">
            Book This
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', () => rcUpdateMapForRoute(route));
    const bookBtn = card.querySelector('.rc-book-btn');
    if (bookBtn) {
      bookBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trips = rcGetTrips();
        trips.unshift({
          id: route.id + '-' + Date.now(),
          fromCity: route.fromCity,
          destinationLabel: route.destinationLabel,
          preference: pref,
          totalPrice: route.totalPrice,
          totalDurationLabel: route.totalDurationLabel,
          createdAt: new Date().toISOString(),
          chain: route.steps
            .map((s) =>
              s.mode === 'bus'
                ? '🚌'
                : s.mode === 'train'
                ? '🚆'
                : s.mode === 'flight'
                ? '✈️'
                : s.mode === 'metro'
                ? '🚇'
                : s.mode === 'carpool'
                ? '🚗'
                : '🚕',
            )
            .join(' → '),
        });
        rcSaveTrips(trips.slice(0, 6)); // keep last 6
        rcRenderTrips();
        alert('Trip saved to your dashboard.');
      });
    }
    container.appendChild(card);
  });

  // Show first route on map + personal plan if present
  if (filtered[0]) {
    rcUpdateMapForRoute(filtered[0]);
  }
}

function rcRenderTrips() {
  const listEl = document.getElementById('rc-trips');
  const countLabel = document.getElementById('rc-trips-count-label');
  if (!listEl || !countLabel) return;

  const trips = rcGetTrips();
  listEl.innerHTML = '';

  if (!trips.length) {
    countLabel.textContent = 'No saved trips yet';
    return;
  }

  countLabel.textContent = `${trips.length} trip${trips.length > 1 ? 's' : ''} saved`;

  trips.forEach((trip) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-xl-4';
    col.innerHTML = `
      <div class="card rc-trips-card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="badge bg-primary-subtle text-primary-emphasis">Saved Trip</span>
            <small class="rc-muted">${trip.preference === 'budget' ? 'Low Budget' : trip.preference === 'fast' ? 'Fast Travel' : 'Luxury / Comfort'}</small>
          </div>
          <h6 class="mb-1">${trip.fromCity} → ${trip.destinationLabel}</h6>
          <p class="small rc-muted mb-2">Chain: ${trip.chain}</p>
          <p class="small mb-1">
            <strong>₹${trip.totalPrice}</strong> • ${trip.totalDurationLabel}
          </p>
        </div>
      </div>
    `;
    listEl.appendChild(col);
  });
}

function rcInitHome() {
  const fromSelect = document.getElementById('rc-from');
  const toSelect = document.getElementById('rc-to');
  const prefBtns = document.querySelectorAll('[data-rc-pref]');
  const form = document.getElementById('rc-search-form');

  if (!fromSelect || !toSelect || !form) return;

  // Populate city dropdowns
  const cities = Object.keys(RC_CITIES);
  cities.forEach((city) => {
    const optFrom = document.createElement('option');
    optFrom.value = city;
    optFrom.textContent = city;
    fromSelect.appendChild(optFrom);
    const optTo = document.createElement('option');
    optTo.value = city;
    optTo.textContent = city;
    toSelect.appendChild(optTo);
  });

  // Default values
  const user = rcGetUser();
  fromSelect.value = user?.homeCity || 'Guntur';
  toSelect.value = fromSelect.value === 'Guntur' ? 'Vijayawada' : 'Guntur';

  let currentPref = PREFERENCES.BUDGET;

  function updatePrefButtons() {
    prefBtns.forEach((btn) => {
      const val = btn.getAttribute('data-rc-pref');
      btn.classList.toggle('active', val === currentPref);
    });
  }

  prefBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.getAttribute('data-rc-pref');
      if (!val) return;
      currentPref = val;
      updatePrefButtons();
      // Trigger rerender if we already have a selection
      if (fromSelect.value && toSelect.value && fromSelect.value !== toSelect.value) {
        rcRenderRoutes(fromSelect.value, toSelect.value, currentPref);
      }
    });
  });

  updatePrefButtons();

  // Search
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!fromSelect.value || !toSelect.value || fromSelect.value === toSelect.value) {
      alert('Please pick two different cities.');
      return;
    }
    rcRenderRoutes(fromSelect.value, toSelect.value, currentPref);
  });

  // Map
  rcInitMap();

  // Personalized smart plan section
  const planEl = document.getElementById('rc-personal-plan');
  const contextEl = document.getElementById('rc-personal-context');
  const summaryEl = document.getElementById('rc-personal-summary');
  const metaEl = document.getElementById('rc-personal-meta');

  if (user && planEl && contextEl && summaryEl && metaEl) {
    const routes = rcBuildMultiModalRoutes(
      user.homeCity || 'Guntur',
      'Vijayawada',
      user.travelPreference || PREFERENCES.BUDGET,
      user,
    );
    if (routes.length) {
      const best = routes[0];
      planEl.classList.remove('d-none');
      contextEl.textContent = `Based on your home city (${user.homeCity}) and ${best.destinationLabel}.`;
      summaryEl.innerHTML = `
        Best match: <strong>${best.label}</strong><br />
        Chain: ${best.steps
          .map((s) =>
            s.mode === 'bus'
              ? '🚌'
              : s.mode === 'train'
              ? '🚆'
              : s.mode === 'flight'
              ? '✈️'
              : s.mode === 'metro'
              ? '🚇'
              : s.mode === 'carpool'
              ? '🚗'
              : '🚕',
          )
          .join(' → ')}
      `;
      metaEl.textContent = `₹${best.totalPrice} • ${best.totalDurationLabel} • Score ${best.score}/100`;
    }
  }

  // If some pre-selected route comes from Explore page in future, we could read it here.

  // Load existing trips into dashboard
  rcRenderTrips();
}

// ===========================
// Auth Page (login.html)
// ===========================

function rcInitAuth() {
  const loginForm = document.getElementById('rc-login-form');
  const signupForm = document.getElementById('rc-signup-form');
  const toggleToSignup = document.getElementById('rc-toggle-signup');
  const toggleToLogin = document.getElementById('rc-toggle-login');

  if (!loginForm || !signupForm) return;

  function showForm(form) {
    if (form === 'login') {
      loginForm.classList.remove('d-none');
      signupForm.classList.add('d-none');
    } else {
      loginForm.classList.add('d-none');
      signupForm.classList.remove('d-none');
    }
  }

  if (toggleToSignup) {
    toggleToSignup.addEventListener('click', (e) => {
      e.preventDefault();
      showForm('signup');
    });
  }
  if (toggleToLogin) {
    toggleToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      showForm('login');
    });
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('rc-login-email').value.trim();
    const password = document.getElementById('rc-login-password').value.trim();
    const user = rcGetUser();

    if (!user || user.email !== email || user.password !== password) {
      alert('Invalid credentials. Please check your email & password or sign up.');
      return;
    }

    alert(`Welcome back, ${user.name}!`);
    window.location.href = 'index.html';
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rc-signup-name').value.trim();
    const email = document.getElementById('rc-signup-email').value.trim();
    const password = document.getElementById('rc-signup-password').value.trim();
    const homeCity = document.getElementById('rc-signup-homecity').value;
    const travelPreference = document.getElementById('rc-signup-preference').value;

    if (!name || !email || !password || !homeCity || !travelPreference) {
      alert('Please fill in all fields, including home city and preference.');
      return;
    }

    rcSetUser({ name, email, password, homeCity, travelPreference });
    alert('Account created! You can now use RouteCraft.');
    window.location.href = 'index.html';
  });
}

// ===========================
// Explore Page (static)
// ===========================

function rcInitExplore() {
  // Currently static. Hook events later if needed.
}

// ===========================
// Init per page
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  rcInitThemeToggle();
  rcRenderNavbarAuth();

  const page = document.body.dataset.page;
  if (page === 'home') {
    rcInitHome();
  } else if (page === 'auth') {
    rcInitAuth();
  } else if (page === 'explore') {
    rcInitExplore();
  }
});

