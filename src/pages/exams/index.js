// /exams (listing) → 301 → /govt-exams
//
// Canonical exam hub is /govt-exams. The /exams listing was emitting a
// duplicate of the same exam catalogue, so this route now permanently
// redirects to /govt-exams to consolidate ranking signals and avoid
// duplicate content.

export default function ExamsListRedirectStub() {
    return null;
}

export async function getServerSideProps() {
    return { redirect: { destination: '/govt-exams', permanent: true } };
}
