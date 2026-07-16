import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';

/**
 * Referral-fraud analytics.
 *
 * The platform stores no IP/device fingerprint, so detection is graph- and
 * behaviour-based over the referral graph (referredBy = referrer's referralCode):
 *   - self-referral            : invited themselves
 *   - reciprocal ring          : A invited B and B invited A
 *   - velocity burst           : many invitees signed up in a tiny window (bot farm)
 *   - dormant invitees         : invitees who never logged back in (throwaways)
 *   - duplicate contact        : invitees sharing phone / normalized email
 *   - email-pattern cluster    : invitees like ravi1@, ravi2@, ravi3@ …
 *   - suspended invitees       : invitees already flagged/banned
 *
 * Each fired signal adds weight; the sum (capped 100) is the risk score.
 */

const WINDOW_MS = 10 * 60 * 1000;       // velocity burst window
const NEVER_RETURNED_MS = 3 * 60 * 1000; // last login within 3 min of signup = never came back
const REFERRAL_REWARD = parseInt(process.env.NEXT_PUBLIC_REFERRAL_REWARD_PRO, 10) || 33;

function normEmail(e) {
    if (!e) return '';
    e = String(e).trim().toLowerCase();
    const at = e.indexOf('@');
    if (at === -1) return e;
    let local = e.slice(0, at);
    const domain = e.slice(at + 1);
    local = local.split('+')[0];
    if (domain === 'gmail.com' || domain === 'googlemail.com') local = local.replace(/\./g, '');
    return `${local}@${domain}`;
}

// Local part with a trailing number stripped: ravi123 -> ravi
function emailPrefix(e) {
    const norm = normEmail(e);
    const at = norm.indexOf('@');
    const local = at === -1 ? norm : norm.slice(0, at);
    return local.replace(/\d+$/, '');
}

function maxSignupsInWindow(referees) {
    const times = referees
        .map(r => (r.createdAt ? new Date(r.createdAt).getTime() : null))
        .filter(Boolean)
        .sort((a, b) => a - b);
    let max = 0, start = 0;
    for (let end = 0; end < times.length; end++) {
        while (times[end] - times[start] > WINDOW_MS) start++;
        max = Math.max(max, end - start + 1);
    }
    return max;
}

function analyzeReferrer(referrer, referees) {
    const signals = [];
    const total = referees.length;

    // self-referral
    if (referrer.referredBy && referrer.referredBy === referrer.referralCode) {
        signals.push({ key: 'self_referral', label: 'Self-referral', detail: 'Referred by their own code', points: 40 });
    }

    // reciprocal ring — referrer was invited by one of their own invitees
    if (referrer.referredBy) {
        const inviteeCodes = new Set(referees.map(r => r.referralCode).filter(Boolean));
        if (inviteeCodes.has(referrer.referredBy)) {
            signals.push({ key: 'reciprocal_ring', label: 'Reciprocal ring', detail: 'Invited by their own invitee (A↔B)', points: 30 });
        }
    }

    // velocity burst
    if (total >= 5) {
        const burst = maxSignupsInWindow(referees);
        if (burst >= 5) {
            signals.push({ key: 'velocity_burst', label: 'Signup burst', detail: `${burst} invitees within 10 min`, points: Math.min(30, 15 + burst) });
        }
    }

    // dormant invitees (never returned after signup)
    if (total >= 3) {
        const dormant = referees.filter(r => {
            if (!r.lastLoginDate) return true;
            const created = r.createdAt ? new Date(r.createdAt).getTime() : 0;
            return new Date(r.lastLoginDate).getTime() - created < NEVER_RETURNED_MS;
        }).length;
        const ratio = dormant / total;
        if (ratio >= 0.6) {
            signals.push({ key: 'dormant_invitees', label: 'Dormant invitees', detail: `${dormant}/${total} never logged back in`, points: 20 });
        }
    }

    // duplicate contact among invitees (+ referrer)
    const contactSeen = new Map();
    let dupHits = 0;
    for (const r of [...referees, referrer]) {
        const keys = [];
        if (r.phone) keys.push(`p:${String(r.phone).trim()}`);
        const ne = normEmail(r.email);
        if (ne) keys.push(`e:${ne}`);
        for (const k of keys) {
            contactSeen.set(k, (contactSeen.get(k) || 0) + 1);
            if (contactSeen.get(k) === 2) dupHits++;
        }
    }
    if (dupHits > 0) {
        signals.push({ key: 'duplicate_contact', label: 'Duplicate contact', detail: `${dupHits} shared phone/email among invitees`, points: 25 });
    }

    // email-pattern cluster (ravi1@, ravi2@ …)
    if (total >= 3) {
        const prefixCounts = new Map();
        for (const r of referees) {
            const p = emailPrefix(r.email);
            if (p && p.length >= 3) prefixCounts.set(p, (prefixCounts.get(p) || 0) + 1);
        }
        const maxCluster = Math.max(0, ...prefixCounts.values());
        if (maxCluster >= 3) {
            signals.push({ key: 'email_pattern', label: 'Email pattern cluster', detail: `${maxCluster} invitees share an email prefix`, points: 20 });
        }
    }

    // suspended / banned invitees
    const suspended = referees.filter(r => ['suspended', 'banned'].includes(r.status)).length;
    if (suspended > 0) {
        signals.push({ key: 'suspended_invitees', label: 'Suspended invitees', detail: `${suspended} invitee(s) already flagged`, points: Math.min(20, 8 * suspended) });
    }

    const riskScore = Math.min(100, signals.reduce((s, x) => s + x.points, 0));
    const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : riskScore > 0 ? 'low' : 'none';

    const referralEarnings = Array.isArray(referrer.referralRewards) && referrer.referralRewards.length
        ? referrer.referralRewards.reduce((s, x) => s + (Number(x.amount) || 0), 0)
        : (referrer.referralCount || 0) * REFERRAL_REWARD;

    return { signals, riskScore, riskLevel, referralEarnings, refereeCount: total };
}

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
        const limit = Math.min(100, parseInt(searchParams.get('limit')) || 20);
        const riskFilter = searchParams.get('risk') || 'all'; // all | high | medium | low
        const search = (searchParams.get('search') || '').trim();

        // Referrers = anyone who has invited at least one user.
        const referrers = await User.find({ referralCount: { $gt: 0 } })
            .select('name email phone referralCode referredBy referralCount referralRewards walletBalance status createdAt')
            .lean();

        const codes = referrers.map(r => r.referralCode).filter(Boolean);

        // Invitees of those referrers (bounded by real referrers' codes).
        const referees = await User.find({ referredBy: { $in: codes } })
            .select('name email phone referralCode referredBy status createdAt lastLoginDate')
            .limit(100000)
            .lean();

        const refereesByCode = new Map();
        for (const r of referees) {
            if (!refereesByCode.has(r.referredBy)) refereesByCode.set(r.referredBy, []);
            refereesByCode.get(r.referredBy).push(r);
        }

        // Analyze every referrer.
        const signalCounts = {};
        let analyzed = referrers.map(referrer => {
            const list = refereesByCode.get(referrer.referralCode) || [];
            const res = analyzeReferrer(referrer, list);
            for (const s of res.signals) signalCounts[s.key] = (signalCounts[s.key] || 0) + 1;
            return {
                _id: referrer._id,
                name: referrer.name,
                email: referrer.email,
                phone: referrer.phone,
                referralCode: referrer.referralCode,
                referredBy: referrer.referredBy,
                referralCount: referrer.referralCount,
                walletBalance: referrer.walletBalance || 0,
                status: referrer.status,
                ...res,
                // trim invitee payload for the drill-down
                referees: list.slice(0, 25).map(r => ({
                    _id: r._id, name: r.name, email: r.email, status: r.status,
                    createdAt: r.createdAt, lastLoginDate: r.lastLoginDate
                }))
            };
        });

        // Summary over ALL flagged referrers (before pagination/filter).
        const flagged = analyzed.filter(a => a.riskScore > 0);
        const highRisk = flagged.filter(a => a.riskLevel === 'high');
        const mediumRisk = flagged.filter(a => a.riskLevel === 'medium');
        const summary = {
            totalReferrers: referrers.length,
            flaggedReferrers: flagged.length,
            highRisk: highRisk.length,
            mediumRisk: mediumRisk.length,
            lowRisk: flagged.length - highRisk.length - mediumRisk.length,
            rewardAtRisk: [...highRisk, ...mediumRisk].reduce((s, a) => s + (a.referralEarnings || 0), 0),
            signalCounts
        };

        // Filter + sort by risk, then paginate.
        let rows = flagged;
        if (riskFilter !== 'all') rows = rows.filter(a => a.riskLevel === riskFilter);
        if (search) {
            const q = search.toLowerCase();
            rows = rows.filter(a =>
                (a.name || '').toLowerCase().includes(q) ||
                (a.email || '').toLowerCase().includes(q) ||
                (a.referralCode || '').toLowerCase().includes(q)
            );
        }
        rows.sort((a, b) => b.riskScore - a.riskScore || b.referralEarnings - a.referralEarnings);

        const total = rows.length;
        const start = (page - 1) * limit;
        const pageItems = rows.slice(start, start + limit);

        return NextResponse.json({
            success: true,
            summary,
            data: pageItems,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('GET /api/admin/referral-fraud error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
