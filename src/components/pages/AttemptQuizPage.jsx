'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Clock, ArrowLeft, ArrowRight, Brain, CheckCircle, XCircle, Trophy, Star,
  Rocket, ChevronRight, BookOpen, GraduationCap, AlertTriangle, Home, SkipForward,
  BrainCircuit, Crown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import Loading from '../Loading';

const LeaderboardTable = ({ leaderboard, currentUser }) => {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="text-center py-4 mb-4">
        <div className="bg-gradient-to-r from-yellow-50 to-emerald-50 dark:from-yellow-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-emerald-700">
          <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No Leaderboard Yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Be the first to complete this quiz!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Leaderboard</h3>
      </div>

      {/* Mobile List */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isCurrentUser = entry.user?._id === currentUser?.id;
          return (
            <div key={entry._id} className={`flex items-center gap-3 p-3 rounded-xl ${isCurrentUser ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700' : 'bg-white/60 dark:bg-slate-700/60'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                index === 2 ? 'bg-gradient-to-r from-amber-600 to-yellow-600' :
                'bg-slate-300 dark:bg-slate-600'
              }`}>
                {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {entry.user?.name || 'Anonymous'}
                  {isCurrentUser && <span className="text-xs text-yellow-600 dark:text-yellow-400 ml-1">(You)</span>}
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

  // Timer - total quiz duration
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // Track time per question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      setIsTimerRunning(false);
      setSubmitted(true);

      // Record time for current question
      const updatedTime = [...timeTaken];
      updatedTime[currentQuestionIndex] = (updatedTime[currentQuestionIndex] || 0) + Math.round((Date.now() - questionStartTime) / 1000);

      const totalTime = updatedTime.reduce((a, b) => a + (b || 0), 0);
      const actualQuizId = quizId;

      const formattedAnswers = answers.map((ans, i) => ({
        selectedOptionIndex: ans === null || ans === undefined ? -1 : ans,
        timeTaken: updatedTime[i] || 0
      }));

      const res = await API.submitQuiz(actualQuizId, {
        attemptId,
        answers: formattedAnswers,
        totalTime
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
        const lbRes = await API.getQuizLeaderboard(actualQuizId);
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
  }, [quizId, answers, attemptId, timeTaken, currentQuestionIndex, questionStartTime, submitting]);

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
        } catch (e) {}
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
    // Record time for this question
    const updated = [...timeTaken];
    updated[currentQuestionIndex] = (updated[currentQuestionIndex] || 0) + Math.round((Date.now() - questionStartTime) / 1000);
    setTimeTaken(updated);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const updated = [...timeTaken];
      updated[currentQuestionIndex] = (updated[currentQuestionIndex] || 0) + Math.round((Date.now() - questionStartTime) / 1000);
      setTimeTaken(updated);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSkipQuestion = () => {
    const updated = [...answers];
    updated[currentQuestionIndex] = null;
    setAnswers(updated);
    handleNextQuestion();
  };

  const handleExitConfirm = (confirmed) => {
    setShowExitConfirm(false);
    if (confirmed) {
      handleSubmit();
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200 dark:border-red-700">
          <div className="text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-3">Exit Quiz?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Question {currentQuestionIndex + 1} of {quiz?.questions?.length || 0}. Exiting will submit your quiz with current answers.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-5">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleExitConfirm(false)} className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-medium transition-colors">
                Continue Quiz
              </button>
              <button onClick={() => handleExitConfirm(true)} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-medium transition-colors">
                Exit & Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 dark:text-slate-300 font-semibold">No questions available for this quiz.</p>
          <button onClick={() => router.push('/')} className="mt-4 text-primary-600 hover:underline text-sm">Go Home</button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;

  // ─── SUBMITTED: Result View ───
  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden pb-24">
        {/* Confetti */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="absolute animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${1 + Math.random() * 2}s` }}>
                <div className={`w-2 h-2 rounded-full ${['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]}`} />
              </div>
            ))}
          </div>
        )}

        <div className="container mx-auto px-3 lg:px-10 pt-6 pb-8">
          {/* Result Card */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-green-50 via-blue-50 to-emerald-50 dark:from-green-900/30 dark:via-blue-900/30 dark:to-emerald-900/30 rounded-2xl p-5 lg:p-8 border border-green-200 dark:border-green-700 shadow-xl">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-4">Quiz Completed!</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{result.correctCount}</div>
                  <div className="text-xs text-slate-500">Correct</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">{result.wrongCount}</div>
                  <div className="text-xs text-slate-500">Wrong</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{Math.round(result.percentage || 0)}%</div>
                  <div className="text-xs text-slate-500">Score</div>
                </div>
                <div className="bg-white/60 dark:bg-slate-700/60 rounded-xl p-3 border border-white/20">
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{Math.round(result.accuracy || 0)}%</div>
                  <div className="text-xs text-slate-500">Accuracy</div>
                </div>
              </div>

              {result.rank && (
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-xl mb-3 inline-flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="font-semibold text-sm">Rank #{result.rank} · Top {Math.round(result.percentile || 0)}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Review */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-8 border border-white/20 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
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

                return (
                  <div key={index} className={`rounded-xl p-4 border ${isSkipped ? 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 ${isSkipped ? 'bg-slate-400' : isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                        {index + 1}
                      </div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">{question.questionText}</p>
                    </div>

                    <div className="space-y-1.5 ml-11">
                      {question.options?.map((opt, optIdx) => {
                        const isSelected = ans.selectedOptionIndex === optIdx;
                        const isCorrectOpt = optIdx === correctIndex;
                        let optClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600';
                        if (isCorrectOpt) optClass = 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600';
                        if (isSelected && !isCorrect) optClass = 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600';

                        return (
                          <div key={optIdx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${optClass}`}>
                            {isCorrectOpt && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                            {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 shrink-0" />}
                            {!isCorrectOpt && !isSelected && <div className="w-4 h-4 shrink-0" />}
                            <span className="text-slate-700 dark:text-slate-300">{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="ml-11 mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300"><span className="font-semibold">Explanation:</span> {question.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <LeaderboardTable leaderboard={leaderboard} currentUser={currentUser} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button onClick={handleBack} className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
            <button onClick={() => router.push('/')} className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ IN PROGRESS ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 overflow-x-hidden">
      <div className="container mx-auto px-3 lg:px-10 pt-3 pb-32">

        {/* Quiz Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm lg:text-lg font-bold text-slate-800 dark:text-white truncate max-w-[200px] lg:max-w-none">{quiz?.title}</h1>
                <p className="text-[10px] lg:text-xs text-slate-500">{quiz.questions.length} Questions</p>
              </div>
            </div>
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm ${timeLeft <= 60 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-pulse' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">Q {currentQuestionIndex + 1}/{quiz.questions.length}</span>
            <span className="text-[10px] text-slate-400">{answeredCount} answered</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-8 border border-white/20 mb-3">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
              {currentQuestionIndex + 1}
            </div>
            <p className="text-base lg:text-lg font-semibold text-slate-800 dark:text-white leading-relaxed">{currentQuestion.questionText}</p>
          </div>

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
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-emerald-800 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-300'}`}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Navigation Dots */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-3 mb-3 border border-white/20">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {quiz.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const updated = [...timeTaken];
                  updated[currentQuestionIndex] = (updated[currentQuestionIndex] || 0) + Math.round((Date.now() - questionStartTime) / 1000);
                  setTimeTaken(updated);
                  setCurrentQuestionIndex(idx);
                }}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                  idx === currentQuestionIndex
                    ? 'bg-emerald-500 text-white shadow-md scale-110'
                    : answers[idx] !== null
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700 p-3 z-40">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Prev
            </button>
            <button
              onClick={handleSkipQuestion}
              className="px-4 py-3 rounded-xl font-semibold text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700 transition-all"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextQuestion}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transition-all"
            >
              {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit' : 'Next'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttemptQuizPage;
