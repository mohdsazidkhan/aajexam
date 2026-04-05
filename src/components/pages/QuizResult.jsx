'use client';

import React, { useEffect, useState } from "react";
import Head from 'next/head';
import {
   Trophy,
   CheckCircle,
   XCircle,
   Crown,
   Brain,
   Award,
   ArrowLeft,
   HelpCircle,
   Check,
   X,
   Target,
   Zap,
   Activity,
   ChevronRight,
   TrendingUp,
   Clock,
   BookOpen,
   Sparkles
} from "lucide-react";
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../lib/api';
import PublicNavbar from '../navbars/PublicNavbar';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import Button from '../ui/Button';
import Card from '../ui/Card';
import config from '../../lib/config/appConfig';

const LeaderboardTable = ({ leaderboard, currentUser }) => {
   if (!leaderboard || leaderboard?.length === 0) {
      return (
         <Card className="p-12 text-center bg-slate-50 dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-800">
            <Trophy className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
            <div className="space-y-2">
               <h3 className="text-xl font-black font-outfit uppercase tracking-tight">No Leaderboard Yet</h3>
               <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-loose">
                  Be the first to complete this quiz and reach the top!
               </p>
            </div>
         </Card>
      );
   }

   return (
      <div className="space-y-8 mt-12">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-duo-primary">
               <Trophy className="text-white w-6 h-6" />
            </div>
            <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">Leaderboard</h3>
         </div>

         <Card className="overflow-hidden border-none shadow-xl rounded-[2.5rem]">
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-slate-900 text-white">
                        <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em]">Student</th>
                        <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em]">Rank</th>
                        <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.3em]">Performance</th>
                        <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em]">Score</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800 bg-white dark:bg-slate-900/50">
                     {leaderboard.map((w, idx) => {
                        const isCurrentUser = w.studentId === currentUser?.id;
                        return (
                           <tr key={idx} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group ${isCurrentUser ? 'bg-primary-500/5' : ''}`}>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-500 flex items-center justify-center text-white font-black">
                                       {w.studentName?.charAt(0) || 'A'}
                                    </div>
                                    <div>
                                       <p className="font-black font-outfit uppercase truncate max-w-[200px]">{w.studentName || 'Student'}</p>
                                       {isCurrentUser && <p className="text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest leading-none mt-1">THAT'S YOU</p>}
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="flex items-center justify-center">
                                    {w.rank <= 3 ? (
                                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black shadow-lg ${w.rank === 1 ? 'bg-amber-500' : w.rank === 2 ? 'bg-slate-400' : 'bg-primary-600'}`}>
                                          {w.rank === 1 ? <Crown className="w-4 h-4" /> : w.rank}
                                       </div>
                                    ) : (
                                       <span className="font-black text-slate-400">{w.rank}</span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">
                                    {new Date(w.attemptedAt).toLocaleDateString()}
                                 </p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <p className="text-xl lg:text-2xl font-black text-primary-700 dark:text-primary-500">{w.score}%</p>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </Card>
      </div>
   );
};

const QuizResult = () => {
   const [currentUser, setCurrentUser] = useState(null);
   const router = useRouter();
   const [quizResult, setQuizResult] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [quiz, setQuiz] = useState(null);
   const [answers, setAnswers] = useState([]);
   const [leaderboard, setLeaderboard] = useState([]);

   useEffect(() => {
      if (typeof window !== 'undefined') {
         setCurrentUser(JSON.parse(localStorage.getItem("userInfo") || 'null'));
      }
   }, []);

   useEffect(() => {
      async function fetchResult() {
         let quizId = null;

         if (typeof window !== 'undefined') {
            const storedResult = sessionStorage.getItem('quizResult');
            if (storedResult) {
               try {
                  const parsedResult = JSON.parse(storedResult);
                  const actualQuizId = parsedResult?.quiz?._id || parsedResult?._id;

                  if (actualQuizId) {
                     const quizRes = await API.getQuizById(actualQuizId);
                     setQuiz(quizRes);
                     setAnswers(parsedResult?.answers || []);
                     setQuizResult(parsedResult);
                     const leaderboardRes = await API.getQuizLeaderboard(actualQuizId);
                     setLeaderboard(leaderboardRes?.leaderboard || []);
                     setLoading(false);
                     sessionStorage.removeItem('quizResult');
                     return;
                  }
               } catch (err) {
                  console.error('Error:', err);
               }
            }
         }

         const params = new URLSearchParams(window.location.search);
         quizId = params.get("quizId");

         if (quizId) {
            setLoading(true);
            try {
               const res = await API.getQuizResult(quizId);
               if (res.success) {
                  setQuizResult(res.data);
                  const quizRes = await API.getQuizById(res.data.quiz || quizId);
                  setQuiz(quizRes);
                  const leaderboardRes = await API.getQuizLeaderboard(res.data.quiz || quizId);
                  setLeaderboard(leaderboardRes?.leaderboard || []);
               } else {
                  setError("No results found");
               }
            } catch (err) {
               setError("No results found");
            } finally {
               setLoading(false);
            }
         } else {
            setLoading(false);
            setError("No quiz data detected");
         }
      }
      fetchResult();
   }, []);

   const getScoreColor = (p) => {
      if (p >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE) return "text-primary-700 dark:text-primary-500";
      return "text-indigo-500";
   };

   const getScoreMessage = (p) => {
      if (p >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE) return "Excellent work! You reached a high score.";
      if (p >= 50) return "Good attempt! Keep practicing to improve.";
      return "Don't give up! Study the answers and try again.";
   };

   if (loading) return <Loading fullScreen={true} size="lg" color="primary" message="Preparing your results..." />;

   if (error) {
      return (
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
            <Card className="max-w-md w-full p-12 text-center space-y-8">
               <HelpCircle className="w-20 h-20 text-slate-200 mx-auto" />
               <div className="space-y-2">
                  <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">No Results Found</h3>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{error}</p>
               </div>
               <Button variant="primary" fullWidth onClick={() => router.push("/profile")}>BACK TO PROFILE</Button>
            </Card>
         </div>
      );
   }

   const percentage = quizResult?.scorePercentage || 0;

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
         <Head>
            <title>Quiz Results | AajExam</title>
         </Head>
         <PublicNavbar />

         <main className="flex-grow container mx-auto px-2 lg:px-6 py-4 lg:py-12 max-w-5xl space-y-6 lg:space-y-12 mt-16">

            {/* --- Hero Result --- */}
            <section className="text-center space-y-5 lg:space-y-8 py-6 lg:py-10 relative overflow-hidden">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative inline-block">
                  <div className={`w-24 lg:w-48 h-24 lg:h-48 rounded-[2.5rem] lg:rounded-[3.5rem] bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xl border-8 ${percentage >= 80 ? 'border-primary-500' : 'border-slate-200 dark:border-slate-700'}`}>
                     <span className={`text-2xl lg:text-5xl font-black font-outfit ${getScoreColor(percentage)}`}>{percentage}%</span>
                  </div>
                  {percentage >= 80 && (
                     <div className="absolute -top-6 -right-6 w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-duo-primary rotate-12">
                        <Crown className="w-8 h-8" />
                     </div>
                  )}
               </motion.div>

               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">
                     {quizResult?.quizTitle || "Results"}
                  </h1>
                  <p className="text-sm font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em]">{getScoreMessage(percentage)}</p>
               </div>
            </section>

            {/* --- Quick Stats --- */}
            <div className="grid grid-cols-3 gap-3 lg:gap-8">
               <Card className="p-4 lg:p-8 space-y-2 lg:space-y-4 flex flex-col items-center text-center group">
                  <div className="p-3 lg:p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform"><CheckCircle className="w-5 h-5 lg:w-8 lg:h-8" /></div>
                  <div>
                     <p className="text-[8px] lg:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">CORRECT</p>
                     <span className="text-base lg:text-3xl font-black font-outfit text-slate-900 dark:text-white">{quizResult?.score || 0}/{quizResult?.answers?.length || 0}</span>
                  </div>
               </Card>
               <Card className="p-4 lg:p-8 space-y-2 lg:space-y-4 flex flex-col items-center text-center group">
                  <div className="p-3 lg:p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform"><Activity className="w-5 h-5 lg:w-8 lg:h-8" /></div>
                  <div>
                     <p className="text-[8px] lg:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">ACCURACY</p>
                     <span className="text-base lg:text-3xl font-black font-outfit text-slate-900 dark:text-white">{percentage}%</span>
                  </div>
               </Card>
               <Card className="p-4 lg:p-8 space-y-2 lg:space-y-4 flex flex-col items-center text-center group">
                  <div className="p-3 lg:p-4 bg-indigo-500/10 text-indigo-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform"><Clock className="w-5 h-5 lg:w-8 lg:h-8" /></div>
                  <div>
                     <p className="text-[8px] lg:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">DATE</p>
                     <span className="text-base lg:text-3xl font-black font-outfit text-slate-900 dark:text-white">{new Date(quizResult?.attemptedAt).toLocaleDateString()}</span>
                  </div>
               </Card>
            </div>

            {/* --- Status Message --- */}
            <Card className={`p-5 lg:p-8 border-none relative overflow-hidden ${percentage >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-900 text-white shadow-xl'}`}>
               <div className="relative z-10 flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-white/20">
                     <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="space-y-1 text-center lg:text-left">
                     <h4 className="text-xl font-black font-outfit uppercase tracking-tight">
                        {percentage >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE ? "Great Score!" : "Good Try!"}
                     </h4>
                     <p className="text-sm font-bold opacity-80 uppercase tracking-wide">
                        {percentage >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE
                           ? "Well done! This score helps you move up to the next level."
                           : `You need ${config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% or higher to level up. Keep practicing!`}
                     </p>
                  </div>
               </div>
               <Sparkles className="absolute -bottom-10 -right-10 w-24 lg:w-48 h-24 lg:h-48 text-white/5 -rotate-12" />
            </Card>

            {/* --- Answer Review --- */}
            <section className="space-y-8 pt-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                     <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">Review Your Answers</h3>
               </div>

               <div className="space-y-6">
                  {(quiz?.questions || []).map((q, idx) => {
                     const userAns = answers?.[idx]?.answer || "SKIP";
                     const correctAns = q.options[q.correctAnswerIndex];
                     const isCorrect = userAns === correctAns;
                     const isSkipped = userAns === "SKIP";

                     return (
                        <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                           <Card className="p-8 space-y-6 border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                              <div className="flex items-start gap-6">
                                 <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-white shadow-lg ${isSkipped ? 'bg-slate-400' : isCorrect ? 'bg-primary-500' : 'bg-red-500'}`}>
                                    {isSkipped ? <HelpCircle className="w-6 h-6" /> : isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">QUESTION {idx + 1}</p>
                                    <h4 className="text-lg font-black font-outfit uppercase text-slate-900 dark:text-white leading-tight">{q.questionText}</h4>
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                 {q.options.map((opt, oIdx) => {
                                    const isUsers = opt === userAns;
                                    const isActual = opt === correctAns;
                                    return (
                                       <div key={oIdx} className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${isActual ? 'bg-primary-500/5 border-primary-500/30' : isUsers ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}>
                                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isActual ? 'bg-primary-500 text-white' : isUsers ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                                             {String.fromCharCode(65 + oIdx)}
                                          </div>
                                          <span className={`text-sm font-black uppercase text-slate-900 dark:text-white ${isActual ? 'text-primary-700 dark:text-primary-500' : isUsers ? 'text-red-600' : ''}`}>{opt}</span>
                                          {isActual && <CheckCircle className="ml-auto w-5 h-5 text-primary-700 dark:text-primary-500" />}
                                       </div>
                                    );
                                 })}
                              </div>

                              {!isCorrect && !isSkipped && (
                                 <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-loose">YOU SELECTED: {userAns}</p>
                                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-loose">CORRECT ANSWER: {correctAns}</p>
                                 </div>
                              )}
                              {isSkipped && (
                                 <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-loose">YOU SKIPPED THIS QUESTION. CORRECT ANSWER: {correctAns}</p>
                                 </div>
                              )}
                           </Card>
                        </motion.div>
                     );
                  })}
               </div>
            </section>

            {/* --- Leaderboard Segment --- */}
            <LeaderboardTable leaderboard={leaderboard} currentUser={currentUser} />

            {/* --- Footer Actions --- */}
            <section className="pt-12 text-center flex flex-col lg:flex-row justify-center gap-6">
               <Button variant="primary" size="lg" className="px-12 py-6 shadow-duo-primary" onClick={() => router.push("/home")}>TAKE ANOTHER QUIZ</Button>
               <Button variant="ghost" size="lg" className="px-12 py-6 bg-white dark:bg-slate-800 border-2" onClick={() => router.push("/profile")}>SEE MY PROGRESS</Button>
               <Button variant="ghost" size="lg" className="px-12 py-6 bg-slate-200 dark:bg-slate-700" onClick={() => router.push(-1)}><ArrowLeft className="w-5 h-5 mr-2" /> GO BACK</Button>
            </section>
         </main>

         <UnifiedFooter />
      </div>
   );
};

export default QuizResult;


