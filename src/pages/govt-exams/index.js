import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageHero from '@/components/common/ui/PageHero';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  GraduationCap,
  Building,
  MapPin,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Star,
  FileText,
  BrainCircuit,
  ChevronRight,
  History
} from 'lucide-react';
import { m as motion } from 'framer-motion';

import API from '../../lib/api';
import useTargetExamsVersion from '../../hooks/useTargetExamsVersion';
import { getStoredTargetExamIds } from '../../lib/utils/targetExams';
import Button from '../../components/common/ui/Button';
import Card from '../../components/common/ui/Card';
import Skeleton from '../../components/common/Skeleton';
import Seo from '../../components/common/Seo';
import {
  generateBreadcrumbSchema,
  generateItemListSchema
} from '../../utils/schema';
import useTranslate from '../../hooks/useTranslate';

const GovernmentExamsLanding = ({ initialExams = [], initialError = '', seo }) => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const [exams, setExams] = useState(initialExams);
  const [loading, setLoading] = useState(!initialExams.length && !initialError);
  const [error, setError] = useState(initialError);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.getAllExams({ forUser: true });
      if (res?.success) setExams(res.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError(translate('Failed to load exams.'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
  }, []);

  const targetVersion = useTargetExamsVersion();

  // SSR always ships the full list (SEO). Logged-in users with target exams get the
  // filtered list on mount, and again right after they change their selection.
  useEffect(() => {
    if (targetVersion > 0 || getStoredTargetExamIds().length) fetchExams();
  }, [targetVersion, fetchExams]);

  useEffect(() => {
    if (!exams.length && !initialError) fetchExams();
  }, [exams.length, fetchExams, initialError]);

  // Search and Central/State filter run on the server. With neither active we show the
  // SSR/target-exam list as is; otherwise the API returns the matching exams.
  const [serverExams, setServerExams] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);
  useEffect(() => {
    if (!debouncedSearch && activeFilter === 'all') { setServerExams(null); return; }
    let alive = true;
    API.getAllExams({ forUser: true, search: debouncedSearch || undefined, type: activeFilter, limit: 100 })
      .then((res) => { if (alive && res?.success) setServerExams(res.data || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, [debouncedSearch, activeFilter, targetVersion]);
  const filteredExams = serverExams ?? exams;

  const filters = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'central', label: 'Central', icon: Building },
    { id: 'state', label: 'State', icon: MapPin },
  ];

  const examNamesPreview = useMemo(
    () => (exams || []).slice(0, 8).map(e => e.name).filter(Boolean).join(', '),
    [exams]
  );
  const seoDescription = seo?.description || `Browse ${exams.length} government exam preparation pages on AajExam${examNamesPreview ? ` – ${examNamesPreview} and more` : ''}. Free practice tests, previous year question papers (PYQs) and topic-wise quizzes for SSC, UPSC, Banking, Railway, Defence and State PSC exams.`;

  const itemListSchema = useMemo(() => generateItemListSchema({
    name: 'Government Exam Preparation',
    items: (exams || []).filter(e => e?.slug).slice(0, 30).map(e => ({
      name: e.name,
      url: `/govt-exams/exam/${e.slug}`
    }))
  }), [exams]);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Government Exams', url: '/govt-exams' }
  ]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in py-10">
        <Skeleton height="100px" borderRadius="1.5rem" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="120px" borderRadius="1.5rem" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-2 xl:py-4 space-y-4 xl:space-y-8">
      <Seo
        title={seo?.title || 'Government Exam Preparation – Free Practice Tests, PYQs & Quizzes | AajExam'}
        description={seoDescription}
        keywords={[
          'government exam preparation',
          'free practice tests',
          'previous year question papers',
          'PYQ practice',
          'SSC CHSL',
          'SSC CGL',
          'SSC MTS',
          'SSC GD',
          'UPSC',
          'banking exam',
          'railway exam',
          'state PSC',
          'aajexam exams'
        ]}
        canonical="/govt-exams"
        schemas={[itemListSchema, breadcrumbSchema]}
      />

      {/* Hero */}
      <PageHero
        icon={GraduationCap}
        eyebrow={translate('Govt. Exams')}
        title={translate('Govt. Exams')}
        subtitle={translate('{count} Exams Available', { count: exams.length })}
        center={
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={translate('Search exams...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-black rounded-lg xl:rounded-xl py-2 pl-9 pr-3 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>
        }
        actions={
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar max-w-full">
            {filters.map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black uppercase text-[11px] whitespace-nowrap transition-all border-b-2 active:translate-y-0.5 ${
                  activeFilter === f.id
                    ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] border-primary-600'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-white border-slate-300 dark:border-slate-500'
                }`}>
                <f.icon className="w-3.5 h-3.5" /> {translate(f.label)}
              </button>
            ))}
          </div>
        }
      />

      {/* Filters + Search */}
      <section className="space-y-2 xl:space-y-4">

        {/* Exams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-6 pt-2">
          {filteredExams.map((exam, idx) => (
            <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card
                hoverable
                onClick={() => router.push(`/govt-exams/exam/${exam.slug}`)}
                className="group relative flex flex-col gap-4 border-slate-200 dark:border-slate-800 hover:border-primary-700 transition-all rounded-[1.5rem] bg-background-surface shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 xl:w-10 h-8 xl:h-10 px-1 rounded-2xl bg-primary-600 flex items-center justify-center shrink-0 shadow-sm text-white text-xs xl:text-base font-black tabular-nums">
                      {idx + 1}
                    </div>
                    <div>
                      <h2 className="text-md font-black text-content-primary uppercase tracking-tight">{translateData(exam.name)}</h2>
                      {exam.code && <p className="text-[10px] font-bold text-content-muted uppercase">{exam.code}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-2">
                {/* Category Badge */}
                <div className="flex items-center gap-1.5">
                  {exam.category?.type === 'Central'
                    ? <Building className="w-3 h-3 text-black dark:text-white" />
                    : <MapPin className="w-3 h-3 text-black dark:text-white" />
                  }
                  <span className="text-xs font-bold text-content-secondary">{translateData(exam.category?.name) || translate('General')}</span>
                  <span className="text-[10px] font-bold text-content-muted px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{exam.category?.type || ''}</span>
                </div>

                {/* Counts */}
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 dark:text-primary-300 uppercase bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-primary-100 dark:border-primary-800/50">
                    <FileText className="w-3 h-3" />
                    {translate('{count} Tests', { count: exam.practiceTestCount || 0 })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-black dark:text-white uppercase bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-slate-200 dark:border-slate-800 dark:border-white/50">
                    <History className="w-3 h-3" />
                    {translate('{count} PYQs', { count: exam.pyqCount || 0 })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 dark:text-primary-300 uppercase bg-primary-50 dark:bg-primary-900/30 px-2.5 py-1.5 rounded-lg xl:rounded-xl border border-primary-100 dark:border-primary-800/50">
                    <BrainCircuit className="w-3 h-3" />
                    {translate('{count} Quizzes', { count: exam.quizCount || 0 })}
                  </div>
                </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredExams.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-2 xl:space-y-4">
              <Search className="w-20 h-20 text-gray-300 mx-auto" />
              <h2 className="text-xl font-black text-gray-400 uppercase">{translate('No exams found')}</h2>
              <Button variant="primary" onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}>{translate('View All')}</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GovernmentExamsLanding;

export async function getServerSideProps() {
  const dbConnect = (await import('../../lib/db')).default;
  const Exam = (await import('../../models/Exam')).default;
  const PracticeTest = (await import('../../models/PracticeTest')).default;
  const Quiz = (await import('../../models/Quiz')).default;
  try {
    await dbConnect();

    const [examDocs, testCounts, quizCounts] = await Promise.all([
      Exam.find({ isActive: true, actualExam: { $ne: false }, name: { $not: /Central Board of Secondary Education|CBSE/i } }).populate('category', 'name type').sort({ name: 1 }).lean(),
      PracticeTest.aggregate([
        { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
        { $unwind: '$pattern' },
        {
          $group: {
            _id: '$pattern.exam',
            pyq: { $sum: { $cond: [{ $eq: ['$isPYQ', true] }, 1, 0] } },
            practice: { $sum: { $cond: [{ $eq: ['$isPYQ', true] }, 0, 1] } }
          }
        }
      ]),
      Quiz.aggregate([
        { $match: { status: 'published', applicableExams: { $exists: true, $ne: [] } } },
        { $unwind: '$applicableExams' },
        { $group: { _id: '$applicableExams', total: { $sum: 1 } } }
      ])
    ]);

    const ptMap = Object.fromEntries(testCounts.map(i => [i._id?.toString(), i]));
    const qzMap = Object.fromEntries(quizCounts.map(i => [i._id?.toString(), i.total]));

    const exams = examDocs.map(e => {
      const counts = ptMap[e._id.toString()] || { practice: 0, pyq: 0 };
      return {
        ...JSON.parse(JSON.stringify(e)),
        practiceTestCount: counts.practice || 0,
        pyqCount: counts.pyq || 0,
        quizCount: qzMap[e._id.toString()] || 0,
      };
    });

    return { props: { initialExams: exams, seo: { title: 'Govt. Exams - AajExam' } } };
  } catch (error) {
    console.error('Failed to pre-render exams:', error);
    return { props: { initialExams: [], initialError: 'Failed to load data.' } };
  }
}
