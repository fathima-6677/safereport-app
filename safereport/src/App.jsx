import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ReportPage from './pages/ReportPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import SOSPage from './pages/SOSPage';
import SOSTrailPage from './pages/SOSTrailPage';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<ReportPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/sos" element={<SOSPage />} />
            <Route path="/sos/trail/:sessionId" element={<SOSTrailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
