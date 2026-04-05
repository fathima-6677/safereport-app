const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ── Data file helpers ──
const DATA_DIR = path.join(__dirname, 'data');
const INCIDENTS_FILE = path.join(DATA_DIR, 'incidents.json');

function readIncidents() {
  try {
    return JSON.parse(fs.readFileSync(INCIDENTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeIncidents(data) {
  fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(data, null, 2));
}

// ── Auto-seed demo data ──
function seedIfEmpty() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(INCIDENTS_FILE) && readIncidents().length > 0) return;

  const TYPES = [
    'Verbal harassment', 'Physical threat or assault', 'Stalking or following',
    'Indecent exposure', 'Poor lighting / dark area', 'Unsafe infrastructure', 'Other safety concern',
  ];
  const SEVS = ['high', 'medium', 'low'];
  const STATUSES = ['new', 'reviewing', 'resolved'];
  const TIMES = [
    'Early morning (5am–8am)', 'Morning (8am–12pm)', 'Afternoon (12pm–5pm)',
    'Evening (5pm–9pm)', 'Night (9pm–12am)', 'Late night (12am–5am)',
  ];
  const AREAS = [
    { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
    { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
    { name: 'Velachery', lat: 12.9815, lng: 80.2180 },
    { name: 'Adyar', lat: 13.0012, lng: 80.2565 },
    { name: 'Tambaram', lat: 12.9249, lng: 80.1000 },
    { name: 'Chromepet', lat: 12.9516, lng: 80.1462 },
    { name: 'Mylapore', lat: 13.0368, lng: 80.2676 },
    { name: 'Guindy', lat: 13.0067, lng: 80.2206 },
    { name: 'Nungambakkam', lat: 13.0569, lng: 80.2425 },
    { name: 'Egmore', lat: 13.0732, lng: 80.2609 },
  ];
  const DESCS = [
    'Verbal catcalling near the bus stop.',
    'Group of men blocking the pathway.',
    'Very dark stretch with no streetlights.',
    'Someone followed me for several blocks.',
    'Unsafe construction area with no barriers.',
    'Inappropriate comments while waiting for auto.',
    'Broken streetlight making area unsafe at night.',
    'Felt unsafe walking alone after dark.',
    'Eve-teasing incident near the park.',
    'Suspicious person loitering near school entrance.',
    '', '',
  ];

  function sRand(seed) { let x = Math.sin(seed) * 10000; return x - Math.floor(x); }
  function pick(arr, seed) { return arr[Math.floor(sRand(seed) * arr.length)]; }
  function roundC(v) { return Math.round(v * 200) / 200; }

  const now = Date.now();
  const reports = [];
  for (let i = 0; i < 48; i++) {
    const s = i * 13 + 42;
    const area = pick(AREAS, s);
    reports.push({
      id: `demo_${i}_${now}`,
      incidentType: pick(TYPES, s + 5),
      severity: pick(SEVS, s + 6),
      location: {
        lat: roundC(area.lat + (sRand(s + 1) - 0.5) * 0.02),
        lng: roundC(area.lng + (sRand(s + 2) - 0.5) * 0.02),
        area: area.name,
      },
      timeOfDay: pick(TIMES, s + 7),
      description: pick(DESCS, s + 8),
      referenceId: '#' + Math.random().toString(16).slice(2, 6).toUpperCase(),
      status: pick(STATUSES, s + 10),
      flagged: false,
      createdAt: now - Math.floor(sRand(s + 3) * 30) * 86400000 - Math.floor(sRand(s + 4) * 24) * 3600000,
    });
  }
  writeIncidents(reports);
  console.log(`Seeded ${reports.length} demo incidents.`);
}

seedIfEmpty();

// ── Haversine distance (meters) ──
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ──────────────────────────────────────
// REPORTS CRUD
// ──────────────────────────────────────

app.get('/api/reports', (req, res) => {
  let data = readIncidents();
  if (req.query.severity && req.query.severity !== 'all') {
    data = data.filter((r) => r.severity === req.query.severity);
  }
  if (req.query.status && req.query.status !== 'all') {
    data = data.filter((r) => r.status === req.query.status);
  }
  data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  res.json(data);
});

app.post('/api/reports', (req, res) => {
  const data = readIncidents();
  const id = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const referenceId = '#' + Math.random().toString(16).slice(2, 6).toUpperCase();
  const newReport = { ...req.body, id, referenceId, status: 'new', flagged: false, createdAt: Date.now() };
  data.unshift(newReport);
  writeIncidents(data);
  res.json({ success: true, referenceId, id });
});

app.patch('/api/reports/:id', (req, res) => {
  const data = readIncidents();
  const idx = data.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data[idx] = { ...data[idx], ...req.body };
  writeIncidents(data);
  res.json({ success: true, report: data[idx] });
});

app.delete('/api/reports/:id', (req, res) => {
  const data = readIncidents().filter((r) => r.id !== req.params.id);
  writeIncidents(data);
  res.json({ success: true });
});

// ──────────────────────────────────────
// SOS PANIC BUTTON
// ──────────────────────────────────────

const sosSessions = {};

app.post('/api/sos/ping', (req, res) => {
  const { sessionId, lat, lng, timestamp } = req.body;
  if (!sosSessions[sessionId]) {
    sosSessions[sessionId] = { id: sessionId, trail: [], active: true, startedAt: Date.now() };
  }
  sosSessions[sessionId].trail.push({ lat, lng, timestamp: timestamp || Date.now() });
  res.json({ success: true, pointCount: sosSessions[sessionId].trail.length });
});

app.get('/api/sos/trail/:sessionId', (req, res) => {
  const session = sosSessions[req.params.sessionId];
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

app.post('/api/sos/stop', (req, res) => {
  const { sessionId } = req.body;
  if (sosSessions[sessionId]) {
    sosSessions[sessionId].active = false;
    sosSessions[sessionId].stoppedAt = Date.now();
  }
  res.json({ success: true });
});

// ──────────────────────────────────────
// VIRTUAL ESCORT (SAFETY TIMER)
// ──────────────────────────────────────

const timerSessions = {};

app.post('/api/timer/start', (req, res) => {
  const { sessionId, durationMinutes, lat, lng, area } = req.body;
  const expiresAt = Date.now() + durationMinutes * 60000;
  
  timerSessions[sessionId] = {
    sessionId,
    expiresAt,
    lat,
    lng,
    area,
    active: true,
    triggered: false
  };
  
  res.json({ success: true, expiresAt });
});

app.post('/api/timer/stop', (req, res) => {
  const { sessionId } = req.body;
  if (timerSessions[sessionId]) {
    timerSessions[sessionId].active = false;
  }
  res.json({ success: true });
});

app.get('/api/timer/status/:sessionId', (req, res) => {
  const session = timerSessions[req.params.sessionId];
  if (!session) return res.json({ active: false });
  res.json(session);
});

// Background task: Check for expired timers every 10 seconds
setInterval(() => {
  const now = Date.now();
  const data = readIncidents();
  let changed = false;

  Object.values(timerSessions).forEach(session => {
    if (session.active && !session.triggered && now > session.expiresAt) {
      session.triggered = true;
      session.active = false;
      
      // Auto-trigger an SOS incident
      const id = `timer_sos_${Date.now()}`;
      const referenceId = '#T-' + Math.random().toString(16).slice(2, 5).toUpperCase();
      const newReport = {
        id,
        referenceId,
        incidentType: 'Timer Expired — Emergency SOS',
        severity: 'high',
        location: {
          lat: session.lat || 13.0827,
          lng: session.lng || 80.2707,
          area: session.area || 'Unknown (Timer Location)',
        },
        timeOfDay: 'Emergency (Auto)',
        description: `CRITICAL: Safety timer for session ${session.sessionId} expired without check-in. Automatic SOS triggered.`,
        status: 'new',
        flagged: true,
        createdAt: now
      };
      
      data.unshift(newReport);
      changed = true;
      console.log(`[ALARM] Timer expired for ${session.sessionId}. SOS Incident ${referenceId} created.`);
    }
  });

  if (changed) writeIncidents(data);
}, 10000);


// ──────────────────────────────────────
// AI SAFETY SCORE
// ──────────────────────────────────────

app.get('/api/score', (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  const targetLat = parseFloat(lat);
  const targetLng = parseFloat(lng);
  const incidents = readIncidents();

  // Incidents within 500m
  const nearby = incidents.filter((r) => {
    const iLat = r.location?.lat || r.lat;
    const iLng = r.location?.lng || r.lng;
    return haversine(targetLat, targetLng, iLat, iLng) <= 500;
  });

  // 1. Density (40%) — fewer incidents = higher score
  const densityScore = Math.max(0, 100 - (nearby.length / 15) * 100);

  // 2. Recency (30%) — older = safer
  const now = Date.now();
  let recencyScore = 100;
  if (nearby.length > 0) {
    const avgDays = nearby.reduce((s, r) => s + (now - (r.createdAt || now)), 0) / nearby.length / 86400000;
    recencyScore = Math.min(100, (avgDays / 30) * 100);
  }

  // 3. Time-of-day (20%) — current hour matches = riskier
  const hr = new Date().getHours();
  const hourMatches = nearby.filter((r) => Math.abs(new Date(r.createdAt || now).getHours() - hr) <= 2).length;
  const timeScore = nearby.length > 0 ? Math.max(0, 100 - (hourMatches / nearby.length) * 100) : 100;

  // 4. Severity (10%) — more high-severity = riskier
  const highCount = nearby.filter((r) => r.severity === 'high').length;
  const severityScore = nearby.length > 0 ? Math.max(0, 100 - (highCount / nearby.length) * 200) : 100;

  const score = Math.max(0, Math.min(100, Math.round(
    densityScore * 0.4 + recencyScore * 0.3 + timeScore * 0.2 + severityScore * 0.1
  )));

  res.json({
    score,
    label: score <= 40 ? 'High Risk' : score <= 70 ? 'Moderate' : 'Safe',
    color: score <= 40 ? 'red' : score <= 70 ? 'amber' : 'green',
    nearbyIncidents: nearby.length,
    breakdown: {
      density: Math.round(densityScore),
      recency: Math.round(recencyScore),
      timeOfDay: Math.round(timeScore),
      severity: Math.round(severityScore),
    },
  });
});

// ── Production Frontend Serving ──
// Serve the built static files from the safereport/dist directory
const DIST_PATH = path.join(__dirname, '../safereport/dist');
app.use(express.static(DIST_PATH));

// SPA Routing: Catch-all to serve index.html for any non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// ── Start ──
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\x1b[35m[RIFT FLAME]\x1b[0m Deployment active at http://localhost:${PORT}`);
  console.log(`\x1b[36m[SERVER]\x1b[0m Monitoring active for Virtual Escort and SOS sessions.`);
});
