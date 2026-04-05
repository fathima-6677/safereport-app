/**
 * Seed script to populate Firestore with sample incident data.
 * 
 * Usage:
 *   1. Replace the Firebase config below with your actual config
 *   2. Run: node src/firebase/seedData.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

// ⚠️ Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Sample Data Config ──
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
const TIME_OF_DAY = ['Early morning', 'Morning', 'Afternoon', 'Evening', 'Night', 'Late night'];

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
  'Verbal catcalling near the bus stop',
  'Group of men blocking the pathway',
  'Very dark stretch with no streetlights',
  'Someone followed me for several blocks',
  'Unsafe construction area with no barriers',
  'Inappropriate comments from a stranger',
  'Broken streetlight making the area very dark',
  '',
  '',
  'Felt unsafe walking alone after dark in this area',
  '',
  'Road is in terrible condition and dangerous at night',
];

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateReferenceId() {
  const chars = '0123456789ABCDEF';
  let id = '#';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function roundCoord(val) {
  return Math.round(parseFloat(val) * 200) / 200;
}

async function seed() {
  console.log('🌱 Seeding Firestore with sample incident data...\n');

  const COUNT = 48;
  const reports = [];

  for (let i = 0; i < COUNT; i++) {
    const area = randomPick(AREAS);
    const lat = area.lat + (Math.random() - 0.5) * 0.02;
    const lng = area.lng + (Math.random() - 0.5) * 0.02;
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const createdAt = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);

    const report = {
      incidentType: randomPick(INCIDENT_TYPES),
      severity: randomPick(SEVERITIES),
      location: {
        lat: roundCoord(lat),
        lng: roundCoord(lng),
        area: area.name,
      },
      timeOfDay: randomPick(TIME_OF_DAY),
      description: randomPick(DESCRIPTIONS),
      referenceId: generateReferenceId(),
      status: randomPick(STATUSES),
      flagged: false,
      createdAt: Timestamp.fromDate(createdAt),
    };

    reports.push(report);
  }

  // Write to Firestore
  let count = 0;
  for (const report of reports) {
    try {
      await addDoc(collection(db, 'reports'), report);
      count++;
      process.stdout.write(`\r  Written ${count}/${COUNT} reports...`);
    } catch (err) {
      console.error(`\n❌ Error writing report: ${err.message}`);
    }
  }

  console.log(`\n\n✅ Successfully seeded ${count} reports into Firestore!`);
  console.log('\nSample reference IDs:');
  reports.slice(0, 5).forEach((r) => {
    console.log(`  ${r.referenceId} — ${r.incidentType} (${r.severity}) in ${r.location.area}`);
  });

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
