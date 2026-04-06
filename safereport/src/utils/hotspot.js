/**
 * Hotspot detection — identifies areas with high incident density.
 * A hotspot is defined as 3+ incidents within ~500m radius in 24 hours.
 */

const PROXIMITY_THRESHOLD = 0.005; // ~500m in lat/lng degrees
const TIME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Parse timestamp from various formats (number, Firestore Timestamp, Date string).
 */
function parseTimestamp(ts) {
  if (typeof ts === 'number') return ts;
  if (ts?.toDate) return ts.toDate().getTime();
  return new Date(ts).getTime();
}

/**
 * Calculate distance between two coordinate pairs (simple Euclidean for small areas)
 */
function isNearby(loc1, loc2) {
  if (!loc1 || !loc2) return false;
  const dLat = Math.abs((loc1.lat || 0) - (loc2.lat || 0));
  const dLng = Math.abs((loc1.lng || 0) - (loc2.lng || 0));
  return dLat <= PROXIMITY_THRESHOLD && dLng <= PROXIMITY_THRESHOLD;
}

/**
 * Detect hotspots from a list of reports.
 * Returns an array of hotspot zones: { lat, lng, count, incidents, area }
 */
export function detectHotspots(reports) {
  if (!reports || reports.length === 0) return [];

  const now = Date.now();
  const recentReports = reports.filter((r) => {
    try {
      const ts = parseTimestamp(r.createdAt);
      return now - ts < TIME_WINDOW_MS;
    } catch {
      return false;
    }
  });

  const hotspots = [];
  const visited = new Set();

  for (let i = 0; i < recentReports.length; i++) {
    if (visited.has(i)) continue;

    const cluster = [recentReports[i]];
    visited.add(i);

    for (let j = i + 1; j < recentReports.length; j++) {
      if (visited.has(j)) continue;
      if (isNearby(recentReports[i].location, recentReports[j].location)) {
        cluster.push(recentReports[j]);
        visited.add(j);
      }
    }

    if (cluster.length >= 3) {
      const avgLat = cluster.reduce((s, r) => s + (r.location?.lat || 0), 0) / cluster.length;
      const avgLng = cluster.reduce((s, r) => s + (r.location?.lng || 0), 0) / cluster.length;
      hotspots.push({
        lat: avgLat,
        lng: avgLng,
        count: cluster.length,
        incidents: cluster,
        area: cluster[0].location?.area || 'Unknown area',
      });
    }
  }

  return hotspots;
}

/**
 * Check if a new report creates a hotspot by examining existing recent reports.
 */
export function wouldCreateHotspot(newReport, existingReports) {
  const now = Date.now();
  const nearby = existingReports.filter((r) => {
    try {
      const ts = parseTimestamp(r.createdAt);
      return now - ts < TIME_WINDOW_MS && isNearby(newReport.location, r.location);
    } catch {
      return false;
    }
  });
  return nearby.length >= 2; // 2 existing + 1 new = 3+ total
}

/**
 * Calculate a safety score (0-100) for a given location based on nearby incidents.
 * Replicates the backend logic from server/server.js.
 */
export function calculateSafetyScore(targetLat, targetLng, incidents) {
  const PROXIMITY_M = 500;
  const now = Date.now();

  // Helper for Haversine distance
  function haversineDist(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Filter incidents within 500m
  const nearby = (incidents || []).filter((r) => {
    const iLat = r.location?.lat || r.lat || 0;
    const iLng = r.location?.lng || r.lng || 0;
    return haversineDist(targetLat, targetLng, iLat, iLng) <= PROXIMITY_M;
  });

  // 1. Density (40%) — fewer incidents = higher score
  const densityScore = Math.max(0, 100 - (nearby.length / 15) * 100);

  // 2. Recency (30%) — older = safer
  let recencyScore = 100;
  if (nearby.length > 0) {
    const avgDays = nearby.reduce((s, r) => s + (now - parseTimestamp(r.createdAt || now)), 0) / nearby.length / 86400000;
    recencyScore = Math.min(100, (avgDays / 30) * 100);
  }

  // 3. Time-of-day (20%) — current hour matches = riskier
  const hr = new Date().getHours();
  const hourMatches = nearby.filter((r) => Math.abs(new Date(parseTimestamp(r.createdAt || now)).getHours() - hr) <= 2).length;
  const timeScore = nearby.length > 0 ? Math.max(0, 100 - (hourMatches / nearby.length) * 100) : 100;

  // 4. Severity (10%) — more high-severity = riskier
  const highCount = nearby.filter((r) => r.severity === 'high').length;
  const severityScore = nearby.length > 0 ? Math.max(0, 100 - (highCount / nearby.length) * 200) : 100;

  const score = Math.max(0, Math.min(100, Math.round(
    densityScore * 0.4 + recencyScore * 0.3 + timeScore * 0.2 + severityScore * 0.1
  )));

  return {
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
  };
}

