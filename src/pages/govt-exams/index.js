import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Skeleton from '../../components/Skeleton';

const GovernmentExamsLanding = ({ initialExams = [], initialError = '', seo }) => {
  const router = useRouter();
  const [exams, setExams] = useState(initialExams);
  const [loading, setLoading] = useState(!initialExams.length && !initialError);
  const [error, setError] = useState(initialError);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.getAllExams();
      if (res?.success) setExams(res.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!exams.length && !initialError) fetchExams();
  }, [exams.length, fetchExams, initialError]);

  const filteredExams = useMemo(() => {
    let list = exams;
    if (activeFilter !== 'all') {
      list = list.filter(e => e.category?.type?.toLowerCase() === activeFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.code?.toLowerCase().includes(q) ||
        e.category?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [exams, activeFilter, searchQuery]);

  const filters = [
    { id: 'all', label: 'All Exams', icon: Sparkles },
    { id: 'central', label: 'Central Govt', icon: Building },
    { id: 'state', label: 'State Level', icon: MapPin },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in py-10">
        <Skeleton height="100px" borderRadius="1.5rem" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="120px" borderRadius="1.5rem" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-10 animate-fade-in bg-transparent font-outfit pb-10">
      <Head>
        <title>{seo?.title || 'Exams Hub - AajExam'}</title>
      </Head>

      {/* Hero */}
      <section className="relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl border-b-8 border-primary-600/20 dark:border-primary-900/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-500 dark:from-slate-900 dark:via-primary-900/40 dark:to-slate-900" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30">
              <TrendingUp className="w-3.5 h-3.5" /> {exams.length} Exams Available
            </motion.div>
            <h1 className="text-2xl lg:text-5xl font-black uppercase leading-tight text-white tracking-tighter">Exams Hub</h1>
            <p className="text-md lg:text-lg font-bold text-white/90 max-w-md">Select an exam to start practicing</p>
          </div>
          <Button variant="white" size="md" onClick={() => router.push('/search')} className="rounded-2xl px-10 py-5 font-black uppercase tracking-widest text-xs md:w-fit">
            <Search className="w-4 h-4 mr-2" /> Search <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
        <GraduationCap className="absolute -bottom-10 -right-10 w-80 h-80 text-white/10 rotate-12 pointer-events-none" />
      </section>

      {/* Filters + Search */}
      <section className="space-y-4">
        <div className="sticky top-16 lg:top-20 z-20 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-border-primary/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {filters.map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all border-b-4 active:translate-y-0.5 ${
                    activeFilter === f.id ? 'bg-primary-500 text-white border-primary-600' : 'bg-background-surface text-content-secondary border-border-primary'
                  }`}>
                  <f.icon className="w-3.5 h-3.5" /> {f.label}
                </button>
              ))}
            </div>
            <div className="flex-1 min-w-[150px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-2">
          {filteredExams.map((exam, idx) => (
            <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card
                hoverable
                onClick={() => router.push(`/govt-exams/exam/${exam._id}`)}
                className="group p-5 flex flex-col gap-4 border-border-primary hover:border-primary-500 transition-all rounded-[1.5rem] bg-background-surface shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                      <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-content-primary uppercase tracking-tight">{exam.name}</h3>
                      {exam.code && <p className="text-[10px] font-bold text-content-muted uppercase">{exam.code}</p>}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>

                {/* Category Badge */}
                <div className="flex items-center gap-1.5">
                  {exam.category?.type === 'Central'
                    ? <Building className="w-3 h-3 text-blue-500" />
                    : <MapPin className="w-3 h-3 text-orange-500" />
                  }
                  <span className="text-xs font-bold text-content-secondary">{exam.category?.name || 'General'}</span>
                  <span className="text-[10px] font-bold text-content-muted px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">{exam.category?.type || ''}</span>
                </div>

                {/* Counts */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-900/30 px-3 py-1.5 rounded-xl border border-primary-100 dark:border-primary-800/50">
                    <FileText className="w-3 h-3" />
                    {exam.practiceTestCount || 0} Tests
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                    <BrainCircuit className="w-3 h-3" />
                    {exam.quizCount || 0} Quizzes
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {filteredExams.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <Search className="w-20 h-20 text-gray-300 mx-auto" />
              <h3 className="text-xl font-black text-gray-400 uppercase">No exams found</h3>
              <Button variant="primary" onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}>View All</Button>
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

    const [examDocs, practiceTestCounts, quizCounts] = await Promise.all([
      Exam.find({ isActive: true }).populate('category', 'name type').sort({ name: 1 }).lean(),
      PracticeTest.aggregate([
        { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
        { $unwind: '$pattern' },
        { $group: { _id: '$pattern.exam', total: { $sum: 1 } } }
      ]),
      Quiz.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$exam', total: { $sum: 1 } } }
      ])
    ]);

    const ptMap = Object.fromEntries(practiceTestCounts.map(i => [i._id?.toString(), i.total]));
    const qzMap = Object.fromEntries(quizCounts.map(i => [i._id?.toString(), i.total]));

    const exams = examDocs.map(e => ({
      ...JSON.parse(JSON.stringify(e)),
      practiceTestCount: ptMap[e._id.toString()] || 0,
      quizCount: qzMap[e._id.toString()] || 0,
    }));

    return { props: { initialExams: exams, seo: { title: 'Exams Hub - AajExam' } } };
  } catch (error) {
    console.error('Failed to pre-render exams:', error);
    return { props: { initialExams: [], initialError: 'Failed to load data.' } };
  }
}
