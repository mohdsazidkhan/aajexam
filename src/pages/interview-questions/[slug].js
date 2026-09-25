'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircleQuestion, Lightbulb, Eye, ArrowLeft, Tag } from 'lucide-react';
import { useRouter } from 'next/router';
import API from '../../lib/api';
import Card from '../../components/ui/Card';
import Seo from '../../components/Seo';
import { generateBreadcrumbSchema, generateBlogPostingSchema } from '../../utils/schema';
import { DetailSkeleton } from '../../components/skeletons/PrivateSkeletons';

// Module-level dedup: when the auth-state-driven layout switch in _app.js
// remounts this page during hydration, both mounts await the same in-flight
// request instead of firing the API (and incrementing views) twice.
const inflightQuestionRequests = new Map();

const InterviewQuestionDetailPage = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const fetchQuestion = async () => {
      let promise = inflightQuestionRequests.get(slug);
      if (!promise) {
        promise = API.request(`/api/interview-questions/${slug}`).finally(() => {
          if (inflightQuestionRequests.get(slug) === promise) inflightQuestionRequests.delete(slug);
        });
        inflightQuestionRequests.set(slug, promise);
      }
      try {
        const res = await promise;
        if (cancelled) return;
        if (res?.success) setQuestion(res.data);
        else router.push('/interview-questions');
      } catch (e) {
        if (!cancelled) router.push('/interview-questions');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchQuestion();

    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen pb-8 lg:pb-16 font-outfit">
      <div className="py-8"><DetailSkeleton /></div>
    </div>
  );
  if (!question) return null;

  const hasHindi = Boolean(question.questionHi || question.answerHi);
  const displayQuestion = (language === 'hi' && question.questionHi) || question.question;
  const displayAnswer = (language === 'hi' && question.answerHi) || question.answer;
  const displayTips = (language === 'hi' && question.tipsHi) || question.tips;

  return (
    <div className="min-h-screen pb-24">
      <Seo
        title={`${question.question} – Interview Question | AajExam`}
        description={`${question.question}${question.category?.name ? ' – ' + question.category.name : ''}. Sample answer and expert tips for government and private job interviews on AajExam.`}
        canonical={`/interview-questions/${slug}`}
        type="article"
        keywords={[
          question.question,
          question.category?.name && `${question.category.name} interview questions`,
          ...(question.tags || []),
          'interview questions',
          'aajexam interview prep'
        ].filter(Boolean)}
        schemas={[
          generateBlogPostingSchema({
            title: question.question,
            description: `${question.question}${question.category?.name ? ' – ' + question.category.name : ''} interview preparation on AajExam.`,
            keywords: question.tags,
            category: question.category?.name,
            url: `/interview-questions/${slug}`
          }),
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Interview Questions', url: '/interview-questions' },
            { name: question.question, url: `/interview-questions/${slug}` }
          ])
        ]}
      />
      <div className="py-0 lg:py-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button onClick={() => router.push('/interview-questions')} className="text-sm font-bold text-primary-600 flex items-center gap-1 hover:underline"><ArrowLeft className="w-4 h-4" /> Back to Interview Questions</button>
          {hasHindi && (
            <div className="flex rounded-full overflow-auto border-2 border-slate-200 dark:border-slate-700 shrink-0">
              {[{ id: 'en', label: 'EN' }, { id: 'hi', label: 'HI' }].map(l => (
                <button key={l.id} onClick={() => setLanguage(l.id)}
                  className={`px-4 py-2 font-black uppercase text-xs transition-all ${
                    language === l.id ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {question.category?.type && <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 uppercase">{question.category.type} job</span>}
            {question.category?.name && <span className="text-[10px] font-bold text-slate-400">{question.category.name}</span>}
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{displayQuestion}</h1>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
            <span><Eye className="w-3 h-3 inline" /> {question.views} views</span>
          </div>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircleQuestion className="w-4 h-4 text-primary-600" />
            <h2 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Sample Answer</h2>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: displayAnswer }} />
        </Card>

        {displayTips && (
          <Card className="border-2 border-primary-600/20 dark:border-primary-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary-600" />
              <h2 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">Tips &amp; Expert Advice</h2>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: displayTips }} />
          </Card>
        )}

        {question.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-slate-400" />
            {question.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestionDetailPage;
