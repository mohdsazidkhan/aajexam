import { recordPageView } from '@/lib/utils/traffic';

// Public: first-party visitor beacon (see src/lib/tracker.js). Always answers 204.
export async function POST(req) {
    return recordPageView(req);
}
