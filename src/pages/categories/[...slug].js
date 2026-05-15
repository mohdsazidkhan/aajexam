// Legacy /categories/<ObjectId> — return 410 Gone.
//
// Pre-slug versions of the site exposed category pages under /categories/
// with raw MongoDB ObjectIds in the URL. The canonical path is now
// /govt-exams/category/<slug>. Serve an explicit 410 so Google deindexes
// the old ObjectId URLs quickly.

export default function CategoriesGone() {
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 520 }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>This category page has moved</h1>
                <p style={{ color: '#475569', lineHeight: 1.6 }}>
                    Browse our <a href="/govt-exams" style={{ color: '#dc2626', textDecoration: 'underline' }}>full government-exam catalogue</a> to find the exam category you were looking for.
                </p>
            </div>
        </div>
    );
}

export async function getServerSideProps({ res }) {
    res.statusCode = 410;
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return { props: {} };
}
