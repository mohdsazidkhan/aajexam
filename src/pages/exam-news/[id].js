'use client';
import React, { useState, useEffect } from 'react';
import { Megaphone, ArrowLeft, Calendar, ExternalLink, Eye } from 'lucide-react';
import { useRouter } from 'next/router';
import API from '../../lib/api';
import Card from '../../components/ui/Card';
import Loading from '../../components/Loading';
import Seo from '../../components/Seo';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '../../utils/schema';

const ExamNewsDetail = () => {
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await API.request(`/api/exam-news/${id}`);
        if (res?.success) setNews(res.data);
        else router.push('/exam-news');
      } catch (e) { router.push('/exam-news'); } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;
  if (!news) return null;

  return (
    <div className="min-h-screen pb-24">
      <Seo
        title={`${news.title}${news.exam?.name ? ' – ' + news.exam.name : ''} | AajExam Exam News`}
        description={(news.content || `${news.title} – latest ${news.type?.replace('_', ' ') || 'notification'} for ${news.exam?.name || 'government exam'} aspirants on AajExam.`).slice(0, 160)}
        canonical={`/exam-news/${id}`}
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
            url: `/exam-news/${id}`
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Exam News', url: '/exam-news' },
            { name: news.title, url: `/exam-news/${id}` }
          ])
        ]}
      />
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <button onClick={() => router.push('/exam-news')} className="text-sm font-bold text-primary-500 flex items-center gap-1 hover:underline"><ArrowLeft className="w-4 h-4" /> Back</button>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded text-[9px] font-black text-blue-600 uppercase">{news.type?.replace('_', ' ')}</span>
            {news.exam?.name && <span className="text-[10px] font-bold text-slate-400">{news.exam.name}</span>}
            <span className="text-[10px] text-slate-400"><Eye className="w-3 h-3 inline" /> {news.views}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{news.title}</h1>
        </div>

        {news.importantDates?.length > 0 && (
          <Card className="p-4 space-y-2 bg-amber-50 dark:bg-amber-900/20">
            <h3 className="text-sm font-black text-amber-700">Important Dates</h3>
            {news.importantDates.map((d, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="font-bold text-slate-600">{d.label}</span>
                <span className="font-black text-amber-700">{new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            ))}
          </Card>
        )}

        <Card className="p-6">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{news.content}</p>
        </Card>

        {news.officialLink && (
          <a href={news.officialLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-bold text-primary-500 hover:underline">
            <ExternalLink className="w-4 h-4" /> Official Website
          </a>
        )}
      </div>
    </div>
  );
};

export default ExamNewsDetail;
