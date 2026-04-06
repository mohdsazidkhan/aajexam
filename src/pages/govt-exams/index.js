import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  GraduationCap,
  Building,
  MapPin,
  Search,
  BookOpen,
  Calculator,
  Lightbulb,
  Globe,
  Languages,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';

import API from '../../lib/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Skeleton from '../../components/Skeleton';

const GovernmentExamsLanding = ({ initialCategories = [], initialError = '', seo }) => {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(!initialCategories.length && !initialError);
  const [error, setError] = useState(initialError);
  const [activeFilter, setActiveFilter] = useState('all');

  const subjects = [
    { name: 'Mathematics', icon: Calculator, color: 'primary', progress: 45, exams: 12 },
    { name: 'Reasoning', icon: Lightbulb, color: 'secondary', progress: 68, exams: 8 },
    { name: 'GS & GK', icon: Globe, color: 'emerald', progress: 92, exams: 15 },
    { name: 'English', icon: Languages, color: 'orange', progress: 30, exams: 10 },
  ];

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.getRealExamCategories();
      if (res?.success) setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load exam categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!categories.length) fetchCategories();
  }, [categories.length, fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (activeFilter === 'all') return categories;
    return categories.filter(cat => cat.type?.toLowerCase() === activeFilter.toLowerCase());
  }, [categories, activeFilter]);

  const filters = [
    { id: 'all', label: 'All Exams', icon: Sparkles },
    { id: 'central', label: 'Central Govt', icon: Building },
    { id: 'state', label: 'State Level', icon: MapPin },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in py-10">
        <Skeleton height="100px" borderRadius="1.5rem" />
        <div className="flex gap-4">
          <Skeleton width="120px" height="40px" borderRadius="2rem" />
          <Skeleton width="120px" height="40px" borderRadius="2rem" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="150px" borderRadius="1.5rem" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-12 animate-fade-in bg-transparent font-outfit pb-10">
      <Head>
        <title>{seo?.title || 'Study Hub - AajExam'}</title>
      </Head>

      {/* --- Section 1: Hero Header --- */}
      <section className="relative rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl border-b-8 border-primary-600/20 dark:border-primary-900/30">
        {/* Dynamic Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-500 dark:from-slate-900 dark:via-primary-900/40 dark:to-slate-900 transition-colors duration-700" />

        {/* Animated Mesh Overlay (Light Mode Only for Performance/Clarity) */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,1),transparent)]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 dark:bg-primary-500/20 px-5 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/30 dark:border-primary-500/30"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Trending: SSC GL 2026
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-2xl lg:text-6xl font-black font-outfit uppercase leading-tight text-white tracking-tighter drop-shadow-lg">
                Exams Hub
              </h1>
              <p className="text-lg lg:text-xl font-bold text-white/90 max-w-md leading-relaxed">
                What would you like to master today?
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <Button
              variant="white"
              size="md"
              icon={Search}
              iconPosition="left"
              onClick={() => router.push('/search')}
              fullWidth={true}
              className="rounded-2xl px-10 py-5 font-black uppercase tracking-widest text-xs group md:w-fit"
            >
              Start Practice <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-10 -right-10 opacity-20 dark:opacity-30 pointer-events-none">
          <GraduationCap className="w-80 h-80 text-white rotate-12" />
        </div>
        <div className="absolute top-10 right-20 w-20 lg:w-32 h-20 lg:h-32 bg-white/10 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none animte-pulse" />
      </section>

      {/* --- Section 2: Subject Grid (Duolingo Style) --- */}
      <section className="space-y-6">
        <h2 className="text-md md:text-xl lg:text-2xl font-black text-content-primary font-outfit uppercase tracking-widest px-1">Subject Hub</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {subjects.map((sub, idx) => (
            <Card
              key={idx}
              hoverable
              className="flex flex-col items-center text-center p-6 gap-4 group transition-all border-border-primary bg-background-surface rounded-[2.5rem]"
            >
              <div className={`mx-auto mb-2 w-20 h-20 flex items-center justify-center rounded-3xl bg-${sub.color}-100 dark:bg-${sub.color}-900/30 text-${sub.color}-600 dark:text-${sub.color}-400 group-hover:scale-110 transition-transform shadow-duo`}>
                <sub.icon className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <span className="font-black text-lg tracking-wide font-outfit uppercase text-content-primary">{sub.name}</span>
                <p className="text-[10px] font-black text-content-muted uppercase tracking-wider">{sub.exams} Quizzes</p>
              </div>
              <ProgressBar progress={sub.progress} variant={sub.color} height="sm" />
            </Card>
          ))}
        </div>
      </section>

      {/* --- Section 3: Sticky Filters & Exam Categories --- */}
      <section className="space-y-8">
        <div className="sticky top-16 lg:top-20 z-20 bg-background-page/80 backdrop-blur-xl py-6 -mx-4 px-4 border-b border-border-primary/50">
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-black uppercase text-xs whitespace-nowrap transition-all shadow-duo border-b-4 active:translate-y-1 active:border-b-0
                  ${activeFilter === f.id
                    ? 'bg-primary-500 text-white border-primary-600 border-b-4'
                    : 'bg-background-surface text-content-secondary border-border-primary hover:bg-background-page'}
                `}
              >
                <f.icon className="w-4 h-4" />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8 pt-4">
          {filteredCategories.map((cat) => (
            <Card
              key={cat._id}
              hoverable
              onClick={() => router.push(`/govt-exams/category/${cat._id}`)}
              className="group p-5 lg:p-8 flex flex-col md:flex-row items-start gap-4 lg:gap-6 border-border-primary hover:border-primary-500 transition-all rounded-[2rem] lg:rounded-[2.5rem] bg-background-surface shadow-xl"
            >
              <div className="mb-2 w-20 h-20 bg-background-page rounded-[1.5rem] flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform shadow-duo border-2 border-border-primary/50">
                {cat.type === 'central' ? <Building className="w-10 h-10" /> : <MapPin className="w-10 h-10" />}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-md md:text-xl lg:text-2xl font-black text-content-primary font-outfit uppercase tracking-tight">
                    {cat.name}
                  </h3>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-content-secondary text-sm font-bold line-clamp-2 leading-relaxed">
                  {cat.description || 'Prepare for all competitive exams in this category with realistic mock tests.'}
                </p>
                <div className="pt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-2xl border-2 border-primary-100 dark:border-primary-800/50 shadow-sm">
                    <Zap className="w-3.5 h-3.5 fill-primary-600" />
                    {cat.examCount || 0} Exams
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase bg-primary-50 dark:bg-primary-500/10 px-4 py-2 rounded-2xl border-2 border-primary-100 dark:border-primary-500/20 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-primary-600" />
                    {cat.testCount || 0} Tests
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filteredCategories.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center space-y-4">
              <Search className="w-20 h-20 text-gray-300 mx-auto" />
              <h3 className="text-xl lg:text-2xl font-black text-gray-400 font-outfit uppercase">No categories found</h3>
              <Button variant="primary" onClick={() => setActiveFilter('all')}>View All Exams</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GovernmentExamsLanding;

import dbConnect from '../../lib/db';
import ExamCategory from '../../models/ExamCategory';
import Exam from '../../models/Exam';
import PracticeTest from '../../models/PracticeTest';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  try {
    await dbConnect();

    const [categoriesDocs, examCounts, testCounts] = await Promise.all([
      ExamCategory.find().sort({ type: 1, name: 1 }).lean(),
      Exam.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', total: { $sum: 1 } } }
      ]),
      PracticeTest.aggregate([
        { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'pattern' } },
        { $unwind: '$pattern' },
        { $lookup: { from: 'exams', localField: 'pattern.exam', foreignField: '_id', as: 'exam' } },
        { $unwind: '$exam' },
        { $match: { 'exam.isActive': true } },
        { $group: { _id: '$exam.category', total: { $sum: 1 } } }
      ])
    ]);

    const examCountMap = Object.fromEntries(examCounts.map(i => [i._id?.toString(), i.total]));
    const testCountMap = Object.fromEntries(testCounts.map(i => [i._id?.toString(), i.total]));

    const categories = categoriesDocs.map(c => ({
      ...JSON.parse(JSON.stringify(c)),
      examCount: examCountMap[c._id.toString()] || 0,
      testCount: testCountMap[c._id.toString()] || 0
    }));

    const seo = {
      title: 'Study Hub - Government Exam Preparation',
      description: 'Master government exams (SSC, Banking, UPSC) with our gamified learning paths and mock tests.',
      keywords: 'SSC, Banking, UPSC, Mock Test, Govt Job Preparation',
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams` : undefined
    };

    return { props: { initialCategories: categories, seo } };
  } catch (error) {
    console.error('Failed to pre-render govt exams categories:', error);
    return { props: { initialCategories: [], initialError: 'Failed to load data.' } };
  }
}

