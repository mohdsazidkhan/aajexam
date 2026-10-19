import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VisitorDay from '@/models/VisitorDay';
import User from '@/models/User';
import Lead from '@/models/Lead';
import { protect, admin } from '@/middleware/auth';
import { istDay, PROMPT_NAMES, SOURCES, LEGACY_SOURCE } from '@/lib/utils/traffic';

const SUM_KEYS = ['visitors', 'pageViews', 'alreadyLoggedIn', 'newVisitors', 'sawAuthPage', 'leftWithoutAuth', 'leftAfterAuthPage',
    'signupGoogle', 'signupPassword', 'loginGoogle', 'loginPassword', 'dbSignups', 'dbSignupsGoogle', 'dbSignupsPassword'];
const sumRows = (list) => Object.fromEntries(SUM_KEYS.map((k) => [k, list.reduce((t, r) => t + (r[k] || 0), 0)]));

// Fold legacy source names into the current list and show every source, even those with no visitors yet.
const mergeSources = (rows) => {
    const m = new Map(SOURCES.map((n) => [n, { source: n, visitors: 0, signups: 0 }]));
    rows.forEach((r) => {
        const raw = r._id || 'Direct';
        const name = SOURCES.includes(raw) ? raw : (LEGACY_SOURCE[raw] || 'Other');
        const e = m.get(name);
        e.visitors += r.visitors;
        e.signups += r.signups;
    });
    return [...m.values()];
};

const count = (cond) => ({ $sum: { $cond: [cond, 1, 0] } });
const anon = { $not: ['$wasLoggedIn'] };

// GET /api/admin/traffic?days=14&offset=0   (offset 1 + days 1 = yesterday only)
// Per IST day: visitors, how many were already logged in, how many opened /login or /register,
// how many left without signing up or logging in, and the google vs password split.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }
        await dbConnect();

        const sp = new URL(req.url).searchParams;
        const days = Math.min(1095, Math.max(1, parseInt(sp.get('days')) || 14));
        const offset = parseInt(sp.get('offset')) === 1 ? 1 : 0;
        // Also load the equally long period before the range, for the vs-previous comparison on the cards.
        const total = offset + 2 * days;
        const fromDate = new Date(Date.now() - (total - 1) * 86400000);
        const fromDay = istDay(fromDate);
        // The selected range (sources / devices / table) covers [rangeFrom, rangeTo].
        const rangeTo = istDay(new Date(Date.now() - offset * 86400000));
        const rangeFrom = istDay(new Date(Date.now() - (offset + days - 1) * 86400000));

        // Optional: hide visits that look automated (single page, direct, from outside India).
        const hideSuspect = sp.get('hideSuspect') === '1';
        const suspectFilter = hideSuspect
            ? { $nor: [{ pages: { $lte: 1 }, source: 'Direct', country: { $nin: ['IN', ''] } }] }
            : {};

        const inRange = { day: { $gte: rangeFrom, $lte: rangeTo }, ...suspectFilter };
        const top = (field, extra = {}) => VisitorDay.aggregate([
            { $match: { ...inRange, [field]: { $nin: ['', null] }, ...extra } },
            { $group: { _id: field === 'city' ? { city: '$city', country: '$country' } : field === 'state' ? { state: '$state', country: '$country' } : `$${field}`, visitors: { $sum: 1 }, signups: count({ $ne: ['$signup', ''] }) } },
            { $sort: { visitors: -1 } },
            { $limit: 10 },
        ]);

        const [perDay, sources, devices, dbSignups, countries, cities, states, oses, browsers, ips, exitPages, promptRows, leadCount, signupFromRows, signupPathRows] = await Promise.all([

            VisitorDay.aggregate([
                { $match: { day: { $gte: fromDay }, ...suspectFilter } },
                {
                    $group: {
                        _id: '$day',
                        visitors: { $sum: 1 },
                        pageViews: { $sum: '$pages' },
                        alreadyLoggedIn: count('$wasLoggedIn'),
                        newVisitors: count(anon),
                        sawAuthPage: count({ $and: [anon, '$sawAuth'] }),
                        leftWithoutAuth: count({ $and: [anon, { $eq: ['$signup', ''] }, { $eq: ['$login', ''] }] }),
                        leftAfterAuthPage: count({ $and: [anon, '$sawAuth', { $eq: ['$signup', ''] }, { $eq: ['$login', ''] }] }),
                        signupGoogle: count({ $eq: ['$signup', 'google'] }),
                        signupPassword: count({ $eq: ['$signup', 'password'] }),
                        loginGoogle: count({ $eq: ['$login', 'google'] }),
                        loginPassword: count({ $eq: ['$login', 'password'] }),
                    },
                },
            ]),
            VisitorDay.aggregate([
                { $match: { ...inRange, wasLoggedIn: false } },
                { $group: { _id: '$source', visitors: { $sum: 1 }, signups: count({ $ne: ['$signup', ''] }) } },
                { $sort: { visitors: -1 } },
            ]),
            VisitorDay.aggregate([
                { $match: inRange },
                { $group: { _id: '$device', visitors: { $sum: 1 } } },
            ]),
            // Ground truth from the users collection (includes mobile app signups, which the web beacon cannot see)
            User.aggregate([
                { $match: { createdAt: { $gte: new Date(fromDate.getTime() - 86400000) } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
                        total: { $sum: 1 },
                        google: count({ $ifNull: ['$googleId', false] }),
                    },
                },
            ]),
            top('country'),
            top('city'),
            top('state'),
            top('os'),
            top('browser'),
            VisitorDay.aggregate([
                { $match: { ...inRange, ipHash: { $nin: ['', null] } } },
                { $group: { _id: '$ipHash' } },
                { $count: 'n' },
            ]),
            // Last page seen by visitors who left without signing up or logging in
            VisitorDay.aggregate([
                { $match: { ...inRange, wasLoggedIn: false, signup: '', login: '', lastPath: { $ne: '' } } },
                { $group: { _id: '$lastPath', visitors: { $sum: 1 } } },
                { $sort: { visitors: -1 } },
                { $limit: 10 },
            ]),
            // Per signup prompt: shown to, clicked by, and how many of those visitors signed up that day
            VisitorDay.aggregate([
                { $match: { ...inRange, wasLoggedIn: false } },
                { $project: { prompts: 1, clicks: 1, signedUp: { $ne: ['$signup', ''] } } },
                { $facet: Object.fromEntries(PROMPT_NAMES.map((n) => [n, [
                    { $match: { $or: [{ prompts: n }, { clicks: n }] } },
                    { $group: { _id: null, shown: count({ $in: [n, { $ifNull: ['$prompts', []] }] }), clicked: count({ $in: [n, { $ifNull: ['$clicks', []] }] }), signups: count('$signedUp') } },
                ]])) },
            ]),
            Lead.countDocuments({ day: { $gte: rangeFrom, $lte: rangeTo } }),
            // Which button / popup the visitor pressed before creating their account
            VisitorDay.aggregate([
                { $match: { ...inRange, signup: { $ne: '' } } },
                { $group: { _id: { $ifNull: ['$signupFrom', ''] }, signups: { $sum: 1 }, google: count({ $eq: ['$signup', 'google'] }), password: count({ $eq: ['$signup', 'password'] }) } },
                { $sort: { signups: -1 } },
            ]),
            // ...and the page that button was on
            VisitorDay.aggregate([
                { $match: { ...inRange, signup: { $ne: '' }, signupPath: { $nin: ['', null] } } },
                { $group: { _id: '$signupPath', signups: { $sum: 1 } } },
                { $sort: { signups: -1 } },
                { $limit: 10 },
            ]),
        ]);

        const byDay = new Map(perDay.map((d) => [d._id, d]));
        const dbByDay = new Map(dbSignups.map((d) => [d._id, d]));
        const rows = [];
        for (let i = 0; i < total; i += 1) {
            const day = istDay(new Date(Date.now() - i * 86400000));
            const d = byDay.get(day) || {};
            const db = dbByDay.get(day) || { total: 0, google: 0 };
            rows.push({
                day,
                visitors: d.visitors || 0,
                pageViews: d.pageViews || 0,
                alreadyLoggedIn: d.alreadyLoggedIn || 0,
                newVisitors: d.newVisitors || 0,
                sawAuthPage: d.sawAuthPage || 0,
                leftWithoutAuth: d.leftWithoutAuth || 0,
                leftAfterAuthPage: d.leftAfterAuthPage || 0,
                signupGoogle: d.signupGoogle || 0,
                signupPassword: d.signupPassword || 0,
                loginGoogle: d.loginGoogle || 0,
                loginPassword: d.loginPassword || 0,
                dbSignups: db.total,
                dbSignupsGoogle: db.google,
                dbSignupsPassword: db.total - db.google,
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                summary: {
                    current: sumRows(rows.slice(offset, offset + days)),
                    previous: sumRows(rows.slice(offset + days, offset + 2 * days)),
                },
                days: rows.slice(offset, offset + days),
                sources: mergeSources(sources),
                countries: countries.map((s) => ({ code: s._id, visitors: s.visitors, signups: s.signups })),
                cities: cities.map((s) => ({ city: s._id.city, country: s._id.country, visitors: s.visitors, signups: s.signups })),
                states: states.map((s) => ({ name: s._id.state, country: s._id.country, visitors: s.visitors, signups: s.signups })),
                oses: oses.map((s) => ({ name: s._id, visitors: s.visitors })),
                browsers: browsers.map((s) => ({ name: s._id, visitors: s.visitors })),
                uniqueIps: ips[0]?.n || 0,
                exitPages: exitPages.map((p) => ({ path: p._id, visitors: p.visitors })),
                prompts: PROMPT_NAMES.map((n) => {
                    const r = promptRows[0]?.[n]?.[0] || {};
                    return { name: n, shown: r.shown || 0, clicked: r.clicked || 0, signups: r.signups || 0 };
                }),
                leads: leadCount,
                signupFrom: signupFromRows.map((r) => ({ from: r._id || 'untracked', signups: r.signups, google: r.google, password: r.password })),
                signupPaths: signupPathRows.map((r) => ({ path: r._id, signups: r.signups })),
                hideSuspect,
                devices: devices.map((s) => ({ device: s._id || 'desktop', visitors: s.visitors })),
                trackingSince: (await VisitorDay.findOne().sort({ createdAt: 1 }).select('day').lean())?.day || null,
            },
        });
    } catch (error) {
        console.error('admin traffic error:', error);
        return NextResponse.json({ message: 'Failed to load traffic' }, { status: 500 });
    }
}
