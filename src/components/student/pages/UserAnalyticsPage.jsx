'use client';

import { AnalyticsPageSkeleton } from '../../common/skeletons/PageSkeletons';
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

import API from '../../../lib/api';
import Card from '../../common/ui/Card';
import Button from '../../common/ui/Button';
import ProgressBar from '../../common/ui/ProgressBar';
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
const StatMini = ({ icon: Icon, label, value, color = 'text-primary-600', bg = 'bg-primary-50' }) => (
   <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-background-surface border-2 border-slate-200 dark:border-slate-800 shadow-sm min-w-0">
      <div className={`p-2 rounded-lg shrink-0 ${bg} dark:bg-slate-700/50 ${color}`}>
         <Icon className="w-4 h-4" />
      </div>
      <div>
         <p className="text-base xl:text-lg font-black font-outfit leading-tight">{value}</p>
         <p className="text-[9px] font-black text-content-secondary uppercase leading-tight truncate">{label}</p>
      </div>
   </div>
);

// --- Helper: Section Header ---
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
   <div className="flex items-center gap-2 px-1">
      {Icon && <div className="p-1.5 bg-primary-50 dark:bg-slate-700/50 text-primary-600 rounded-lg"><Icon className="w-4 h-4" /></div>}
      <div>
         <h2 className="text-base xl:text-lg font-black font-outfit">{title}</h2>
         {subtitle && <p className="text-xs text-content-secondary font-bold">{subtitle}</p>}
      </div>
   </div>
);

const TABS = [
   { key: 'overview', label: 'Overview', icon: BarChart3 },
   { key: 'quizzes', label: 'Quizzes', icon: Zap },
   { key: 'exams', label: 'Exams', icon: GraduationCap },
   { key: 'reels', label: 'Reels', icon: Play },
   { key: 'my-reels', label: 'My Reels', icon: FileText },
   { key: 'wallet', label: 'Wallet', icon: Wallet },
];

const MyAnalyticsPage = () => {
  const { translate, translateData } = useTranslate();
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [activeTab, setActiveTab] = useState('overview');
   const [showAllTopics, setShowAllTopics] = useState(false);
   const [copied, setCopied] = useState(false);

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
         <XCircle className="w-16 h-16 text-black dark:text-white" />
         <p className="text-lg font-black text-content-secondary">{error}</p>
         <Button variant="primary" onClick={() => window.location.reload()}>{translate('Retry')}</Button>
      </div>
   );

   const { quiz, exam, reel, wallet, referral, followersCount, followingCount } = data || {};

   // Combined accuracy for overview hero
   const overallAccuracy = quiz?.totalAttempts > 0 ? quiz.avgAccuracy : 0;
   const totalActivity = (quiz?.totalAttempts || 0) + (exam?.totalAttempts || 0) + (reel?.totalAnswered || 0);

   return (
      <div className="space-y-2 xl:space-y-3 animate-fade-in mt-2 pb-4">
         <Head><title>My Analytics - AajExam</title></Head>

         <SubscriptionGuard message="Upgrade to PRO to unlock advanced analytics, detailed performance tracking, and comprehensive insights into your learning progress.">
            {/* --- Hero Section --- */}
            <section className="relative">
               <Card className="bg-primary-600 text-white border-none shadow-sm overflow-hidden relative rounded-2xl">
                  <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-2 xl:gap-6">
                     <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 xl:gap-3">
                        <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                           <Star className="w-3.5 h-3.5 fill-white text-white" />
                           {translate('My Analytics')}
                        </div>
                        <h1 className="text-lg xl:text-xl font-black font-outfit">{translate('Performance Dashboard')}</h1>
                     </div>
                     <div className="flex items-center gap-4 xl:gap-6">
                        <div className="text-center">
                           <p className="text-lg xl:text-xl font-black font-outfit leading-tight">{overallAccuracy.toFixed(0)}%</p>
                           <p className="text-[10px] font-black opacity-60 uppercase">{translate('Quiz Accuracy')}</p>
                        </div>
                        <div className="h-8 xl:h-10 w-0.5 bg-white/20 rounded-full" />
                        <div className="text-center">
                           <p className="text-lg xl:text-xl font-black font-outfit leading-tight">{totalActivity}</p>
                           <p className="text-[10px] font-black opacity-60 uppercase">{translate('Total Activity')}</p>
                        </div>
                        <div className="h-8 xl:h-10 w-0.5 bg-white/20 rounded-full hidden sm:block" />
                        <div className="text-center hidden sm:block">
                           <p className="text-lg xl:text-xl font-black font-outfit leading-tight">{wallet?.balance || 0}</p>
                           <p className="text-[10px] font-black opacity-60 uppercase">{translate('Wallet')}</p>
                        </div>
                     </div>
                  </div>
                  <GraduationCap className="absolute -bottom-6 -right-6 w-32 h-32 text-white/10 rotate-12" />
               </Card>
            </section>

            {/* --- Tab Switcher --- */}
            <section className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 max-w-full px-0 py-0.5">
               {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                     className={`flex-shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-full font-black text-[11px] uppercase transition-all ${activeTab === tab.key ? 'bg-primary-600 text-white shadow-sm' : 'text-content-secondary hover:text-content-primary'}`}>
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
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           {[
                              { icon: Zap, value: quiz?.totalAttempts || 0, label: 'Quizzes Done', tone: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' },
                              { icon: GraduationCap, value: exam?.totalAttempts || 0, label: 'Exams Done', tone: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' },
                              { icon: Play, value: reel?.totalViewed || 0, label: 'Reels Viewed', tone: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' },
                              { icon: FileText, value: data?.myReels?.totalPosted || 0, label: 'Reels Posted', tone: 'bg-primary-50 dark:bg-slate-700/50 text-primary-600' },
                              { icon: Users, value: followersCount || 0, label: 'Followers', tone: 'bg-primary-50 dark:bg-slate-700/50 text-primary-600' },
                              { icon: Target, value: followingCount || 0, label: 'Following', tone: 'bg-primary-50 dark:bg-slate-700/50 text-primary-600' },
                              { icon: Wallet, value: wallet?.balance || 0, label: 'Wallet Balance', tone: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' },
                              { icon: UserPlus, value: referral?.count || 0, label: 'Referrals', tone: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' },
                           ].map((tile) => (
                              <Card key={tile.label} padded={false} radius="xl" className="flex items-center gap-2.5 p-2.5 border-slate-200 dark:border-slate-800">
                                 <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${tile.tone}`}><tile.icon className="w-4 h-4" /></div>
                                 <div className="min-w-0">
                                    <p className="text-base xl:text-lg font-black font-outfit leading-tight">{tile.value}</p>
                                    <p className="text-[9px] font-black text-content-secondary uppercase leading-tight truncate">{translate(tile.label)}</p>
                                 </div>
                              </Card>
                           ))}
                        </div>

                        {/* Subject-wise Quick View (from quiz) */}
                        {quiz?.subjectWise?.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={BarChart3} title={translate('Subject Performance')} />
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {quiz.subjectWise.map((s, idx) => {
                                    return (
                                       <Card key={idx} radius="2xl" className="border-slate-200 dark:border-slate-800 space-y-2">
                                          <div className="flex justify-between items-center">
                                             <span className="font-black text-base">{translateData(s.name)}</span>
                                             <span className="text-xs font-bold text-content-secondary">{translate('{count} attempts', { count: s.attempts })}</span>
                                          </div>
                                          <ProgressBar progress={s.avgAccuracy} height="sm" showPercentage label={translate('Accuracy')} />
                                       </Card>
                                    );
                                 })}
                              </div>
                           </div>
                        )}
                     </>
                  )}

                  {/* ======================== QUIZZES TAB ======================== */}
                  {activeTab === 'quizzes' && (
                     <>
                        {/* Overall Quiz Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           <StatMini icon={Zap} label={translate('Total Quizzes')} value={quiz?.totalAttempts || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Target} label={translate('Avg Accuracy')} value={`${quiz?.avgAccuracy || 0}%`} color="text-primary-600" bg="bg-primary-50" />
                           <StatMini icon={Trophy} label={translate('Best Score')} value={`${quiz?.bestScore || 0}%`} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Clock} label={translate('Total Time')} value={`${Math.round((quiz?.totalTime || 0) / 60)}m`} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                        </div>

                        {/* Correct / Wrong / Skipped */}
                        <Card radius="2xl" className="border-slate-200 dark:border-slate-800">
                           <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-0.5">
                                    <CheckCircle className="w-4 h-4 text-primary-600" />
                                    <span className="text-xl font-black font-outfit text-primary-600">{quiz?.totalCorrect || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-black text-content-secondary uppercase">{translate('Correct')}</p>
                              </div>
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-1">
                                    <XCircle className="w-4 h-4 text-black dark:text-white" />
                                    <span className="text-xl font-black font-outfit text-black dark:text-white">{quiz?.totalWrong || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-black text-content-secondary uppercase">{translate('Wrong')}</p>
                              </div>
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-1">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-xl font-black font-outfit text-gray-500">{quiz?.totalSkipped || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-black text-content-secondary uppercase">{translate('Skipped')}</p>
                              </div>
                           </div>
                        </Card>

                        {/* Subject Wise */}
                        {quiz?.subjectWise?.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={BookOpen} title={translate('Subject Wise Performance')} />
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {quiz.subjectWise.map((s, idx) => {
                                    return (
                                       <Card key={idx} radius="2xl" className="border-slate-200 dark:border-slate-800">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                             <div className="flex-1 space-y-2">
                                                <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1">
                                                   <span className="font-black text-base">{translateData(s.name)}</span>
                                                   <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-bold text-content-secondary">
                                                      <span className="text-primary-600">{translate('{count} correct', { count: s.totalCorrect })}</span>
                                                      <span className="text-black dark:text-white">{translate('{count} wrong', { count: s.totalWrong })}</span>
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

                        {/* Topic Wise */}
                        {quiz?.topicWise?.length > 0 && (
                           <div className="space-y-2 xl:space-y-3">
                              <SectionHeader icon={Target} title={translate('Topic Wise Performance')} />
                              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-3">
                                 {(showAllTopics ? quiz.topicWise : quiz.topicWise.slice(0, 6)).map((tp, idx) => (
                                    <Card key={idx} radius="2xl" className="border-slate-200 dark:border-slate-800">
                                       <div className="flex items-center justify-between gap-2">
                                          <div>
                                             <p className="font-black text-sm">{translateData(tp.name)}</p>
                                             <p className="text-[10px] font-bold text-content-secondary">{translateData(tp.subjectName)} &bull; {translate('{count} attempts', { count: tp.attempts })}</p>
                                          </div>
                                          <div className="flex items-center gap-3">
                                             <span className="text-primary-600 text-xs font-bold">{tp.totalCorrect}  </span>
                                             <span className="text-black dark:text-white text-xs font-bold">{tp.totalWrong}  </span>
                                             <span className="font-black text-sm text-primary-600">{tp.avgAccuracy}%</span>
                                          </div>
                                       </div>
                                    </Card>
                                 ))}
                                 {quiz.topicWise.length > 6 && (
                                    <button onClick={() => setShowAllTopics(!showAllTopics)}
                                       className="xl:col-span-3 flex items-center justify-center gap-2 mx-auto text-primary-600 font-black text-sm py-2">
                                       {showAllTopics ? <><ChevronUp className="w-4 h-4" /> {translate('Show Less')}</> : <><ChevronDown className="w-4 h-4" /> {translate('Show All {count} Topics', { count: quiz.topicWise.length })}</>}
                                    </button>
                                 )}
                              </div>
                           </div>
                        )}

                        {quiz?.totalAttempts === 0 && (
                           <Card radius="2xl" className="text-center border-slate-200 dark:border-slate-800">
                              <Zap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-black text-content-secondary">{translate('No quiz attempts yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Start practicing to see your performance here!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== EXAMS TAB ======================== */}
                  {activeTab === 'exams' && (
                     <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                           <StatMini icon={GraduationCap} label={translate('Total Exams')} value={exam?.totalAttempts || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Target} label={translate('Avg Accuracy')} value={`${exam?.avgAccuracy || 0}%`} color="text-primary-600" bg="bg-primary-50" />
                           <StatMini icon={Trophy} label={translate('Best Accuracy')} value={`${exam?.bestAccuracy || 0}%`} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                        </div>

                        <Card radius="2xl" className="border-slate-200 dark:border-slate-800">
                           <div className="grid grid-cols-2 gap-2 text-center">
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-0.5">
                                    <CheckCircle className="w-4 h-4 text-primary-600" />
                                    <span className="text-xl font-black font-outfit text-primary-600">{exam?.totalCorrect || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-black text-content-secondary uppercase">{translate('Correct')}</p>
                              </div>
                              <div>
                                 <div className="flex items-center justify-center gap-2 mb-1">
                                    <XCircle className="w-4 h-4 text-black dark:text-white" />
                                    <span className="text-xl font-black font-outfit text-black dark:text-white">{exam?.totalWrong || 0}</span>
                                 </div>
                                 <p className="text-[10px] font-black text-content-secondary uppercase">{translate('Wrong')}</p>
                              </div>
                           </div>
                        </Card>

                        {exam?.totalAttempts === 0 && (
                           <Card radius="2xl" className="text-center border-slate-200 dark:border-slate-800">
                              <GraduationCap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-black text-content-secondary">{translate('No exam attempts yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Attempt practice tests to track your exam performance!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== REELS TAB ======================== */}
                  {activeTab === 'reels' && (
                     <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           <StatMini icon={Eye} label={translate('Reels Viewed')} value={reel?.totalViewed || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={CheckCircle} label={translate('Questions Answered')} value={reel?.totalAnswered || 0} color="text-primary-600" bg="bg-primary-50" />
                           <StatMini icon={Target} label={translate('Reel Accuracy')} value={`${reel?.accuracy || 0}%`} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Clock} label={translate('Time Spent')} value={`${Math.round((reel?.totalTimeSpent || 0) / 60)}m`} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                        </div>

                        {/* Engagement Stats */}
                        <Card radius="2xl" className="border-slate-200 dark:border-slate-800">
                           <p className="font-black text-xs uppercase text-content-secondary mb-2">{translate('Engagement')}</p>
                           <div className="grid grid-cols-3 gap-2 text-center">
                              <div>
                                 <Heart className="w-5 h-5 text-black dark:text-white mx-auto mb-1" />
                                 <p className="text-xl font-black font-outfit">{reel?.totalLiked || 0}</p>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Liked')}</p>
                              </div>
                              <div>
                                 <Bookmark className="w-5 h-5 text-black dark:text-white mx-auto mb-1" />
                                 <p className="text-xl font-black font-outfit">{reel?.totalBookmarked || 0}</p>
                                 <p className="text-[10px] font-bold text-content-secondary uppercase">{translate('Saved')}</p>
                              </div>
                              <div>
                                 <Share2 className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                                 <p className="text-xl font-black font-outfit">{reel?.totalShared || 0}</p>
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
                                       <Card key={idx} radius="2xl" className="border-slate-200 dark:border-slate-800">
                                          <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-1 mb-2">
                                             <span className="font-black text-base">{s.subject}</span>
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
                           <Card radius="2xl" className="text-center border-slate-200 dark:border-slate-800">
                              <Play className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                              <p className="font-black text-content-secondary">{translate('No reel activity yet')}</p>
                              <p className="text-xs text-content-secondary mt-1">{translate('Start watching reels to learn on the go!')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== MY REELS TAB ======================== */}
                  {activeTab === 'my-reels' && (
                     <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           <StatMini icon={FileText} label={translate('Reels Posted')} value={data?.myReels?.totalPosted || 0} color="text-primary-600" bg="bg-primary-50" />
                           <StatMini icon={Eye} label={translate('Views')} value={data?.myReels?.totalViews || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Heart} label={translate('Liked')} value={data?.myReels?.totalLikes || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Bookmark} label={translate('Saved')} value={data?.myReels?.totalBookmarks || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Share2} label={translate('Shared')} value={data?.myReels?.totalShares || 0} color="text-primary-600" bg="bg-primary-50" />
                           <StatMini icon={CheckCircle} label={translate('Questions Answered')} value={data?.myReels?.totalAnswered || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Target} label={translate('Correct')} value={data?.myReels?.totalCorrect || 0} color="text-primary-600" bg="bg-primary-50" />
                        </div>

                        <Card radius="2xl" className="border-slate-200 dark:border-slate-800">
                           <p className="font-black text-xs uppercase text-content-secondary mb-2">{translate('Status')}</p>
                           <div className="grid grid-cols-4 gap-2 text-center">
                              {[
                                 { label: 'Published', value: data?.myReels?.published || 0, tone: 'text-primary-600' },
                                 { label: 'Pending', value: data?.myReels?.pending || 0, tone: 'text-black dark:text-white' },
                                 { label: 'Rejected', value: data?.myReels?.rejected || 0, tone: 'text-black dark:text-white' },
                                 { label: 'Draft', value: data?.myReels?.draft || 0, tone: 'text-gray-500' },
                              ].map((item) => (
                                 <div key={item.label}>
                                    <p className={`text-xl font-black font-outfit ${item.tone}`}>{item.value}</p>
                                    <p className="text-[10px] font-black text-content-secondary uppercase">{translate(item.label)}</p>
                                 </div>
                              ))}
                           </div>
                        </Card>

                        {!data?.myReels?.totalPosted && (
                           <Card radius="2xl" className="text-center border-slate-200 dark:border-slate-800">
                              <FileText className="w-10 h-10 text-content-secondary mx-auto mb-2 opacity-30" />
                              <p className="font-black text-content-secondary">{translate('No reels posted yet')}</p>
                           </Card>
                        )}
                     </>
                  )}

                  {/* ======================== WALLET TAB ======================== */}
                  {activeTab === 'wallet' && (
                     <>
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                           <Card padded={false} radius="xl" className="col-span-2 xl:col-span-1 bg-primary-600 text-white border-none shadow-sm flex items-center gap-2.5 p-2.5">
                              <div className="p-2 bg-white/20 rounded-lg shrink-0"><Wallet className="w-4 h-4" /></div>
                              <div className="min-w-0">
                                 <p className="text-xl font-black font-outfit leading-tight">{wallet?.balance || 0}</p>
                                 <p className="text-[9px] font-black opacity-70 uppercase leading-tight">{translate('Wallet Balance')}</p>
                              </div>
                           </Card>
                           <StatMini icon={TrendingUp} label={translate('Total Earned')} value={wallet?.totalEarnings || 0} color="text-primary-600" bg="bg-primary-50" />
                           <StatMini icon={TrendingDown} label={translate('Total Spent')} value={wallet?.totalExpenses || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={Coins} label={translate('Total Referral Rewards')} value={referral?.totalRewards || 0} color="text-primary-600" bg="bg-primary-50" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                           <StatMini icon={BookOpen} label={translate('Blog Earnings')} value={wallet?.blogEarnings || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <StatMini icon={UserPlus} label={translate('Referral Rewards')} value={wallet?.referralRewards || 0} color="text-black dark:text-white" bg="bg-slate-100 dark:bg-slate-800" />
                           <Card padded={false} radius="xl" className="flex items-center gap-2.5 p-2.5 border-slate-200 dark:border-slate-800">
                              <div className="min-w-0 flex-1">
                                 <p className="text-[9px] font-black text-content-secondary uppercase leading-tight">{translate('Your Referral Code')}</p>
                                 <p className="font-black text-base font-mono tracking-wider leading-tight truncate">{referral?.code || '---'}</p>
                              </div>
                              <button onClick={copyReferralCode} aria-label={translate('Copy')}
                                 className="p-2 bg-primary-600 text-white rounded-lg shrink-0 transition-colors">
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
