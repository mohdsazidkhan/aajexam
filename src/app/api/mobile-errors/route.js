import { recordClientError } from '@/lib/utils/clientErrors';

// Public: mobile clients report their own errors here (rate limited, de-duplicated by fingerprint).
export async function POST(req) {
    return recordClientError(req, 'mobile');
}
