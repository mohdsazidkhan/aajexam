import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VisitorDay from '@/models/VisitorDay';
import { protect, admin } from '@/middleware/auth';
import { istDay, SEGMENTS, segmentFilter } from '@/lib/utils/traffic';

const LIMIT = 500;
const istStart = (day) => new Date(`${day}T00:00:00+05:30`);

const USER_FIELDS = 'name username email phone googleId city state heardFrom referredBy createdAt lastLoginDate';

const shapeUser = (u, extra = {}) => ({
    id: String(u._id),
    username: u.username || '',
    name: u.name || '',
    email: u.email || '',
    phone: u.phone || '',
    method: u.googleId ? 'google' : 'password',
    city: u.city || '',
    state: u.state || '',
    heardFrom: u.heardFrom || '',
    referred: !!u.referredBy,
    createdAt: u.createdAt,
    lastLoginDate: u.lastLoginDate,
    ...extra,
});

// GET /api/admin/traffic/users?kind=signup|login&days=1&offset=1&segment=total
// Who signed up / logged in during the selected IST period (same days/offset/segment as /api/admin/traffic).
// signup = accounts created in the period (web + mobile app).
// login  = exactly the visitor rows the Logins card counts (so the list always matches the number). Each row knows
//          which user logged in; rows from before that was recorded come back as `unknown`.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();

        const sp = new URL(req.url).searchParams;
        const kind = sp.get('kind') === 'login' ? 'login' : 'signup';
        const days = Math.min(1095, Math.max(1, parseInt(sp.get('days')) || 1));
        const offset = parseInt(sp.get('offset')) === 1 ? 1 : 0;
        const segment = SEGMENTS.includes(sp.get('segment')) ? sp.get('segment') : 'total';

        const dayFrom = istDay(new Date(Date.now() - (offset + days - 1) * 86400000));
        const dayTo = istDay(new Date(Date.now() - offset * 86400000));

        if (kind === 'login') {
            const filter = { day: { $gte: dayFrom, $lte: dayTo }, login: { $ne: '' }, ...segmentFilter(segment) };
            const [total, rows] = await Promise.all([
                VisitorDay.countDocuments(filter),
                VisitorDay.find(filter).sort({ lastAt: -1 }).limit(LIMIT).select('login loginUid lastAt city state country').lean(),
            ]);
            const ids = [...new Set(rows.map((r) => r.loginUid).filter(Boolean))];
            const found = ids.length ? await User.find({ _id: { $in: ids } }).select(USER_FIELDS).lean() : [];
            const byId = new Map(found.map((u) => [String(u._id), u]));

            return NextResponse.json({
                success: true,
                data: {
                    kind,
                    total,
                    users: rows.map((r) => {
                        const u = r.loginUid && byId.get(r.loginUid);
                        if (u) return shapeUser(u, { method: r.login, lastLoginDate: r.lastAt });
                        return {
                            id: '', unknown: true, name: '', email: '', phone: '', method: r.login,
                            city: r.city || '', state: r.state || r.country || '', heardFrom: '', referred: false, createdAt: null, lastLoginDate: r.lastAt,
                        };
                    }),
                },
            });
        }

        const filter = { createdAt: { $gte: istStart(dayFrom), $lt: new Date(istStart(dayTo).getTime() + 86400000) }, role: { $ne: 'admin' } };
        const [total, users] = await Promise.all([
            User.countDocuments(filter),
            User.find(filter).sort({ createdAt: -1 }).limit(LIMIT).select(USER_FIELDS).lean(),
        ]);

        return NextResponse.json({ success: true, data: { kind, total, users: users.map((u) => shapeUser(u)) } });
    } catch (error) {
        console.error('admin traffic users error:', error);
        return NextResponse.json({ message: 'Failed to load users' }, { status: 500 });
    }
}
