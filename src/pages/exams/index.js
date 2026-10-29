import { withPageCache } from '@/lib/utils/pageCache';
// /exams (listing) → 301 → /govt-exams
//
// Canonical exam hub is /govt-exams. The /exams listing was emitting a
// duplicate of the same exam catalogue, so this route now permanently
// redirects to /govt-exams to consolidate ranking signals and avoid
// duplicate content.

export default function ExamsListRedirectStub() {
    return null;
}

async function getServerSidePropsImpl() {
    return { redirect: { destination: '/govt-exams', permanent: true } };
}

// Public, URL-only data: let the CDN keep it instead of running this function on every request.
export const getServerSideProps = withPageCache(getServerSidePropsImpl, { sMaxAge: 86400, swr: 604800 });
