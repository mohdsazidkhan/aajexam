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
          <BackButton onClick={() => router.push(question.category?.slug ? `/${question.category.slug}-interview-questions` : '/interview-questions')}><ArrowLeft className="w-4 h-4" /> Back to <span className="capitalize text-content-primary">{question.category?.name || 'Interview Questions'}</span></BackButton>
          {hasHindi && (
            <div className="flex rounded-full overflow-auto border border-border-primary shrink-0">
              {[{ id: 'en', label: 'EN' }, { id: 'hi', label: 'HI' }].map(l => (
                <button key={l.id} onClick={() => setLanguage(l.id)}
                  className={`px-4 py-2 font-bold uppercase text-xs transition-all ${
                    language === l.id ? 'bg-primary-600 text-on-primary' : 'bg-background-surface text-content-secondary'
                  }`}>
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <header className="z-auto relative isolate overflow-hidden border border-border-primary p-4 xl:p-6 space-y-2 bg-background-surface" style={{ borderRadius: 16 }}>
          <div className="flex items-center gap-2 flex-wrap">
            {question.category?.type && <span className="px-2 py-0.5 rounded text-[9px] font-bold text-primary-600 uppercase">{translate('{type} job', { type: question.category.type })}</span>}
            {question.category?.name && <span className="text-[10px] font-bold text-content-muted dark:text-white/60">{translate('{name} Interview Questions', { name: question.category.name })}</span>}
          </div>
          <h1 className="text-xl xl:text-2xl font-bold text-content-primary">{displayQuestion}</h1>
          <div className="flex items-center gap-3 text-[10px] text-content-muted dark:text-white/60 font-bold">
            <span><Eye className="w-3 h-3 inline" /> {translate('{count} views', { count: question.views })}</span>
          </div>
        </header>

        <Card as="section">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircleQuestion className="w-4 h-4 text-primary-600" />
            <h2 className="text-xs font-bold uppercase text-content-muted">{translate('Sample Answer')}</h2>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none text-content-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: displayAnswer }} />
        </Card>

        {displayTips && (
          <Card as="section" className="border border-primary-600/20 dark:border-primary-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary-600" />
              <h2 className="text-xs font-bold uppercase text-content-muted">{translate('Tips & Expert Advice')}</h2>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-content-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: displayTips }} />
          </Card>
        )}

        {question.tags?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-content-muted" />
            {question.tags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 bg-background-surface-secondary rounded text-[10px] font-bold text-content-muted">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestionDetailPage;
