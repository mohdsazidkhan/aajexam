// Legacy /articles/<anything> — return 410 Gone.
//
// Older versions of the site exposed an /articles namespace that has since
// been folded into /blog and /notes. Google still has ~150 of these URLs in
// its index returning soft 404s. Serve an explicit 410 so Google deindexes
// them in 1-2 weeks instead of waiting 6-12 months for soft-404 expiry.

export default function ArticlesGone() {
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 520 }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>This article is no longer available</h1>
                <p style={{ color: '#475569', lineHeight: 1.6 }}>
                    The articles section has moved. Browse our <a href="/blog" style={{ color: '#dc2626', textDecoration: 'underline' }}>blog</a> for the latest exam strategy, or <a href="/notes" style={{ color: '#dc2626', textDecoration: 'underline' }}>study notes</a> for topic-wise guides.
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
