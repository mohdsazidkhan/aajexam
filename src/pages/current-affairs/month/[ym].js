import React from 'react';
import Link from '@/components/common/AppLink';
import Seo from '../../../components/common/Seo';
import { generateBreadcrumbSchema } from '../../../utils/schema';
import { DIGEST_MIN_ITEMS, MONTH_NAMES, digestKey, parseDigestMonth } from '../../../lib/web/currentAffairsDigest';

const CATEGORY_ORDER = ['national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment', 'other'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtDay = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });

const CurrentAffairsMonth = ({ year, month, total, groups, prevKey, nextKey, indexable }) => {
  const label = `${MONTH_NAMES[month - 1]} ${year}`;
  const path = `/current-affairs/month/${digestKey(year, month)}`;

  return (
    <div className="container mx-auto py-4 xl:py-8 space-y-6 pb-24">
      <Seo
        title={`Current Affairs ${label} – Monthly Digest for SSC, UPSC, Banking | AajExam`}
        description={`All ${total} important current affairs of ${label} in one page – national, international, economy, science, sports, awards and appointments – for SSC, UPSC, Banking and Railway exams.`}
        canonical={path}
        noIndex={!indexable}
        type="article"
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Current Affairs', url: '/current-affairs' },
          { name: label, url: path },
        ])}
      />

      <header className="relative isolate overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-primary-700 dark:via-primary-800 dark:to-primary-950 shadow-xl ring-1 ring-primary-200 dark:ring-white/10 p-4 xl:p-6 space-y-2" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-amber-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
        <Link href="/current-affairs" className="block text-right text-sm font-bold text-primary-600 dark:text-amber-300 hover:underline">← Current Affairs</Link>
        <h1 className="text-2xl xl:text-4xl font-black text-slate-900 dark:text-white">Current Affairs {label} – Monthly Digest</h1>
        <p className="text-sm xl:text-base font-semibold text-slate-600 dark:text-slate-500 dark:text-white/60">
          {total} important updates from {label}, grouped by category, for SSC, UPSC, Banking, Railway and State PSC exams.
        </p>
        <nav className="flex gap-3 text-sm font-bold text-primary-600" aria-label="Other months">
          {prevKey && <Link href={`/current-affairs/month/${prevKey}`} className="hover:underline">← Previous month</Link>}
          {nextKey && <Link href={`/current-affairs/month/${nextKey}`} className="hover:underline">Next month →</Link>}
        </nav>
      </header>

      {groups.map((g) => (
        <section key={g.category} className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{cap(g.category)} ({g.items.length})</h2>
          <ul className="space-y-3">
            {g.items.map((it) => (
              <li key={it.slug} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 xl:p-4 bg-white dark:bg-slate-900">
                <p className="text-[11px] font-bold text-slate-400">{fmtDay(it.date)}</p>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  <Link href={`/current-affairs/${it.slug}`} className="hover:underline">{it.title}</Link>
                </h3>
                {it.content && <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{it.content}</p>}
                {it.keyPoints?.length > 0 && (
                  <ul className="mt-1 list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                    {it.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default CurrentAffairsMonth;

export async function getServerSideProps({ params, res }) {
  const parsed = parseDigestMonth(params?.ym);
  if (!parsed) return { notFound: true };

  try {
    const dbConnect = (await import('../../../lib/db')).default;
    const CurrentAffair = (await import('../../../models/CurrentAffair')).default;
    await dbConnect();

    const docs = await CurrentAffair.find({
      status: 'published',
      slug: { $exists: true, $ne: null },
      date: { $gte: parsed.start, $lt: parsed.end },
    })
      .select('title slug date category content keyPoints')
      .sort({ date: 1 })
      .lean();
    if (docs.length === 0) return { notFound: true };

    const byCategory = new Map();
    docs.forEach((d) => {
      const cat = d.category || 'other';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push({
        title: d.title,
        slug: d.slug,
        date: d.date.toISOString(),
        content: d.content || '',
        keyPoints: d.keyPoints || [],
      });
    });
    const groups = [...byCategory.entries()]
      .sort((a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]))
      .map(([category, items]) => ({ category, items }));

    // Prev/next only link to months that exist, so there are no dead links.
    const [prevDoc, nextDoc] = await Promise.all([
      CurrentAffair.findOne({ status: 'published', date: { $lt: parsed.start } }).sort({ date: -1 }).select('date').lean(),
      CurrentAffair.findOne({ status: 'published', date: { $gte: parsed.end } }).sort({ date: 1 }).select('date').lean(),
    ]);
    const keyOf = (d) => (d ? digestKey(d.date.getUTCFullYear(), d.date.getUTCMonth() + 1) : null);

    if (res) res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    return {
      props: {
        year: parsed.year,
        month: parsed.month,
        total: docs.length,
        groups,
        prevKey: keyOf(prevDoc),
        nextKey: keyOf(nextDoc),
        indexable: docs.length >= DIGEST_MIN_ITEMS,
      },
    };
  } catch (e) {
    console.error('current-affairs month ssr error', e);
    return { notFound: true };
  }
}
