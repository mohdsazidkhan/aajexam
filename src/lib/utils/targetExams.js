// Target-exam filtering helpers. A user with no target exams (= "All Exams")
// gets unfiltered content; otherwise list endpoints receive ?examIds=a,b,c.

export const TARGET_EXAMS_EVENT = 'targetExamsChanged';

// Call after saving target exams so open pages refetch their (now filtered) lists.
export const notifyTargetExamsChanged = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TARGET_EXAMS_EVENT));
};

export const parseExamIds = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter((id) => /^[a-f0-9]{24}$/i.test(id));

// Adds "exam is one of ids" to a Mongo query. $and keeps it from clobbering an existing $or
// (e.g. blog search). includeGeneric keeps docs with no exam (optional-exam content).
export function applyExamScope(query, ids, { field = 'exam', includeGeneric = false } = {}) {
  if (!ids.length) return query;
  const scope = includeGeneric
    ? { $or: [{ [field]: { $in: ids } }, { [field]: null }] }
    : { [field]: { $in: ids } };
  query.$and = [...(query.$and || []), scope];
  return query;
}

// Client only: ids saved on the logged-in user (kept in sync by settings + TargetExamPrompt).
export function getStoredTargetExamIds() {
  if (typeof window === 'undefined') return [];
  try {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    return (user?.targetExams || []).map((e) => String(e?._id || e));
  } catch {
    return [];
  }
}
