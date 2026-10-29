import { withPageCache } from '@/lib/utils/pageCache';
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  ArrowLeft,
  GraduationCap,
  Building,
  Target,
  Zap,
  Star,
  ChevronRight,
  Info
} from 'lucide-react';
import { m as motion } from 'framer-motion';

import API from '../../../lib/api';
import Button from '../../../components/common/ui/Button';
import Card from '../../../components/common/ui/Card';
import ProgressBar from '../../../components/common/ui/ProgressBar';
import Skeleton from '../../../components/common/Skeleton';
import Seo from '../../../components/common/Seo';
import { generateBreadcrumbSchema, generateItemListSchema } from '../../../utils/schema';
import useTranslate from '../../../hooks/useTranslate';

const CategoryExams = ({ initialCategory = null, initialExams = [], initialError = '', seo, categoryId }) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [exams, setExams] = useState(initialExams);
  const [loading, setLoading] = useState(!initialExams.length && !initialError);
  const [error, setError] = useState(initialError);

  const fetchCategoryAndExams = useCallback(async () => {
    if (!categoryId) return;
    try {
      setLoading(true);
      const res = await API.getExamsByCategory(categoryId);
      if (res?.success) {
        setExams(res.data || []);
        if (res.category) setCategory(res.category);
      } else {
        setError(translate('Failed to load exams.'));
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(translate('An error occurred.'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
  }, [categoryId]);

  useEffect(() => {
    if (!initialExams.length && !initialError) fetchCategoryAndExams();
  }, [initialExams.length, initialError, fetchCategoryAndExams]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in py-10">
        <Skeleton height="200px" borderRadius="1.5rem" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="120px" borderRadius="1.5rem" />)}
        </div>
      </div>
    );
  }

  const categoryName = category?.name || 'Government Exams';

  return (
    <div className="space-y-10 animate-fade-in font-outfit">
      <Seo
        title={seo?.title || `${categoryName} – Practice Tests, PYQs & Quizzes | AajExam`}
        description={seo?.description || `Browse ${exams.length || ''} ${categoryName} exam preparation pages on AajExam. Free practice tests, previous year question papers (PYQs) and topic-wise quizzes with detailed solutions.`}
        canonical={`/govt-exams/category/${category?.slug || categoryId}`}
        keywords={[
          `${categoryName} exams`,
          `${categoryName} practice test`,
          `${categoryName} PYQ`,
          `${categoryName} mock test`,
          'government exam preparation',
          'aajexam'
        ]}
        schemas={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Government Exams', url: '/govt-exams' },
            { name: categoryName, url: `/govt-exams/category/${category?.slug || categoryId}` }
          ]),
          generateItemListSchema({
            name: `${categoryName} Exams`,
            items: (exams || []).filter(e => e?.slug).slice(0, 30).map(e => ({ name: e.name, url: `/govt-exams/exam/${e.slug}` }))
          })
        ]}
      />

      {/* --- Header Section --- */}
      <section className="space-y-6">
        <button
          onClick={() => router.push('/govt-exams')}
          className="group flex items-center gap-3 px-6 py-3 bg-background-surface text-content-primary font-bold uppercase tracking-[0.08em] text-[10px] rounded-2xl border border-border-primary active:translate-y-1 active:border-b-0 transition-all w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {translate('Back')}
        </button>

        <div className="p-5 xl:p-8 relative overflow-hidden ring-1 ring-white/10 bg-primary-600" style={{ borderRadius: 'var(--radius)' }}>
          {/* Background atmosphere */}

          <header className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-3 text-on-primary px-4 py-1.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] bg-primary-600">
              <Target className="w-3 h-3" />
              {translate('{type} Category', { type: category?.type || translate('Competitive') })}
            </div>
            <h1 className="text-2xl xl:text-4xl font-bold text-white tracking-tight leading-none">{categoryName}</h1>
            <p className="text-base xl:text-lg font-bold text-white/80 max-w-2xl leading-relaxed">
              {category?.description || translate('Everything you need to master exams in this category. Start your journey today!')}
            </p>
          </header>
          <Building className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5 pointer-events-none" />
        </div>
      </section>

      {/* --- Exams List --- */}
      <section className="space-y-8">
        <section className="flex justify-between items-center px-4">
          <h2 className="text-md md:text-xl xl:text-2xl font-bold text-content-primary tracking-tight">{translate('Available Exams')}</h2>
          <span className="px-5 py-2 rounded-2xl text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] border border-border-primary dark:border-slate-800">
            {translate('{count} TOTAL', { count: exams.length })}
          </span>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 xl:gap-6">
          {exams.map((exam, idx) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <section
                onClick={() => router.push(`/govt-exams/exam/${exam.slug}`)}
                className="group flex items-center gap-3 xl:gap-6 p-4 xl:p-8 bg-background-surface border border-border-primary rounded-3xl hover:border-primary-700 transition-all cursor-pointer active:translate-y-1 active:border-b-2"
              >
                <div className="w-10 xl:w-20 h-10 xl:h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-on-primary font-bold text-xl xl:text-3xl group-hover:scale-110 transition-transform border-b-2 border-primary-600">
                  {exam.code?.[0] || 'E'}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-sm xl:text-xl font-bold text-content-primary tracking-tight group-hover:text-primary-600 transition-colors">
                    {translateData(exam.name)}
                  </h3>
                  <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">
                      <Zap className="w-3.5 h-3.5 fill-slate-400 stroke-none" />
                      {translate('{count} Tests', { count: exam.testCount || 0 })}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">
                      <Star className="w-3.5 h-3.5 fill-slate-400 stroke-none" />
                      {translate('{count} Patterns', { count: exam.patternCount || 0 })}
                    </span>
                  </div>
                </div>

                <div className="w-8 xl:w-12 h-8 xl:h-12 rounded-md flex items-center justify-center text-primary-600 group-hover:bg-primary-700 group-hover:text-white transition-all transform group-hover:translate-x-1 border border-primary-600">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </section>
            </motion.div>
          ))}
        </div>

        {exams.length === 0 && (
          <section className="py-24 text-center space-y-6 bg-background-surface rounded-3xl border border-dashed border-border-primary">
            <div className="w-20 h-20 bg-background-surface-secondary rounded-md flex items-center justify-center mx-auto text-content-muted border border-primary-600">
              <Info className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl xl:text-2xl font-bold text-content-muted tracking-tight">{translate('No exams found')}</h3>
              <p className="text-content-muted font-bold mt-2">{translate('Try another category or search again.')}</p>
            </div>
          </section>
        )}
      </section>
    </div>
  );
};

export default CategoryExams;

async function getServerSidePropsImpl({ params }) {
  const dbConnect = (await import('../../../lib/db')).default;
  const Exam = (await import('../../../models/Exam')).default;
  const ExamCategory = (await import('../../../models/ExamCategory')).default;
  const ExamPattern = (await import('../../../models/ExamPattern')).default;
  const PracticeTest = (await import('../../../models/PracticeTest')).default;
  const { isObjectId, slugRedirect } = await import('../../../lib/web/slugRouting');
  const segment = params?.categoryId;
  if (!segment) return { notFound: true };

  try {
    await dbConnect();

    if (isObjectId(segment)) {
      const idDoc = await ExamCategory.findById(segment).select('slug').lean();
      if (idDoc?.slug) return slugRedirect(`/govt-exams/category/${idDoc.slug}`);
      if (!idDoc) return { notFound: true };
    }

    const categoryDoc = await ExamCategory.findOne(isObjectId(segment) ? { _id: segment } : { slug: segment }).lean();
    if (!categoryDoc) return { notFound: true };
    const categoryId = categoryDoc._id;

    const examsDocs = await Exam.find({ category: categoryId, isActive: true }).sort({ name: 1 }).lean();
    const examIds = examsDocs.map(e => e._id);

    let exams = [];
    if (examIds.length > 0) {
      const [patterns, tests] = await Promise.all([
        ExamPattern.aggregate([{ $match: { exam: { $in: examIds } } }, { $group: { _id: '$exam', total: { $sum: 1 } } }]),
        PracticeTest.aggregate([
          { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
          { $unwind: '$pattern' },
          { $match: { 'pattern.exam': { $in: examIds } } },
          { $group: { _id: '$pattern.exam', total: { $sum: 1 } } }
        ])
      ]);

      const patternMap = Object.fromEntries(patterns.map(i => [i._id.toString(), i.total]));
      const testMap = Object.fromEntries(tests.map(i => [i._id.toString(), i.total]));

      exams = examsDocs.map(e => ({
        ...JSON.parse(JSON.stringify(e)),
        patternCount: patternMap[e._id.toString()] || 0,
        testCount: testMap[e._id.toString()] || 0
      }));
    }

    return {
      props: {
        categoryId: String(categoryId),
        initialCategory: JSON.parse(JSON.stringify(categoryDoc)),
        initialExams: exams
      }
    };
  } catch (error) {
    console.error('Data pre-render error:', error);
    return { props: { initialError: 'Failed to load data.' } };
  }
}

// Public, URL-only data: let the CDN keep it instead of running this function on every request.
export const getServerSideProps = withPageCache(getServerSidePropsImpl, { sMaxAge: 3600, swr: 86400, shared: { key: ({ params }) => `page:govt-cat:${params?.categoryId}`, ttl: 900 } });
