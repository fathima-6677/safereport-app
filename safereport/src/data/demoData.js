/**
 * Pre-generated demo incident data for Chennai areas.
 * This seeds the app with realistic data so it works immediately.
 */

const INCIDENT_TYPES = [
  'Verbal harassment',
  'Physical threat or assault',
  'Stalking or following',
  'Indecent exposure',
  'Poor lighting / dark area',
  'Unsafe infrastructure',
  'Other safety concern',
];

const SEVERITIES = ['high', 'medium', 'low'];
const STATUSES = ['new', 'reviewing', 'resolved'];
const TIME_OF_DAY = [
  'Early morning (5am–8am)',
  'Morning (8am–12pm)',
  'Afternoon (12pm–5pm)',
  'Evening (5pm–9pm)',
  'Night (9pm–12am)',
  'Late night (12am–5am)',
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

const DESCRIPTIONS = [
  'Verbal catcalling near the bus stop. A group of men were making inappropriate comments.',
  'Group of men blocking the pathway and refusing to move aside.',
  'Very dark stretch with no streetlights. Felt unsafe walking alone.',
  'Someone followed me for several blocks after getting off the bus.',
  'Unsafe construction area with no barriers or warning signs.',
  'Inappropriate comments from a stranger while waiting for auto.',
  'Broken streetlight making the area very dark and unsafe at night.',
  'Felt unsafe walking alone after dark in this area. No police presence visible.',
  'Road is in terrible condition and dangerous at night with no lighting.',
  'Eve-teasing incident near the park. The person fled when confronted.',
  'Suspicious person loitering near the school entrance during evening hours.',
  'Poorly maintained footpath forcing pedestrians to walk on the road.',
  '',
  '',
  'Multiple incidents reported in this area but no action taken by authorities.',
  '',
];

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomPick(arr, seed) {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function roundCoord(val) {
  return Math.round(parseFloat(val) * 200) / 200;
}

function generateRefId(seed) {
  const chars = '0123456789ABCDEF';
  let id = '#';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(seededRandom(seed + i * 7) * chars.length)];
  }
  return id;
}

/**
 * Generate N demo reports with deterministic seeding for consistency.
 */
export function generateDemoData(count = 48) {
  const now = Date.now();
  const reports = [];

  for (let i = 0; i < count; i++) {
    const seed = i * 13 + 42;
    const area = randomPick(AREAS, seed);
    const lat = area.lat + (seededRandom(seed + 1) - 0.5) * 0.02;
    const lng = area.lng + (seededRandom(seed + 2) - 0.5) * 0.02;
    const daysAgo = Math.floor(seededRandom(seed + 3) * 30);
    const hoursAgo = Math.floor(seededRandom(seed + 4) * 24);
    const createdAt = now - daysAgo * 86400000 - hoursAgo * 3600000;

    reports.push({
      id: `demo_${i}_${Date.now()}`,
      incidentType: randomPick(INCIDENT_TYPES, seed + 5),
      severity: randomPick(SEVERITIES, seed + 6),
      location: {
        lat: roundCoord(lat),
        lng: roundCoord(lng),
        area: area.name,
      },
      timeOfDay: randomPick(TIME_OF_DAY, seed + 7),
      description: randomPick(DESCRIPTIONS, seed + 8),
      referenceId: generateRefId(seed + 9),
      status: randomPick(STATUSES, seed + 10),
      flagged: false,
      createdAt: createdAt,
    });
  }

  return reports;
}
