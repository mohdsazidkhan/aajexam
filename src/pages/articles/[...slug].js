import Link from 'next/link';
import useTranslate from '../../hooks/useTranslate';

// Legacy /articles/<anything> — return 410 Gone.
//
// Older versions of the site exposed an /articles namespace that has since
// been folded into /blog and /notes. Google still has ~150 of these URLs in
// its index returning soft 404s. Serve an explicit 410 so Google deindexes
// them in 1-2 weeks instead of waiting 6-12 months for soft-404 expiry.

export default function ArticlesGone() {
  const { translate, rich } = useTranslate();
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 520 }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{translate('This article is no longer available')}</h1>
                <p className="text-slate-600 dark:text-slate-300" style={{ lineHeight: 1.6 }}>
                    {rich('The articles section has moved. Browse our <0>blog</0> for the latest exam strategy, or <1>study notes</1> for topic-wise guides.', [(c) => <Link href="/blog" style={{ color: '#58cc02', textDecoration: 'underline' }}>{c}</Link>, (c) => <Link href="/notes" style={{ color: '#58cc02', textDecoration: 'underline' }}>{c}</Link>])}
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
