import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { sosTrail } from '../utils/api';
import 'leaflet/dist/leaflet.css';

export default function SOSTrailPage() {
  const { sessionId } = useParams();
  const [trail, setTrail] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({ polyline: null, markers: [] });

  // Fetch trail data with auto-refresh
  useEffect(() => {
    let mounted = true;
    const fetchTrail = async () => {
      try {
        const data = await sosTrail(sessionId);
        if (mounted) setTrail(data);
      } catch {
        if (mounted) setError('Trail not found or session expired.');
      }
    };

    fetchTrail();
    const interval = setInterval(fetchTrail, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [sessionId]);

  // Initialize & update map
  useEffect(() => {
    if (!mapRef.current || !trail || !trail.trail || trail.trail.length === 0) return;

    const update = async () => {
      const L = (await import('leaflet')).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current, {
          center: [trail.trail[0].lat, trail.trail[0].lng],
          zoom: 15,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
        }).addTo(mapInstance.current);
      }

      const map = mapInstance.current;

      // Clean old layers
      if (layersRef.current.polyline) map.removeLayer(layersRef.current.polyline);
      layersRef.current.markers.forEach((m) => map.removeLayer(m));
      layersRef.current.markers = [];

      const coords = trail.trail.map((p) => [p.lat, p.lng]);

      // Polyline
      const polyline = L.polyline(coords, { color: '#e8547a', weight: 4, opacity: 0.8, dashArray: '8, 6' });
      polyline.addTo(map);
      layersRef.current.polyline = polyline;

      // Start marker (green)
      const startIcon = L.divIcon({
        html: '<div style="width:14px;height:14px;background:#4ade80;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(74,222,128,0.6);"></div>',
        className: '',
        iconSize: [14, 14],
      });
      const sm = L.marker(coords[0], { icon: startIcon }).addTo(map);
      sm.bindPopup('Start point');
      layersRef.current.markers.push(sm);

      // End marker (red pulsing)
      if (coords.length > 1) {
        const endIcon = L.divIcon({
          html: '<div style="width:14px;height:14px;background:#f87171;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(248,113,113,0.6);"></div>',
          className: '',
          iconSize: [14, 14],
        });
        const em = L.marker(coords[coords.length - 1], { icon: endIcon }).addTo(map);
        em.bindPopup('Latest position');
        layersRef.current.markers.push(em);
      }

      map.fitBounds(polyline.getBounds().pad(0.2));
    };

    update();
  }, [trail]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, []);

  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-center px-7">
        <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div className="font-serif text-[18px] text-txt mb-2">Trail Not Found</div>
        <div className="text-[13px] text-txt-3">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-4 border-b border-brd flex-shrink-0 bg-bg flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[22px] text-txt font-normal">SOS Trail</h1>
          <p className="text-[12px] text-txt-3 mt-0.5">Live GPS trail for session {sessionId?.slice(0, 12)}...</p>
        </div>
        {trail && (
          <div className="flex gap-3">
            <div className="bg-bg-2 border border-brd rounded-btn px-3 py-1.5 text-[12px]">
              <span className="text-txt-3">Points: </span>
              <span className="text-txt font-semibold">{trail.trail.length}</span>
            </div>
            <div className={`rounded-btn px-3 py-1.5 text-[12px] font-medium ${trail.active ? 'bg-danger/10 text-danger border border-danger/30' : 'bg-success/10 text-success border border-success/30'}`}>
              {trail.active ? '● Live' : '✓ Ended'}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {!trail ? (
          <div className="flex items-center justify-center h-full text-txt-3">
            <span className="loader mr-3" /> Loading trail...
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}
      </div>
    </div>
  );
}
