import { useState, useCallback } from 'react';
import {
  fetchReports as localFetch,
  addReport as localAdd,
  updateReportStatus,
} from '../data/localStore';
import { fetchReportsAPI, addReportAPI, updateReportStatusAPI } from '../utils/api';
import { roundCoordinates, generateReferenceId, sanitizeReport } from '../utils/privacy';
import { checkForSpam, recordSubmission } from '../utils/spamDetection';

/**
 * Hook for all report-related operations.
 * Uses localStorage-backed data store for full offline functionality.
 */
export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch reports with optional filters.
   */
  const fetchReports = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Try Express API first, fallback to localStorage
      const data = await fetchReportsAPI(filters);
      setReports(data);
      return data;
    } catch {
      try {
        const data = localFetch(filters);
        setReports(data);
        return data;
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err.message);
        return [];
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit a new anonymous report.
   */
  const addReport = useCallback(async (reportData) => {
    // Spam check
    const spamCheck = checkForSpam(reportData);
    if (spamCheck.isSpam) {
      return { success: false, error: spamCheck.reason };
    }

    try {
      const sanitized = sanitizeReport(reportData);
      const rounded = roundCoordinates(sanitized.location.lat, sanitized.location.lng);
      const referenceId = generateReferenceId();

      const docData = {
        ...sanitized,
        location: {
          ...sanitized.location,
          lat: rounded.lat,
          lng: rounded.lng,
        },
        referenceId,
        status: 'new',
        flagged: false,
      };

      // Try API first, fallback to localStorage
      try {
        const result = await addReportAPI(docData);
        recordSubmission(reportData);
        return { success: true, referenceId: result.referenceId || referenceId };
      } catch {
        localAdd(docData);
        recordSubmission(reportData);
        return { success: true, referenceId };
      }
    } catch (err) {
      console.error('Error adding report:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Update report status (admin action).
   */
  const updateStatus = useCallback(async (docId, newStatus) => {
    try {
      try {
        await updateReportStatusAPI(docId, newStatus);
      } catch {
        updateReportStatus(docId, newStatus);
      }
      setReports((prev) =>
        prev.map((r) => (r.id === docId ? { ...r, status: newStatus } : r))
      );
      return { success: true };
    } catch (err) {
      console.error('Error updating status:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Compute aggregate stats from loaded reports.
   */
  const getStats = useCallback((data = reports) => {
    const total = data.length;
    const high = data.filter((r) => r.severity === 'high').length;
    const medium = data.filter((r) => r.severity === 'medium').length;
    const low = data.filter((r) => r.severity === 'low').length;
    const resolved = data.filter((r) => r.status === 'resolved').length;
    const now = Date.now();
    const thisWeek = data.filter((r) => {
      const ts = typeof r.createdAt === 'number' ? r.createdAt
        : r.createdAt?.toDate ? r.createdAt.toDate().getTime()
        : new Date(r.createdAt).getTime();
      return now - ts < 7 * 86400000;
    }).length;

    const byType = {};
    const byArea = {};
    const byHour = Array(24).fill(0);
    const byDay = Array(7).fill(0);

    data.forEach((r) => {
      byType[r.incidentType] = (byType[r.incidentType] || 0) + 1;
      if (r.location?.area) {
        byArea[r.location.area] = (byArea[r.location.area] || 0) + 1;
      }
      const ts = typeof r.createdAt === 'number' ? r.createdAt
        : r.createdAt?.toDate ? r.createdAt.toDate().getTime()
        : new Date(r.createdAt).getTime();
      const date = new Date(ts);
      byHour[date.getHours()]++;
      byDay[date.getDay()]++;
    });

    return {
      total,
      high,
      medium,
      low,
      resolved,
      thisWeek,
      resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
      byType: Object.entries(byType).sort((a, b) => b[1] - a[1]),
      byArea: Object.entries(byArea).sort((a, b) => b[1] - a[1]),
      byHour,
      byDay,
    };
  }, [reports]);

  return {
    reports,
    loading,
    error,
    fetchReports,
    addReport,
    updateStatus,
    getStats,
  };
}
