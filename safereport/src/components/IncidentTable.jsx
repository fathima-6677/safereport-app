const sevClass = {
  high: 'bg-danger-bg text-danger',
  medium: 'bg-warn-bg text-warn',
  low: 'bg-teal-bg text-teal',
};

const statusClass = {
  new: 'bg-danger-bg text-danger',
  reviewing: 'bg-gold-bg text-gold',
  resolved: 'bg-success-bg text-success',
};

const nextStatus = {
  new: 'reviewing',
  reviewing: 'resolved',
  resolved: 'new',
};

function parseTimestamp(ts) {
  if (typeof ts === 'number') return new Date(ts);
  if (ts?.toDate) return ts.toDate();
  return new Date(ts);
}

export default function IncidentTable({ incidents, onStatusChange, loading }) {
  if (loading) {
    return (
      <div className="bg-bg-2 border border-brd rounded-card overflow-hidden">
        <div className="p-4 border-b border-brd">
          <div className="text-[13px] font-medium text-txt">Incident log</div>
        </div>
        <div className="text-center py-10 text-txt-3 text-[13px]">
          <span className="loader mr-2"></span> Loading incidents...
        </div>
      </div>
    );
  }

  const formatDate = (ts) => {
    if (!ts) return '—';
    try {
      const d = parseTimestamp(ts);
      const diff = Date.now() - d.getTime();
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 172800000) return 'Yesterday';
      const days = Math.floor(diff / 86400000);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="bg-bg-2 border border-brd rounded-card overflow-hidden">
      <div className="p-4 border-b border-brd flex items-center justify-between">
        <div className="text-[13px] font-medium text-txt">Incident log</div>
        <div className="text-[11px] text-txt-3">{incidents.length} records</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['ID', 'Type', 'Area', 'Severity', 'Reported', 'Status', 'Action'].map((h) => (
                <th key={h} className="text-left text-[10.5px] font-medium text-txt-3 tracking-wider uppercase px-4 py-2.5 border-b border-brd">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-txt-3 text-[13px]">
                  No incidents found
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2.5 border-b border-brd font-mono text-[11.5px] text-txt-3">
                    {inc.referenceId}
                  </td>
                  <td className="px-4 py-2.5 border-b border-brd text-[12.5px] text-txt-2 max-w-[160px] truncate">
                    {inc.incidentType}
                  </td>
                  <td className="px-4 py-2.5 border-b border-brd text-[12.5px] text-txt-2">
                    {inc.location?.area || '—'}
                  </td>
                  <td className="px-4 py-2.5 border-b border-brd">
                    <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full ${sevClass[inc.severity] || ''}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 border-b border-brd text-[12.5px] text-txt-2">
                    {formatDate(inc.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 border-b border-brd">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${statusClass[inc.status] || ''}`}>
                      <span className="w-[5px] h-[5px] rounded-full bg-current"></span>
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 border-b border-brd">
                    <button
                      onClick={() => onStatusChange(inc.id, nextStatus[inc.status] || 'new')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium border border-brd-2 text-txt-2 hover:bg-bg-4 hover:text-txt transition-colors"
                    >
                      {inc.status === 'new' ? 'Review' : inc.status === 'reviewing' ? 'Resolve' : 'Reopen'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
