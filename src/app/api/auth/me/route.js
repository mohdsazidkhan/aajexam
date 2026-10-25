import { NextResponse } from 'next/server';
import { protect } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

// GET /api/auth/me — the few identity fields the navbar menu shows (photo, name, username, email).
// The login response does not carry the profile picture, and /api/student/profile is far too heavy
// to call from a navbar, so this is the light read.
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: auth.message || 'Not authorized' }, { status: 401 });
        }
        const u = auth.user;
        return NextResponse.json({
            success: true,
            user: {
                _id: u._id,
                name: u.name,
                username: u.username || null,
                email: u.email,
                profilePicture: u.profilePicture || null,
            },
        });
    } catch (error) {
        console.error('auth/me error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
