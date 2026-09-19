'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Clock, ArrowLeft, ArrowRight, Brain, CheckCircle, XCircle, Trophy, Star,
  Rocket, ChevronRight, BookOpen, GraduationCap, AlertTriangle, Home, SkipForward,
  BrainCircuit, Crown, Users, Zap, AlertCircle, MessageSquare, Maximize2, Minimize2
} from 'lucide-react';
import DiscussionThread from '../discussions/DiscussionThread';

// Format seconds → "45s" or "1m 23s"
const fmtSec = (sec) => {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

// Returns speed badge props based on seconds taken
const speedBadge = (sec) => {
  if (!sec || sec <= 0) return null;
  if (sec <= 20) return { label: 'Fast', icon: <Zap className="w-3 h-3" />, cls: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' };
  if (sec <= 60) return { label: 'Good', icon: null, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white' };
  return { label: 'Slow', icon: <AlertCircle className="w-3 h-3" />, cls: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white' };
};
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { QuizAttemptSkeleton } from '../skeletons/PrivateSkeletons';
import LanguageToggle from '../LanguageToggle';
import useQuestionTranslation from '../../hooks/useQuestionTranslation';

const LeaderboardTable = ({ leaderboard, currentUser }) => {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-4 mb-4">
        <div className="bg-gradient-to-r from-slate-100 dark:from-slate-800 to-primary-50 dark:from-white/20 dark:to-primary-900/20 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 dark:border-primary-700">
          <Trophy className="w-10 h-10 text-black dark:text-white mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No Leaderboard Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Be the first to complete this quiz!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-black dark:from-white to-black dark:to-white rounded-lg lg:rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Leaderboard</h3>
      </div>

      {/* Mobile List */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.user?._id === currentUser?.id;
          return (
            <div key={entry._id} className={`flex items-center gap-3 p-3 rounded-lg lg:rounded-xl ${isCurrentUser ? 'bg-slate-100 dark:bg-slate-800 dark:bg-white/20 border border-slate-200 dark:border-slate-800 dark:border-white' : 'bg-white/60 dark:bg-slate-700/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white dark:text-black text-sm font-bold shrink-0 ${index === 0 ? 'bg-gradient-to-r from-black dark:from-white to-black dark:to-white' :
                  index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                    index === 2 ? 'bg-gradient-to-r from-black dark:from-white to-black dark:to-white' :
                      'bg-slate-300 dark:bg-slate-600'
                }`}>
                {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {entry.user?.name || 'Anonymous'}
                  {isCurrentUser && <span className="text-xs text-black dark:text-white ml-1">(You)</span>}
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
        toast.error(res.message || 'Error submitting quiz');
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
      toast.error('Error submitting quiz');
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
          toast.error(startRes.message || 'Could not start quiz');
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
          toast.success('Resumed your previous attempt');
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
        toast.error('Error loading quiz');
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 dark:border-white">
          <div className="text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-black dark:from-white to-black dark:to-white rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Exit Quiz?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Question {currentQuestionIndex + 1} of {quiz?.questions?.length || 0}. Exiting will submit your quiz with current answers.
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 dark:bg-white/20 border border-slate-200 dark:border-slate-800 dark:border-white rounded-lg p-3 mb-5">
              <p className="text-xs text-black dark:text-white">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleExitConfirm(false)} className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg lg:rounded-xl font-medium transition-colors">
                Continue Quiz
              </button>
              <button onClick={() => handleExitConfirm(true)} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-black dark:from-white to-black dark:to-white hover:from-black hover:to-black text-white dark:text-black rounded-lg lg:rounded-xl font-medium transition-colors">
                Exit & Submit
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-black dark:text-white mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-semibold">No questions available for this quiz.</p>
          <button onClick={() => router.push('/')} className="mt-4 text-primary-600 hover:underline text-sm">Go Home</button>
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
      toast.error('Only PRO users can challenge friends!');
      router.push('/subscription');
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
          title: 'Can you beat my score?',
          text: `I scored ${Math.round(result?.percentage || 0)}% on this quiz. I challenge you to beat me!`,
          url: link
        };

        if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(link);
          toast.success('Challenge link copied to clipboard!');
        }
      } else {
        toast.error(res.message || 'Failed to create challenge');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  // ─── SUBMITTED: Result View ───
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden pb-24">
        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="absolute animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${1 + Math.random() * 2}s` }}>
                <div className={`w-2 h-2 rounded-full ${['bg-black dark:bg-white', 'bg-black dark:bg-white', 'bg-black dark:bg-white', 'bg-primary-400', 'bg-black dark:bg-white'][Math.floor(Math.random() * 5)]}`} />
              </div>
            ))}
          </div>
        )}

        <div className="container mx-auto px-3 lg:px-10 pt-6 pb-8">
          {/* Result Card */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-primary-50 via-slate-100 dark:via-slate-800 to-primary-50 dark:from-primary-900/30 dark:via-white/30 dark:to-primary-900/30 rounded-2xl p-5 lg:p-8 border border-primary-200 dark:border-primary-700 shadow-xl">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-4">Quiz Completed!</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{result.correctCount}</div>
                  <div className="text-xs text-slate-500">Correct</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-black dark:text-white">{result.wrongCount}</div>
                  <div className="text-xs text-slate-500">Wrong</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-black dark:text-white">{Math.round(result.percentage || 0)}%</div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg lg:rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-black dark:text-white">{Math.round(result.accuracy || 0)}%</div>
                  <div className="text-xs text-slate-500">Accuracy</div>
                </div>
              </div>

              {result.rank && (
                <div className="bg-gradient-to-r from-slate-100 dark:from-slate-800 to-slate-100 dark:to-slate-800 dark:from-white/30 dark:to-white/30 text-black dark:text-white dark:text-black px-4 py-2 rounded-lg lg:rounded-xl mb-3 inline-flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="font-semibold text-sm">Rank #{result.rank} · Top {Math.round(result.percentile || 0)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Review */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-8 border border-white/20 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-black dark:from-white to-black dark:to-white rounded-lg lg:rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Quiz Review</h2>
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
                  <div key={index} className={`rounded-lg lg:rounded-xl p-4 border ${isSkipped ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : isCorrect ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700' : 'bg-slate-100 dark:bg-slate-800 dark:bg-white/20 border-slate-200 dark:border-slate-800 dark:border-white'}`}>
                    {/* Question header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${isSkipped ? 'bg-slate-400 text-white' : isCorrect ? 'bg-primary-500 text-white' : 'bg-black dark:bg-white text-white dark:text-black'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{question.questionText}</p>
                        {/* ⏱ Time-per-question */}
                        {timeLabel && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge?.cls || 'bg-slate-100 text-slate-500'}`}>
                              <Clock className="w-3 h-3" />{timeLabel}
                            </span>
                            {badge && (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>
                                {badge.icon}{badge.label}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 ml-11">
                      {question.options?.map((opt, optIdx) => {
                        const isSelected = ans.selectedOptionIndex === optIdx;
                        const isCorrectOpt = optIdx === correctIndex;
                        let optClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                        if (isCorrectOpt) optClass = 'bg-primary-100 dark:bg-primary-900/30 border-primary-400 dark:border-primary-600';
                        if (isSelected && !isCorrect) optClass = 'bg-slate-100 dark:bg-slate-800 dark:bg-white/30 border-black dark:border-white dark:border-white';

                        return (
                          <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${optClass}`}>
                            {isCorrectOpt && <CheckCircle className="w-4 h-4 text-primary-600 shrink-0" />}
                            {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-black dark:text-white shrink-0" />}
                            {!isCorrectOpt && !isSelected && <div className="w-4 h-4 shrink-0" />}
                            <span className="text-slate-700 dark:text-slate-300">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="ml-11 mt-2 p-2 bg-slate-100 dark:bg-slate-800 dark:bg-white/20 rounded-lg">
                        <p className="text-xs text-black dark:text-white"><span className="font-semibold">Explanation:</span> {question.explanation}</p>
                      </div>
                    )}

                    <div className="ml-11">
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
                className="w-full px-6 py-4 bg-gradient-to-r from-black dark:from-white to-black dark:to-white hover:from-black hover:to-black text-white dark:text-black rounded-2xl font-black text-lg uppercase tracking-wider shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingChallenge ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Users className="w-6 h-6" /> CHALLENGE FRIENDS TO BEAT THIS SCORE</>
                )}
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button onClick={handleBack} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg lg:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Go Back
              </button>
              <button onClick={() => router.push('/')} className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-black dark:to-white hover:from-primary-700 hover:to-black text-white rounded-lg lg:rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
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
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      <div className="container mx-auto px-3 lg:px-10 pt-3 pb-32">

        {/* Quiz Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 mb-3">
          {/* 3-column layout on desktop: left=title | center=dots | right=controls */}
          <div className="flex items-center mb-2">
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-black dark:to-white rounded-lg lg:rounded-xl flex items-center justify-center shrink-0">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 title={quiz?.title} className="text-sm lg:text-lg font-bold text-slate-800 dark:text-white truncate max-w-[200px] lg:max-w-none">{quiz?.title}</h1>
                <p className="text-[10px] lg:text-xs text-slate-500">{quiz.questions.length} Questions</p>
              </div>
            </div>

            {/* Center: Question Navigation Dots — desktop only, truly centered */}
            <div className="hidden lg:flex flex-wrap gap-1.5 justify-center flex-1">
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
                      ? 'bg-primary-500 text-white shadow-md scale-110'
                      : answers[idx] !== null
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                    }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Right: Language + Timer + Fullscreen */}
            <div className="flex items-center gap-2 flex-1 justify-end">
              {/* Language */}
              <LanguageToggle
                language={language}
                onToggle={toggleLanguage}
                translating={translating}
                className="flex items-center justify-center gap-1.5 min-w-[52px] px-3 py-1.5 rounded-lg lg:rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              />
              {/* Timer */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg lg:rounded-xl font-bold text-sm ${timeLeft <= 60 ? 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                className="flex items-center justify-center w-8 h-8 rounded-lg lg:rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-primary-500 to-black dark:to-white h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">Q {currentQuestionIndex + 1}/{quiz.questions.length}</span>
            <span className="text-[10px] text-slate-400">{answeredCount} answered</span>
          </div>

        </div>

        {/* Question Navigation Dots — mobile only, standalone card */}
        <div className="lg:hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 mb-3 border border-white/20">
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
                    ? 'bg-primary-500 text-white shadow-md scale-110'
                    : answers[idx] !== null
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                  }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-8 border border-white/20 mb-3">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
              {currentQuestionIndex + 1}
            </div>
            <p className="text-base lg:text-lg font-semibold text-slate-800 dark:text-white leading-relaxed">
              {translated?.questionText || currentQuestion.questionText}
            </p>
          </div>

          {translating && (
            <p className="text-[11px] font-bold text-black dark:text-white mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
              हिंदी में अनुवाद हो रहा है… (अभी अंग्रेज़ी दिख रही है)
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
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg lg:rounded-xl border-2 transition-all duration-200 ${isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                    }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-primary-800 dark:text-primary-200' : 'text-slate-700 dark:text-slate-300'}`}>
                    {translated?.optionTexts?.[optIdx] || option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 p-3 z-40">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-lg lg:rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Prev
            </button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-lg lg:rounded-xl font-bold text-sm bg-gradient-to-r from-black dark:from-white to-black dark:to-white text-white dark:text-black shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-lg lg:rounded-xl font-bold text-sm bg-gradient-to-r from-primary-600 to-black dark:to-white text-white shadow-md transition-all"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptQuizPage;
