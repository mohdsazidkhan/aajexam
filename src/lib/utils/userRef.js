import mongoose from 'mongoose';
import User from '@/models/User';

// A user can be addressed by id (24 hex chars) or by username (3-20 chars, so the two never clash;
// usernames are stored lower-case and may be typed with a leading "@").
export const isObjectIdString = (v) => /^[a-f0-9]{24}$/i.test(String(v || ''));

const clean = (ref) => {
    let r = String(ref ?? '');
    try { r = decodeURIComponent(r); } catch { /* keep the raw value */ }
    return r.trim();
};

// Mongo filter for a user reference, or null when the reference is empty.
export function userRefFilter(ref) {
    const r = clean(ref);
    if (!r) return null;
    return isObjectIdString(r) ? { _id: r } : { username: r.toLowerCase().replace(/^@/, '') };
}

// The user's _id for an id-or-username reference, or null when there is no such user.
// An id costs no query; a username costs one indexed lookup.
export async function resolveUserId(ref) {
    const filter = userRefFilter(ref);
    if (!filter) return null;
    if (filter._id) return new mongoose.Types.ObjectId(filter._id);
    const u = await User.findOne(filter).select('_id').lean();
    return u ? u._id : null;
}
