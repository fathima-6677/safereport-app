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
