# SafeReport — Anonymous Incident Reporting & Safety Mapping System

A privacy-first incident reporting platform built with **React + Vite + Tailwind CSS + Firebase**.

## 🛡️ Features

- **100% Anonymous** — No accounts, no tracking, no personal data stored
- **Interactive Safety Map** — Leaflet.js heatmap with marker clustering
- **Admin Dashboard** — Real-time stats, incident management, hotspot alerts
- **Analytics** — Chart.js visualizations (by type, area, hour, severity)
- **Privacy Protection** — GPS coordinates rounded to 500m grid
- **Spam Detection** — Rate limiting and duplicate detection
- **Hotspot Detection** — Automatic alerts for 3+ incidents in same area within 24h

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Firebase project (free tier works)

### 1. Install dependencies
```bash
cd safereport
npm install
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable **Firestore Database** (start in test mode)
4. Enable **Authentication → Sign-in method → Anonymous**
5. Go to **Project Settings → General → Your apps → Add web app**
6. Copy the config values into `.env`:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Seed sample data (optional)
Edit `src/firebase/seedData.mjs` with your Firebase config, then:
```bash
npm run seed
```
This adds 48 sample incidents to Firestore.

### 4. Run the app
```bash
npm run dev
```
Open http://localhost:5173

## 📁 Project Structure

```
safereport/
├── .env                    # Firebase config (placeholder)
├── index.html              # Vite entry
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Router + providers
    ├── index.css           # Tailwind + dark theme
    ├── firebase/
    │   ├── config.js       # Firebase init
    │   └── seedData.mjs    # Seed script
    ├── hooks/
    │   ├── useAuth.js      # Anonymous auth
    │   └── useReports.js   # Firestore CRUD
    ├── utils/
    │   ├── privacy.js      # Coordinate rounding
    │   ├── hotspot.js      # Hotspot detection
    │   └── spamDetection.js
    ├── components/
    │   ├── Layout.jsx      # App shell
    │   ├── Sidebar.jsx     # Navigation
    │   ├── ReportForm.jsx  # Incident form
    │   ├── MapView.jsx     # Leaflet map
    │   ├── Charts.jsx      # Chart.js charts
    │   ├── StatsCard.jsx   # Stat cards
    │   ├── IncidentTable.jsx
    │   └── Toast.jsx       # Notifications
    └── pages/
        ├── ReportPage.jsx
        ├── MapPage.jsx
        ├── AdminPage.jsx
        ├── AnalyticsPage.jsx
        └── SettingsPage.jsx
```

## 🔥 Firestore Structure

### Collection: `reports`
```json
{
  "incidentType": "Verbal harassment",
  "severity": "high",
  "location": { "lat": 13.083, "lng": 80.271, "area": "T. Nagar" },
  "timeOfDay": "Evening",
  "description": "Optional text",
  "createdAt": "Timestamp",
  "referenceId": "#A3F2",
  "status": "new",
  "flagged": false
}
```

## 🔒 Privacy

- No email, phone, name, IP, or device info is stored
- GPS coordinates are rounded to a ~500m grid
- Firebase anonymous UID is used only for rate limiting (not stored in reports)
- No cookies or session tracking

## 📊 Sample API Test Data

After seeding, you'll see incidents like:
| Reference | Type | Severity | Area | Time |
|-----------|------|----------|------|------|
| #A3F2 | Verbal harassment | high | T. Nagar | Evening |
| #B7E1 | Poor lighting | medium | Velachery | Night |
| #C9D0 | Stalking or following | high | Anna Nagar | Late night |
| #D2F8 | Unsafe infrastructure | low | Adyar | Morning |
| #E5A3 | Physical threat | high | Guindy | Evening |

## 🚢 Deployment

### Firebase Hosting
```bash
npm run build
firebase init hosting  # select dist folder
firebase deploy
```

### Vercel / Netlify
Push to GitHub and connect — zero config needed.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS 3
- **Database**: Firebase Firestore
- **Auth**: Firebase Anonymous Authentication
- **Maps**: Leaflet.js + leaflet.heat + leaflet.markercluster
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router v7
