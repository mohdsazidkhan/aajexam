import { recordClientError } from '@/lib/utils/clientErrors';

// Public: web clients report their own errors here (rate limited, de-duplicated by fingerprint).
export async function POST(req) {
    return recordClientError(req, 'web');
}
