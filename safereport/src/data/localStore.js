/**
 * LocalStorage-backed data store for SafeReport.
 * Provides CRUD operations that work entirely offline without Firebase.
 * Data persists across page reloads via localStorage.
 */

import { generateDemoData } from './demoData';

const STORAGE_KEY = 'safereport_incidents';
const SEEDED_KEY = 'safereport_seeded';

/**
 * Initialize the store with demo data if empty.
 */
function ensureSeeded() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  const existing = getAll();
  if (existing.length === 0) {
    const demos = generateDemoData(48);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demos));
  }
  localStorage.setItem(SEEDED_KEY, 'true');
}

/**
 * Get all reports from localStorage.
 */
export function getAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save all reports to localStorage.
 */
function saveAll(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

/**
 * Fetch reports with optional filters.
 * Mimics the Firestore query interface.
 */
export function fetchReports(filters = {}) {
  ensureSeeded();
  let data = getAll();

  // Sort by createdAt descending
  data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // Apply filters
  if (filters.severity && filters.severity !== 'all') {
    data = data.filter((r) => r.severity === filters.severity);
  }
  if (filters.status && filters.status !== 'all') {
    data = data.filter((r) => r.status === filters.status);
  }
  if (filters.incidentType && filters.incidentType !== 'all') {
    data = data.filter((r) =>
      r.incidentType?.toLowerCase().includes(filters.incidentType.toLowerCase())
    );
  }
  if (filters.days) {
    const cutoff = Date.now() - parseInt(filters.days) * 86400000;
    data = data.filter((r) => (r.createdAt || 0) > cutoff);
  }
  if (filters.limit) {
    data = data.slice(0, filters.limit);
  }

  return data;
}

/**
 * Add a new report.
 */
export function addReport(reportData) {
  ensureSeeded();
  const reports = getAll();
  const id = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const newReport = {
    ...reportData,
    id,
    createdAt: Date.now(),
  };
  reports.unshift(newReport);
  saveAll(reports);
  return newReport;
}

/**
 * Update a report's status.
 */
export function updateReportStatus(docId, newStatus) {
  const reports = getAll();
  const idx = reports.findIndex((r) => r.id === docId);
  if (idx === -1) throw new Error('Report not found');
  reports[idx] = { ...reports[idx], status: newStatus };
  saveAll(reports);
  return reports[idx];
}

/**
 * Delete a report.
 */
export function deleteReport(docId) {
  const reports = getAll().filter((r) => r.id !== docId);
  saveAll(reports);
}

/**
 * Export all reports as CSV string.
 */
export function exportAsCSV() {
  const reports = getAll();
  if (reports.length === 0) return '';

  const headers = [
    'Reference ID',
    'Type',
    'Severity',
    'Area',
    'Latitude',
    'Longitude',
    'Time of Day',
    'Description',
    'Status',
    'Reported Date',
  ];

  const rows = reports.map((r) => [
    r.referenceId || '',
    r.incidentType || '',
    r.severity || '',
    r.location?.area || '',
    r.location?.lat || '',
    r.location?.lng || '',
    r.timeOfDay || '',
    `"${(r.description || '').replace(/"/g, '""')}"`,
    r.status || '',
    r.createdAt ? new Date(r.createdAt).toISOString() : '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Reset all data and re-seed with demo data.
 */
export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SEEDED_KEY);
  ensureSeeded();
  return getAll();
}
