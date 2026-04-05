import { useEffect, useState } from 'react';
import { BarChart, SeverityDoughnut, HourGrid, TrendChart } from '../components/Charts';
import { useReports } from '../hooks/useReports';

export default function AnalyticsPage() {
  const { reports, fetchReports, getStats, loading } = useReports();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (reports.length) {
      setStats(getStats(reports));
    }
  }, [reports, getStats]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-7 pt-5 pb-4 border-b border-brd flex-shrink-0 bg-bg">
          <h1 className="font-serif text-[22px] text-txt font-normal">Analytics</h1>
          <p className="text-[12px] text-txt-3 mt-0.5">Pattern analysis across all reported incidents</p>
        </div>
        <div className="flex items-center justify-center flex-1 text-txt-3">
          <span className="loader mr-3"></span> Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-4 border-b border-brd flex-shrink-0 bg-bg">
        <h1 className="font-serif text-[22px] text-txt font-normal">Analytics</h1>
        <p className="text-[12px] text-txt-3 mt-0.5">Pattern analysis across all reported incidents</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {stats ? (
          <div className="grid grid-cols-2 gap-4">
            {/* By Type */}
            <div className="bg-bg-2 border border-brd rounded-card p-5 fade-up">
              <div className="text-[12px] font-medium text-txt-2 uppercase tracking-wider mb-4">
                Incidents by type
              </div>
              <BarChart data={stats.byType.slice(0, 6)} color="#e8547a" />
            </div>

            {/* By Area */}
            <div className="bg-bg-2 border border-brd rounded-card p-5 fade-up">
              <div className="text-[12px] font-medium text-txt-2 uppercase tracking-wider mb-4">
                Top affected areas
              </div>
              <BarChart data={stats.byArea.slice(0, 6)} color="#2dd4bf" />
            </div>

            {/* Severity Distribution */}
            <div className="bg-bg-2 border border-brd rounded-card p-5 fade-up">
              <div className="text-[12px] font-medium text-txt-2 uppercase tracking-wider mb-4">
                Severity distribution
              </div>
              <SeverityDoughnut stats={stats} />
            </div>

            {/* Weekly Trend */}
            <div className="bg-bg-2 border border-brd rounded-card p-5 fade-up">
              <div className="text-[12px] font-medium text-txt-2 uppercase tracking-wider mb-4">
                Reports by day of week
              </div>
              <TrendChart byDay={stats.byDay} />
            </div>

            {/* Hour Heatmap */}
            <div className="col-span-2 bg-bg-2 border border-brd rounded-card p-5 fade-up">
              <div className="text-[12px] font-medium text-txt-2 uppercase tracking-wider mb-4">
                Incidents by hour of day
              </div>
              <HourGrid byHour={stats.byHour} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-txt-3">
            No data available yet. Submit some reports to see analytics.
          </div>
        )}
      </div>
    </div>
  );
}
