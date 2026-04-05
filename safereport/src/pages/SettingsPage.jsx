import { useState } from 'react';
import { exportAsCSV, resetData } from '../data/localStore';
import { useToast } from '../components/Toast';

function Toggle({ defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn);
  const handleToggle = () => {
    const newVal = !on;
    setOn(newVal);
    onChange?.(newVal);
  };
  return (
    <div
      onClick={handleToggle}
      className={`flex-shrink-0 w-9 h-5 rounded-full cursor-pointer relative transition-colors duration-200 border
        ${on ? 'bg-success border-success' : 'bg-bg-4 border-brd-2'}
      `}
    >
      <div className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[2px] transition-transform duration-200
        ${on ? 'translate-x-[18px]' : 'translate-x-[2px]'}
      `}></div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-brd last:border-b-0 last:pb-0 gap-3">
      <div>
        <div className="text-[13px] text-txt">{label}</div>
        <div className="text-[11.5px] text-txt-3 mt-0.5">{description}</div>
      </div>
      {children}
    </div>
  );
}

function SettingsCard({ title, children }) {
  return (
    <div className="bg-bg-2 border border-brd rounded-card p-5 fade-up">
      <div className="text-[13px] font-medium text-txt mb-4 pb-3 border-b border-brd">{title}</div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const csv = exportAsCSV();
      if (!csv) {
        showToast('No data to export', 'info');
        setExporting(false);
        return;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `safereport_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`Exported successfully`, 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
    setExporting(false);
  };

  const handleReset = () => {
    if (window.confirm('This will reset all data to demo defaults. Your submitted reports will be lost. Continue?')) {
      resetData();
      showToast('Data reset to demo defaults', 'success');
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-5 pb-4 border-b border-brd flex-shrink-0 bg-bg">
        <h1 className="font-serif text-[22px] text-txt font-normal">Settings</h1>
        <p className="text-[12px] text-txt-3 mt-0.5">Privacy, notifications, and data preferences</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="grid grid-cols-2 gap-4 max-w-[860px]">
          {/* Privacy */}
          <SettingsCard title="Privacy & anonymity">
            <SettingRow label="Strip all metadata" description="Remove device info, browser, and precise timestamps">
              <Toggle defaultOn />
            </SettingRow>
            <SettingRow label="500m location grid" description="Coordinates rounded before storage — exact GPS never saved">
              <Toggle defaultOn />
            </SettingRow>
            <SettingRow label="No session cookies" description="All data cleared when tab closes">
              <Toggle defaultOn />
            </SettingRow>
            <SettingRow label="Tor-friendly mode" description="Disable features that may leak identity via Tor">
              <Toggle />
            </SettingRow>
          </SettingsCard>

          {/* Alerts */}
          <SettingsCard title="Admin alerts">
            <SettingRow label="High severity alerts" description="Notify when a high severity report is submitted">
              <Toggle defaultOn />
            </SettingRow>
            <SettingRow label="Hotspot detection" description="Alert when 3+ incidents in same zone within 24h">
              <Toggle defaultOn />
            </SettingRow>
            <SettingRow label="Weekly digest" description="Summary of incidents every Monday morning">
              <Toggle />
            </SettingRow>
          </SettingsCard>

          {/* Map */}
          <SettingsCard title="Map settings">
            <SettingRow label="Dark map tiles" description="Use dark theme for OpenStreetMap tiles">
              <Toggle defaultOn />
            </SettingRow>
            <SettingRow label="Cluster nearby markers" description="Group nearby incidents at low zoom levels">
              <Toggle defaultOn />
            </SettingRow>
            <SettingRow label="Auto-refresh map" description="Reload incident data every 5 minutes">
              <Toggle />
            </SettingRow>
          </SettingsCard>

          {/* Data */}
          <SettingsCard title="Data management">
            <SettingRow label="Auto-delete resolved" description="Remove resolved incidents after">
              <select className="form-select-dark bg-bg-3 border border-brd-2 rounded-btn text-txt text-[12px] px-2.5 py-1.5 w-[110px] outline-none">
                <option>90 days</option>
                <option>180 days</option>
                <option>1 year</option>
              </select>
            </SettingRow>
            <SettingRow label="Export anonymised data" description="Download all reports as CSV">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-3 py-1.5 bg-bg-3 border border-brd-2 rounded-btn text-txt-2 text-[11.5px] font-medium hover:bg-bg-4 hover:text-txt transition-all disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export CSV'}
              </button>
            </SettingRow>
            <SettingRow label="Reset to demo data" description="Clear all data and reload sample incidents">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-danger-bg border border-danger/20 rounded-btn text-danger text-[11.5px] font-medium hover:bg-danger/20 transition-all"
              >
                Reset data
              </button>
            </SettingRow>
            <SettingRow label="Data storage" description="All data stored locally in your browser">
              <span className="font-mono text-[11px] text-teal">localStorage</span>
            </SettingRow>
          </SettingsCard>
        </div>
      </div>
    </div>
  );
}
