import { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import IncidentTable from '../components/IncidentTable';
import { useReports } from '../hooks/useReports';
import { useToast } from '../components/Toast';
import { detectHotspots } from '../utils/hotspot';

export default function AdminPage() {
  const { reports, loading, fetchReports, updateStatus, getStats } = useReports();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: 0, thisWeek: 0, resolutionRate: 0 });
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    fetchReports({ status: statusFilter !== 'all' ? statusFilter : undefined });
  }, [fetchReports, statusFilter]);

  useEffect(() => {
    if (reports.length) {
      setStats(getStats(reports));
      setHotspots(detectHotspots(reports));
    }
  }, [reports, getStats]);

  const handleStatusChange = async (id, newStatus) => {
    const result = await updateStatus(id, newStatus);
    if (result.success) {
      showToast(`Status updated to "${newStatus}"`, 'success');
    } else {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-4 border-b border-brd flex-shrink-0 bg-bg flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[22px] text-txt font-normal">Admin Dashboard</h1>
          <p className="text-[12px] text-txt-3 mt-0.5">Monitor and manage all reported incidents</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select-dark bg-bg-3 border border-brd-2 rounded-btn text-txt text-[12px] px-3 py-1.5 w-[140px] outline-none"
        >
          <option value="all">All statuses</option>
          <option value="new">New only</option>
          <option value="reviewing">In review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatsCard label="Total reports" value={stats.total} subtitle={`${stats.thisWeek} this week`} subtitleClass="text-txt-3" color="accent" />
          <StatsCard label="High severity" value={stats.high} subtitle="Requires attention" subtitleClass="text-danger" color="red" />
          <StatsCard label="Resolved" value={stats.resolved} subtitle={`${stats.resolutionRate}% resolution rate`} subtitleClass="text-success" color="teal" />
          <StatsCard label="This week" value={stats.thisWeek} subtitle="Recent reports" color="gold" />
        </div>

        {/* Hotspot alerts */}
        {hotspots.length > 0 && (
          <div className="mb-5 bg-danger-bg border border-danger/20 rounded-card p-4 fade-up">
            <div className="flex items-center gap-2 text-danger text-[13px] font-medium mb-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              🔥 {hotspots.length} Hotspot{hotspots.length > 1 ? 's' : ''} Detected
            </div>
            <div className="space-y-1">
              {hotspots.map((h, i) => (
                <div key={i} className="text-[12px] text-danger/80">
                  {h.area || 'Unknown area'} — {h.count} incidents in the last 24 hours
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <IncidentTable incidents={reports} onStatusChange={handleStatusChange} loading={loading} />
      </div>
    </div>
  );
}
