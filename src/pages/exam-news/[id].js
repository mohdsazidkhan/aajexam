'use client';
import BackButton from '@/components/common/ui/BackButton';
import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, ExternalLink, Eye, ArrowLeft } from 'lucide-react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import API from '../../lib/api';
import Card from '../../components/common/ui/Card';
import Loading from '../../components/common/Loading';
import Seo from '../../components/common/Seo';
import { DetailSkeleton } from '../../components/common/skeletons/PrivateSkeletons';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '../../utils/schema';
import useTranslate from '../../hooks/useTranslate';

const ExamNewsDetail = ({ resolvedId, initialNews } = {}) => {
  const { translate } = useTranslate();
  const [news, setNews] = useState(initialNews || null);
  const [loading, setLoading] = useState(!initialNews);
  const router = useRouter();
  const lookupId = resolvedId || router.query.id;

  useEffect(() => {
    if (!lookupId || initialNews) return;
    const fetch = async () => {
      try {
        const res = await API.request(`/api/exam-news/${lookupId}`);
        if (res?.success) setNews(res.data);
        else router.push('/exam-news');
      } catch (e) { router.push('/exam-news'); } finally { setLoading(false); }
    };
    fetch();
  }, [lookupId, initialNews, router]);

  if (loading) return (
    <div className="min-h-screen pb-8 xl:pb-16 font-outfit">
      <div className="py-8"><DetailSkeleton /></div>
    </div>
  );
  if (!news) return null;

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
      <Seo
        title={`${news.title}${news.exam?.name ? ' – ' + news.exam.name : ''} | AajExam Exam News`}
        description={(news.content || `${news.title} – latest ${news.type?.replace('_', ' ') || 'notification'} for ${news.exam?.name || 'government exam'} aspirants on AajExam.`).slice(0, 160)}
        canonical={`/exam-news/${news.slug || lookupId}`}
        type="article"
        publishedTime={news.createdAt}
        modifiedTime={news.updatedAt}
        keywords={[
          news.title,
          news.exam?.name && `${news.exam.name} ${news.type?.replace('_', ' ')}`,
          news.type?.replace('_', ' '),
          'sarkari job alert',
          'aajexam exam news'
        ].filter(Boolean)}
        schemas={[
          generateBlogPostingSchema({
            title: news.title,
            description: (news.content || '').slice(0, 160),
            publishedAt: news.createdAt,
            updatedAt: news.updatedAt || news.createdAt,
            authorName: 'AajExam Team',
            category: news.exam?.name || news.type,
            url: `/exam-news/${news.slug || lookupId}`
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Exam News', url: '/exam-news' },
            { name: news.title, url: `/exam-news/${news.slug || lookupId}` }
          ])
        ]}
      />
      <div className="py-0 xl:py-6 space-y-3 xl:space-y-4">
        <div className="flex justify-end"><BackButton onClick={() => router.push('/exam-news')}><ArrowLeft className="w-4 h-4" /> {translate('Back')}</BackButton></div>

        <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-primary-700 dark:via-primary-800 dark:to-primary-950 shadow-xl ring-1 ring-primary-200 dark:ring-white/10 p-4 xl:p-6 space-y-2" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-amber-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-black text-black dark:text-white uppercase">{news.type?.replace('_', ' ')}</span>
            {news.exam?.name && <span className="text-[10px] font-bold text-slate-500 dark:text-white/60">{news.exam.name}</span>}
            <span className="text-[10px] text-slate-500 dark:text-white/60"><Eye className="w-3 h-3 inline" /> {news.views}</span>
          </div>
          <h1 className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white">{news.title}</h1>
        </div>

        {news.importantDates?.length > 0 && (
          <Card className="space-y-2 bg-slate-100 dark:bg-slate-800">
            <h2 className="text-sm font-black text-black dark:text-white">{translate('Important Dates')}</h2>
            {news.importantDates.map((d, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="font-bold text-slate-600">{d.label}</span>
                <span className="font-black text-black dark:text-white">{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            ))}
          </Card>
        )}

        <Card className="">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{news.content}</p>
        </Card>

        {news.officialLink && (
          <a href={news.officialLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-bold text-primary-600 hover:underline">
            <ExternalLink className="w-4 h-4" /> Official Website
          </a>
        )}
      </div>
    </div>
  );
};

export default ExamNewsDetail;

export async function getServerSideProps({ params }) {
  const dbConnect = (await import('../../lib/db')).default;
  const ExamNews = (await import('../../models/ExamNews')).default;
  const { isObjectId, slugRedirect } = await import('../../lib/web/slugRouting');
  const segment = params?.id;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await ExamNews.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/exam-news/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const doc = await ExamNews.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment })
      .populate('exam', 'name code slug')
      .lean();
    if (!doc) return { notFound: true };

    return {
      props: {
        resolvedId: String(doc._id),
        initialNews: JSON.parse(JSON.stringify(doc))
      }
    };
  } catch (e) {
    console.error('exam-news ssr error', e);
    return { notFound: true };
  }
}
