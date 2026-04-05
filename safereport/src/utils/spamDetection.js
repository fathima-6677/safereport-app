/**
 * Basic spam/fake report detection.
 * Detects rapid duplicate or similar submissions.
 */

const SPAM_COOLDOWN_MS = 60 * 1000; // 1 minute between submissions
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000; // 10 minute window for dupe checking

// In-memory rate limiter (client-side)
let lastSubmissionTime = 0;
let recentSubmissions = [];

/**
 * Check if the submission appears to be spam.
 * Returns { isSpam: boolean, reason: string }
 */
export function checkForSpam(newReport) {
  const now = Date.now();

  // Rate limiting — too fast
  if (now - lastSubmissionTime < SPAM_COOLDOWN_MS) {
    return {
      isSpam: true,
      reason: 'Please wait at least 1 minute between submissions.',
    };
  }

  // Clean old entries
  recentSubmissions = recentSubmissions.filter((s) => now - s.time < DUPLICATE_WINDOW_MS);

  // Check for duplicate description
  if (newReport.description && newReport.description.length > 10) {
    const dupe = recentSubmissions.find(
      (s) => s.description === newReport.description
    );
    if (dupe) {
      return {
        isSpam: true,
        reason: 'A similar report was already submitted recently.',
      };
    }
  }

  // Check for same type + area combo in rapid succession
  const sameTypeArea = recentSubmissions.filter(
    (s) =>
      s.incidentType === newReport.incidentType &&
      s.area === newReport.location?.area
  );
  if (sameTypeArea.length >= 3) {
    return {
      isSpam: true,
      reason: 'Multiple similar reports detected. Please try again later.',
    };
  }

  return { isSpam: false, reason: '' };
}

/**
 * Record a successful submission for spam tracking.
 */
export function recordSubmission(report) {
  lastSubmissionTime = Date.now();
  recentSubmissions.push({
    time: Date.now(),
    incidentType: report.incidentType,
    area: report.location?.area,
    description: report.description,
  });
}
