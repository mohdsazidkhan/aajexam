'use client';

import { AnalyticsPageSkeleton, CardGridSkeleton } from '../../common/skeletons/PageSkeletons';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
   TrendingUp,
   TrendingDown,
   Wallet,
   Trophy,
   Target,
   Users,
   GraduationCap,
   BookOpen,
   Coins,
   Award,
   Zap,
   Star,
   UserPlus,
   Eye,
   Heart,
   Bookmark,
   Share2,
   CheckCircle,
   XCircle,
   Clock,
   BarChart3,
   FileText,
   Play,
   Copy,
   Check,
   ChevronDown,
   ChevronUp
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';

import Link from '@/components/common/AppLink';
import API from '../../../lib/api';
import { fmtNum } from '../../../lib/utils/formatNumber';
import Card from '../../common/ui/Card';
import PageHero from '../../common/ui/PageHero';
import Button from '../../common/ui/Button';
import ProgressBar from '../../common/ui/ProgressBar';
import Pagination from '../../common/Pagination';
import UnifiedFooter from '../../common/UnifiedFooter';
import SubscriptionGuard from '../SubscriptionGuard';
import useTranslate from '../../../hooks/useTranslate';

// --- Helper: Circular Progress Ring ---
const CircleProgress = ({ value = 0, size = 80, strokeWidth = 8, color = '#6366f1' }) => {
   const radius = (size - strokeWidth) / 2;
   const circumference = 2 * Math.PI * radius;
   const offset = circumference - (Math.min(value, 100) / 100) * circumference;
   return (
      <svg width={size} height={size} className="transform -rotate-90">
         <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-border-primary opacity-30" />
         <motion.circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
         />
      </svg>
   );
};

// --- Helper: Stat Mini Card ---
const StatMini = ({ icon: Icon, label, value }) => (
   <div className="relative overflow-hidden flex items-center gap-2.5 p-2.5 bg-background-surface border border-border-primary hover:-translate-y-0.5 transition-all min-w-0" style={{ borderRadius: 12 }}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary-600" />
      <div className="ml-1 w-9 h-9 shrink-0 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 10 }}>
         <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
         <p className="text-base xl:text-lg font-bold font-outfit leading-tight text-primary-600 truncate">{value}</p>
         <p className="text-[9px] font-bold text-content-secondary uppercase tracking-wide leading-tight truncate">{label}</p>
      </div>
   </div>
);

// --- Helper: Section Header ---
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
   <div className="flex items-center gap-2.5 px-1 pb-2 border-b border-dashed border-primary-300/70 dark:border-white/15">
      {Icon && <div className="w-8 h-8 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 10 }}><Icon className="w-4 h-4" /></div>}
      <section>
         <h2 className="text-base xl:text-lg font-bold font-outfit tracking-tight">{title}</h2>
         {subtitle && <p className="text-xs text-content-secondary font-bold">{subtitle}</p>}
      </section>
   </div>
);

const TABS = [
   { key: 'overview', label: 'Overview', icon: BarChart3 },
   { key: 'quizzes', label: 'Quizzes', icon: Zap },
   { key: 'exams', label: 'Exams', icon: GraduationCap },
   { key: 'subjects', label: 'Subjects', icon: BookOpen },
   { key: 'topics', label: 'Topics', icon: Target },
   { key: 'reels', label: 'Reels', icon: Play },
   { key: 'my-reels', label: 'My Reels', icon: FileText },
   { key: 'wallet', label: 'Referral Rewards', icon: Wallet },
];

const MyAnalyticsPage = () => {
  const { translate, translateData } = useTranslate();
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeTab, setActiveTab] = useState('overview');
   const [showAllTopics, setShowAllTopics] = useState(false);
   const [copied, setCopied] = useState(false);
   const [examAttempts, setExamAttempts] = useState([]);
   const [examAttemptsLoaded, setExamAttemptsLoaded] = useState(false);
   const [quizAttempts, setQuizAttempts] = useState([]);
   const [quizPage, setQuizPage] = useState(1);
   const [quizLoading, setQuizLoading] = useState(true);
   const [myReelsList, setMyReelsList] = useState([]);
   const [myReelsPage, setMyReelsPage] = useState(1);
   const [myReelsTotalPages, setMyReelsTotalPages] = useState(1);
   const [myReelsLoading, setMyReelsLoading] = useState(true);
   const [quizTotalPages, setQuizTotalPages] = useState(1);

   useEffect(() => {
      const fetchData = async () => {
         try {
            setLoading(true);
            const res = await API.getAnalytics();
            if (res?.success) setData(res.data);
            else setError(res?.message || translate('Failed to load data'));
         } catch (err) {
            setError(translate('An error occurred.'));
         } finally {
            setLoading(false);
         }
      };
      fetchData();
   }, []);

   // Attempted exams list: loaded the first time the Exams tab is opened
   useEffect(() => {
      if (activeTab !== 'exams' || examAttemptsLoaded) return;
      API.getExamAttemptHistory({ page: 1, limit: 12 })
         .then((res) => {
            const payload = res?.data || res;
            setExamAttempts(payload?.attempts || payload?.items || []);
         })
         .catch(() => {})
         .finally(() => setExamAttemptsLoaded(true));
   }, [activeTab, examAttemptsLoaded]);

   // Attempted quizzes list: server-side paginated, loaded when the Quizzes tab is open
   useEffect(() => {
      if (activeTab !== 'quizzes') return;
      let alive = true;
      setQuizLoading(true);
      API.getMyQuizAttempts({ page: quizPage, limit: 12, status: 'Completed' })
         .then((res) => {
            if (!alive || !res?.success) return;
            setQuizAttempts(res.data || []);
            setQuizTotalPages(res.pagination?.totalPages || 1);
         })
         .catch(() => {})
         .finally(() => { if (alive) setQuizLoading(false); });
      return () => { alive = false; };
   }, [activeTab, quizPage]);

   // Posted reels list: server-side paginated, loaded when the My Reels tab is open
   useEffect(() => {
      if (activeTab !== 'my-reels') return;
      let alive = true;
      setMyReelsLoading(true);
      API.getMyReels({ page: myReelsPage, limit: 12 })
         .then((res) => {
            if (!alive || !res?.success) return;
            setMyReelsList(res.data || []);
            setMyReelsTotalPages(res.pagination?.totalPages || 1);
         })
         .catch(() => {})
         .finally(() => { if (alive) setMyReelsLoading(false); });
      return () => { alive = false; };
   }, [activeTab, myReelsPage]);

   const getReelTitle = (r) => {
      if (r.title) return r.title;
      if (r.type === 'question' && r.questionText) return r.questionText;
      if (r.type === 'poll' && r.pollQuestion) return r.pollQuestion;
      if (r.content) return r.content;
      return 'Untitled Reel';
   };

   const copyReferralCode = () => {
      if (data?.referral?.code) {
         navigator.clipboard.writeText(data.referral.code);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      }
   };

   if (loading) return (
      <div className="min-h-screen pb-6 xl:pb-12">
         <div className="py-2 xl:py-4"><AnalyticsPageSkeleton /></div>
      </div>
   );

   if (error) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 mt-0 xl:mt-16">
         <XCircle className="w-16 h-16 text-content-primary" />
         <p className="text-lg font-bold text-content-secondary">{error}</p>
         <Button variant="primary" onClick={() => window.location.reload()}>{translate('Retry')}</Button>
      </div>
   );

   const { quiz, exam, reel, wallet, referral, followersCount, followingCount } = data || {};

   // Combined accuracy for overview hero
   const overallAccuracy = quiz?.totalAttempts > 0 ? quiz.avgAccuracy : 0;
   const totalActivity = (quiz?.totalAttempts || 0) + (exam?.totalAttempts || 0) + (reel?.totalAnswered || 0);

   return (
      <div className="space-y-2 xl:space-y-3 animate-fade-in mt-3 xl:mt-4 pb-4">
         <Head><title>My Analytics - AajExam</title></Head>

         <SubscriptionGuard message="Upgrade to PRO to unlock advanced analytics, detailed performance tracking, and comprehensive insights into your learning progress.">
            {/* --- Hero Section --- */}
            <PageHero
               icon={Star}
               eyebrow={translate('My Analytics')}
               title={translate('Performance Dashboard')}
               stats={[
                  { icon: Target, value: `${overallAccuracy.toFixed(0)}%`, label: translate('Quiz Accuracy') },
                  { icon: Zap, value: totalActivity, label: translate('Total Activity') },
                  { icon: Wallet, value: wallet?.balance || 0, label: translate('Referral Rewards') },
               ]}
            />

            {/* --- Tab Switcher --- */}
            <section className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 max-w-full p-1.5 bg-background-surface border border-border-primary" style={{ borderRadius: 14 }}>
               {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                     style={{ borderRadius: 999 }} className={`flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-4 py-2 font-bold text-[11px] xl:text-xs uppercase tracking-wide transition-all ${activeTab === tab.key ? 'text-on-primary bg-primary-600' : 'text-content-secondary hover:text-primary-700 dark:hover:text-primary-600 dark:hover:bg-white/10'}`}>
                     <tab.icon className="w-3.5 h-3.5" />
                     {translate(tab.label)}
                  </button>
               ))}
            </section>

            {/* --- Tab Content --- */}
            <AnimatePresence mode="wait">
               <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-3 xl:space-y-4">

                  {/* ======================== OVERVIEW TAB ======================== */}
                  {activeTab === 'overview' && (
                     <>
                        {/* Quick stats — one compact grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-5 gap-2">
                           {[
                              { icon: GraduationCap, value: exam?.totalAttempts || 0, label: 'Exams Done', tone: 'bg-background-surface-secondary text-content-primary' },
                              { icon: Zap, value: quiz?.totalAttempts || 0, label: 'Quizzes Done', tone: 'bg-background-surface-secondary text-content-primary' },
                              { icon: BookOpen, value: quiz?.subjectWise?.length || 0, label: 'Subjects' },
                              { icon: Target, value: quiz?.topicWise?.length || 0, label: 'Topics' },
                              { icon: Play, value: reel?.totalViewed || 0, label: 'Reels Viewed', tone: 'bg-background-surface-secondary text-content-primary' },
                              { icon: FileText, value: data?.myReels?.totalPosted || 0, label: 'Reels Posted', tone: 'dark:bg-slate-700/50 text-primary-600' },
                              { icon: Users, value: followersCount || 0, label: 'Followers', tone: 'dark:bg-slate-700/50 text-primary-600' },
                              { icon: Target, value: followingCount || 0, label: 'Following', tone: 'dark:bg-slate-700/50 text-primary-600' },
                              { icon: Wallet, value: wallet?.balance || 0, label: 'Referral Rewards', tone: 'bg-background-surface-secondary text-content-primary' },
                              { icon: UserPlus, value: referral?.count || 0, label: 'Referrals', tone: 'bg-background-surface-secondary text-content-primary' },
                           ].map((tile) => (
                              <StatMini key={tile.label} icon={tile.icon} value={tile.value} label={translate(tile.label)} />
                           ))}
                        </div>
                     </>
                  )}

                  {/* ======================== QUIZZES TAB ======================== */}
                  {activeTab === 'quizzes' && (
                     <>
                        {/* Overall Quiz Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           <StatMini icon={Zap} label={translate('Total Quizzes')} value={quiz?.totalAttempts || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Target} label={translate('Avg Accuracy')} value={`${quiz?.avgAccuracy || 0}%`} color="text-primary-600" bg="" />
                           <StatMini icon={Trophy} label={translate('Best Score')} value={`${quiz?.bestScore || 0}%`} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Clock} label={translate('Total Time')} value={`${Math.round((quiz?.totalTime || 0) / 60)}m`} color="text-content-primary" bg="bg-background-surface-secondary" />
                        </div>

                        {/* Correct / Wrong / Skipped */}
                        <Card radius="2xl" className="border-border-primary">
                           <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-0.5">
                                    <CheckCircle className="w-4 h-4 text-primary-600" />
                                    <span className="text-xl font-bold font-outfit text-primary-600">{quiz?.totalCorrect || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Correct')}</p>
                              </div>
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-1">
                                    <XCircle className="w-4 h-4 text-content-primary" />
                                    <span className="text-xl font-bold font-outfit text-content-primary">{quiz?.totalWrong || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Wrong')}</p>
                              </div>
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-content-muted" />
                                    <span className="text-xl font-bold font-outfit text-content-muted">{quiz?.totalSkipped || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Skipped')}</p>
                              </div>
                           </div>
                        </Card>

                        {quizLoading && quiz?.totalAttempts > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={Zap} title={translate('Quiz History')} />
                              <CardGridSkeleton count={6} cols="grid-cols-1 xl:grid-cols-3" />
                           </div>
                        )}

                        {!quizLoading && quizAttempts.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                 <SectionHeader icon={Zap} title={translate('Quiz History')} />
                                 <Link href="/student/quiz-history" className="shrink-0 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-on-primary hover:brightness-105 transition-all bg-primary-600" style={{ borderRadius: 999 }}>{translate('View All')}</Link>
                              </div>
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {quizAttempts.map((a, idx) => (
                                    <Link key={a._id || idx} href={`/student/quiz-result/${a._id}`}>
                                       <Card padded={false} className="p-3 hover:-translate-y-0.5 transition-all h-full">
                                          <div className="flex items-start justify-between gap-2">
                                             <div className="min-w-0">
                                                <p className="font-bold text-sm line-clamp-1">{translateData(a.quiz?.title) || translate('Quiz')}</p>
                                                <p className="text-[10px] font-bold text-content-secondary line-clamp-1">{translateData(a.quiz?.subject?.name || '')}{a.quiz?.topic?.name ? ` • ${translateData(a.quiz.topic.name)}` : ''}</p>
                                             </div>
                                             <span className="shrink-0 font-bold text-sm text-primary-600">{Math.round(a.accuracy || 0)}%</span>
                                          </div>
                                          <ProgressBar progress={a.accuracy || 0} height="sm" />
                                          <div className="flex items-center justify-between mt-2 text-[10px] font-bold uppercase tracking-wide text-content-secondary">
                                             <span>{translate('Score')}: {Math.round(a.percentage || 0)}%</span>
                                             <span>{translate('Rank')}: #{a.rank || '-'}</span>
                                             <span>{new Date(a.submittedAt || a.createdAt).toLocaleDateString()}</span>
                                          </div>
                                       </Card>
                                    </Link>
                                 ))}
                              </div>
                              {quizTotalPages > 1 && (
                                 <div className="flex justify-center pt-2">
                                    <Pagination currentPage={quizPage} totalPages={quizTotalPages} onPageChange={setQuizPage} />
                                 </div>
                              )}
                           </div>
                        )}

                        {quiz?.totalAttempts === 0 && (
                           <Card radius="2xl" className="text-center border-border-primary">
                              <Zap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-bold text-content-secondary">{translate('No quiz attempts yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Start practicing to see your performance here!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== EXAMS TAB ======================== */}
                  {activeTab === 'exams' && (
                     <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           <StatMini icon={GraduationCap} label={translate('Total Exams')} value={exam?.totalAttempts || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Target} label={translate('Avg Accuracy')} value={`${exam?.avgAccuracy || 0}%`} color="text-primary-600" bg="" />
                           <StatMini icon={Trophy} label={translate('Best Accuracy')} value={`${exam?.bestAccuracy || 0}%`} color="text-content-primary" bg="bg-background-surface-secondary" />
                        </div>

                        <Card radius="2xl" className="border-border-primary">
                           <div className="grid grid-cols-2 gap-2 text-center">
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-0.5">
                                    <CheckCircle className="w-4 h-4 text-primary-600" />
                                    <span className="text-xl font-bold font-outfit text-primary-600">{exam?.totalCorrect || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Correct')}</p>
                              </div>
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-1">
                                    <XCircle className="w-4 h-4 text-content-primary" />
                                    <span className="text-xl font-bold font-outfit text-content-primary">{exam?.totalWrong || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Wrong')}</p>
                              </div>
                           </div>
                        </Card>

                        {!examAttemptsLoaded && exam?.totalAttempts > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={GraduationCap} title={translate('Exam History')} />
                              <CardGridSkeleton count={6} cols="grid-cols-1 xl:grid-cols-3" />
                           </div>
                        )}

                        {examAttempts.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                 <SectionHeader icon={GraduationCap} title={translate('Exam History')} />
                                 <Link href="/student/exam-history" className="shrink-0 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-on-primary hover:brightness-105 transition-all bg-primary-600" style={{ borderRadius: 999 }}>{translate('View All')}</Link>
                              </div>
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {examAttempts.map((a, idx) => (
                                    <Link key={a._id || idx} href={`/govt-exams/test/${a.practiceTest}/result?attempt=${a._id}`}>
                                       <Card padded={false} className="p-3 hover:-translate-y-0.5 transition-all h-full">
                                          <div className="flex items-start justify-between gap-2">
                                             <div className="min-w-0">
                                                <p className="font-bold text-sm line-clamp-1">{translateData(a.testTitle) || translate('Exam')}</p>
                                                <p className="text-[10px] font-bold text-content-secondary line-clamp-1">{translateData(a.examName) || translate('Standard Exam')}{a.patternTitle ? ` • ${translateData(a.patternTitle)}` : ''}</p>
                                             </div>
                                             <span className="shrink-0 font-bold text-sm text-primary-600">{Math.round(a.accuracy || 0)}%</span>
                                          </div>
                                          <ProgressBar progress={a.accuracy || 0} height="sm" />
                                          <div className="flex items-center justify-between mt-2 text-[10px] font-bold uppercase tracking-wide text-content-secondary">
                                             <span>{translate('Score')}: {fmtNum(a.score)} / {fmtNum(a.totalMarks)}</span>
                                             <span>{translate('Rank')}: #{a.rank || 'N/A'}</span>
                                             <span>{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : ''}</span>
                                          </div>
                                       </Card>
                                    </Link>
                                 ))}
                              </div>
                           </div>
                        )}

                        {exam?.totalAttempts === 0 && (
                           <Card radius="2xl" className="text-center border-border-primary">
                              <GraduationCap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-bold text-content-secondary">{translate('No exam attempts yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Attempt practice tests to track your exam performance!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== SUBJECTS TAB ======================== */}
                  {activeTab === 'subjects' && (
                     <>
                        {/* Subject Wise */}
                        {quiz?.subjectWise?.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={BookOpen} title={translate('Subject Wise Performance')} />
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {quiz.subjectWise.map((s, idx) => {
                                    return (
                                       <Card key={idx} radius="2xl" className="border-border-primary">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                             <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
                                                   <span className="font-bold text-base">{translateData(s.name)}</span>
                                                   <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-bold text-content-secondary">
                                                      <span className="text-primary-600">{translate('{count} correct', { count: s.totalCorrect })}</span>
                                                      <span className="text-content-primary">{translate('{count} wrong', { count: s.totalWrong })}</span>
                                                      <span>{translate('{count} attempts', { count: s.attempts })}</span>
                                                   </div>
                                                </div>
                                                <ProgressBar progress={s.avgAccuracy} height="sm" showPercentage label={translate('Accuracy')} />
                                             </div>
                                          </div>
                                       </Card>
                                    );
                                 })}
                              </div>
                           </div>
                        )}

                        {quiz?.totalAttempts === 0 && (
                           <Card radius="2xl" className="text-center border-border-primary">
                              <Zap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-bold text-content-secondary">{translate('No quiz attempts yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Start practicing to see your performance here!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== TOPICS TAB ======================== */}
                  {activeTab === 'topics' && (
                     <>
                        {/* Topic Wise */}
                        {quiz?.topicWise?.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={Target} title={translate('Topic Wise Performance')} />
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {(showAllTopics ? quiz.topicWise : quiz.topicWise.slice(0, 6)).map((tp, idx) => (
                                    <Card as="article" key={idx} radius="2xl" className="border-border-primary">
                                       <div className="flex items-center justify-between gap-2">
                                          <div>
                                             <p className="font-bold text-sm">{translateData(tp.name)}</p>
                                             <p className="text-[10px] font-bold text-content-secondary">{translateData(tp.subjectName)} &bull; {translate('{count} attempts', { count: tp.attempts })}</p>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <span className="text-primary-600 text-xs font-bold">{tp.totalCorrect}  </span>
                                             <span className="text-content-primary text-xs font-bold">{tp.totalWrong}  </span>
                                             <span className="font-bold text-sm text-primary-600">{tp.avgAccuracy}%</span>
                                          </div>
                                       </div>
                                    </Card>
                                 ))}
                                 {quiz.topicWise.length > 6 && (
                                    <button onClick={() => setShowAllTopics(!showAllTopics)}
                                       className="xl:col-span-3 flex items-center justify-center gap-2 mx-auto text-primary-600 font-bold text-sm py-2">
                                       {showAllTopics ? <><ChevronUp className="w-4 h-4" /> {translate('Show Less')}</> : <><ChevronDown className="w-4 h-4" /> {translate('Show All {count} Topics', { count: quiz.topicWise.length })}</>}
                                    </button>
                                 )}
                              </div>
                           </div>
                        )}

                        {quiz?.totalAttempts === 0 && (
                           <Card radius="2xl" className="text-center border-border-primary">
                              <Zap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-bold text-content-secondary">{translate('No quiz attempts yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Start practicing to see your performance here!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== REELS TAB ======================== */}
                  {activeTab === 'reels' && (
                     <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           <StatMini icon={Eye} label={translate('Reels Viewed')} value={reel?.totalViewed || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={CheckCircle} label={translate('Questions Answered')} value={reel?.totalAnswered || 0} color="text-primary-600" bg="" />
                           <StatMini icon={Target} label={translate('Reel Accuracy')} value={`${reel?.accuracy || 0}%`} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Clock} label={translate('Time Spent')} value={`${Math.round((reel?.totalTimeSpent || 0) / 60)}m`} color="text-content-primary" bg="bg-background-surface-secondary" />
                        </div>

                        {/* Engagement Stats */}
                        <Card radius="2xl" className="border-border-primary">
                           <p className="font-bold text-xs uppercase text-content-secondary mb-2">{translate('Engagement')}</p>
                           <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                 <Heart className="w-5 h-5 text-content-primary mx-auto mb-1" />
                                 <p className="text-xl font-bold font-outfit">{reel?.totalLiked || 0}</p>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Liked')}</p>
                              </div>
                              <div>
                                 <Bookmark className="w-5 h-5 text-content-primary mx-auto mb-1" />
                                 <p className="text-xl font-bold font-outfit">{reel?.totalBookmarked || 0}</p>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Saved')}</p>
                              </div>
                              <div>
                                 <Share2 className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                                 <p className="text-xl font-bold font-outfit">{reel?.totalShared || 0}</p>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Shared')}</p>
                              </div>
                           </div>
                        </Card>

                        {/* Reel Subject Wise */}
                        {reel?.subjectWise?.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={BookOpen} title={translate('Reel Subject Performance')} />
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {reel.subjectWise.map((s, idx) => {
                                    return (
                                       <Card key={idx} radius="2xl" className="border-border-primary">
                                          <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 mb-2">
                                             <span className="font-bold text-base">{s.subject}</span>
                                             <span className="text-xs font-bold text-content-secondary">{translate('{correct}/{attempted} correct', { correct: s.correct, attempted: s.attempted })}</span>
                                          </div>
                                          <ProgressBar progress={s.accuracy} height="sm" showPercentage label={translate('Accuracy')} />
                                       </Card>
                                    );
                                 })}
                              </div>
                           </div>
                        )}

                        {reel?.totalViewed === 0 && (
                           <Card radius="2xl" className="text-center border-border-primary">
                              <Play className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-bold text-content-secondary">{translate('No reel activity yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Start watching reels to learn on the go!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== MY REELS TAB ======================== */}
                  {activeTab === 'my-reels' && (
                     <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           <StatMini icon={FileText} label={translate('Reels Posted')} value={data?.myReels?.totalPosted || 0} color="text-primary-600" bg="" />
                           <StatMini icon={Eye} label={translate('Views')} value={data?.myReels?.totalViews || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Heart} label={translate('Liked')} value={data?.myReels?.totalLikes || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Bookmark} label={translate('Saved')} value={data?.myReels?.totalBookmarks || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Share2} label={translate('Shared')} value={data?.myReels?.totalShares || 0} color="text-primary-600" bg="" />
                           <StatMini icon={CheckCircle} label={translate('Questions Answered')} value={data?.myReels?.totalAnswered || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Target} label={translate('Correct')} value={data?.myReels?.totalCorrect || 0} color="text-primary-600" bg="" />
                        </div>

                        <Card radius="2xl" className="border-border-primary">
                           <p className="font-bold text-xs uppercase text-content-secondary mb-2">{translate('Status')}</p>
                           <div className="grid grid-cols-4 gap-2 text-center">
                              {[
                                 { label: 'Published', value: data?.myReels?.published || 0, tone: 'text-primary-600' },
                                 { label: 'Pending', value: data?.myReels?.pending || 0, tone: 'text-content-primary' },
                                 { label: 'Rejected', value: data?.myReels?.rejected || 0, tone: 'text-content-primary' },
                                 { label: 'Draft', value: data?.myReels?.draft || 0, tone: 'text-content-muted' },
                              ].map((item) => (
                                 <div key={item.label}>
                                    <p className={`text-xl font-bold font-outfit ${item.tone}`}>{item.value}</p>
                                    <p className="text-[10px] font-bold text-content-secondary uppercase">{translate(item.label)}</p>
                                 </div>
                              ))}
                           </div>
                        </Card>

                        {myReelsLoading && data?.myReels?.totalPosted > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={FileText} title={translate('My Reels')} />
                              <CardGridSkeleton count={6} cols="grid-cols-1 xl:grid-cols-3" />
                           </div>
                        )}

                        {!myReelsLoading && myReelsList.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <div className="flex items-center justify-between gap-2">
                                 <SectionHeader icon={FileText} title={translate('My Reels')} />
                                 <Link href="/student/my-reels" className="shrink-0 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-on-primary hover:brightness-105 transition-all bg-primary-600" style={{ borderRadius: 999 }}>{translate('View All')}</Link>
                              </div>
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {myReelsList.map((r, idx) => (
                                    <Card as="article" key={r._id || idx} padded={false} className="p-3 h-full flex flex-col gap-2">
                                       <div className="flex items-center justify-between gap-2">
                                          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary-600" style={{ borderRadius: 999 }}>{translate(r.type === 'current_affairs' ? 'Current Affairs' : r.type === 'tip' ? 'Tip' : r.type === 'fact' ? 'Fact' : r.type === 'poll' ? 'Poll' : 'Question')}</span>
                                          <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase ${r.status === 'published' ? 'bg-primary-500 text-on-primary' : r.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-background-surface-secondary text-content-secondary'}`} style={{ borderRadius: 999 }}>{translate(r.status === 'published' ? 'Published' : r.status === 'pending' ? 'Pending' : r.status === 'rejected' ? 'Rejected' : r.status === 'archived' ? 'Archived' : 'Draft')}</span>
                                       </div>
                                       <p className="flex-1 font-bold text-sm line-clamp-3 leading-snug">{getReelTitle(r)}</p>
                                       <div className="flex items-center justify-between text-[10px] font-bold text-content-secondary pt-2 border-t border-border-primary">
                                          <div className="flex items-center gap-3">
                                             <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{r.viewsCount || 0}</span>
                                             <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{r.likesCount || 0}</span>
                                             <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{r.bookmarksCount || 0}</span>
                                             <span className="flex items-center gap-1"><Share2 className="w-3 h-3" />{r.sharesCount || 0}</span>
                                          </div>
                                          <span>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                       </div>
                                    </Card>
                                 ))}
                              </div>
                              {myReelsTotalPages > 1 && (
                                 <div className="flex justify-center pt-2">
                                    <Pagination currentPage={myReelsPage} totalPages={myReelsTotalPages} onPageChange={setMyReelsPage} />
                                 </div>
                              )}
                           </div>
                        )}

                        {!data?.myReels?.totalPosted && (
                           <Card radius="2xl" className="text-center border-border-primary">
                              <FileText className="w-10 h-10 text-content-secondary mx-auto mb-2 opacity-30" />
                              <p className="font-bold text-content-secondary">{translate('No reels posted yet')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== WALLET TAB ======================== */}
                  {activeTab === 'wallet' && (
                     <>
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                           <Card padded={false} radius="xl" className="col-span-2 xl:col-span-1 text-on-primary border-none flex items-center gap-2.5 p-2.5 bg-primary-600">
                              <div className="w-9 h-9 shrink-0 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 10 }}><Wallet className="w-4 h-4" /></div>
                              <div className="min-w-0">
                                 <p className="text-xl font-bold font-outfit leading-tight">{wallet?.balance || 0}</p>
                                 <p className="text-[9px] font-bold opacity-70 uppercase leading-tight">{translate('Referral Rewards')}</p>
                              </div>
                           </Card>
                           <StatMini icon={TrendingUp} label={translate('Total Earned')} value={wallet?.totalEarnings || 0} color="text-primary-600" bg="" />
                           <StatMini icon={TrendingDown} label={translate('Total Spent')} value={wallet?.totalExpenses || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={Coins} label={translate('Total Referral Rewards')} value={referral?.totalRewards || 0} color="text-primary-600" bg="" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                           <StatMini icon={BookOpen} label={translate('Blog Earnings')} value={wallet?.blogEarnings || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <StatMini icon={UserPlus} label={translate('Referral Rewards')} value={wallet?.referralRewards || 0} color="text-content-primary" bg="bg-background-surface-secondary" />
                           <Card padded={false} radius="xl" className="flex items-center gap-2.5 p-2.5 border-border-primary">
                              <div className="min-w-0 flex-1">
                                 <p className="text-[9px] font-bold text-content-secondary uppercase leading-tight">{translate('Your Referral Code')}</p>
                                 <p className="font-bold text-base font-mono tracking-[0.08em] leading-tight truncate">{referral?.code || '---'}</p>
                              </div>
                              <button onClick={copyReferralCode} aria-label={translate('Copy')}
                                 className="p-2 text-on-primary hover:brightness-105 rounded-lg shrink-0 transition-all bg-primary-600">
                                 {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                           </Card>
                        </div>
                     </>
                  )}

               </motion.div>
            </AnimatePresence>
         </SubscriptionGuard>
      </div>
);
};

export default MyAnalyticsPage;
