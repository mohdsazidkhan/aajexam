'use client';
import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Pin, Eye, ChevronRight, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/router';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import Seo from '../components/Seo';
import { generateBreadcrumbSchema } from '../utils/schema';

const types = ['all', 'notification', 'admit_card', 'result', 'answer_key', 'vacancy', 'date_change'];

const ExamNewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 20 });
        if (type !== 'all') params.set('type', type);
        const res = await API.request(`/api/exam-news?${params}`);
        if (res?.success) { setNews(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [type, page]);

  const typeColors = { notification: 'blue', admit_card: 'emerald', result: 'orange', answer_key: 'purple', vacancy: 'pink', date_change: 'red', other: 'slate' };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Seo
        title="Exam News & Job Alerts – Notifications, Admit Cards, Results | AajExam"
        description="Stay updated with the latest government exam notifications, admit cards, results, answer keys, vacancies and date changes for SSC, UPSC, Banking, Railway and State PSC exams on AajExam."
        canonical="/exam-news"
        keywords={[
          'government exam news',
          'sarkari job alert',
          'SSC notification',
          'UPSC notification',
          'banking job alert',
          'railway recruitment',
          'admit card',
          'exam result',
          'answer key',
          'aajexam exam news'
        ]}
        schemas={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Exam News', url: '/exam-news' }
        ])}
      />
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><Megaphone className="w-6 h-6 text-primary-500" /> Exam News</h1>
          <p className="text-sm font-bold text-slate-400">Latest notifications, results, admit cards</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {types.map(t => (
            <button key={t} onClick={() => { setType(t); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-colors ${type === t ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{t.replace('_', ' ')}</button>
          ))}
        </div>

        <div className="space-y-3">
          {news.map((item, i) => (
            <Card key={item._id || i} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/exam-news/${item._id}`)}>
              <div className="flex items-start gap-3">
                {item.isPinned && <Pin className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 bg-${typeColors[item.type] || 'slate'}-50 dark:bg-${typeColors[item.type] || 'slate'}-900/30 rounded text-[9px] font-black text-${typeColors[item.type] || 'slate'}-600 uppercase`}>{item.type?.replace('_', ' ')}</span>
                    {item.exam?.name && <span className="text-[10px] text-slate-400 font-bold">{item.exam.name}</span>}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{item.title}</h3>
                  {item.importantDates?.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {item.importantDates[0].label}: {new Date(item.importantDates[0].date).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 mt-2" />
              </div>
            </Card>
          ))}
        </div>

        {news.length === 0 && <div className="text-center py-12"><p className="text-slate-400 font-bold">No news found</p></div>}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
            <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamNewsPage;
