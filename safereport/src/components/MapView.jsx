import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { SAFE_HAVENS } from '../data/safeHavens';
import { IconHospital, IconPolice } from './Icons';
import { renderToStaticMarkup } from 'react-dom/server';

const sevColors = {
  high: '#f87171',
  medium: '#fb923c',
  low: '#60a5fa',
};

export default function MapView({ incidents, filters, onFilterChange, scoreOverlay, routeSegments, showSafeHavens = false }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const layersRef = useRef({ heat: null, markers: null, scoreCircle: null, scoreMarker: null, routeLines: [], safeHavens: [] });
  const [mapMode, setMapMode] = useState('markers');
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      const L = await import('leaflet');
      await import('leaflet.heat');
      const { MarkerClusterGroup } = await import('leaflet.markercluster');

      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, {
        center: [13.0827, 80.2707],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstance.current = map;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update heatmap & marker layers
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;

    const updateLayers = async () => {
      const L = await import('leaflet');
      const { MarkerClusterGroup } = await import('leaflet.markercluster');
      const map = mapInstance.current;

      if (layersRef.current.heat) { map.removeLayer(layersRef.current.heat); }
      if (layersRef.current.markers) { map.removeLayer(layersRef.current.markers); }

      const data = incidents || [];

      if (mapMode === 'heat' || mapMode === 'both') {
        const heatData = data.map((r) => {
          const lat = r.location?.lat || r.lat;
          const lng = r.location?.lng || r.lng;
          const intensity = r.severity === 'high' ? 1 : r.severity === 'medium' ? 0.6 : 0.3;
          return [lat, lng, intensity];
        });
        const heat = L.heatLayer(heatData, {
          radius: 30, blur: 20, maxZoom: 15,
          gradient: { 0.2: '#60a5fa', 0.5: '#fb923c', 0.8: '#f87171', 1: '#ff2d55' },
        });
        heat.addTo(map);
        layersRef.current.heat = heat;
      }

      if (mapMode === 'markers' || mapMode === 'both') {
        const cluster = new MarkerClusterGroup({ maxClusterRadius: 50, spiderfyOnMaxZoom: true });

        data.forEach((r) => {
          const lat = r.location?.lat || r.lat;
          const lng = r.location?.lng || r.lng;
          const color = sevColors[r.severity] || '#60a5fa';

          const icon = L.divIcon({
            html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 8px ${color}66;"></div>`,
            className: '',
            iconSize: [12, 12],
          });

          const marker = L.marker([lat, lng], { icon });
          marker.bindPopup(`
            <div style="font-family:'DM Sans',sans-serif;">
              <div style="font-weight:500;font-size:13px;color:#e8eaf0;margin-bottom:4px;">${r.incidentType}</div>
              <div style="font-size:11.5px;color:#555b6a;">${r.location?.area || r.area || '—'} · ${r.timeOfDay || '—'}</div>
              <span style="display:inline-block;font-size:10.5px;font-weight:500;padding:2px 7px;border-radius:20px;margin-top:5px;background:${color}22;color:${color};">${r.severity}</span>
            </div>
          `);
          cluster.addLayer(marker);
        });

        map.addLayer(cluster);
        layersRef.current.markers = cluster;
      }
    };

    updateLayers();
  }, [incidents, mapMode, mapReady]);

  // ── Safety Score overlay ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;

    const drawScore = async () => {
      const L = await import('leaflet');
      const map = mapInstance.current;

      // Remove previous
      if (layersRef.current.scoreCircle) { map.removeLayer(layersRef.current.scoreCircle); layersRef.current.scoreCircle = null; }
      if (layersRef.current.scoreMarker) { map.removeLayer(layersRef.current.scoreMarker); layersRef.current.scoreMarker = null; }

      if (!scoreOverlay) return;

      const { lat, lng, score, color } = scoreOverlay;
      const circleColor = color === 'red' ? '#f87171' : color === 'amber' ? '#fb923c' : '#4ade80';

      const circle = L.circle([lat, lng], {
        radius: 500,
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 4',
      }).addTo(map);

      const scoreIcon = L.divIcon({
        html: `<div style="background:${circleColor}22;border:2px solid ${circleColor};border-radius:12px;padding:4px 10px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;color:${circleColor};white-space:nowrap;text-align:center;">${score}/100</div>`,
        className: '',
        iconSize: [60, 28],
        iconAnchor: [30, 14],
      });
      const marker = L.marker([lat, lng], { icon: scoreIcon }).addTo(map);

      layersRef.current.scoreCircle = circle;
      layersRef.current.scoreMarker = marker;

      map.setView([lat, lng], 14);
    };

    drawScore();
  }, [scoreOverlay, mapReady]);

  // ── Route segments overlay ──
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return;

    const drawRoute = async () => {
      const L = await import('leaflet');
      const map = mapInstance.current;

      // Remove previous route
      layersRef.current.routeLines.forEach((l) => map.removeLayer(l));
      layersRef.current.routeLines = [];

      if (!routeSegments || routeSegments.length === 0) return;

      const allCoords = [];
      routeSegments.forEach((seg) => {
        const color = seg.safe ? '#4ade80' : '#f87171';
        const line = L.polyline(seg.coords, {
          color,
          weight: 5,
          opacity: 0.85,
        }).addTo(map);
        layersRef.current.routeLines.push(line);
        allCoords.push(...seg.coords);
      });

      // Start & end markers
      if (allCoords.length > 1) {
        const startIcon = L.divIcon({
          html: '<div style="width:12px;height:12px;background:#4ade80;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(74,222,128,0.5);"></div>',
          className: '',
          iconSize: [12, 12],
        });
        const endIcon = L.divIcon({
          html: '<div style="width:12px;height:12px;background:#f87171;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px rgba(248,113,113,0.5);"></div>',
          className: '',
          iconSize: [12, 12],
        });
        const sm = L.marker(allCoords[0], { icon: startIcon }).addTo(map);
        const em = L.marker(allCoords[allCoords.length - 1], { icon: endIcon }).addTo(map);
        layersRef.current.routeLines.push(sm, em);
      }

      map.fitBounds(allCoords, { padding: [50, 50] });
    };

    drawRoute();
  }, [routeSegments, mapReady]);

  const filterTypes = ['all', 'harassment', 'physical', 'stalking', 'lighting'];

  return (
    <div className="flex-1 relative">
      <div ref={mapRef} className="w-full h-full"></div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Type filter */}
        <div className="bg-bg-2 border border-brd-2 rounded-card p-1.5 flex gap-1">
          {filterTypes.map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange?.({ ...filters, type: f })}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all
                ${(filters?.type || 'all') === f
                  ? 'bg-bg-4 text-txt'
                  : 'text-txt-2 hover:text-txt'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="bg-bg-2 border border-brd-2 rounded-btn p-1.5 flex gap-1">
          {['markers', 'heat', 'both'].map((m) => (
            <button
              key={m}
              onClick={() => setMapMode(m)}
              className={`px-3 py-1 rounded-md text-[11.5px] font-medium transition-all
                ${mapMode === m
                  ? 'bg-accent-bg text-accent'
                  : 'text-txt-2 hover:text-txt'
                }`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="bg-bg-2 border border-brd-2 rounded-btn p-3">
          <div className="text-[10.5px] font-medium text-txt-3 uppercase tracking-wider mb-2">Severity</div>
          {[
            { label: 'High risk', color: '#f87171' },
            { label: 'Medium risk', color: '#fb923c' },
            { label: 'Low risk', color: '#60a5fa' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-[12px] text-txt-2 mb-1 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }}></div>
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="absolute bottom-4 left-4 z-[1000] flex gap-2">
        <div className="bg-bg-2 border border-brd-2 rounded-full px-3.5 py-1.5 text-[12px] text-txt-2 flex items-center gap-1.5">
          <strong className="text-txt font-semibold">{incidents?.length || 0}</strong> incidents shown
        </div>
      </div>
    </div>
  );
}
