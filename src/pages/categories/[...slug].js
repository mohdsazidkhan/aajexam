import Link from 'next/link';
import useTranslate from '../../hooks/useTranslate';

// Legacy /categories/<ObjectId> — return 410 Gone.
//
// Pre-slug versions of the site exposed category pages under /categories/
// with raw MongoDB ObjectIds in the URL. The canonical path is now
// /govt-exams/category/<slug>. Serve an explicit 410 so Google deindexes
// the old ObjectId URLs quickly.

export default function CategoriesGone() {
  const { translate, rich } = useTranslate();
    return (
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: 520 }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{translate('This category page has moved')}</h1>
                <p className="text-slate-600 dark:text-slate-300" style={{ lineHeight: 1.6 }}>
                    {rich('Browse our <0>full government-exam catalogue</0> to find the exam category you were looking for.', [(c) => <Link href="/govt-exams" style={{ color: '#58cc02', textDecoration: 'underline' }}>{c}</Link>])}
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
