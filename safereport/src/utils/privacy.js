/**
 * Privacy utilities — ensure no exact location data is stored.
 */

/**
 * Round coordinates to 3 decimal places (~111m grid).
 * This prevents exact GPS pinpointing while keeping area-level accuracy.
 */
export function roundCoordinates(lat, lng) {
  return {
    lat: Math.round(parseFloat(lat) * 200) / 200, // ~500m grid
    lng: Math.round(parseFloat(lng) * 200) / 200,
  };
}

/**
 * Generate a random reference ID (e.g., "#A3F2")
 */
export function generateReferenceId() {
  const chars = '0123456789ABCDEF';
  let id = '#';
  for (let i = 0; i < 4; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

/**
 * Sanitize report data — strip any potentially identifying info
 */
export function sanitizeReport(data) {
  const { incidentType, severity, location, timeOfDay, description } = data;
  return {
    incidentType: String(incidentType || '').trim().slice(0, 100),
    severity: ['low', 'medium', 'high'].includes(severity) ? severity : 'low',
    location: {
      lat: location?.lat || 0,
      lng: location?.lng || 0,
      area: String(location?.area || 'Unknown area').trim().slice(0, 100),
    },
    timeOfDay: String(timeOfDay || 'Unknown').trim().slice(0, 50),
    description: String(description || '').trim().slice(0, 500),
  };
}
