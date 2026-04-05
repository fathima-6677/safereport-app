/**
 * API client for SafeReport Express backend.
 * All requests go through Vite proxy → http://localhost:3000
 */

const API = '/api';

// ── Reports ──

export async function fetchReportsAPI(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== 'all') params.append(k, v);
  });
  const res = await fetch(`${API}/reports?${params}`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function addReportAPI(data) {
  const res = await fetch(`${API}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add report');
  return res.json();
}

export async function updateReportStatusAPI(id, status) {
  const res = await fetch(`${API}/reports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update report');
  return res.json();
}

export async function deleteReportAPI(id) {
  const res = await fetch(`${API}/reports/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete report');
  return res.json();
}

// ── SOS ──

export async function sosPing(sessionId, lat, lng) {
  const res = await fetch(`${API}/sos/ping`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, lat, lng, timestamp: Date.now() }),
  });
  return res.json();
}

export async function sosStop(sessionId) {
  const res = await fetch(`${API}/sos/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  });
  return res.json();
}

export async function sosTrail(sessionId) {
  const res = await fetch(`${API}/sos/trail/${sessionId}`);
  if (!res.ok) throw new Error('Trail not found');
  return res.json();
}

// ── Safety Score ──

export async function getSafetyScore(lat, lng) {
  const res = await fetch(`${API}/score?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error('Failed to get safety score');
  return res.json();
}
