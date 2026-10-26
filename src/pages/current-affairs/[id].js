'use client';
import BackButton from '@/components/common/ui/BackButton';
import BookmarkButton from '../../components/common/BookmarkButton';
import React, { useState, useEffect } from 'react';
import { Newspaper, ArrowLeft, Tag, Eye, Calendar } from 'lucide-react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Loading from '../../components/common/Loading';
import Seo from '../../components/common/Seo';
import { DetailSkeleton } from '../../components/common/skeletons/PrivateSkeletons';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '../../utils/schema';
import useTranslate from '../../hooks/useTranslate';

const CurrentAffairDetail = ({ resolvedId, initialAffair } = {}) => {
  const { translate } = useTranslate();
  const [affair, setAffair] = useState(initialAffair || null);
  const [loading, setLoading] = useState(!initialAffair);
  const router = useRouter();
  const lookupId = resolvedId || router.query.id;

  useEffect(() => {
    if (!lookupId || initialAffair) return;
    const fetch = async () => {
      try {
        const res = await API.request(`/api/current-affairs/${lookupId}`);
        if (res?.success) setAffair(res.data);
        else router.push('/current-affairs');
      } catch (e) { router.push('/current-affairs'); } finally { setLoading(false); }
    };
    fetch();
  }, [lookupId, initialAffair, router]);

  if (loading) return (
    <div className="min-h-screen pb-8 xl:pb-16 font-outfit">
      <div className="py-8"><DetailSkeleton /></div>
    </div>
  );
  if (!affair) return null;

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <Seo
        title={`${affair.title} – Current Affairs ${new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | AajExam`}
        description={(affair.keyPoints?.[0] || affair.content || '').slice(0, 160) || `${affair.title}: daily current affairs for SSC, UPSC, Banking and Railway exam preparation on AajExam.`}
        canonical={`/current-affairs/${affair.slug || lookupId}`}
        type="article"
        publishedTime={affair.date}
        keywords={[
          affair.title,
          `${affair.category} current affairs`,
          'daily GA',
          'current affairs MCQ',
          'aajexam current affairs'
        ]}
        schemas={[
          generateBlogPostingSchema({
            title: affair.title,
            description: (affair.keyPoints?.[0] || affair.content || '').slice(0, 160),
            publishedAt: affair.date,
            updatedAt: affair.updatedAt || affair.date,
            authorName: 'AajExam Team',
            category: affair.category,
            url: `/current-affairs/${affair.slug || lookupId}`
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Current Affairs', url: '/current-affairs' },
            { name: affair.title, url: `/current-affairs/${affair.slug || lookupId}` }
          ])
        ]}
      />
      <div className="py-0 xl:py-6 space-y-3 xl:space-y-4">
        <div className="flex justify-end"><BackButton onClick={() => router.push('/current-affairs')}><ArrowLeft className="w-4 h-4" /> {translate('Back')}</BackButton></div>

        <header className="z-auto relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 shadow-xl ring-1 ring-slate-200 dark:ring-white/10 p-4 xl:p-6 space-y-2" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 dark:text-primary-300 uppercase">{affair.category}</span>
            <span className="text-[10px] text-slate-500 dark:text-white/60 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="text-[10px] text-slate-500 dark:text-white/60 flex items-center gap-1"><Eye className="w-3 h-3" />{affair.views}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white">{affair.title}</h1>
            </div>
            <BookmarkButton type="affair" id={affair._id || affair.slug} variant="pill" className="shrink-0" />
          </div>
        </header>

        <Card className="">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{affair.content}</p>
        </Card>

        {affair.keyPoints?.length > 0 && (
          <Card as="section" className="space-y-2">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">{translate('Key Points')}</h2>
            <ul className="space-y-1">
              {affair.keyPoints.map((kp, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-primary-600 dark:text-primary-300 font-black mt-0.5">&#8226;</span> {kp}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {affair.questions?.length > 0 && (
          <Card as="section" className="space-y-2 xl:space-y-4">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">{translate('Practice Questions')}</h2>
            {affair.questions.map((q, i) => (
              <div key={i} className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Q{i + 1}. {q.questionText}</p>
                <div className="grid grid-cols-2 gap-1">
                  {q.options?.map((opt, j) => (
                    <span key={j} className={`text-[10px] px-2 py-1 rounded ${opt.isCorrect ? 'bg-primary-50 text-primary-600 font-bold' : 'text-slate-500'}`}>
                      {String.fromCharCode(65 + j)}. {opt.text}
                    </span>
                  ))}
                </div>
                {q.explanation && <p className="text-[10px] text-black dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{q.explanation}</p>}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default CurrentAffairDetail;

export async function getServerSideProps({ params }) {
  const dbConnect = (await import('../../lib/db')).default;
  const CurrentAffair = (await import('../../models/CurrentAffair')).default;
  const { isObjectId, slugRedirect } = await import('../../lib/web/slugRouting');
  const segment = params?.id;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await CurrentAffair.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/current-affairs/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const doc = await CurrentAffair.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment }).lean();
    if (!doc) return { notFound: true };

    return {
      props: {
        resolvedId: String(doc._id),
        initialAffair: JSON.parse(JSON.stringify(doc))
      }
    };
  } catch (e) {
    console.error('current-affair ssr error', e);
    return { notFound: true };
  }
}
