import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import UserTestAttempt from '@/models/UserTestAttempt';
import User from '@/models/User';
import UserStreak from '@/models/UserStreak';
import { protect, admin } from '@/middleware/auth';
import { getISTRange } from '@/lib/istRange';

// GET /api/admin/most-active-users?period=all-time|5y|1y|6m|3m|monthly|weekly|yesterday|today
// (legacy 'weekly' = 7d, 'monthly' = 30d). All windows are calendar-aligned in IST (UTC+5:30).
// Top 100 users ranked by total time spent (quiz + exam attempts, completed only).
// Ties break on total activities. Paginated client-side. QuizAttempt.totalTime is seconds,
// UserTestAttempt.totalTime is milliseconds, so exam time is normalised to seconds.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'all-time';

        const range = getISTRange(period);
        const dateFilter = range ? { createdAt: range } : {};

        const match = { $match: { status: 'Completed', ...dateFilter } };

        const [quizAgg, examAgg] = await Promise.all([
            QuizAttempt.aggregate([
                match,
                { $group: { _id: '$user', count: { $sum: 1 }, seconds: { $sum: '$totalTime' }, lastActive: { $max: '$createdAt' } } },
            ]),
            UserTestAttempt.aggregate([
                match,
                { $group: { _id: '$user', count: { $sum: 1 }, seconds: { $sum: { $divide: ['$totalTime', 1000] } }, lastActive: { $max: '$createdAt' } } },
            ]),
        ]);

        const byUser = new Map();
        const add = (rows, key) => {
            for (const r of rows) {
                if (!r._id) continue;
                const id = String(r._id);
                const cur = byUser.get(id) || { userId: r._id, quizzes: 0, exams: 0, totalTimeSpent: 0, lastActive: null };
                cur[key] += r.count;
                cur.totalTimeSpent += r.seconds || 0;
                if (!cur.lastActive || r.lastActive > cur.lastActive) cur.lastActive = r.lastActive;
                byUser.set(id, cur);
            }
        };
        add(quizAgg, 'quizzes');
        add(examAgg, 'exams');

        // Only real, active, non-admin accounts with time spent > 0 count as "active users".
        const timed = [...byUser.values()].filter((u) => u.totalTimeSpent > 0);
        const [validDocs, totalUsers] = await Promise.all([
            User.find({ _id: { $in: timed.map((u) => u.userId) }, status: 'active', role: { $ne: 'admin' } })
                .select('_id')
                .lean(),
            User.countDocuments({ status: 'active', role: { $ne: 'admin' } }),
        ]);
        const validIds = new Set(validDocs.map((d) => String(d._id)));
        const activeList = timed
            .filter((u) => validIds.has(String(u.userId)))
            .map((u) => ({ ...u, totalActivities: u.quizzes + u.exams }))
            .sort((a, b) => b.totalTimeSpent - a.totalTimeSpent || b.totalActivities - a.totalActivities);

        const summary = activeList.reduce(
            (acc, u) => ({
                totalActivities: acc.totalActivities + u.totalActivities,
                quizzes: acc.quizzes + u.quizzes,
                exams: acc.exams + u.exams,
                totalTimeSpent: acc.totalTimeSpent + u.totalTimeSpent,
            }),
            { totalActivities: 0, quizzes: 0, exams: 0, totalTimeSpent: 0 }
        );
        summary.totalUsers = totalUsers;
        summary.totalActiveUsers = activeList.length;
        summary.totalTimeSpent = Math.round(summary.totalTimeSpent);

        const candidates = activeList.slice(0, 100);

        const users = await User.find({ _id: { $in: candidates.map((c) => c.userId) } })
            .select('name username email profilePicture city subscriptionStatus')
            .lean();
        const userMap = new Map(users.map((u) => [String(u._id), u]));

        const streaks = await UserStreak.find({ user: { $in: users.map((u) => u._id) } })
            .select('user currentStreak longestStreak')
            .lean();
        const streakMap = new Map(streaks.map((s) => [String(s.user), s]));

        const data = candidates
            .filter((c) => userMap.has(String(c.userId)))
            .slice(0, 100)
            .map((c, idx) => {
                const u = userMap.get(String(c.userId));
                const s = streakMap.get(String(c.userId));
                return {
                    rank: idx + 1,
                    userId: c.userId,
                    name: u.name,
                    username: u.username,
                    email: u.email,
                    profilePicture: u.profilePicture,
                    city: u.city,
                    subscriptionStatus: u.subscriptionStatus,
                    quizzes: c.quizzes,
                    exams: c.exams,
                    totalActivities: c.totalActivities,
                    totalTimeSpent: Math.round(c.totalTimeSpent),
                    lastActive: c.lastActive,
                    currentStreak: s?.currentStreak || 0,
                    longestStreak: s?.longestStreak || 0,
                };
            });

        return NextResponse.json({ success: true, data, summary, period });
    } catch (error) {
        console.error('Admin most-active-users API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
