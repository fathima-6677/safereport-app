import { useEffect, useState, useCallback } from 'react';
import { IconMap, IconShield, IconHospital } from '../components/Icons';
import MapView from '../components/MapView';
import SafetyScore from '../components/SafetyScore';
import SafeRoute from '../components/SafeRoute';
import { useReports } from '../hooks/useReports';
import { SAFE_HAVENS } from '../data/safeHavens';

export default function MapPage() {
  const { reports, fetchReports, loading } = useReports();
  const [filters, setFilters] = useState({ type: 'all', severity: 'all' });
  const [activeTab, setActiveTab] = useState('map');
  const [scoreOverlay, setScoreOverlay] = useState(null);
  const [routeSegments, setRouteSegments] = useState(null);
  const [showSafeHavens, setShowSafeHavens] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Client-side filter
  const filtered = reports.filter((r) => {
    if (filters.type && filters.type !== 'all') {
      if (!r.incidentType?.toLowerCase().includes(filters.type.toLowerCase())) {
        return false;
      }
    }
    if (filters.severity && filters.severity !== 'all') {
      if (r.severity !== filters.severity) return false;
    }
    return true;
  });

  const handleFilterChange = useCallback((f) => setFilters(f), []);

  const handleScoreResult = useCallback((data) => {
    setScoreOverlay(data);
  }, []);

  const handleRouteResult = useCallback((segments) => {
    setRouteSegments(segments);
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header - spacing depends on Layout offset */}
      <div className="px-4 lg:px-7 pt-4 lg:pt-8 pb-4 border-b border-brd flex-shrink-0 bg-bg">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 lg:mb-6">
          <div>
            <h1 className="font-serif text-[22px] lg:text-[26px] text-txt mb-1">Safety Map</h1>
            <p className="text-txt-3 text-[11px] lg:text-[13px]">Live incident heatmap — Community powered</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
             <button
              onClick={() => setShowSafeHavens(!showSafeHavens)}
              className={`flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 rounded-btn text-[11px] lg:text-[12px] font-bold transition-all border ${
                showSafeHavens 
                ? 'bg-accent/15 text-accent border-accent/20' 
                : 'bg-bg-3 text-txt-2 border-brd-2 hover:bg-bg-4 shadow-sm'
              }`}
            >
              <IconShield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Safe Havens</span>
              <span className="sm:hidden">Havens</span>
            </button>

            <div className="flex bg-bg-3 p-1 rounded-card border border-brd-2 shadow-sm">
              <button
                onClick={() => setActiveTab('map')}
                className={`px-3 lg:px-4 py-1.5 rounded-btn text-[11px] lg:text-[12px] font-bold transition-all ${activeTab === 'map' ? 'bg-bg-4 text-txt shadow-sm' : 'text-txt-3 hover:text-txt-2'}`}
              >
                Map
              </button>
              <button
                onClick={() => setActiveTab('route')}
                className={`px-3 lg:px-4 py-1.5 rounded-btn text-[11px] lg:text-[12px] font-bold transition-all ${activeTab === 'route' ? 'bg-bg-4 text-txt shadow-sm' : 'text-txt-3 hover:text-txt-2'}`}
              >
                Route
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <select
              value={filters.severity}
              onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
              className="form-select-dark bg-bg-3 border border-brd-2 rounded-btn text-txt text-[11px] lg:text-[12px] px-3 py-1.5 outline-none"
            >
              <option value="all">All severity</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <button
              onClick={() => fetchReports()}
              className="px-3 py-1.5 bg-bg-3 border border-brd-2 rounded-btn text-txt-2 text-[11px] lg:text-[12px] font-medium hover:bg-bg-4 hover:text-txt transition-all flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Safety Score search */}
        <div className="mb-1">
          <SafetyScore onScoreResult={handleScoreResult} />
        </div>
      </div>


      {/* Route panel (shown when route tab is active) */}
      {activeTab === 'route' && (
        <div className="px-7 py-3 border-b border-brd bg-bg flex-shrink-0">
          <SafeRoute incidents={reports} onRouteResult={handleRouteResult} />
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {loading && reports.length === 0 ? (
          <div className="flex items-center justify-center h-full text-txt-3">
            <span className="loader mr-3"></span> Loading map data...
          </div>
        ) : (
          <MapView
            incidents={filtered}
            filters={filters}
            onFilterChange={handleFilterChange}
            scoreOverlay={scoreOverlay}
            routeSegments={routeSegments}
          />
        )}
      </div>
    </div>
  );
}
