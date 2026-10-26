// Profile-based conditions the admin "Announce" modal can narrow an audience with, e.g. "State or City not added".
// One list shared by the modal (labels) and the broadcast API (filters), so they can never drift apart.
// A condition only ever narrows the "all / PRO / free" audiences; it is never applied to hand-picked users.

const empty = (field) => ({ $or: [{ [field]: { $exists: false } }, { [field]: null }, { [field]: '' }] });

export const ANNOUNCE_CONDITIONS = [
  { key: 'no_location', label: 'State or City not added', filter: { $or: [...empty('state').$or, ...empty('city').$or] } },
  { key: 'no_state', label: 'State not added', filter: empty('state') },
  { key: 'no_city', label: 'City not added', filter: empty('city') },
  { key: 'no_photo', label: 'Profile photo not added', filter: empty('profilePicture') },
  { key: 'no_phone', label: 'Phone number not added', filter: empty('phone') },
  { key: 'no_qualification', label: 'Qualification not added', filter: empty('qualification') },
  { key: 'no_dob', label: 'Date of birth not added', filter: { $or: [{ dateOfBirth: { $exists: false } }, { dateOfBirth: null }] } },
  { key: 'no_gender', label: 'Gender not added', filter: empty('gender') },
  { key: 'no_target_exam', label: 'Target exam not chosen', filter: { $or: [{ targetExams: { $exists: false } }, { targetExams: { $size: 0 } }] } },
  { key: 'profile_incomplete', label: 'Profile not marked complete', filter: { profileCompleted: { $ne: true } } },
];

const BY_KEY = new Map(ANNOUNCE_CONDITIONS.map((c) => [c.key, c]));

export const isAnnounceCondition = (key) => BY_KEY.has(key);
export const announceConditionLabel = (key) => BY_KEY.get(key)?.label || '';
export const announceConditionFilter = (key) => BY_KEY.get(key)?.filter || null;
