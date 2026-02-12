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

// Demo accounts for easy login in hackathon demos
const RC_DEMO_USERS = [
  {
    name: 'RouteCraft Demo',
    email: 'demo@routecraft.com',
    password: 'demo123',
    homeCity: 'Guntur',
    travelPreference: 'budget',
  },
  {
    name: 'Navya',
    email: 'navya@routecraft.com',
    password: 'navya123',
    homeCity: 'Vijayawada',
    travelPreference: 'fast',
  },
];

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
let rcPendingBooking = null;

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

// Build simple city‑to‑city route options (no intermediate steps)
function rcBuildMultiModalRoutes(fromCityKey, toCityKey, preference, user) {
  const fromCity = RC_CITIES[fromCityKey];
  const cityTo = RC_CITIES[toCityKey];
  if (!fromCity || !cityTo || fromCityKey === toCityKey) return [];

  const dLat = Math.abs(fromCity.lat - cityTo.lat);
  const dLng = Math.abs(fromCity.lng - cityTo.lng);
  const approxDistance = Math.max(
    60,
    Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 140),
  );

  const fmtTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (!h) return `${m}m`;
    if (!m) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const makeRoute = (mode, speedKmH, pricePerKm) => {
    const minutes = (approxDistance / speedKmH) * 60;
    const price = Math.round(approxDistance * pricePerKm);
    return {
      id: `${fromCityKey}-${toCityKey}-${mode}`,
      fromKey: fromCityKey,
      toKey: toCityKey,
      fromCity: fromCity.name,
      toCity: cityTo.name,
      mode,
      durationMinutes: minutes,
      durationLabel: fmtTime(minutes),
      price,
      totalMinutes: minutes,
      totalDurationLabel: fmtTime(minutes),
      totalPrice: price,
      score: 0, // filled later
      tags: [],
      primaryMode: mode,
    };
  };

  // Core modes for simple routes
  const routes = [
    makeRoute('bus', 50, 1.5),
    makeRoute('train', 70, 1.2),
    makeRoute('cab', 45, 7.5),
  ];

  // Scoring + badges
  const minPrice = Math.min(...routes.map((r) => r.price));
  const minMinutes = Math.min(...routes.map((r) => r.durationMinutes));

  routes.forEach((r) => {
    let baseScore = 80;
    if (r.mode === 'train') baseScore += 8;
    if (r.mode === 'bus') baseScore += 4;
    if (r.mode === 'cab') baseScore += 6;

    r.score = Math.min(
      99,
      Math.round(
        baseScore -
          r.durationMinutes / 250 +
          (minPrice * 1.5 - r.price) / 900,
      ),
    );

    if (r.price === minPrice) r.tags.push('💰 Cheapest');
    if (r.durationMinutes === minMinutes) r.tags.push('⚡ Fastest');

    // Personalization tag based on user preference and mode
    if (user) {
      if (
        user.travelPreference === PREFERENCES.BUDGET &&
        r.mode === 'bus'
      ) {
        r.tags.push('Best for you');
        r.personalized = true;
      } else if (
        user.travelPreference === PREFERENCES.FAST &&
        r.mode === 'train'
      ) {
        r.tags.push('Best for you');
        r.personalized = true;
      } else if (
        user.travelPreference === PREFERENCES.LUXURY &&
        r.mode === 'cab'
      ) {
        r.tags.push('Best for you');
        r.personalized = true;
      }
    }
  });

  const pref = preference || PREFERENCES.BUDGET;
  routes.sort((a, b) => {
    if (pref === PREFERENCES.BUDGET && a.price !== b.price) {
      return a.price - b.price;
    }
    if (pref === PREFERENCES.FAST && a.durationMinutes !== b.durationMinutes) {
      return a.durationMinutes - b.durationMinutes;
    }
    if (pref === PREFERENCES.LUXURY) {
      if (a.mode === 'cab' && b.mode !== 'cab') return -1;
      if (b.mode === 'cab' && a.mode !== 'cab') return 1;
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
  if (!rcMapInstance || !route) return;

  rcMapMarkers.forEach((m) => rcMapInstance.removeLayer(m));
  rcMapMarkers = [];
  rcMapLines.forEach((l) => rcMapInstance.removeLayer(l));
  rcMapLines = [];

  const fromCity =
    RC_CITIES[route.fromKey] ||
    Object.values(RC_CITIES).find((c) => c.name === route.fromCity);
  const toCity =
    RC_CITIES[route.toKey] ||
    Object.values(RC_CITIES).find((c) => c.name === route.toCity);

  if (!fromCity || !toCity) return;

  const from = [fromCity.lat, fromCity.lng];
  const to = [toCity.lat, toCity.lng];

  const fromMarker = L.marker(from).addTo(rcMapInstance);
  const toMarker = L.marker(to).addTo(rcMapInstance);
  fromMarker.bindPopup(`Start: ${fromCity.name}`);
  toMarker.bindPopup(`Destination: ${toCity.name}`);
  rcMapMarkers.push(fromMarker, toMarker);

  const line = L.polyline([from, to], {
    color: '#22c55e',
    weight: 4,
    opacity: 0.9,
  }).addTo(rcMapInstance);
  rcMapLines.push(line);

  const bounds = L.latLngBounds([from, to]);
  rcMapInstance.fitBounds(bounds, { padding: [40, 40] });
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

  filtered.forEach((route) => {
    const primaryLabel =
      route.primaryMode === 'bus'
        ? '🚌 Bus-focused'
        : route.primaryMode === 'train'
        ? '🚆 Train-focused'
        : '🚕 Cab-focused';

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
              ${primaryLabel}
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
          <h6 class="mb-1">${route.fromCity} → ${route.toCity}</h6>
          <p class="small rc-muted mb-2">
            Duration: <strong>${route.totalDurationLabel}</strong>
            <span class="mx-2">•</span>
            Price: <strong>₹${route.totalPrice}</strong>
          </p>
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
        rcStartPayment(route, pref);
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
            <span class="badge bg-primary-subtle text-primary-emphasis">Saved booking</span>
            <small class="rc-muted">${trip.preference === 'budget' ? 'Low Budget' : trip.preference === 'fast' ? 'Fast Travel' : 'Luxury / Comfort'}</small>
          </div>
          <h6 class="mb-1">${trip.fromCity} → ${trip.destinationLabel}</h6>
          <p class="small rc-muted mb-2">Chain: ${trip.chain}</p>
          <p class="small mb-1">
            <strong>₹${trip.totalPrice}</strong> • ${trip.totalDurationLabel}
          </p>
          ${trip.bookingId ? `<p class="small rc-muted mb-0">Booking ID: ${trip.bookingId}</p>` : ''}
        </div>
      </div>
    `;
    listEl.appendChild(col);
  });
}

function rcShowBookingToast(route, bookingId) {
  const toast = document.getElementById('rc-booking-toast');
  const text = document.getElementById('rc-booking-text');
  if (!toast || !text) return;

  text.innerHTML = `
    Your trip <strong>${route.fromCity} → ${route.destinationLabel}</strong> has been
    added to your wishlist with booking ID <strong>${bookingId}</strong>.<br/>
    You can review it anytime in the <strong>My Trips</strong> dashboard.
  `;

  toast.classList.add('show');

  if (toast._hideTimeout) {
    clearTimeout(toast._hideTimeout);
  }
  toast._hideTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 6000);
}

function rcStartPayment(route, preference) {
  rcPendingBooking = { route, preference };
  const payCard = document.getElementById('rc-payment');
  const payRoute = document.getElementById('rc-pay-route');
  const payAmount = document.getElementById('rc-pay-amount');
  const status = document.getElementById('rc-pay-status');
   const qr = document.getElementById('rc-pay-qr');

  if (!payCard || !payRoute || !payAmount || !status) return;

  payCard.classList.remove('d-none');
  payRoute.textContent = `${route.fromCity} → ${route.destinationLabel}`;
  payAmount.textContent = `₹${route.totalPrice}`;
  status.textContent = 'Select a payment method and confirm your booking.';

  if (qr) {
    qr.classList.add('d-none');
  }

  // Reset selected method
  const methods = document.querySelectorAll('input[name="rc-pay-method"]');
  methods.forEach((m) => {
    m.checked = false;
  });

  payCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        Best match: <strong>${
          best.primaryMode === 'bus'
            ? '🚌 Bus-focused'
            : best.primaryMode === 'train'
            ? '🚆 Train-focused'
            : '🚕 Cab-focused'
        }</strong><br />
      `;
      metaEl.textContent = `₹${best.totalPrice} • ${best.totalDurationLabel} • Score ${best.score}/100`;
    }
  }

  // If Explore page pre-filled a route, apply it once
  const presetRaw = localStorage.getItem('rcPresetRoute');
  if (presetRaw) {
    try {
      const preset = JSON.parse(presetRaw);
      if (preset.from && preset.to && preset.from !== preset.to) {
        fromSelect.value = preset.from;
        toSelect.value = preset.to;
        if (preset.pref) {
          currentPref =
            preset.pref === PREFERENCES.FAST
              ? PREFERENCES.FAST
              : preset.pref === PREFERENCES.LUXURY
              ? PREFERENCES.LUXURY
              : PREFERENCES.BUDGET;
          updatePrefButtons();
        }
        rcRenderRoutes(fromSelect.value, toSelect.value, currentPref);
      }
    } catch {
      // ignore
    }
    localStorage.removeItem('rcPresetRoute');
  }

  // If some pre-selected route comes from Explore page in future, we could read it here.

  // Load existing trips into dashboard
  rcRenderTrips();

  // Payment handler
  const payBtn = document.getElementById('rc-pay-btn');
  const payQr = document.getElementById('rc-pay-qr');
  const payConfirm = document.getElementById('rc-pay-confirm');
  const payStatus = document.getElementById('rc-pay-status');
  if (payBtn && payQr && payConfirm) {
    payBtn.addEventListener('click', () => {
      if (!rcPendingBooking) {
        alert('Pick a route and click "Book This" before paying.');
        return;
      }
      const methodInput = document.querySelector(
        'input[name="rc-pay-method"]:checked',
      );
      if (!methodInput) {
        alert('Please choose a payment method (Card, UPI, or Wallet).');
        return;
      }

      if (payQr) {
        payQr.classList.remove('d-none');
      }
      if (payStatus) {
        payStatus.textContent =
          'Scan the QR to simulate payment, then click "Payment Done".';
      }
    });

    payConfirm.addEventListener('click', () => {
      if (!rcPendingBooking) return;
      const methodInput = document.querySelector(
        'input[name="rc-pay-method"]:checked',
      );
      if (!methodInput) return;

      const { route, preference: pref } = rcPendingBooking;
      const trips = rcGetTrips();
      const bookingId = 'RC' + Math.floor(100000 + Math.random() * 900000);
      const chainLabel =
        route.mode === 'bus'
          ? '🚌 Bus'
          : route.mode === 'train'
          ? '🚆 Train'
          : '🚕 Cab';
      trips.unshift({
        id: route.id + '-' + Date.now(),
        fromCity: route.fromCity,
        destinationLabel: route.toCity,
        preference: pref,
        totalPrice: route.totalPrice,
        totalDurationLabel: route.totalDurationLabel,
        bookingId,
        createdAt: new Date().toISOString(),
        chain: chainLabel,
      });
      rcSaveTrips(trips.slice(0, 6));
      rcRenderTrips();

      if (payStatus) {
        const label =
          methodInput.value === 'upi'
            ? 'UPI'
            : methodInput.value === 'wallet'
            ? 'Wallet'
            : 'Card';
        payStatus.textContent = `Payment successful via ${label}. Booking ID: ${bookingId}`;
      }

      rcShowBookingToast(route, bookingId);
      rcPendingBooking = null;
    });
  }
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

    const inputEmail = email.toLowerCase();

    // 1) Check locally created account
    let loggedInUser = null;
    if (user) {
      const storedEmail = (user.email || '').trim().toLowerCase();
      if (storedEmail === inputEmail && user.password === password) {
        loggedInUser = user;
      }
    }

    // 2) Fallback to demo users
    if (!loggedInUser) {
      loggedInUser = RC_DEMO_USERS.find(
        (u) => u.email === inputEmail && u.password === password,
      );
    }

    if (!loggedInUser) {
      alert(
        'Invalid credentials. Use your signup details or a demo account (e.g. demo@routecraft.com / demo123).',
      );
      return;
    }

    // Persist chosen profile so navbar & personalization work
    rcSetUser(loggedInUser);
    alert(`Welcome back, ${loggedInUser.name}!`);
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

    const normalizedEmail = email.toLowerCase();
    rcSetUser({ name, email: normalizedEmail, password, homeCity, travelPreference });
    alert('Account created! You can now use RouteCraft.');
    window.location.href = 'index.html';
  });
}

// ===========================
// Explore Page (static)
// ===========================

function rcInitExplore() {
  const ideaButtons = document.querySelectorAll('.rc-explore-idea');
  const modalEl = document.getElementById('rcExploreModal');
  if (!modalEl || !ideaButtons.length) return;

  const modalTitle = document.getElementById('rc-explore-title');
  const modalImg = document.getElementById('rc-explore-img');
  const modalDesc = document.getElementById('rc-explore-desc');
  const modalSteps = document.getElementById('rc-explore-steps');
  const modalCost = document.getElementById('rc-explore-cost');
  const modalDuration = document.getElementById('rc-explore-duration');

  // Bootstrap Modal instance
  const modal = new bootstrap.Modal(modalEl);

  ideaButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (
        !modalTitle ||
        !modalImg ||
        !modalDesc ||
        !modalSteps ||
        !modalCost ||
        !modalDuration
      ) {
        return;
      }

      const card = btn.closest('.rc-explore-card');
      const img = card ? card.querySelector('img') : null;

      const title = btn.getAttribute('data-rc-title') || 'Explore idea';
      const desc =
        btn.getAttribute('data-rc-desc') ||
        'A curated multi-modal plan across RouteCraft cities.';
      const stepsRaw = btn.getAttribute('data-rc-steps') || '';
      const cost = btn.getAttribute('data-rc-cost') || '—';
      const duration = btn.getAttribute('data-rc-duration') || '—';

      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      if (img && img.src) {
        modalImg.src = img.src;
        modalImg.alt = title;
      }

      // Build steps list
      modalSteps.innerHTML = '';
      if (stepsRaw) {
        stepsRaw.split('|').forEach((stepText) => {
          const li = document.createElement('li');
          li.textContent = stepText.trim();
          modalSteps.appendChild(li);
        });
      }

      modalCost.textContent = cost;
      modalDuration.textContent = duration;

      modal.show();
    });
  });
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

