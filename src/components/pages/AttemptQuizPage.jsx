'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Brain,
  CircleCheck,
  XCircle,
  Trophy,
  Star,
  Rocket,
  TrendingUp,
  Crown,
  Check,
  X,
  HelpCircle,
  BookOpen,
  GraduationCap,
  TriangleAlert,
  Home,
  Zap,
  Target,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Timer,
  BadgeCheck,
  Award,
  History,
  Layout,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import Card from '../ui/Card';
import Button from '../ui/Button';

/* --- Top Performers Component --- */
const LeaderboardTable = ({ leaderboard, currentUser }) => {
  if (!leaderboard || leaderboard?.length === 0) {
    return (
      <div className="py-12">
        <Card className="p-12 text-center space-y-6 border-dashed border-2 border-slate-100 dark:border-slate-800 bg-transparent">
          <div className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black font-outfit uppercase tracking-tight">No Results Yet</h3>
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">Be the first to finish this quiz and see your rank!</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-2xl">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">Top Students</h3>
          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">Best performers for this quiz</p>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl bg-white dark:bg-slate-800 rounded-[2.5rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="py-6 px-8 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">RANK</th>
                <th className="py-6 px-8 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">STUDENT</th>
                <th className="py-6 px-8 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] text-center">SCORE</th>
                <th className="py-6 px-8 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] text-right">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-900/50">
              {leaderboard?.map(({ rank, studentName, studentId, score, attemptedAt }) => {
                const isCurrentUser = studentId === currentUser?.id;
                const isTopThree = rank <= 3;

                return (
                  <tr key={rank} className={`group hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all ${isCurrentUser ? 'bg-primary-500/5' : ''}`}>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        {isTopThree ? (
                          <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center text-white shadow-duo-${rank === 1 ? 'primary' : rank === 2 ? 'secondary' : 'emerald'} ${rank === 1 ? 'bg-primary-500' : rank === 2 ? 'bg-slate-400' : 'bg-emerald-500'}`}>
                            {rank === 1 ? <Crown className="w-5 h-5" /> : <span className="font-black font-outfit">{rank}</span>}
                          </div>
                        ) : (
                          <span className="text-sm font-black text-slate-300 ml-4">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center font-black text-slate-900 dark:text-white uppercase shadow-inner border border-slate-200 dark:border-slate-800">
                          {studentName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">{studentName || 'STUDENT'}</p>
                          {isCurrentUser && <p className="text-[8px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest mt-1">YOUR ANSWER</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <div className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-sm font-black font-mono text-slate-900 dark:text-white shadow-inner">
                        {score || 0}%
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(attemptedAt).toLocaleDateString('en-GB')}
                      </span>
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

/* --- Main AttemptQuizPage Component --- */
const AttemptQuizPage = () => {
  const router = useRouter();
  const { quizId } = router.query;

  const navigationData = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('quizNavigationData');
    return data ? JSON.parse(data) : null;
  }, []);

  const currentUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }, []);

  const quizData = navigationData?.quizData;
  const fromPage = navigationData?.fromPage;
  const levelNumber = navigationData?.levelNumber;
  const searchQuery = navigationData?.searchQuery;
  const subcategoryId = navigationData?.subcategoryId;
  const competitionType = navigationData?.competitionType;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  /* --- Fullscreen Experience --- */
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.log('Focus mode deferred');
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen) await document.webkitExitFullscreen();
      setIsFullscreen(false);
    } catch (error) {
      console.error('Exit failed');
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    const isFullscreenNow = !!(document.fullscreenElement || document.webkitFullscreenElement);
    setIsFullscreen(isFullscreenNow);
    if (!isFullscreenNow && !submitted && quiz && !showExitConfirm) {
      setShowExitConfirm(true);
    }
  }, [submitted, quiz, showExitConfirm]);

  const handleExitConfirm = (confirmed) => {
    setShowExitConfirm(false);
    if (confirmed) handleSubmit();
    else enterFullscreen();
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [handleFullscreenChange]);

  const handleStart = useCallback(async () => {
    await enterFullscreen();
    setStarted(true);
  }, [enterFullscreen]);

  /* --- Results Submission --- */
  const handleSubmit = useCallback(async () => {
    try {
      setIsTimerRunning(false);
      setSubmitted(true);

      const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (isCurrentlyFullscreen) {
        try { await exitFullscreen(); } catch (e) { }
      }

      const actualQuizId = quizData?._id || quizId;
      const res = await API.submitQuiz(actualQuizId, answers, competitionType);
      setResult(res);

      if (res.scorePercentage >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }

      try {
        const leaderboardRes = await API.getQuizLeaderboard(actualQuizId);
        setLeaderboard(leaderboardRes.leaderboard || []);
      } catch (e) {
        setLeaderboard([]);
      }
    } catch (error) {
      const msg = error.message || '';
      const alreadyAttempted = msg.toLowerCase().includes('already attempted') || error.response?.status === 409;
      if (alreadyAttempted) {
        toast.error(msg || 'You have already attempted this quiz today.');
        setTimeout(() => {
          if (typeof window !== 'undefined') localStorage.removeItem('quizNavigationData');
          router.push('/');
        }, 2000);
      } else {
        toast.error('Could not save your results');
        setSubmitted(false);
      }
    }
  }, [quizData?._id, quizId, answers, exitFullscreen, competitionType, router]);

  /* --- Timer Logic --- */
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            const updated = [...answers];
            updated[currentQuestionIndex] = 'SKIP';
            setAnswers(updated);
            if (currentQuestionIndex < quiz.questions.length - 1) {
              setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            } else {
              handleSubmit();
            }
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, currentQuestionIndex, quiz?.questions?.length, answers, handleSubmit]);

  useEffect(() => {
    if (started && quiz && quiz.questions && quiz.questions[currentQuestionIndex]) {
      const question = quiz.questions[currentQuestionIndex];
      const questionTime = question.timeLimit || 30;
      setTimeLeft(questionTime);
      setIsTimerRunning(true);
    }
  }, [started, currentQuestionIndex, quiz]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const actualQuizId = quizData?._id || quizId;
        const quizRes = await API.getQuizById(actualQuizId);
        setQuiz(quizRes);
        setTimeLeft(quizRes.timeLimit || 30);
        setAnswers(new Array(quizRes.questions.length).fill(null));

        try {
          const leaderboardRes = await API.getQuizLeaderboard(actualQuizId);
          setLeaderboard(leaderboardRes.leaderboard || []);
        } catch (e) { }
      } catch (error) {
        toast.error('Could not load quiz questions');
      } finally {
        setLoading(false);
      }
    };
    if (quizId || quizData?._id) fetchQuizData();
  }, [quizId, quizData?._id]);

  const handleSelect = (option) => {
    if (!currentUser) {
      if (typeof window !== 'undefined') localStorage.setItem('redirectAfterLogin', window.location.pathname);
      toast.error('Please login to take the quiz');
      router.push('/login');
      return;
    }
    const updated = [...answers];
    updated[currentQuestionIndex] = option;
    setAnswers(updated);
  };

  const handleSkipQuestion = () => {
    const updated = [...answers];
    updated[currentQuestionIndex] = 'SKIP';
    setAnswers(updated);
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem('quizNavigationData');
    if (fromPage === "category") router.push(`/category/${quizData?.category?._id}`);
    else if (fromPage === "subcategory") router.push(`/subcategory/${subcategoryId || quizData?.subcategory?._id}`);
    else if (fromPage === "level-detail" || fromPage === "home") router.push(`/level/${levelNumber}`);
    else if (fromPage === "search") router.push(`/search?q=${searchQuery}`);
    else router.push(`/`);
  }, [fromPage, quizData?.category?._id, subcategoryId, quizData?.subcategory?._id, levelNumber, searchQuery, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loading size="lg" /></div>;

  if (!started && !submitted) {
    return (
      <div className="min-h-screen max-h-screen bg-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full space-y-8 text-center"
        >
          <div className="w-24 h-24 bg-primary-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-duo-primary">
            <Layout className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black font-outfit uppercase tracking-tight text-white">{quiz?.title}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{quiz?.questions?.length} Questions</p>
          </div>
          <button
            onClick={handleStart}
            className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-duo-primary border-b-4 border-primary-700 active:border-b-0 active:translate-y-1 transition-all"
          >
            Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
        <Card className="p-12 max-w-md w-full space-y-8 border-none bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight">Leave Quiz?</h2>
              <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">If you leave now, your quiz will end and your answers will be saved. Are you sure?</p>
            </div>
          </div>

          <div className="flex flex-row gap-4 mt-4">
            <Button onClick={() => handleExitConfirm(false)} variant="secondary" className="flex-1 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-duo-secondary">
              STAY IN QUIZ
            </Button>
            <Button onClick={() => handleExitConfirm(true)} variant="primary" className="flex-1 py-6 rounded-2xl text-xs font-black uppercase tracking-widest bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 !shadow-none">
              LEAVE QUIZ
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  return (
    <div className="min-h-screen max-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 animate-fade-in relative selection:bg-primary-500 selection:text-white">

      {/* Celebration Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[110] overflow-hidden">
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, 1000],
                  x: [0, (Math.random() - 0.5) * 400],
                  rotate: [0, 360 * 2]
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className={`absolute w-3 h-3 rounded-sm ${['bg-primary-500', 'bg-primary-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-500'][Math.floor(Math.random() * 5)]}`}
                style={{ left: `${Math.random() * 100}%`, top: '-5%' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {submitted ? (
        /* --- Results View --- */
        <div className="container mx-auto px-2 lg:px-6 py-4 lg:py-12 max-w-5xl space-y-6 lg:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          {/* Results Header */}
          <header className="py-10 lg:py-24 text-center space-y-6 lg:space-y-10 relative overflow-hidden rounded-[2rem] lg:rounded-[4rem] bg-slate-950 border-b-4 lg:border-b-8 border-slate-900 shadow-2xl glass-dark">
            <div className="relative z-20 space-y-8">
              <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 10, stiffness: 100 }} className="w-28 h-28 bg-primary-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-duo-primary relative">
                <Trophy className="w-14 h-14 text-white" />
                <motion.div animate={{ opacity: [0, 1, 0], scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-[2.5rem] bg-primary-400/30 -z-10" />
              </motion.div>
              <div className="space-y-4">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black font-outfit uppercase tracking-tighter text-white">Quiz <span className="text-primary-700 dark:text-primary-500 text-glow-primary">Results</span></h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-[1px] w-12 bg-slate-700" />
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.5em] leading-none">HOW YOU DID</p>
                  <div className="h-[1px] w-12 bg-slate-700" />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(88,204,2,0.15),transparent)] pointer-events-none" />
            <Sparkles className="absolute -bottom-24 -right-24 w-96 h-96 text-primary-700 dark:text-primary-500/5 animate-pulse-slow" />
          </header>

          {/* Performance Stats */}
          <section className="grid grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-6">
            {[
              { label: 'CORRECT', val: result?.score, sub: 'OUT OF TOTAL', icon: Target, color: 'emerald', glow: 'text-glow-primary' },
              { label: 'ACCURACY', val: `${result?.scorePercentage}%`, sub: 'YOUR SCORE', icon: Zap, color: 'secondary', glow: 'text-glow-secondary' },
              { label: 'TOTAL', val: result?.total, sub: 'QUESTIONS IN QUIZ', icon: Layers, color: 'primary', glow: '' }
            ].map((s, i) => (
              <Card key={i} variant="white" className="p-4 lg:p-10 hover:border-primary-500 transition-all group overflow-hidden relative" glow={s.color === 'emerald'}>
                <div className="flex justify-between items-start mb-4 lg:mb-8">
                  <div className={`p-2 lg:p-4 bg-${s.color}-500/10 text-${s.color}-500 rounded-xl lg:rounded-2xl group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-4 h-4 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="space-y-0.5 lg:space-y-1">
                  <p className="text-[8px] lg:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                  <h4 className={`text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight dark:text-white ${s.glow}`}>{s.val}</h4>
                  <p className="text-[8px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest leading-none pt-1 lg:pt-3">{s.sub}</p>
                </div>
              </Card>
            ))}
          </section>

          {/* Achievements */}
          <section className="space-y-4">
            <AnimatePresence>
              {(result?.isNewBestScore || result?.isHighScore || (result?.levelUpdate && result.levelUpdate.levelIncreased)) && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result?.isNewBestScore && (
                    <div className="bg-primary-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-duo-primary">
                      <div className="p-3 bg-white/20 rounded-xl"><Crown className="w-5 h-5" /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Your New Best Score!</p>
                    </div>
                  )}
                  {result?.isHighScore && (
                    <div className="bg-primary-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-duo-secondary">
                      <div className="p-3 bg-white/20 rounded-xl"><Star className="w-5 h-5" /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">High Score!</p>
                    </div>
                  )}
                  {result?.levelUpdate?.levelIncreased && (
                    <div className="bg-emerald-500 text-white p-6 rounded-3xl flex items-center gap-4 shadow-duo-emerald">
                      <div className="p-3 bg-white/20 rounded-xl"><Rocket className="w-5 h-5" /></div>
                      <p className="text-[10px] font-black uppercase tracking-widest">Level Up: {result.levelUpdate.newLevel}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Answer Review */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl">
                <History className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">Check Your Answers</h3>
                <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">See which answers were right and which were wrong</p>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              {quiz.questions.map((question, index) => {
                const userAnswer = answers[index];
                const correctAnswer = question.options[question.correctAnswerIndex];
                const isCorrect = userAnswer === correctAnswer;
                const isSkipped = userAnswer === 'SKIP';
                return (
                  <Card key={index} className="p-4 lg:p-10 border-none shadow-xl bg-white dark:bg-slate-800 rounded-[2rem] lg:rounded-[3rem] group">
                    <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-8">
                      <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-duo-${isSkipped ? 'slate' : isCorrect ? 'emerald' : 'primary'} ${isSkipped ? 'bg-slate-400' : isCorrect ? 'bg-emerald-500' : 'bg-primary-500'}`}>
                        {isSkipped ? <HelpCircle className="w-6 h-6" /> : isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">QUESTION {index + 1}</p>
                        <h4 className="text-xl font-black font-outfit uppercase leading-tight">{question.questionText}</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {question.options.map((option, optIdx) => {
                        const isUserChoice = option === userAnswer;
                        const isCorrectTarget = option === correctAnswer;
                        return (
                          <div key={optIdx} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${isCorrectTarget ? 'bg-emerald-500/5 border-emerald-500/30' : isUserChoice && !isCorrectTarget ? 'bg-primary-500/5 border-primary-500/30' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${isCorrectTarget ? 'bg-emerald-500 text-white shadow-duo-emerald' : isUserChoice ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isCorrectTarget ? 'text-emerald-600' : isUserChoice ? 'text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}`}>{option}</span>
                            {isCorrectTarget && <BadgeCheck className="w-4 h-4 text-emerald-500 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          <LeaderboardTable leaderboard={leaderboard} currentUser={currentUser} />

          <div className="pt-6 lg:pt-12 text-center space-y-6">
            <div className="flex flex-col sm:flex-row justify-center gap-4 lg:gap-6">
              <Button variant="secondary" onClick={handleBack} size="lg" className="px-8 py-4 lg:px-12 lg:py-6 rounded-[1.5rem] lg:rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-duo-secondary">
                <Home className="w-4 h-4 mr-2" /> GO HOME
              </Button>
              <Button variant="primary" onClick={() => window.location.reload()} size="lg" className="px-8 py-4 lg:px-12 lg:py-6 rounded-[1.5rem] lg:rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-duo-primary">
                <Zap className="w-4 h-4 mr-2" /> TRY AGAIN
              </Button>
            </div>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.5em] pt-8">* YOUR SCORE IS SAVED TO YOUR PROFILE</p>
          </div>
        </div>
      ) : (
        /* --- Quiz Mode --- */
        <div className="space-y-0 min-h-screen flex flex-col">

          {/* Header Progress Bar */}
          <div className="sticky top-0 z-50 px-3 lg:px-6 py-3">
            <Card variant="glass" className="!p-3 !rounded-2xl border-none shadow-2xl max-w-5xl mx-auto">
              <div className="flex items-center gap-3">
                {/* Left: icon + title */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-9 h-9 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-duo-primary flex-shrink-0">
                    <Layout className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-0.5">QUIZ TITLE</p>
                    <h2 className="text-[10px] font-black font-outfit uppercase truncate max-w-[10rem] dark:text-white">{quiz?.title}</h2>
                  </div>
                </div>

                {/* Center: progress */}
                <div className="flex-1 min-w-0 mx-3">
                  <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> PROGRESS</span>
                    <span>{currentQuestionIndex + 1} OF {quiz?.questions.length}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-primary-500 shadow-duo-primary" />
                  </div>
                </div>

                {/* Right: timer */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0 transition-all duration-300 ${timeLeft < 10 ? 'bg-primary-500 text-white shadow-duo-primary animate-pulse' : 'bg-slate-100/50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50'}`}>
                  <Timer className={`w-4 h-4 ${timeLeft < 10 ? 'animate-bounce' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span className="text-base font-black font-mono leading-none">{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="container mx-auto px-3 lg:px-6 py-2 lg:py-4 pb-8 max-w-5xl flex-1 flex flex-col justify-center gap-4 lg:gap-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6 lg:space-y-8"
              >
                {/* Question Text */}
                <div className="text-center space-y-2 lg:space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 rounded-full border border-primary-500/20">
                    <Brain className="w-3 h-3 text-primary-700 dark:text-primary-500 animate-pulse" />
                    <p className="text-[9px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-[0.4em]">QUESTION {currentQuestionIndex + 1}</p>
                  </div>
                  <h3 className="text-base lg:text-xl xl:text-2xl font-black font-outfit tracking-tight leading-[1.2] max-w-5xl mx-auto dark:text-white drop-shadow-sm">
                    {currentQuestion?.questionText}
                  </h3>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4 max-w-5xl mx-auto px-0">
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = answers[currentQuestionIndex] === option;
                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + (idx * 0.05) }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelect(option)}
                        className={`w-full px-3 py-3 lg:px-6 lg:py-5 rounded-[1.5rem] border-4 flex items-center gap-3 lg:gap-5 text-left transition-all relative overflow-hidden group ${isSelected ? 'bg-primary-500 border-primary-600 text-white shadow-duo-secondary scale-[1.02]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white hover:border-primary-500/50'}`}
                      >
                        {/* Selection Effect */}
                        {isSelected && <div className="absolute inset-0 bg-white/10 shimmer opacity-30" />}

                        <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex-shrink-0 flex items-center justify-center font-black text-base lg:text-xl transition-all shadow-inner border-2 ${isSelected ? 'bg-white text-primary-700 dark:text-primary-500 border-white shadow-lg' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-primary-700 dark:text-primary-500 group-hover:border-primary-500/30'}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm lg:text-xl font-black font-outfit tracking-tight leading-tight">{option}</span>
                        </div>
                        {isSelected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2 -bottom-2 opacity-10">
                            <BadgeCheck className="w-8 lg:w-16 h-8 lg:h-16 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-50 px-3 lg:px-6 pb-3 lg:pb-4">
            <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-3 lg:p-4 flex items-center">
              {/* PREV — left */}
              <div className="flex-1 flex justify-start">
                <Button variant="ghost" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0} className="px-4 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-[1.5rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ChevronLeft className="w-4 h-4 mr-1 lg:mr-2" /> PREV
                </Button>
              </div>

              {/* SKIP — center */}
              <div className="flex-1 flex justify-center">
                <Button onClick={handleSkipQuestion} variant="ghost" className="px-4 py-3 lg:px-10 lg:py-4 rounded-xl lg:rounded-[1.5rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 !shadow-none !border-none">
                  SKIP
                </Button>
              </div>

              {/* NEXT/SUBMIT — right */}
              <div className="flex-1 flex justify-end">
                <Button
                  onClick={handleNextQuestion}
                  variant="primary"
                  size="md"
                  className={`px-6 py-3 lg:px-12 lg:py-4 rounded-xl lg:rounded-[1.5rem] text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-duo-primary ${!answers[currentQuestionIndex] ? 'opacity-50 grayscale' : ''}`}
                >
                  {currentQuestionIndex === quiz.questions.length - 1 ? 'SUBMIT' : 'NEXT'} <ChevronRight className="w-4 h-4 ml-1 lg:ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      <style jsx global>{`
        .quiz-focus-mode {
          overflow-y: auto !important;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};


export default AttemptQuizPage;


