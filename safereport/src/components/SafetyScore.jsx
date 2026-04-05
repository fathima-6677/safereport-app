import { useState } from 'react';
import { IconShield, IconHospital } from './Icons';

export default function SafetyScore({ onScoreResult }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const checkSafety = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Geocode location using Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
        headers: { 'User-Agent': 'RiftFlame/1.0' }
      });
      const data = await res.json();
      if (!data.length) throw new Error('Location not found');
      
      const { lat, lon, display_name } = data[0];
      
      // 2. Get score from our backend
      const scoreRes = await fetch(`/api/score?lat=${lat}&lng=${lon}`);
      const scoreData = await scoreRes.json();
      
      const resData = { ...scoreData, lat: parseFloat(lat), lng: parseFloat(lon), address: display_name };
      setResult(resData);
      onScoreResult?.(resData);
    } catch (err) {
      setError(err.message || 'Failed to check safety score');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={checkSafety} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Check safety of a location (e.g. Marina Beach)"
          className="flex-1 bg-bg-3 border border-brd-2 rounded-btn text-[13px] text-txt px-4 py-2.5 outline-none focus:border-accent transition"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 bg-accent text-white rounded-btn text-[13px] font-bold hover:bg-accent-2 transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <span className="loader" style={{ width: 14, height: 14 }} /> : <IconShield className="w-4 h-4" />}
          Score
        </button>
      </form>

      {error && <div className="text-danger text-[11px] px-2">{error}</div>}

      {result && (
        <div className="glass-card p-5 rounded-card border-l-4 border-l-accent fade-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[14px] font-bold text-txt mb-1">{result.address.split(',')[0]}</div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  result.color === 'green' ? 'bg-success/10 text-success border-success/20' : 
                  result.color === 'amber' ? 'bg-warn/10 text-warn border-warn/20' : 'bg-danger/10 text-danger border-danger/20'
                }`}>
                  {result.label}
                </span>
                <span className="text-[11px] text-txt-3">{result.nearbyIncidents} incidents within 500m</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[28px] font-serif font-black text-txt leading-none">{result.score}</div>
              <div className="text-[10px] text-txt-3 font-bold uppercase tracking-tighter">Safety Index</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-white/5 pt-4">
            {Object.entries(result.breakdown).map(([key, val]) => (
              <div key={key}>
                <div className="flex justify-between text-[10px] font-bold text-txt-3 uppercase mb-1.5 opacity-70">
                  <span>{key === 'timeOfDay' ? 'Time' : key}</span>
                  <span>{val}%</span>
                </div>
                <div className="h-1.5 w-full bg-bg-3 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
