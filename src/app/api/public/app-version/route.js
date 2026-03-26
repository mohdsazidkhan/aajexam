import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const platform = searchParams.get('platform') || 'android';
        const currentVersion = searchParams.get('currentVersion') || '1.0.0';

        // In a real app, you might fetch this from a DB or config
        const latestVersion = '2.4.0';
        const forceUpdate = false;
        const updateUrl = platform === 'android'
            ? 'https://play.google.com/store/apps/details?id=com.subg.app'
            : 'https://apps.apple.com/app/subg-quiz/id123456789';

        return NextResponse.json({
            success: true,
            data: {
                latestVersion,
                forceUpdate,
                updateUrl,
                message: latestVersion !== currentVersion ? 'A new version is available!' : 'App is up to date',
                platform,
                currentVersion
            }
        });
    } catch (error) {
        console.error('GET /api/public/app-version error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
