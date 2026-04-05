import { useState } from 'react';
import { getAll } from '../data/localStore';
import { IconRoute, IconAlert, IconShield } from './Icons';

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    { headers: { 'User-Agent': 'SafeReport/1.0' } }
  );
  const data = await res.json();
  if (!data.length) throw new Error('Location not found');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), display: data[0].display_name };
}

export default function SafeRoute({ incidents, onRouteResult }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);

  const findRoute = async (e) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;
    setLoading(true);
    setError('');
    setSummary(null);
    onRouteResult?.(null);

    try {
      // 1. Geocode both locations
      const [fromGeo, toGeo] = await Promise.all([geocode(from), geocode(to)]);

      // 2. Get walking route from OSRM
      const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${fromGeo.lng},${fromGeo.lat};${toGeo.lng},${toGeo.lat}?overview=full&geometries=geojson&steps=true`;
      const routeRes = await fetch(osrmUrl);
      const routeData = await routeRes.json();

      if (!routeData.routes || routeData.routes.length === 0) {
        setError('No walking route found between these locations.');
        setLoading(false);
        return;
      }

      const coords = routeData.routes[0].geometry.coordinates; // [lng, lat] pairs

      // 3. Get incident data for checking
      let incidentData = incidents || [];
      if (incidentData.length === 0) {
        try { incidentData = getAll(); } catch { /* empty */ }
      }

      // 4. Split into segments of ~15 coords each and check safety
      const segSize = Math.max(5, Math.ceil(coords.length / 20));
      const segments = [];
      let dangerousCount = 0;

      for (let i = 0; i < coords.length; i += segSize) {
        const segCoords = coords.slice(i, Math.min(i + segSize + 1, coords.length));
        // Convert to [lat, lng] for Leaflet
        const latLngCoords = segCoords.map(([lng, lat]) => [lat, lng]);

        // Check if any point in segment is within 100m of an incident
        const isDangerous = segCoords.some(([lng, lat]) =>
          incidentData.some((inc) => {
            const iLat = inc.location?.lat || inc.lat;
            const iLng = inc.location?.lng || inc.lng;
            return haversine(lat, lng, iLat, iLng) <= 100;
          })
        );

        if (isDangerous) dangerousCount++;
        segments.push({ coords: latLngCoords, safe: !isDangerous });
      }

      setSummary({
        total: segments.length,
        dangerous: dangerousCount,
        distance: (routeData.routes[0].distance / 1000).toFixed(1),
        duration: Math.round(routeData.routes[0].duration / 60),
        fromName: fromGeo.display.split(',')[0],
        toName: toGeo.display.split(',')[0],
      });

      onRouteResult?.(segments);
    } catch (err) {
      setError(err.message || 'Failed to find route.');
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    setSummary(null);
    setFrom('');
    setTo('');
    onRouteResult?.(null);
  };

  return (
    <div className="bg-bg-2 border border-brd-2 rounded-card p-4">
      <div className="text-[13px] font-medium text-txt mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        Safe Route Finder
      </div>

      <form onSubmit={findRoute} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-success" />
            <input
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="From (e.g. T. Nagar, Chennai)"
              className="w-full bg-bg-3 border border-brd-2 rounded-btn text-[12px] text-txt pl-8 pr-3 py-2 outline-none focus:border-accent transition"
            />
          </div>
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-danger" />
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="To (e.g. Adyar, Chennai)"
              className="w-full bg-bg-3 border border-brd-2 rounded-btn text-[12px] text-txt pl-8 pr-3 py-2 outline-none focus:border-accent transition"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !from.trim() || !to.trim()}
            className="flex-1 py-2 bg-accent text-white text-[12px] font-medium rounded-btn hover:bg-accent-2 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {loading ? <span className="loader" style={{ width: 12, height: 12 }} /> : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            {loading ? 'Finding route...' : 'Find Safe Route'}
          </button>
          {summary && (
            <button type="button" onClick={clearRoute} className="px-3 py-2 bg-bg-3 text-txt-2 text-[12px] rounded-btn border border-brd-2 hover:bg-bg-4 transition">
              Clear
            </button>
          )}
        </div>
      </form>

      {error && <div className="mt-2 text-[11px] text-danger">{error}</div>}

      {/* Route summary */}
      {summary && (
        <div className="mt-3 fade-up">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-[11px] text-txt-3">
              {summary.fromName} → {summary.toName} · {summary.distance} km · ~{summary.duration} min walk
            </div>
          </div>
          <div className={`rounded-btn p-3 border glass-card ${summary.dangerous > 0 ? 'border-danger/30' : 'border-success/30'}`}>
            <div className={`flex items-center gap-2 text-[13px] font-bold ${summary.dangerous > 0 ? 'text-danger' : 'text-success'}`}>
              {summary.dangerous > 0 ? <IconAlert className="w-4 h-4" /> : <IconShield className="w-4 h-4" />}
              {summary.dangerous > 0
                ? `${summary.dangerous} of ${summary.total} route segments pass through incident zones`
                : `All ${summary.total} segments are clear — safe journey!`}
            </div>
            {/* Segment visualization */}
            <div className="flex gap-0.5 mt-2">
              {Array.from({ length: summary.total }, (_, i) => (
                <div
                  key={i}
                  className="h-2 flex-1 rounded-full"
                  style={{ background: i < summary.total - summary.dangerous ? '#4ade80' : '#f87171' }}
                />
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-txt-3 mt-1">
              <span>Start</span>
              <span>End</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
