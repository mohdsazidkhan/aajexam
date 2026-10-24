'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import {
  Clock, ArrowLeft, ArrowRight, Brain, CheckCircle, XCircle, Trophy, Star,
  Rocket, ChevronRight, BookOpen, GraduationCap, AlertTriangle, Home, SkipForward,
  BrainCircuit, Crown, Users, Zap, AlertCircle, MessageSquare, Maximize2, Minimize2
} from 'lucide-react';
import DiscussionThread from '../../common/discussions/DiscussionThread';

// Format seconds → "45s" or "1m 23s"
const fmtSec = (sec) => {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Score-based feedback shown above the result card
const getScoreMessage = (pct) => {
  if (pct >= 90) return { text: 'Outstanding! 🏆', cls: 'text-primary-600 dark:text-primary-300' };
  if (pct >= 75) return { text: 'Great Job! 🎉', cls: 'text-primary-600 dark:text-primary-300' };
  if (pct >= 50) return { text: 'Good Effort! 👍', cls: 'text-blue-600 dark:text-blue-400' };
  if (pct >= 35) return { text: 'Keep Practicing! 💪', cls: 'text-amber-600 dark:text-amber-400' };
  return { text: 'Needs Improvement 📚', cls: 'text-red-600 dark:text-red-400' };
};

// Returns speed badge props based on seconds taken
const speedBadge = (sec) => {
  if (!sec || sec <= 0) return null;
  if (sec <= 20) return { label: 'Fast', icon: <Zap className="w-3 h-3" />, cls: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' };
  if (sec <= 60) return { label: 'Good', icon: null, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white ' };
  return { label: 'Slow', icon: <AlertCircle className="w-3 h-3" />, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white ' };
};
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import { QuizAttemptSkeleton } from '../../common/skeletons/PrivateSkeletons';
import LanguageToggle from '../../common/LanguageToggle';
import useQuestionTranslation from '../../../hooks/useQuestionTranslation';
import useTranslate from '../../../hooks/useTranslate';

const LeaderboardTable = ({ leaderboard, currentUser }) => {
  const { translate, translateData } = useTranslate();
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-4 mb-4">
        <div className="relative overflow-hidden bg-background-surface shadow-md p-6 border border-slate-200 dark:border-slate-800" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
          <span className="w-14 h-14 flex items-center justify-center mx-auto mb-3 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 16 }}><Trophy className="w-7 h-7" /></span>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">{translate('No Leaderboard Yet')}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{translate('Be the first to complete this quiz!')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 12 }}>
          <Trophy className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white">{translate('Leaderboard')}</h3>
      </div>

      {/* Mobile List */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const rank = entry.rank || index + 1; // API sends the live rank (ties share a rank)
          const myId = currentUser?._id || currentUser?.id;
          const isCurrentUser = !!myId && String(entry.user?._id) === String(myId);
          return (
            <div key={entry._id} style={{ borderRadius: 12 }} className={`flex items-center gap-3 p-3 border shadow-sm ${isCurrentUser ? 'bg-primary-50 dark:bg-primary-400/10 border-primary-300 dark:border-primary-400/50' : 'bg-background-surface border-slate-200 dark:border-slate-800'}`}>
              <div style={{ borderRadius: 999 }} className={`min-w-8 h-8 px-2 flex items-center justify-center text-sm font-black shrink-0 shadow ${rank === 1 ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950' :
                  rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900' :
                    rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}>
                #{rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate flex items-center gap-1">
                  {rank === 1 && <Crown className="w-4 h-4 shrink-0 text-amber-500" />}
                  <span className="truncate">{entry.user?.name || translate('Anonymous')}</span>
                  {isCurrentUser && <span className="text-xs font-black text-primary-700 dark:text-primary-300 ml-1 shrink-0">{translate('(You)')}</span>}
                </p>
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-white">{Math.round(entry.percentage || 0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AttemptQuizPage = () => {
  const { translate, translateData } = useTranslate();
  const router = useRouter();
  const { id: quizId } = router.query;

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

  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeTaken, setTimeTaken] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Refs to avoid stale closures
  const answersRef = useRef(answers);
  const timeTakenRef = useRef(timeTaken);
  const currentQuestionIndexRef = useRef(currentQuestionIndex);
  const handleSubmitRef = useRef(null);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { timeTakenRef.current = timeTaken; }, [timeTaken]);
  useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);

  // EN ⇄ HI translation of the current question + its options
  const { language, toggleLanguage, translating, translated } = useQuestionTranslation({
    questions: quiz?.questions,
    currentIndex: currentQuestionIndex,
    sourceType: 'quiz',
    sourceId: quiz?._id,
  });

  // Timer - uses ref to avoid stale closure
  useEffect(() => {
    if (!quiz || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (handleSubmitRef.current) handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, submitted]);

  // Track time per question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const recordTime = useCallback(() => {
    const updated = [...timeTakenRef.current];
    const idx = currentQuestionIndexRef.current;
    updated[idx] = (updated[idx] || 0) + Math.round((Date.now() - questionStartTime) / 1000);
    setTimeTaken(updated);
    timeTakenRef.current = updated;
    return updated;
  }, [questionStartTime]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setIsTimerRunning(false);
      setSubmitted(true);

      const updatedTime = recordTime();
      const totalTime = updatedTime.reduce((a, b) => a + (b || 0), 0);
      const currentAnswers = answersRef.current;

      const formattedAnswers = currentAnswers.map((ans, i) => ({
        selectedOptionIndex: ans === null || ans === undefined ? -1 : ans,
        timeTaken: updatedTime[i] || 0
      }));

      const res = await API.submitQuiz(quizId, {
        attemptId,
        answers: formattedAnswers,
        totalTime,
        challengeCode: router.query.challengeCode || router.query.challenge || null
      });

      if (res.success) {
        setResult(res.data);
        if (res.data.percentage >= 80) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } else {
        toast.error(res.message || translate('Error submitting quiz'));
        setSubmitted(false);
      }

      try {
        const lbRes = await API.getQuizLeaderboard(quizId);
        if (lbRes.success) setLeaderboard(lbRes.data || []);
      } catch (e) {
        console.log('Leaderboard not available');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(translate('Error submitting quiz'));
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  }, [quizId, attemptId, submitting, recordTime, router.query]);

  // Keep submit ref in sync
  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);

  // Fetch quiz and start attempt
  useEffect(() => {
    if (!quizId) return;
    const fetchAndStart = async () => {
      try {
        setLoading(true);
        const startRes = await API.startQuiz(quizId);
        if (!startRes.success) {
          toast.error(startRes.message || translate('Could not start quiz'));
          return;
        }

        const quizData = startRes.quiz;
        setQuiz(quizData);
        setAttemptId(startRes.data._id);
        setAnswers(new Array(quizData.questions?.length || 0).fill(null));
        setTimeTaken(new Array(quizData.questions?.length || 0).fill(0));
        setTimeLeft(quizData.duration * 60);
        setIsTimerRunning(true);

        if (startRes.resumed) {
          toast.success(translate('Resumed your previous attempt'));
          // Restore previous answers if any
          const prevAnswers = startRes.data.answers || [];
          const restored = prevAnswers.map(a => a.selectedOptionIndex === -1 ? null : a.selectedOptionIndex);
          setAnswers(restored);
        }

        try {
          const lbRes = await API.getQuizLeaderboard(quizId);
          if (lbRes.success) setLeaderboard(lbRes.data || []);
        } catch (e) { }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error(translate('Error loading quiz'));
      } finally {
        setLoading(false);
      }
    };
    fetchAndStart();
  }, [quizId]);

  // Browser back/unload prevention
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!submitted && quiz) {
        event.preventDefault();
        event.returnValue = 'Your quiz progress will be lost!';
      }
    };
    const handlePopState = (event) => {
      if (!submitted && quiz) {
        event.preventDefault();
        setShowExitConfirm(true);
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    if (router.isReady) window.history.pushState(null, '', window.location.href);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [submitted, quiz, router.isReady]);

  const handleSelect = (optionIndex) => {
    const updated = [...answers];
    // Toggle - if same option clicked again, deselect
    updated[currentQuestionIndex] = updated[currentQuestionIndex] === optionIndex ? null : optionIndex;
    setAnswers(updated);
  };

  const handleNextQuestion = () => {
    recordTime();
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      recordTime();
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleExitConfirm = (confirmed) => {
    setShowExitConfirm(false);
    if (confirmed) {
      if (handleSubmitRef.current) handleSubmitRef.current();
    }
  };

  const handleBack = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem('quizNavigationData');
    const from = navigationData?.fromPage;
    if (from === 'search') router.push('/search');
    else if (from === 'quiz-preview') router.push(`/quiz/${quizId}`);
    else router.push('/');
  }, [navigationData, quizId, router]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Exit confirmation modal
  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="relative overflow-hidden bg-background-surface p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
          <div className="text-center">
            <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 16 }}>
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">{translate('Exit Quiz?')}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              {translate('Question {current} of {total}. Exiting will submit your quiz with current answers.', { current: currentQuestionIndex + 1, total: quiz?.questions?.length || 0 })}
            </p>
            <div className="bg-primary-50 dark:bg-white/5 border border-dashed border-primary-300 dark:border-white/20 rounded-lg p-3 mb-5">
              <p className="text-xs font-bold text-slate-800 dark:text-white">{translate('This action cannot be undone.')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleExitConfirm(false)} style={{ borderRadius: 12 }} className="flex-1 px-4 py-2.5 bg-background-surface border border-slate-300 dark:border-slate-600 hover:border-primary-500 text-slate-800 dark:text-white font-black uppercase text-sm transition-all">
                {translate('Continue Quiz')}
              </button>
              <button onClick={() => handleExitConfirm(true)} style={{ borderRadius: 12 }} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg hover:brightness-105 font-black uppercase text-sm transition-all">
                {translate('Exit & Submit')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <QuizAttemptSkeleton />;
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-page">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-black dark:text-white mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-semibold">{translate('No questions available for this quiz.')}</p>
          <button onClick={() => router.push('/')} className="mt-4 text-primary-600 dark:text-primary-300 hover:underline text-sm">{translate('Go Home')}</button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;
  const handleChallenge = async () => {
    const isPro = currentUser?.subscriptionStatus?.toUpperCase() === 'PRO' || currentUser?.role === 'admin';
    if (!isPro) {
      toast.error(translate('Only PRO users can challenge friends!'));
      router.push('/student/subscription');
      return;
    }

    try {
      setIsGeneratingChallenge(true);
      const res = await API.request('/api/challenge/create', {
        method: 'POST',
        body: JSON.stringify({ quizId: quiz?._id || quizId, attemptId: result?._id || attemptId })
      });

      if (res.success && res.challengeCode) {
        const link = `${window.location.origin}/challenge/${res.challengeCode}`;
        const shareData = {
          title: translate('Can you beat my score?'),
          text: translate('I scored {score}% on this quiz. I challenge you to beat me!', { score: Math.round(result?.percentage || 0) }),
          url: link
        };

        if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(link);
          toast.success(translate('Challenge link copied to clipboard!'));
        }
      } else {
        toast.error(res.message || translate('Failed to create challenge'));
      }
    } catch (err) {
      toast.error(translate('Something went wrong'));
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  // ─── SUBMITTED: Result View ───
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background-page overflow-x-hidden pb-24">
        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="absolute animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${1 + Math.random() * 2}s` }}>
                <div className={`w-2 h-2 rounded-full ${['bg-primary-600','bg-primary-600','bg-primary-600','bg-primary-400','bg-primary-600'][Math.floor(Math.random() * 5)]}`} />
              </div>
            ))}
          </div>
        )}

        <div className="pt-6 pb-8">
          {/* Result Card */}
          <div className="text-center mb-6">
            <div className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl p-5 xl:p-8" style={{ borderRadius: 16 }}>
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} /><div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} /><div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/25 blur-3xl" style={{ borderRadius: '50%' }} />
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 flex items-center justify-center animate-pulse bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow-lg rotate-[-4deg]" style={{ borderRadius: 22 }}>
                  <Trophy className="w-10 h-10" />
                </div>
              </div>
              {/* Score-based feedback */}
              <p className={`text-xl xl:text-2xl font-black mb-1 ${getScoreMessage(result.percentage || 0).cls}`}>
                {translate(getScoreMessage(result.percentage || 0).text)}
              </p>
              <h2 className="text-xl xl:text-3xl font-black font-outfit uppercase tracking-tight text-slate-800 dark:text-white mb-4">{translate('Quiz Completed!')}</h2>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 xl:gap-3 mb-4">
                <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                  <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{result.correctCount}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Correct')}</div>
                </div>
                <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                  <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{result.wrongCount}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Wrong')}</div>
                </div>
                <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                  <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{Math.round(result.percentage || 0)}%</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Score')}</div>
                </div>
                <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                  <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{Math.round(result.accuracy || 0)}%</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Accuracy')}</div>
                </div>
                <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                  <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{quiz?.duration ? `${quiz.duration}m` : '—'}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Quiz Total Time')}</div>
                </div>
                <div className="relative overflow-hidden bg-white/80 hover:bg-white dark:bg-white/10 dark:hover:bg-white/15 ring-1 ring-slate-200 dark:ring-white/20 p-3 transition-colors" style={{ borderRadius: 10 }}>
                  <div className="text-2xl font-black font-outfit text-primary-700 dark:text-primary-200">{fmtSec(timeTaken.reduce((sum, t) => sum + (t || 0), 0)) || '0s'}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 dark:text-white/75">{translate('Total Time Taken')}</div>
                </div>
              </div>

              {result.rank && (
                <div className="bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow px-4 py-2 mb-3 inline-flex items-center gap-2" style={{ borderRadius: 999 }}>
                  <Crown className="w-4 h-4" />
                  <span className="font-semibold text-sm">{translate('Rank #{rank} · Top {percentile}%', { rank: result.rank, percentile: Math.round(result.percentile || 0) })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Review */}
          <div className="relative overflow-hidden bg-background-surface shadow-md p-4 xl:p-8 border border-slate-200 dark:border-slate-800 mb-6" style={{ borderRadius: 16 }}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 12 }}>
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white">{translate('Quiz Review')}</h2>
            </div>

            <div className="space-y-5">
              {result.answers?.map((ans, index) => {
                const question = ans.question;
                if (!question) return null;
                const correctIndex = question.options?.findIndex(o => o.isCorrect);
                const isSkipped = ans.selectedOptionIndex === -1;
                const isCorrect = ans.isCorrect;
                // timeTaken from local state array (tracked during quiz)
                const secTaken = timeTaken[index] || ans.timeTaken || 0;
                const timeLabel = fmtSec(secTaken);
                const badge = speedBadge(secTaken);

                return (
                  <div key={index} style={{ borderRadius: 14 }} className={`relative overflow-hidden p-4 xl:p-5 border border-l-4 shadow-sm ${isSkipped ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 border-l-slate-400' : isCorrect ? 'bg-primary-50/60 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 border-l-primary-500' : 'bg-red-50/70 dark:bg-red-900/20 border-red-200 dark:border-red-800 border-l-red-500'}`}>
                    {/* Question header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div style={{ borderRadius: 10 }} className={`w-8 h-8 flex items-center justify-center text-sm font-black shrink-0 shadow ${isSkipped ? 'bg-slate-400 text-white' : isCorrect ? 'bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white' : 'bg-gradient-to-br from-red-500 to-red-700 text-white'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white break-words">{question.questionText}</p>
                        {/* ⏱ Time-per-question */}
                        {timeLabel && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge?.cls || 'bg-slate-100 text-slate-500'}`}>
                              <Clock className="w-3 h-3" />{translate('Time Taken: {time}', { time: timeLabel })}
                            </span>
                            {badge && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>
                                {badge.icon}{translate(badge.label)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    <span style={{ borderRadius: 999 }} className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${isSkipped ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : isCorrect ? 'bg-primary-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isSkipped ? translate('Skipped') : isCorrect ? translate('Correct') : translate('Wrong')}
                    </span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                      {question.options?.map((opt, optIdx) => {
                        const isSelected = ans.selectedOptionIndex === optIdx;
                        const isCorrectOpt = optIdx === correctIndex;
                        let optClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                        if (isCorrectOpt) optClass = 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600';
                        if (isSelected && !isCorrect) optClass = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-600';

                        return (
                          <div key={optIdx} style={{ borderRadius: 10 }} className={`flex items-center gap-2.5 px-3 py-2.5 border text-sm ${optClass}`}>
                          <span style={{ borderRadius: 8 }} className={`w-6 h-6 shrink-0 flex items-center justify-center text-[11px] font-black ${isCorrectOpt ? 'bg-primary-500 text-white' : isSelected && !isCorrect ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-200'}`}>{String.fromCharCode(65 + optIdx)}</span>
                          <span className="flex-1 min-w-0 break-words font-medium text-slate-700 dark:text-slate-200">{opt.text}</span>
                          {isCorrectOpt && <CheckCircle className="w-4 h-4 text-primary-600 dark:text-primary-300 shrink-0" />}
                          {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />}
                        </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-3 p-2.5 bg-primary-50 dark:bg-white/5 border border-dashed border-primary-300 dark:border-white/20 rounded-lg">
                        <p className="text-xs text-black dark:text-white"><span className="font-semibold">{translate('Explanation:')}</span> {question.explanation}</p>
                      </div>
                    )}

                    <div className="ml-0 xl:ml-11">
                      <DiscussionThread
                        questionId={question._id}
                        sourceType="quiz"
                        sourceId={quiz?._id || quizId}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <LeaderboardTable leaderboard={leaderboard} currentUser={currentUser} />

          {/* Actions */}
          <div className="flex flex-col gap-3 mt-6">
            {!quizId?.startsWith('adaptive-') && !router.query.challengeCode && !router.query.challenge && (
              <button
                onClick={handleChallenge}
                disabled={isGeneratingChallenge}
                style={{ borderRadius: 14 }} className="w-full px-6 py-4 bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] font-black text-sm sm:text-lg uppercase tracking-wide sm:tracking-wider shadow-lg transition-all hover:brightness-105 hover:-translate-y-0.5 flex items-center justify-center gap-2 sm:gap-3 text-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingChallenge ? (
                  <div className="w-6 h-6 border-2 border-primary-950/30 border-t-primary-950 rounded-full animate-spin" />
                ) : (
                  <><Users className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" /> {translate('CHALLENGE FRIENDS TO BEAT THIS SCORE')}</>
                )}
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button onClick={handleBack} style={{ borderRadius: 12 }} className="flex-1 px-6 py-3 bg-background-surface border border-slate-300 dark:border-slate-700 hover:border-primary-500 text-slate-800 dark:text-white font-black uppercase tracking-wide text-sm shadow-sm transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
              <button onClick={() => router.push('/')} style={{ borderRadius: 12 }} className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-800 hover:brightness-110 text-white font-black uppercase tracking-wide text-sm shadow-md transition-all flex items-center justify-center gap-2">
                <Home className="w-4 h-4" /> Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ IN PROGRESS ───
  return (
    <div className="min-h-screen bg-background-page overflow-x-hidden">
      <div className="pt-3 pb-32 sm:pb-36">

        {/* Quiz Header */}
        <div className="relative overflow-hidden bg-background-surface shadow-md border border-slate-200 dark:border-slate-800 p-3 mb-3" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
          {/* 3-column layout on desktop: left=title | center=dots | right=controls */}
          <div className="flex items-center mb-2">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 flex items-center justify-center shrink-0 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}>
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h1 title={quiz?.title} className="text-sm xl:text-lg font-bold text-slate-800 dark:text-white truncate xl:max-w-none">{translateData(quiz?.title)}</h1>
                <p className="text-[10px] xl:text-xs text-slate-500">{translate('{count} Questions', { count: quiz.questions.length })}</p>
              </div>
            </div>

            {/* Center: Question Navigation Dots — desktop only, truly centered */}
            <div className="hidden xl:flex flex-wrap gap-1.5 justify-center flex-1">
              {quiz.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const updated = [...timeTaken];
                    updated[currentQuestionIndex] = (updated[currentQuestionIndex] || 0) + Math.round((Date.now() - questionStartTime) / 1000);
                    setTimeTaken(updated);
                    setCurrentQuestionIndex(idx);
                  }}
                  className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${idx === currentQuestionIndex
                      ? 'bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow scale-110'
                      : answers[idx] !== null
                        ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200 border border-primary-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Right: Language + Timer + Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 xl:flex-1 justify-end">
              {/* Language */}
              <LanguageToggle
                language={language}
                onToggle={toggleLanguage}
                translating={translating}
                className="flex shrink-0 items-center justify-center gap-1.5 min-w-[44px] sm:min-w-[52px] px-2 sm:px-3 py-1.5 rounded-lg xl:rounded-xl font-bold text-xs sm:text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              />
              {/* Timer */}
              <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg xl:rounded-xl font-bold text-xs sm:text-sm ${timeLeft <= 60 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 animate-pulse' : 'bg-primary-50 dark:bg-white/10 text-primary-800 dark:text-primary-200 ring-1 ring-primary-200 dark:ring-white/15'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? translate('Exit Fullscreen') : translate('Enter Fullscreen')}
                className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg xl:rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-primary-500 via-primary-300 to-primary-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">{translate('Q {current}/{total}', { current: currentQuestionIndex + 1, total: quiz.questions.length })}</span>
            <span className="text-[10px] text-slate-400">{translate('{count} answered', { count: answeredCount })}</span>
          </div>

        </div>

        {/* Question Navigation Dots — mobile only, standalone card */}
        <div className="xl:hidden bg-background-surface shadow-md p-3 mb-3 border border-slate-200 dark:border-slate-800" style={{ borderRadius: 14 }}>
          <div
            className="flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const updated = [...timeTaken];
                  updated[currentQuestionIndex] = (updated[currentQuestionIndex] || 0) + Math.round((Date.now() - questionStartTime) / 1000);
                  setTimeTaken(updated);
                  setCurrentQuestionIndex(idx);
                }}
                className={`w-7 h-7 shrink-0 rounded-lg text-[10px] font-bold transition-all ${idx === currentQuestionIndex
                    ? 'bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow scale-110'
                    : answers[idx] !== null
                      ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-200 border border-primary-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="relative overflow-hidden bg-background-surface shadow-md p-4 xl:p-8 border border-slate-200 dark:border-slate-800 mb-3" style={{ borderRadius: 16 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-primary-300 to-primary-500" />
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 flex items-center justify-center text-sm font-black shrink-0 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 10 }}>
              {currentQuestionIndex + 1}
            </div>
            <p className="text-[15px] sm:text-base xl:text-lg font-semibold text-slate-800 dark:text-white leading-relaxed break-words min-w-0">
              {translated?.questionText || currentQuestion.questionText}
            </p>
          </div>

          {translating && (
            <p className="text-[11px] font-bold text-black dark:text-white mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse"/>
              {translate('हिंदी में अनुवाद हो रहा है… (अभी अंग्रेज़ी दिख रही है)')}
            </p>
          )}

          {currentQuestion.image && (
            <div className="mb-4 flex justify-center">
              <img src={currentQuestion.image} alt="Question" className="max-w-full max-h-48 rounded-lg object-contain" />
            </div>
          )}

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options?.map((option, optIdx) => {
              const isSelected = answers[currentQuestionIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(optIdx)}
                  className={`w-full text-left flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg xl:rounded-xl border-2 transition-all duration-200 ${isSelected
                      ? 'border-primary-400 bg-primary-50 dark:bg-primary-400/10 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-background-surface hover:border-primary-400 hover:-translate-y-0.5'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${isSelected ? 'bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className={`text-sm font-medium break-words min-w-0 ${isSelected ? 'text-primary-800 dark:text-primary-100 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                    {translated?.optionTexts?.[optIdx] || option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t-2 border-primary-300 dark:border-primary-400/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              style={{ borderRadius: 12 }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 font-black uppercase text-sm bg-background-surface border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Prev
            </button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ borderRadius: 12 }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 font-black uppercase text-sm bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
              >
                {submitting ? translate('Submitting...') : translate('Submit Quiz')}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                style={{ borderRadius: 12 }} className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 font-black uppercase text-sm bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-[#000] shadow-lg hover:brightness-105 transition-all"
              >
                {translate('Next')} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptQuizPage;
