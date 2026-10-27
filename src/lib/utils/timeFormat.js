// QuizAttempt.totalTime is stored in seconds, UserTestAttempt.totalTime in
// milliseconds (Date.now() delta) — normalize to seconds before formatting.
// `type` is 'exam' for UserTestAttempt-backed values, anything else ('quiz') for QuizAttempt.
export const formatTimeSpent = (rawTotalTime, type) => {
  const seconds = Math.round((rawTotalTime || 0) / (type === 'exam' ? 1000 : 1));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return `${seconds}s`;
};

// For values already normalized to seconds (e.g. a value pre-summed server-side
// across both quiz-seconds and exam-milliseconds sources).
export const formatSecondsSpent = (seconds) => formatTimeSpent(seconds || 0, 'quiz');

// Same inputs as formatTimeSpent but keeps the seconds ("26m 31s", "1h 5m 3s"), so a total shown next to
// the per-student values is exactly their sum instead of differing by the minutes each one was rounded down.
export const formatTimeExact = (rawTotalTime, type) => {
  const seconds = Math.round((rawTotalTime || 0) / (type === 'exam' ? 1000 : 1));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

export const formatSecondsExact = (seconds) => formatTimeExact(seconds || 0, 'quiz');
