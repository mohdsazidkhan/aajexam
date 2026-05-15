// Legacy /subcategories/<anything> — return 410 Gone.
//
// An earlier version of the site rendered Next.js dynamic-route template
// strings ("/subcategories/[subcategoryId]") as literal hrefs in the HTML,
// which Google then indexed verbatim. The /subcategories namespace was
// also briefly used for an alternative topic taxonomy that has since
// folded into /topics. Serve an explicit 410 so Google purges these in
// 1-2 weeks instead of waiting for soft-404 expiry.

export default function SubcategoriesGone() {
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 520 }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>This page has moved</h1>
                <p style={{ color: '#475569', lineHeight: 1.6 }}>
                    Browse our <a href="/topics" style={{ color: '#dc2626', textDecoration: 'underline' }}>topics catalogue</a> or <a href="/subjects" style={{ color: '#dc2626', textDecoration: 'underline' }}>subjects catalogue</a> for the resource you were looking for.
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
