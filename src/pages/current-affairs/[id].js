'use client';
import React, { useState, useEffect } from 'react';
import { Newspaper, ArrowLeft, Tag, Eye, Calendar } from 'lucide-react';
import { useRouter } from 'next/router';
import API from '../../lib/api';
import Card from '../../components/ui/Card';
import Loading from '../../components/Loading';
import Seo from '../../components/Seo';
import { generateBlogPostingSchema, generateBreadcrumbSchema } from '../../utils/schema';

const CurrentAffairDetail = () => {
  const [affair, setAffair] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        const res = await API.request(`/api/current-affairs/${id}`);
        if (res?.success) setAffair(res.data);
        else router.push('/current-affairs');
      } catch (e) { router.push('/current-affairs'); } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;
  if (!affair) return null;

  return (
    <div className="min-h-screen pb-24">
      <Seo
        title={`${affair.title} – Current Affairs ${new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | AajExam`}
        description={(affair.keyPoints?.[0] || affair.content || '').slice(0, 160) || `${affair.title}: daily current affairs for SSC, UPSC, Banking and Railway exam preparation on AajExam.`}
        canonical={`/current-affairs/${id}`}
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
            url: `/current-affairs/${id}`
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Current Affairs', url: '/current-affairs' },
            { name: affair.title, url: `/current-affairs/${id}` }
          ])
        ]}
      />
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
        <button onClick={() => router.push('/current-affairs')} className="text-sm font-bold text-primary-500 flex items-center gap-1 hover:underline"><ArrowLeft className="w-4 h-4" /> Back</button>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 uppercase">{affair.category}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(affair.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3" />{affair.views}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{affair.title}</h1>
        </div>

        <Card className="p-6">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{affair.content}</p>
        </Card>

        {affair.keyPoints?.length > 0 && (
          <Card className="p-4 space-y-2">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Key Points</h3>
            <ul className="space-y-1">
              {affair.keyPoints.map((kp, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <span className="text-primary-500 font-black mt-0.5">&#8226;</span> {kp}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {affair.questions?.length > 0 && (
          <Card className="p-4 space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Practice Questions</h3>
            {affair.questions.map((q, i) => (
              <div key={i} className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Q{i + 1}. {q.questionText}</p>
                <div className="grid grid-cols-2 gap-1">
                  {q.options?.map((opt, j) => (
                    <span key={j} className={`text-[10px] px-2 py-1 rounded ${opt.isCorrect ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-500'}`}>
                      {String.fromCharCode(65 + j)}. {opt.text}
                    </span>
                  ))}
                </div>
                {q.explanation && <p className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">{q.explanation}</p>}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
};

export default CurrentAffairDetail;
