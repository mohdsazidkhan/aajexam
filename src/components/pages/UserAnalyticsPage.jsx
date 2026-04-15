'use client';

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
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../lib/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import Skeleton from '../Skeleton';

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
const StatMini = ({ icon: Icon, label, value, color = 'text-primary-500', bg = 'bg-primary-50' }) => (
   <div className="flex items-center gap-3 p-3 rounded-2xl bg-background-surface-secondary/50">
      <div className={`p-2 rounded-xl ${bg} dark:bg-slate-700/50 ${color}`}>
         <Icon className="w-4 h-4" />
      </div>
      <div>
         <p className="text-lg font-black font-outfit leading-tight">{value}</p>
         <p className="text-[10px] font-bold text-content-secondary uppercase">{label}</p>
      </div>
   </div>
);

// --- Helper: Section Header ---
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
   <div className="flex items-center gap-3 px-1">
      {Icon && <div className="p-2.5 bg-primary-50 dark:bg-slate-700/50 text-primary-500 rounded-2xl"><Icon className="w-5 h-5" /></div>}
      <div>
         <h2 className="text-lg lg:text-xl font-black font-outfit">{title}</h2>
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
            else setError(res?.message || 'Failed to load data');
         } catch (err) {
            setError('An error occurred.');
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
      <div className="space-y-6 animate-fade-in mt-0 lg:mt-16">
         <Skeleton height="140px" borderRadius="2rem" />
         <div className="flex gap-3 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height="44px" width="100px" borderRadius="1.5rem" />)}
         </div>
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} height="100px" borderRadius="1.5rem" />)}
         </div>
         <Skeleton height="300px" borderRadius="1.5rem" />
      </div>
   );

   if (error) return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 mt-0 lg:mt-16">
         <XCircle className="w-16 h-16 text-red-400" />
         <p className="text-lg font-black text-content-secondary">{error}</p>
         <Button variant="primary" onClick={() => window.location.reload()}>Retry</Button>
      </div>
   );

   const { quiz, exam, reel, wallet, referral, followersCount, followingCount } = data || {};

   // Combined accuracy for overview hero
   const overallAccuracy = quiz?.totalAttempts > 0 ? quiz.avgAccuracy : 0;
   const totalActivity = (quiz?.totalAttempts || 0) + (exam?.totalAttempts || 0) + (reel?.totalAnswered || 0);

   return (
      <div className="space-y-6 lg:space-y-8 animate-fade-in mt-0 pb-4">
         <Head><title>My Analytics - AajExam</title></Head>

         {/* --- Hero Section --- */}
         <section className="relative">
            <Card className="bg-gradient-to-br from-primary-500 to-indigo-600 text-white border-none shadow-duo-primary p-5 lg:p-8 overflow-hidden relative rounded-[2rem] lg:rounded-[3rem]">
               <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-8">
                  <div className="space-y-2 text-center lg:text-left">
                     <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                        <Star className="w-4 h-4 fill-white text-white" />
                        My Analytics
                     </div>
                     <h1 className="text-2xl lg:text-4xl font-black font-outfit">Performance Dashboard</h1>
                     <p className="text-sm lg:text-base font-bold opacity-80">Quizzes, Exams, Reels & Blogs - sab ek jagah</p>
                  </div>
                  <div className="flex items-center gap-5 lg:gap-8">
                     <div className="text-center">
                        <p className="text-2xl lg:text-4xl font-black font-outfit">{overallAccuracy.toFixed(0)}%</p>
                        <p className="text-[10px] font-black opacity-60 uppercase">Quiz Accuracy</p>
                     </div>
                     <div className="h-12 lg:h-16 w-0.5 bg-white/20 rounded-full" />
                     <div className="text-center">
                        <p className="text-2xl lg:text-4xl font-black font-outfit">{totalActivity}</p>
                        <p className="text-[10px] font-black opacity-60 uppercase">Total Activity</p>
                     </div>
                     <div className="h-12 lg:h-16 w-0.5 bg-white/20 rounded-full hidden sm:block" />
                     <div className="text-center hidden sm:block">
                        <p className="text-2xl lg:text-4xl font-black font-outfit">{wallet?.balance || 0}</p>
                        <p className="text-[10px] font-black opacity-60 uppercase">Wallet</p>
                     </div>
                  </div>
               </div>
               <GraduationCap className="absolute -bottom-10 -right-10 w-64 h-64 text-white/10 rotate-12" />
            </Card>
         </section>

         {/* --- Tab Switcher --- */}
         <section className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-1.5 bg-background-surface-secondary rounded-[2rem] max-w-full">
            {TABS.map(tab => (
               <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-xs uppercase transition-all ${activeTab === tab.key ? 'bg-primary-500 text-white shadow-lg' : 'text-content-secondary hover:text-content-primary'}`}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
               </button>
            ))}
         </section>

         {/* --- Tab Content --- */}
         <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }} className="space-y-6">

               {/* ======================== OVERVIEW TAB ======================== */}
               {activeTab === 'overview' && (
                  <>
                     {/* Quick Stats Grid */}
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-blue-50 dark:bg-slate-700/50 text-blue-500 rounded-2xl w-fit mx-auto mb-2"><Zap className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{quiz?.totalAttempts || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Quizzes Done</p>
                        </Card>
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-purple-50 dark:bg-slate-700/50 text-purple-500 rounded-2xl w-fit mx-auto mb-2"><GraduationCap className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{exam?.totalAttempts || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Exams Done</p>
                        </Card>
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-pink-50 dark:bg-slate-700/50 text-pink-500 rounded-2xl w-fit mx-auto mb-2"><Play className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{reel?.totalViewed || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Reels Viewed</p>
                        </Card>
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-green-50 dark:bg-slate-700/50 text-green-500 rounded-2xl w-fit mx-auto mb-2"><FileText className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{data?.myReels?.totalPosted || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Reels Posted</p>
                        </Card>
                     </div>

                     {/* Social + Wallet Row */}
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-primary-50 dark:bg-slate-700/50 text-primary-500 rounded-2xl w-fit mx-auto mb-2"><Users className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{followersCount || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Followers</p>
                        </Card>
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-primary-50 dark:bg-slate-700/50 text-primary-500 rounded-2xl w-fit mx-auto mb-2"><Target className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{followingCount || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Following</p>
                        </Card>
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-amber-50 dark:bg-slate-700/50 text-amber-500 rounded-2xl w-fit mx-auto mb-2"><Wallet className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{wallet?.balance || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Wallet Balance</p>
                        </Card>
                        <Card className="text-center p-4 border-border-primary rounded-[2rem]">
                           <div className="p-3 bg-orange-50 dark:bg-slate-700/50 text-orange-500 rounded-2xl w-fit mx-auto mb-2"><UserPlus className="w-6 h-6" /></div>
                           <p className="text-xl font-black font-outfit">{referral?.count || 0}</p>
                           <p className="text-[10px] font-black text-content-secondary uppercase">Referrals</p>
                        </Card>
                     </div>

                     {/* Subject-wise Quick View (from quiz) */}
                     {quiz?.subjectWise?.length > 0 && (
                        <div className="space-y-4">
                           <SectionHeader icon={BarChart3} title="Subject Performance" subtitle="Based on your quiz attempts" />
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {quiz.subjectWise.map((s, idx) => {
                                 const colors = ['primary', 'emerald', 'amber', 'rose', 'indigo'];
                                 return (
                                    <Card key={idx} className="p-5 border-border-primary space-y-3 rounded-3xl">
                                       <div className="flex justify-between items-center">
                                          <span className="font-black text-base">{s.name}</span>
                                          <span className="text-xs font-bold text-content-secondary">{s.attempts} attempts</span>
                                       </div>
                                       <ProgressBar progress={s.avgAccuracy} variant={colors[idx % colors.length]} height="sm" showPercentage label="Accuracy" />
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
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatMini icon={Zap} label="Total Quizzes" value={quiz?.totalAttempts || 0} color="text-blue-500" bg="bg-blue-50" />
                        <StatMini icon={Target} label="Avg Accuracy" value={`${quiz?.avgAccuracy || 0}%`} color="text-green-500" bg="bg-green-50" />
                        <StatMini icon={Trophy} label="Best Score" value={`${quiz?.bestScore || 0}%`} color="text-amber-500" bg="bg-amber-50" />
                        <StatMini icon={Clock} label="Total Time" value={`${Math.round((quiz?.totalTime || 0) / 60)}m`} color="text-purple-500" bg="bg-purple-50" />
                     </div>

                     {/* Correct / Wrong / Skipped */}
                     <Card className="p-5 border-border-primary rounded-3xl">
                        <div className="grid grid-cols-3 gap-4 text-center">
                           <div>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                 <CheckCircle className="w-5 h-5 text-green-500" />
                                 <span className="text-2xl font-black font-outfit text-green-600">{quiz?.totalCorrect || 0}</span>
                              </div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Correct</p>
                           </div>
                           <div>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                 <XCircle className="w-5 h-5 text-red-500" />
                                 <span className="text-2xl font-black font-outfit text-red-600">{quiz?.totalWrong || 0}</span>
                              </div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Wrong</p>
                           </div>
                           <div>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                 <Clock className="w-5 h-5 text-gray-400" />
                                 <span className="text-2xl font-black font-outfit text-gray-500">{quiz?.totalSkipped || 0}</span>
                              </div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Skipped</p>
                           </div>
                        </div>
                     </Card>

                     {/* Subject Wise */}
                     {quiz?.subjectWise?.length > 0 && (
                        <div className="space-y-4">
                           <SectionHeader icon={BookOpen} title="Subject Wise Performance" />
                           <div className="space-y-3">
                              {quiz.subjectWise.map((s, idx) => {
                                 const colors = ['primary', 'emerald', 'amber', 'rose', 'indigo'];
                                 return (
                                    <Card key={idx} className="p-5 border-border-primary rounded-3xl">
                                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                          <div className="flex-1 space-y-3">
                                             <div className="flex justify-between items-center">
                                                <span className="font-black text-base">{s.name}</span>
                                                <div className="flex items-center gap-3 text-xs font-bold text-content-secondary">
                                                   <span className="text-green-600">{s.totalCorrect} correct</span>
                                                   <span className="text-red-500">{s.totalWrong} wrong</span>
                                                   <span>{s.attempts} attempts</span>
                                                </div>
                                             </div>
                                             <ProgressBar progress={s.avgAccuracy} variant={colors[idx % colors.length]} height="sm" showPercentage label="Accuracy" />
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
                        <div className="space-y-4">
                           <SectionHeader icon={Target} title="Topic Wise Performance" subtitle="Top topics by attempts" />
                           <div className="space-y-2">
                              {(showAllTopics ? quiz.topicWise : quiz.topicWise.slice(0, 6)).map((t, idx) => (
                                 <Card key={idx} className="p-4 border-border-primary rounded-2xl">
                                    <div className="flex items-center justify-between">
                                       <div>
                                          <p className="font-black text-sm">{t.name}</p>
                                          <p className="text-[10px] font-bold text-content-secondary">{t.subjectName} &bull; {t.attempts} attempts</p>
                                       </div>
                                       <div className="flex items-center gap-3">
                                          <span className="text-green-600 text-xs font-bold">{t.totalCorrect}  </span>
                                          <span className="text-red-500 text-xs font-bold">{t.totalWrong}  </span>
                                          <span className="font-black text-sm text-primary-500">{t.avgAccuracy}%</span>
                                       </div>
                                    </div>
                                 </Card>
                              ))}
                              {quiz.topicWise.length > 6 && (
                                 <button onClick={() => setShowAllTopics(!showAllTopics)}
                                    className="flex items-center gap-2 mx-auto text-primary-500 font-black text-sm py-2">
                                    {showAllTopics ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> Show All {quiz.topicWise.length} Topics</>}
                                 </button>
                              )}
                           </div>
                        </div>
                     )}

                     {quiz?.totalAttempts === 0 && (
                        <Card className="p-8 text-center border-border-primary rounded-3xl">
                           <Zap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                           <p className="font-black text-content-secondary">No quiz attempts yet</p>
                           <p className="text-xs text-content-secondary mt-1">Start practicing to see your performance here!</p>
                        </Card>
                     )}
                  </>
               )}

               {/* ======================== EXAMS TAB ======================== */}
               {activeTab === 'exams' && (
                  <>
                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <StatMini icon={GraduationCap} label="Total Exams" value={exam?.totalAttempts || 0} color="text-purple-500" bg="bg-purple-50" />
                        <StatMini icon={Target} label="Avg Accuracy" value={`${exam?.avgAccuracy || 0}%`} color="text-green-500" bg="bg-green-50" />
                        <StatMini icon={Trophy} label="Best Accuracy" value={`${exam?.bestAccuracy || 0}%`} color="text-amber-500" bg="bg-amber-50" />
                     </div>

                     <Card className="p-5 border-border-primary rounded-3xl">
                        <div className="grid grid-cols-2 gap-4 text-center">
                           <div>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                 <CheckCircle className="w-5 h-5 text-green-500" />
                                 <span className="text-2xl font-black font-outfit text-green-600">{exam?.totalCorrect || 0}</span>
                              </div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Correct</p>
                           </div>
                           <div>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                 <XCircle className="w-5 h-5 text-red-500" />
                                 <span className="text-2xl font-black font-outfit text-red-600">{exam?.totalWrong || 0}</span>
                              </div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Wrong</p>
                           </div>
                        </div>
                     </Card>

                     {exam?.totalAttempts === 0 && (
                        <Card className="p-8 text-center border-border-primary rounded-3xl">
                           <GraduationCap className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                           <p className="font-black text-content-secondary">No exam attempts yet</p>
                           <p className="text-xs text-content-secondary mt-1">Attempt practice tests to track your exam performance!</p>
                        </Card>
                     )}
                  </>
               )}

               {/* ======================== REELS TAB ======================== */}
               {activeTab === 'reels' && (
                  <>
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <StatMini icon={Eye} label="Reels Viewed" value={reel?.totalViewed || 0} color="text-blue-500" bg="bg-blue-50" />
                        <StatMini icon={CheckCircle} label="Questions Answered" value={reel?.totalAnswered || 0} color="text-green-500" bg="bg-green-50" />
                        <StatMini icon={Target} label="Reel Accuracy" value={`${reel?.accuracy || 0}%`} color="text-purple-500" bg="bg-purple-50" />
                        <StatMini icon={Clock} label="Time Spent" value={`${Math.round((reel?.totalTimeSpent || 0) / 60)}m`} color="text-amber-500" bg="bg-amber-50" />
                     </div>

                     {/* Engagement Stats */}
                     <Card className="p-5 border-border-primary rounded-3xl">
                        <p className="font-black text-sm uppercase text-content-secondary mb-4">Engagement</p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                           <div>
                              <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                              <p className="text-xl font-black font-outfit">{reel?.totalLiked || 0}</p>
                              <p className="text-[10px] font-bold text-content-secondary uppercase">Liked</p>
                           </div>
                           <div>
                              <Bookmark className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                              <p className="text-xl font-black font-outfit">{reel?.totalBookmarked || 0}</p>
                              <p className="text-[10px] font-bold text-content-secondary uppercase">Saved</p>
                           </div>
                           <div>
                              <Share2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                              <p className="text-xl font-black font-outfit">{reel?.totalShared || 0}</p>
                              <p className="text-[10px] font-bold text-content-secondary uppercase">Shared</p>
                           </div>
                        </div>
                     </Card>

                     {/* Reel Subject Wise */}
                     {reel?.subjectWise?.length > 0 && (
                        <div className="space-y-4">
                           <SectionHeader icon={BookOpen} title="Reel Subject Performance" subtitle="Question reels you answered" />
                           <div className="space-y-3">
                              {reel.subjectWise.map((s, idx) => {
                                 const colors = ['primary', 'emerald', 'amber', 'rose', 'indigo'];
                                 return (
                                    <Card key={idx} className="p-5 border-border-primary rounded-3xl">
                                       <div className="flex justify-between items-center mb-3">
                                          <span className="font-black text-base">{s.subject}</span>
                                          <span className="text-xs font-bold text-content-secondary">{s.correct}/{s.attempted} correct</span>
                                       </div>
                                       <ProgressBar progress={s.accuracy} variant={colors[idx % colors.length]} height="sm" showPercentage label="Accuracy" />
                                    </Card>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {reel?.totalViewed === 0 && (
                        <Card className="p-8 text-center border-border-primary rounded-3xl">
                           <Play className="w-12 h-12 text-content-secondary mx-auto mb-3 opacity-30" />
                           <p className="font-black text-content-secondary">No reel activity yet</p>
                           <p className="text-xs text-content-secondary mt-1">Start watching reels to learn on the go!</p>
                        </Card>
                     )}
                  </>
               )}

               {/* ======================== WALLET TAB ======================== */}
               {activeTab === 'wallet' && (
                  <>
                     {/* Balance Card */}
                     <Card className="bg-gradient-to-br from-primary-500 to-indigo-600 text-white border-none shadow-duo-primary p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem]">
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-3 bg-white/20 rounded-2xl"><Wallet className="w-8 h-8" /></div>
                           <span className="text-xs font-black opacity-60 uppercase">Wallet Balance</span>
                        </div>
                        <div>
                           <p className="text-xs font-black opacity-60">Current Balance</p>
                           <h3 className="text-4xl lg:text-5xl font-black font-outfit">{wallet?.balance || 0}</h3>
                        </div>
                     </Card>

                     {/* Earned / Spent */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="flex items-center gap-5 p-5 border-border-primary rounded-3xl">
                           <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-2xl"><TrendingUp className="w-7 h-7" /></div>
                           <div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Total Earned</p>
                              <p className="text-2xl font-black font-outfit">{wallet?.totalEarnings || 0}</p>
                           </div>
                        </Card>
                        <Card className="flex items-center gap-5 p-5 border-border-primary rounded-3xl">
                           <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl"><TrendingDown className="w-7 h-7" /></div>
                           <div>
                              <p className="text-[10px] font-black text-content-secondary uppercase">Total Spent</p>
                              <p className="text-2xl font-black font-outfit">{wallet?.totalExpenses || 0}</p>
                           </div>
                        </Card>
                     </div>

                     {/* Earnings Breakdown */}
                     <div className="space-y-4">
                        <SectionHeader icon={Coins} title="Earnings Breakdown" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                           <Card className="p-5 border-border-primary flex items-center justify-between rounded-3xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                                 <span className="font-black text-sm">Blog Earnings</span>
                              </div>
                              <span className="font-black text-lg text-blue-600">{wallet?.blogEarnings || 0}</span>
                           </Card>
                           <Card className="p-5 border-border-primary flex items-center justify-between rounded-3xl">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center"><UserPlus className="w-5 h-5" /></div>
                                 <span className="font-black text-sm">Referral Rewards</span>
                              </div>
                              <span className="font-black text-lg text-orange-600">{wallet?.referralRewards || 0}</span>
                           </Card>
                        </div>
                     </div>

                     {/* Referral Section */}
                     <div className="space-y-4">
                        <SectionHeader icon={UserPlus} title="Referral" subtitle={`${referral?.count || 0} people joined using your code`} />
                        <Card className="p-5 border-border-primary rounded-3xl">
                           <div className="flex flex-col sm:flex-row items-center gap-4">
                              <div className="flex-1 w-full">
                                 <p className="text-xs font-bold text-content-secondary mb-2">Your Referral Code</p>
                                 <div className="flex items-center gap-2 bg-background-surface-secondary p-3 rounded-2xl">
                                    <span className="flex-1 font-black text-lg font-mono tracking-wider">{referral?.code || '---'}</span>
                                    <button onClick={copyReferralCode}
                                       className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
                                       {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                 </div>
                              </div>
                              <div className="text-center sm:text-right">
                                 <p className="text-3xl font-black font-outfit text-primary-500">{referral?.totalRewards || 0}</p>
                                 <p className="text-[10px] font-black text-content-secondary uppercase">Total Referral Rewards</p>
                              </div>
                           </div>
                        </Card>
                     </div>
                  </>
               )}

            </motion.div>
         </AnimatePresence>
      </div>
   );
};

export default MyAnalyticsPage;
