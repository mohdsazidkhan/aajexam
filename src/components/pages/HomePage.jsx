'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
   Flame,
   Trophy,
   Target,
   Zap,
   BookOpen,
   Award,
   TrendingUp,
   ChevronRight,
   ShieldCheck,
   Search,
   MessageSquare,
   PlayCircle,
   Play,
   GraduationCap,
   Brain,
   Layers,
   Heart,
   Eye,
   FileText,
   HelpCircle,
   Lightbulb,
   Newspaper,
   BarChart3,
} from "lucide-react";

import API from "../../lib/api";
import { useAuthStatus } from "../../hooks/useClientSide";
import HomePageSkeleton from "../HomePageSkeleton";

// ─── Section Header ───
const SectionHeader = ({ title, icon: IconComp, iconColor, iconBg, onViewAll }) => (
   <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
         <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
            <IconComp className={`w-[18px] h-[18px] ${iconColor}`} />
         </div>
         <h2 className="text-base lg:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {title}
         </h2>
      </div>
      <button
         onClick={onViewAll}
         className="flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-primary-500/10 hover:bg-primary-500/20 transition-colors"
      >
         <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">View All</span>
         <ChevronRight className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
      </button>
   </div>
);

// ─── Skeleton for sections ───
const SectionSkeleton = () => (
   <div className="flex gap-3 overflow-hidden pb-1">
      {[1, 2, 3, 4].map(i => (
         <div key={i} className="min-w-[140px] lg:min-w-[160px] h-[130px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ))}
   </div>
);

// ─── Govt Exam Card ───
const GovtExamCard = ({ item, onClick }) => (
   <div
      onClick={onClick}
      className="min-w-[140px] lg:min-w-[160px] p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 border-b-[5px] cursor-pointer hover:scale-[1.02] transition-transform flex flex-col items-center gap-2 text-center"
   >
      <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
         <GraduationCap className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {item.name}
      </p>
      {item.code && (
         <p className="text-[11px] font-semibold text-slate-400">{item.code}</p>
      )}
   </div>
);

// ─── Quiz Card ───
const QuizCard = ({ item, onClick }) => (
   <div
      onClick={onClick}
      className="min-w-[160px] lg:min-w-[180px] p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 border-b-[5px] cursor-pointer hover:scale-[1.02] transition-transform flex flex-col gap-2"
   >
      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
         <Brain className="w-5 h-5 text-violet-500" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {item.title || item.name}
      </p>
      <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
         {item.totalQuestions > 0 && <span>{item.totalQuestions} Q</span>}
         {item.totalQuestions > 0 && item.duration > 0 && <span>·</span>}
         {item.duration > 0 && <span>{item.duration} min</span>}
      </div>
   </div>
);

// ─── Subject Card ───
const SubjectCard = ({ item, onClick }) => (
   <div
      onClick={onClick}
      className="min-w-[140px] lg:min-w-[160px] p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 border-b-[5px] cursor-pointer hover:scale-[1.02] transition-transform flex flex-col items-center gap-2 text-center"
   >
      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center">
         <BookOpen className="w-6 h-6 text-sky-500" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {item.name}
      </p>
      {(item.quizCount > 0 || item.topicCount > 0) && (
         <p className="text-[11px] font-semibold text-slate-400">
            {item.topicCount > 0 ? `${item.topicCount} Topics` : `${item.quizCount} Quizzes`}
         </p>
      )}
   </div>
);

// ─── Topic Card ───
const TopicCard = ({ item, onClick }) => (
   <div
      onClick={onClick}
      className="min-w-[140px] lg:min-w-[160px] p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 border-b-[5px] cursor-pointer hover:scale-[1.02] transition-transform flex flex-col items-center gap-2 text-center"
   >
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
         <Layers className="w-5 h-5 text-amber-500" />
      </div>
      <p className="text-[13px] font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
         {item.name}
      </p>
      {item.quizCount > 0 && (
         <p className="text-[11px] font-semibold text-slate-400">{item.quizCount} Quizzes</p>
      )}
   </div>
);

// ─── Reel Card ───
const REEL_TYPE_CONFIG = {
   question: { icon: HelpCircle, color: 'text-blue-700', bg: 'bg-blue-500/10', label: 'Question' },
   fact: { icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-500/10', label: 'Fact' },
   tip: { icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-500/10', label: 'Tip' },
   current_affairs: { icon: Newspaper, color: 'text-rose-600', bg: 'bg-rose-500/10', label: 'Current Affairs' },
   poll: { icon: BarChart3, color: 'text-emerald-600', bg: 'bg-emerald-500/10', label: 'Poll' },
};

const ReelCard = ({ item, onClick }) => {
   const cfg = REEL_TYPE_CONFIG[item.type] || REEL_TYPE_CONFIG.fact;
   const TypeIcon = cfg.icon;

   return (
      <div
         onClick={onClick}
         className="min-w-[180px] lg:min-w-[200px] p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 border-b-[5px] cursor-pointer hover:scale-[1.02] transition-transform flex flex-col gap-2"
      >
         <div className={`flex items-center gap-1.5 self-start px-2 py-1 rounded-lg ${cfg.bg}`}>
            <TypeIcon className={`w-3.5 h-3.5 ${cfg.color}`} />
            <span className={`text-[10px] font-extrabold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
         </div>
         <p className="text-xs font-bold text-slate-900 dark:text-white leading-[1.4] line-clamp-3">
            {item.questionText || item.factText || item.tipText || item.newsContent || item.pollQuestion || 'Reel'}
         </p>
         <div className="flex items-center gap-3 mt-auto text-slate-400">
            <div className="flex items-center gap-1">
               <Heart className="w-3.5 h-3.5" />
               <span className="text-[11px] font-semibold">{item.likes || 0}</span>
            </div>
            <div className="flex items-center gap-1">
               <Eye className="w-3.5 h-3.5" />
               <span className="text-[11px] font-semibold">{item.views || 0}</span>
            </div>
         </div>
      </div>
   );
};

const HomePage = () => {
   const router = useRouter();
   const { user, isClient: authLoading } = useAuthStatus();
   const [loading, setLoading] = useState(true);
   const fetchedRef = useRef(false);

   // Section data
   const [exams, setExams] = useState([]);
   const [quizzes, setQuizzes] = useState([]);
   const [subjects, setSubjects] = useState([]);
   const [topics, setTopics] = useState([]);
   const [reels, setReels] = useState([]);

   // Section loading
   const [sectionsLoading, setSectionsLoading] = useState({
      exams: true, quizzes: true, subjects: true, topics: true, reels: true,
   });

   // Performance stats
   const [performanceReport, setPerformanceReport] = useState(null);

   const fetchAllData = useCallback(async () => {
      setLoading(true);
      setSectionsLoading({ exams: true, quizzes: true, subjects: true, topics: true, reels: true });

      const fetchers = [
         // Govt Exams
         API.getAllExams()
            .then(res => {
               if (res.success && res.data) setExams(res.data);
               else if (res.success && res.exams) setExams(res.exams);
            })
            .catch(e => console.error('Exams fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, exams: false }))),

         // Quizzes
         API.getQuizzes()
            .then(res => {
               if (res.success && res.data) setQuizzes(res.data);
               else if (res.success && res.quizzes) setQuizzes(res.quizzes);
            })
            .catch(e => console.error('Quizzes fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, quizzes: false }))),

         // Subjects
         API.getAllSubjects()
            .then(res => {
               if (res.success && res.data) setSubjects(res.data);
               else if (res.success && res.subjects) setSubjects(res.subjects);
            })
            .catch(e => console.error('Subjects fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, subjects: false }))),

         // Topics
         API.getAllTopics()
            .then(res => {
               if (res.success && res.data) setTopics(res.data);
               else if (res.success && res.topics) setTopics(res.topics);
            })
            .catch(e => console.error('Topics fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, topics: false }))),

         // Reels
         API.getTrendingReels()
            .then(res => {
               if (res.success && res.data) setReels(res.data);
               else if (res.success && res.reels) setReels(res.reels);
            })
            .catch(e => console.error('Reels fetch error:', e))
            .finally(() => setSectionsLoading(prev => ({ ...prev, reels: false }))),

         // Performance
         API.getAnalyticsReport()
            .then(res => { if (res?.success) setPerformanceReport(res.data); })
            .catch(() => {}),
      ];

      await Promise.allSettled(fetchers);
      setLoading(false);
   }, []);

   useEffect(() => {
      if (fetchedRef.current) return;
      fetchedRef.current = true;
      fetchAllData();
   }, [fetchAllData]);

   if (!authLoading || loading) {
      return <HomePageSkeleton />;
   }

   const metrics = performanceReport?.performanceMetrics || {};
   const examStats = metrics.examStats || {};
   const overallReadiness = examStats.overallReadiness ?? 0;
   const averageMockScore = examStats.averageMockScore ?? 0;
   const mockTestsAttempted = examStats.mockTestsAttempted ?? 0;
   const streakCount = examStats.streakCount ?? 0;

   return (
      <div className="relative selection:bg-primary-500 selection:text-white font-outfit">
         <div className="space-y-5 md:space-y-6 lg:space-y-8">

            {/* ── Greeting + Stats ── */}
            <section className="px-0 lg:px-4 pt-2 lg:pt-4">
               <div className="flex items-center justify-between mb-3 lg:mb-6">
                  <div>
                     <h1 className="text-xl md:text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                        Hi, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'Student'}</span>
                     </h1>
                     <p className="text-xs lg:text-sm text-slate-400 font-medium mt-0.5">Prepare Your Exam Today</p>
                  </div>
                  {streakCount > 0 && (
                     <div className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 rounded-xl">
                        <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <span className="text-xs font-black text-orange-600 dark:text-orange-400">{streakCount}</span>
                     </div>
                  )}
               </div>

               {/* Quick Stats */}
               <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-slate-100 dark:border-slate-800">
                     <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-primary-500 mb-1.5" />
                     <p className="text-lg md:text-xl lg:text-3xl font-black text-slate-900 dark:text-white">{overallReadiness}%</p>
                     <p className="text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider">Readiness</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-slate-100 dark:border-slate-800">
                     <Target className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500 mb-1.5" />
                     <p className="text-lg md:text-xl lg:text-3xl font-black text-slate-900 dark:text-white">{averageMockScore}%</p>
                     <p className="text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl p-3 lg:p-6 border border-slate-100 dark:border-slate-800">
                     <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-blue-500 mb-1.5" />
                     <p className="text-lg md:text-xl lg:text-3xl font-black text-slate-900 dark:text-white">{mockTestsAttempted}</p>
                     <p className="text-[11px] lg:text-xs font-bold text-slate-400 uppercase tracking-wider">Tests</p>
                  </div>
               </div>
            </section>

            {/* ── Quick Actions ── */}
            <section className="px-0 lg:px-4">
               <div className="grid grid-cols-3 gap-2.5 md:gap-3 lg:gap-4">
                  <button
                     onClick={() => router.push('/govt-exams')}
                     className="bg-emerald-500 rounded-2xl lg:rounded-3xl p-4 lg:p-6 text-center active:scale-[0.98] transition-transform relative overflow-hidden border-b-4 border-emerald-700"
                  >
                     <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                        <Zap className="w-7 h-7 text-white" />
                     </div>
                     <p className="text-white text-[10px] lg:text-xs font-black uppercase tracking-wider">Start Test</p>
                  </button>
                  <button
                     onClick={() => router.push('/blog')}
                     className="bg-primary-500 rounded-2xl lg:rounded-3xl p-4 lg:p-6 text-center active:scale-[0.98] transition-transform relative overflow-hidden border-b-4 border-primary-700"
                  >
                     <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                        <FileText className="w-7 h-7 text-white" />
                     </div>
                     <p className="text-white text-[10px] lg:text-xs font-black uppercase tracking-wider">Blog</p>
                  </button>
                  <button
                     onClick={() => router.push('/community-questions')}
                     className="bg-sky-500 rounded-2xl lg:rounded-3xl p-4 lg:p-6 text-center active:scale-[0.98] transition-transform relative overflow-hidden border-b-4 border-sky-700"
                  >
                     <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-2">
                        <MessageSquare className="w-7 h-7 text-white" />
                     </div>
                     <p className="text-white text-[10px] lg:text-xs font-black uppercase tracking-wider">Community</p>
                  </button>
               </div>
            </section>

            {/* ═══════ GOVT EXAMS ═══════ */}
            <section className="px-0 lg:px-4">
               <SectionHeader
                  title="Govt. Exams"
                  icon={GraduationCap}
                  iconColor="text-red-500"
                  iconBg="bg-red-500/10"
                  onViewAll={() => router.push('/govt-exams')}
               />
               {sectionsLoading.exams ? <SectionSkeleton /> :
                  exams.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {exams.slice(0, 10).map(item => (
                           <GovtExamCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/govt-exams/exam/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">No exams available</p>
                  )
               }
            </section>

            {/* ═══════ QUIZZES ═══════ */}
            <section className="px-0 lg:px-4">
               <SectionHeader
                  title="Quizzes"
                  icon={Brain}
                  iconColor="text-violet-500"
                  iconBg="bg-violet-500/10"
                  onViewAll={() => router.push('/quizzes')}
               />
               {sectionsLoading.quizzes ? <SectionSkeleton /> :
                  quizzes.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {quizzes.slice(0, 10).map(item => (
                           <QuizCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/quiz/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">No quizzes available</p>
                  )
               }
            </section>

            {/* ═══════ SUBJECTS ═══════ */}
            <section className="px-0 lg:px-4">
               <SectionHeader
                  title="Subjects"
                  icon={BookOpen}
                  iconColor="text-sky-500"
                  iconBg="bg-sky-500/10"
                  onViewAll={() => router.push('/subjects')}
               />
               {sectionsLoading.subjects ? <SectionSkeleton /> :
                  subjects.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {subjects.slice(0, 10).map(item => (
                           <SubjectCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/subjects/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">No subjects available</p>
                  )
               }
            </section>

            {/* ═══════ TOPICS ═══════ */}
            <section className="px-0 lg:px-4">
               <SectionHeader
                  title="Topics"
                  icon={Layers}
                  iconColor="text-amber-500"
                  iconBg="bg-amber-500/10"
                  onViewAll={() => router.push('/topics')}
               />
               {sectionsLoading.topics ? <SectionSkeleton /> :
                  topics.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {topics.slice(0, 10).map(item => (
                           <TopicCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push(`/topics/${item.slug}`)}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">No topics available</p>
                  )
               }
            </section>

            {/* ═══════ REELS ═══════ */}
            <section className="px-0 lg:px-4 pb-8">
               <SectionHeader
                  title="Reels"
                  icon={PlayCircle}
                  iconColor="text-pink-500"
                  iconBg="bg-pink-500/10"
                  onViewAll={() => router.push('/reels')}
               />
               {sectionsLoading.reels ? <SectionSkeleton /> :
                  reels.length > 0 ? (
                     <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {reels.slice(0, 10).map(item => (
                           <ReelCard
                              key={item._id}
                              item={item}
                              onClick={() => router.push('/reels')}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="text-sm font-semibold text-slate-400 text-center py-8">No reels available</p>
                  )
               }
            </section>

         </div>
      </div>
   );
};

export default HomePage;
