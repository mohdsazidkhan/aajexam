'use client';
import BackButton from '@/components/common/ui/BackButton';
import React, { useState } from 'react';
import { MessageCircleQuestion, Lightbulb, Eye, ArrowLeft, Tag } from 'lucide-react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Card from '../../components/common/ui/Card';
import Seo from '../../components/common/Seo';
import { generateBreadcrumbSchema, generateBlogPostingSchema } from '../../utils/schema';
import useTranslate from '../../hooks/useTranslate';

// Server-rendered so crawlers get the title, canonical, h1 and answer in the
// initial HTML (the page used to be a client-only shell that Google skipped).
export async function getServerSideProps({ params, res }) {
  const slug = params?.slug;
  if (!slug) return { notFound: true };

  try {
    const dbConnect = (await import('../../lib/db')).default;
    const InterviewQuestion = (await import('../../models/InterviewQuestion')).default;
    await import('../../models/InterviewCategory');
    await dbConnect();

    const question = await InterviewQuestion.findOne({ slug: String(slug), status: 'published' })
      .populate('category', 'name slug type')
      .lean();
    if (!question) return { notFound: true };

    // Fire-and-forget view count, same as the old /api/interview-questions/[slug] GET did.
    InterviewQuestion.updateOne({ _id: question._id }, { $inc: { views: 1 } }).catch((e) => console.error('View increment failed:', e));
    question.views = (question.views || 0) + 1;

    if (res) res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    return { props: { question: JSON.parse(JSON.stringify(question)) } };
  } catch (e) {
    console.error('interview question ssr error', e);
    return { notFound: true };
  }
}

const InterviewQuestionDetailPage = ({ question }) => {
  const { translate } = useTranslate();
  const [language, setLanguage] = useState('en');
  const router = useRouter();
  const slug = question?.slug;

  if (!question) return null;

  const hasHindi = Boolean(question.questionHi || question.answerHi);
  const displayQuestion = (language === 'hi' && question.questionHi) || question.question;
  const displayAnswer = (language === 'hi' && question.answerHi) || question.answer;
  const displayTips = (language === 'hi' && question.tipsHi) || question.tips;

  return (
    <div className="min-h-screen pb-6 xl:pb-12">
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
      <div className="py-0 xl:py-6 space-y-3 xl:space-y-4">
        <div className="flex flex-row-reverse items-center justify-between gap-3 flex-wrap">
          <BackButton onClick={() => router.push(question.category?.slug ? `/${question.category.slug}-interview-questions` : '/interview-questions')}><ArrowLeft className="w-4 h-4" /> Back to <span className="capitalize text-black dark:text-white">{question.category?.name || 'Interview Questions'}</span></BackButton>
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

        <div className="relative isolate overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-primary-700 dark:via-primary-800 dark:to-primary-950 shadow-xl ring-1 ring-primary-200 dark:ring-white/10 p-4 xl:p-6 space-y-2" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
          <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-amber-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
          <div className="flex items-center gap-2 flex-wrap">
            {question.category?.type && <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[9px] font-black text-primary-600 uppercase">{translate('{type} job', { type: question.category.type })}</span>}
            {question.category?.name && <span className="text-[10px] font-bold text-slate-500 dark:text-white/60">{translate('{name} Interview Questions', { name: question.category.name })}</span>}
          </div>
          <h1 className="text-xl xl:text-2xl font-black text-slate-900 dark:text-white">{displayQuestion}</h1>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-white/60 font-bold">
            <span><Eye className="w-3 h-3 inline" /> {translate('{count} views', { count: question.views })}</span>
          </div>
        </div>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircleQuestion className="w-4 h-4 text-primary-600" />
            <h2 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{translate('Sample Answer')}</h2>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: displayAnswer }} />
        </Card>

        {displayTips && (
          <Card className="border-2 border-primary-600/20 dark:border-primary-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary-600" />
              <h2 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{translate('Tips & Expert Advice')}</h2>
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
