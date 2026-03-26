'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/mobile-app.module.css';
import API from '../../lib/api';
import { toast } from 'react-toastify';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import {
  FaClock,
  FaArrowLeft,
  FaArrowRight,
  FaBrain,
  FaCheckCircle,
  FaTimesCircle,
  FaTrophy,
  FaStar,
  FaRocket,
  FaChartLine,
  FaCrown,
  FaCheck,
  FaTimes,
  FaQuestionCircle,
  FaBookOpen,
  FaGraduationCap,
  FaExclamationTriangle,
  FaHome
} from 'react-icons/fa';

const LeaderboardTable = ({ leaderboard, currentUser }) => {
  if (!leaderboard || leaderboard?.length === 0) {
    return (
      <div className="text-center py-0 md:py-2 lg:py-4 xl:py-6 mb-4">
        <div className="bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/20 dark:to-red-900/20 rounded-2xl p-2 md:p-8 border border-primary-200 dark:border-red-700">
          <FaTrophy className="text-4xl text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Leaderboard Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Be the first to complete this quiz and claim the top spot!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-primary-400 to-primary-500 rounded-xl flex items-center justify-center">
          <FaTrophy className="text-white text-xl" />
        </div>
        <h3 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white">Leaderboard</h3>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem]">
            <thead className="bg-gradient-to-r from-primary-500 to-secondary-500">
              <tr>
                <th className="py-2 md:py-4 px-2 md:px-6 text-white font-semibold text-center">Rank</th>
                <th className="py-2 md:py-4 px-2 md:px-6 text-white font-semibold text-left">Student</th>
                <th className="py-2 md:py-4 px-2 md:px-6 text-white font-semibold text-center">Score</th>
                <th className="py-2 md:py-4 px-2 md:px-6 text-white font-semibold text-center">Attempted At</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard?.map(({ rank, studentName, studentId, score, attemptedAt }, index) => {
                const isCurrentUser = studentId === currentUser?.id;
                const isTopThree = rank <= 3;

                return (
                  <tr
                    key={rank}
                    className={`transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isCurrentUser ? 'bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/30 dark:to-red-900/30 border-l-4 border-primary-500' : ''
                      }`}
                  >
                    <td className="py-2 md:py-4 px-2 md:px-6 text-center">
                      <div className="flex items-center justify-center">
                        {isTopThree ? (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${rank === 1 ? 'bg-gradient-to-r from-primary-400 to-primary-500' :
                            rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                              'bg-gradient-to-r from-amber-600 to-primary-600'
                            }`}>
                            {rank === 1 ? <FaCrown className="text-sm" /> : rank}
                          </div>
                        ) : (
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-2 md:px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {studentName?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800 dark:text-white">
                            {studentName || 'Anonymous'}
                          </div>
                          {isCurrentUser && (
                            <div className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                              You
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-2 md:px-6 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800 dark:text-white">
                          {score || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2 md:py-4 px-2 md:px-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        try {
                          const date = new Date(attemptedAt);
                          if (isNaN(date.getTime())) {
                            return 'N/A';
                          }
                          return date.toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        } catch (error) {
                          return 'N/A';
                        }
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const AttemptQuizPage = () => {
  const router = useRouter();
  const { quizId } = router.query; // Get quizId from router.query for Pages Router
  // Memoize navigation data parsing to prevent re-computation on every render
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
  console.log(navigationData, 'navigationData')
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
  //const [selectedOption, setSelectedOption] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  // Fullscreen functions
  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      } else {
        console.warn('Fullscreen mode is not supported in your browser.');
        return;
      }
      setIsFullscreen(true);
    } catch (error) {
      // Silently handle fullscreen errors - don't show toast
      // This is expected when browser blocks auto-fullscreen
      console.log('Fullscreen blocked (expected):', error.message);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
    }
  }, []);

  const handleFullscreenChange = useCallback(() => {
    const isFullscreenNow = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
    setIsFullscreen(isFullscreenNow);

    // If user exited fullscreen during quiz (not submitted), show confirmation
    if (!isFullscreenNow && !submitted && quiz && !showExitConfirm) {
      console.log('Fullscreen exited - Showing confirmation...');
      setShowExitConfirm(true);
    }
  }, [submitted, quiz, showExitConfirm]);

  const handleExitConfirm = (confirmed) => {
    setShowExitConfirm(false);
    if (confirmed) {
      // User confirmed exit - submit quiz
      handleSubmit();
    } else {
      // User cancelled - re-enter fullscreen
      enterFullscreen();
    }
  };

  // Fullscreen button removed - quiz stays in fullscreen until submitted
  // User cannot manually toggle fullscreen during quiz

  // Fullscreen event listeners
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    // F11 key disabled - quiz must stay in fullscreen until submitted
    const handleKeyDown = (event) => {
      if (event.key === 'F11' && !submitted && quiz) {
        event.preventDefault(); // Block F11 toggle during quiz
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [submitted, quiz, handleFullscreenChange]);

  // Enter fullscreen immediately when page loads (default behavior)
  useEffect(() => {
    // Attempt to enter fullscreen as soon as component mounts
    // This happens on page load, user already accepted in QuizStartModal
    if (!submitted && !loading) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        enterFullscreen();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [submitted, loading, enterFullscreen]);

  // Also enter fullscreen when quiz loads (backup in case first attempt fails)
  useEffect(() => {
    if (quiz && !submitted && !loading) {
      // User already gave consent in QuizStartModal
      // This is safe because modal open was triggered by user click
      enterFullscreen();
    }
  }, [quiz, submitted, loading, enterFullscreen]);

  // Browser back button prevention
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!submitted && quiz) {
        event.preventDefault();
        event.returnValue = 'Are you sure you want to leave? Your quiz progress will be lost.';
        return 'Are you sure you want to leave? Your quiz progress will be lost.';
      }
    };

    const handlePopState = (event) => {
      if (!submitted && quiz) {
        event.preventDefault();
        // Show confirmation on back button
        setShowExitConfirm(true);
        // Push the current state back to prevent navigation
        if (router.isReady) {
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Push current state to history
    if (router.isReady) {
      window.history.pushState(null, '', window.location.href);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [submitted, quiz, router.isReady]);

  const handleSubmit = useCallback(async () => {
    try {
      setIsTimerRunning(false);
      // Set submitted to true before exiting fullscreen to prevent exit confirmation
      setSubmitted(true);

      // Exit fullscreen when submitting - check actual fullscreen state
      const isCurrentlyFullscreen = !!(document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement);

      if (isCurrentlyFullscreen) {
        try {
          await exitFullscreen();
        } catch (error) {
          console.log('Error exiting fullscreen:', error);
        }
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
      } catch (leaderboardError) {
        console.log('Leaderboard not available:', leaderboardError);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error(error.response?.data?.message || 'Error submitting quiz');
      // Reset submitted state if there's an error
      setSubmitted(false);
    }
  }, [quizData?._id, quizId, answers, exitFullscreen]);

  // Ensure fullscreen exits after submission
  useEffect(() => {
    if (submitted) {
      // Force exit fullscreen when quiz is submitted
      const exitFullscreenNow = async () => {
        const isCurrentlyFullscreen = !!(document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement);

        if (isCurrentlyFullscreen) {
          try {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
              await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
              await document.msExitFullscreen();
            }
            setIsFullscreen(false);
          } catch (error) {
            console.log('Error exiting fullscreen after submit:', error);
          }
        }
      };

      exitFullscreenNow();
    }
  }, [submitted]);

  const handleSkipQuestion = useCallback(() => {
    const updated = [...answers];
    updated[currentQuestionIndex] = 'SKIP';
    setAnswers(updated);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentQuestionIndex, quiz?.questions?.length, answers, handleSubmit]);


  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Skip question logic inline to avoid dependency issues
            const updated = [...answers];
            updated[currentQuestionIndex] = 'SKIP';
            setAnswers(updated);

            if (currentQuestionIndex < quiz.questions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
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

  // Start timer when question changes
  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions[currentQuestionIndex]) {
      const question = quiz.questions[currentQuestionIndex];
      const questionTime = question.timeLimit || 30;
      setTimeLeft(questionTime);
      setIsTimerRunning(true);
      //setSelectedOption(null);
    }
  }, [currentQuestionIndex, quiz]);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const actualQuizId = quizData?._id || quizId;
        const quizRes = await API.getQuizById(actualQuizId);
        setQuiz(quizRes);
        setTimeLeft(quizRes.timeLimit || 30);

        // Initialize answers array
        setAnswers(new Array(quizRes.questions.length).fill(null));

        // Load quiz-specific leaderboard
        try {
          const leaderboardRes = await API.getQuizLeaderboard(actualQuizId);
          setLeaderboard(leaderboardRes.leaderboard || []);
        } catch (leaderboardError) {
          console.log('Leaderboard not available:', leaderboardError);
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        toast.error('Error loading quiz');
      } finally {
        setLoading(false);
      }
    };

    if (quizId || quizData?._id) {
      fetchQuizData();
    }
  }, [quizId, quizData?._id]);

  const handleSelect = (option) => {
    // Check if user is logged in
    if (!currentUser) {
      // Store current quiz context for return after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      toast.info('Please login to answer questions');
      router.push('/login');
      return;
    }

    //setSelectedOption(option);
    const updated = [...answers];
    updated[currentQuestionIndex] = option;
    setAnswers(updated);
  };




  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = useCallback(() => {
    // Clear the navigation data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quizNavigationData');
    }

    if (fromPage === "category") {
      router.push(`/category/${quizData?.category?._id}`);
    } else if (fromPage === "subcategory") {
      router.push(`/subcategory/${subcategoryId || quizData?.subcategory?._id}`);
    } else if (fromPage === "level-quizzes") {
      router.push(`/level-quizzes`);
    } else if (fromPage === "level-detail") {
      router.push(`/level/${levelNumber}`);
    } else if (fromPage === "home") {
      router.push(`/level/${levelNumber}`);
    } else if (fromPage === "search") {
      router.push(`/search?q=${searchQuery}`);
    } else {
      router.push(`/`);
    }
  }, [fromPage, quizData?.category?._id, subcategoryId, quizData?.subcategory?._id, levelNumber, searchQuery, router]);


  // Add/remove fullscreen class to body for global styling (must be before early returns)
  useEffect(() => {
    if (isFullscreen && !submitted) {
      document.body.classList.add('quiz-fullscreen-mode');
    } else {
      document.body.classList.remove('quiz-fullscreen-mode');
    }

    return () => {
      document.body.classList.remove('quiz-fullscreen-mode');
    };
  }, [isFullscreen, submitted]);

  // Exit confirmation modal
  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 lg:p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-200 dark:border-red-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-white text-2xl" />
            </div>

            <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Exit Quiz?
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You're currently on question {currentQuestionIndex + 1} of {quiz?.questions?.length || 0}.
              Exiting fullscreen will submit your quiz with current answers.
            </p>

            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-primary-800 dark:text-primary-200">
                ⚠️ This action cannot be undone. Your quiz will be automatically submitted.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleExitConfirm(false)}
                className="flex-1 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors duration-300 font-medium"
              >
                Continue Quiz
              </button>
              <button
                onClick={() => handleExitConfirm(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-primary-500 hover:from-secondary-600 hover:to-primary-600 text-white rounded-xl transition-colors duration-300 font-medium"
              >
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
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-purple-50 to-pink-50 dark:from-red-900 dark:via-gray-900 dark:to-primary-900 flex items-center justify-center">
        <Loading size="lg" color="gray" message="Loading your quiz..." />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <>
      <div className={`${styles.minHScreen} bg-gradient-to-br from-secondary-50 via-purple-50 to-pink-50 dark:from-red-900 dark:via-gray-900 dark:to-primary-900 overflow-x-hidden overflow-y-auto`} style={{ height: 'auto', minHeight: '100vh' }}>
        {/* Fullscreen Active Banner */}
        {isFullscreen && !submitted && (
          <div className={`${styles.quizFullscreenBanner} fixed top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-secondary-500 text-white text-center py-2 z-[100] shadow-lg`}>
            <div className="flex items-center justify-center space-x-2 px-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <span className="text-xs md:text-sm font-medium">
                <span className="hidden md:inline">✅ Fullscreen Mode - Stay focused! Complete quiz to exit</span>
                <span className="md:hidden">✅ Fullscreen Mode</span>
              </span>
            </div>
          </div>
        )}

        <div className={`container mx-auto px-2 pt-2 lg:px-10 pb-32 ${styles.minHScreen} ${styles.quizContainer}`} style={{ height: 'auto', minHeight: '100vh', overflowY: 'auto' }}>
          {quiz.questions.length === 0 && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-2 text-red-700 dark:text-red-300 text-center">
              <FaTimesCircle className="text-2xl mx-auto mb-2" />
              No questions available for this quiz.
            </div>
          )}

          {/* Quiz Header */}
          <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-1 md:p-2 mb-2 md:mb-4 ${isFullscreen ? 'mt-4 md:mt-8' : 'mt-0'}`}>
            <div className="flex items-center justify-between flex-col md:flex-row mb-0">
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-500 to-primary-500 rounded-2xl flex items-center justify-center">
                  <FaBookOpen className="text-white text-lg md:text-2xl" />
                </div>
                <div>
                  <h1 className="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white m-0 md:m-1">{quiz?.title}</h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1 md:space-x-2">
                    <FaGraduationCap className="text-red-500 text-xs md:text-sm" />
                    <span>{quiz.questions.length} Questions • {quiz.category?.name || 'General Knowledge'}</span>
                  </p>
                </div>
              </div>

              {/* Fullscreen indicator */}
              {!submitted && isFullscreen && (
                <div className="mb-2 md:mb-4">
                  <div className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>✅ Fullscreen Active - Stay focused!</span>
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
                    Press ESC or complete the quiz to exit fullscreen
                  </p>
                </div>
              )}
            </div>
          </div>

          {submitted ? (
            <>
              {/* Confetti Effect */}
              {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-bounce"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random() * 2}s`
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${['bg-primary-400', 'bg-red-400', 'bg-secondary-400', 'bg-green-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
                        }`}></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results Section */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-green-50 via-secondary-50 from-red-50 dark:from-green-900/30 dark:via-secondary-900/30 dark:from-red-900/30 rounded-3xl p-2 md:p-8 border border-green-200 dark:border-green-700 shadow-2xl">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-secondary-500 rounded-full flex items-center justify-center animate-pulse">
                      <FaTrophy className="text-white text-4xl" />
                    </div>
                  </div>

                  <h2 className="text-md md:text-md lg:text-2xl xl:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                    🎉 Quiz Completed!
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/60 dark:bg-gray-700/60 rounded-2xl p-2 md:p-6 border border-white/20">
                      <div className="text-md lg:text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {result?.score}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-700/60 rounded-2xl p-2 md:p-6 border border-white/20">
                      <div className="text-md lg:text-2xl font-bold text-secondary-600 dark:text-secondary-400 mb-2">
                        {result?.scorePercentage}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                    </div>

                    <div className="bg-white/60 dark:bg-gray-700/60 rounded-2xl p-2 md:p-6 border border-white/20">
                      <div className="text-md lg:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        {result?.total}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                    </div>
                  </div>

                  {result?.isNewBestScore && (
                    <div className="bg-gradient-to-r from-primary-100 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/30 text-primary-800 dark:text-primary-200 px-6 py-3 rounded-2xl mb-4 flex items-center justify-center space-x-2">
                      <FaCrown className="text-xl" />
                      <span className="font-semibold">🏆 New Best Score!</span>
                    </div>
                  )}

                  {result?.isHighScore && (
                    <div className="bg-gradient-to-r from-green-100 to-secondary-100 dark:from-green-900/30 dark:to-secondary-900/30 text-green-800 dark:text-green-200 px-6 py-3 rounded-2xl mb-4 flex items-center justify-center space-x-2">
                      <FaStar className="text-xl" />
                      <span className="font-semibold">⭐ High Score Achievement!</span>
                    </div>
                  )}

                  {result?.levelUpdate && result.levelUpdate.levelIncreased && (
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-primary-800 dark:text-primary-200 px-6 py-3 rounded-2xl mb-4 flex items-center justify-center space-x-2">
                      <FaRocket className="text-xl" />
                      <span className="font-semibold">🚀 Level Up! You are now Level {result.levelUpdate.newLevel}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quiz Review Section */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl p-2 md:p-8 border border-white/20 mb-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <FaBrain className="text-white text-2xl" />
                  </div>
                  <h2 className="text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                    Quiz Review
                  </h2>
                </div>

                <div className="space-y-6">
                  {quiz.questions.map((question, index) => {
                    const userAnswer = answers[index];
                    const correctAnswer = question.options[question.correctAnswerIndex];
                    const isCorrect = userAnswer === correctAnswer;
                    const isSkipped = userAnswer === 'SKIP';
                    return (
                      <div key={index} className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl p-2 md:p-6 border border-gray-200 dark:border-gray-600 shadow-lg">
                        <div className="flex items-start space-x-0 md:space-x-4 mb-6">
                          <div className={`hidden md:flex w-12 h-12 rounded-2xl items-center justify-center text-white text-lg font-bold shadow-lg ${isSkipped ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                            isCorrect ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-secondary-500'
                            }`}>
                            {isSkipped ? <FaQuestionCircle /> : isCorrect ? <FaCheck /> : <FaTimes />}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                              {index + 1}: {question.questionText}
                            </h3>

                            <div className="space-y-3 mb-6">
                              {question.options.map((option, optIndex) => {
                                const isUserChoice = option === userAnswer;
                                const isCorrectOption = option === correctAnswer;
                                const optionLetter = String.fromCharCode(65 + optIndex);

                                return (
                                  <div
                                    key={optIndex}
                                    className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${isCorrectOption
                                      ? 'bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/30 border-green-300 dark:border-green-600 shadow-lg'
                                      : isUserChoice && !isCorrectOption
                                        ? 'bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/30 border-red-300 dark:border-secondary-600 shadow-lg'
                                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-500 hover:border-purple-300 dark:hover:border-purple-500'
                                      }`}
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isCorrectOption
                                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                                        : isUserChoice && !isCorrectOption
                                          ? 'bg-gradient-to-r from-red-500 to-secondary-600'
                                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                                        }`}>
                                        {optionLetter}
                                      </div>
                                      <span className={`font-medium text-lg ${isCorrectOption
                                        ? 'text-green-800 dark:text-green-200'
                                        : isUserChoice && !isCorrectOption
                                          ? 'text-red-800 dark:text-red-200'
                                          : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {option}
                                      </span>
                                      {isCorrectOption && <FaCheckCircle className="text-green-600 text-xl" />}
                                      {isUserChoice && !isCorrectOption && <FaTimesCircle className="text-primary-600 text-xl" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Answer Summary */}
                            <div className="bg-gradient-to-r from-secondary-50 from-red-50 dark:from-secondary-900/20 dark:from-red-900/20 rounded-xl p-4 border border-secondary-200 dark:border-secondary-600">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-600 dark:text-gray-400">Your Answer:</span>
                                  <span className={`font-medium ${isSkipped ? 'text-gray-500' :
                                    isCorrect ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-red-400'
                                    }`}>
                                    {isSkipped ? 'Skipped' : userAnswer || 'Not answered'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-600 dark:text-gray-400">Correct Answer:</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    {correctAnswer}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-gray-600 dark:text-gray-400">Status:</span>
                                  <span className={`font-medium ${isSkipped ? 'text-gray-500' :
                                    isCorrect ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-red-400'
                                    }`}>
                                    {isSkipped ? 'Skipped' : isCorrect ? 'Correct' : 'Incorrect'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-2 md:space-x-6 mb-4 md:mb-8">
                <button
                  onClick={() => router.push("/home")}
                  className="px-4 md:px-8 py-2 md:py-4 bg-gradient-to-r from-secondary-500 to-indigo-600 text-white rounded-2xl hover:from-secondary-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <FaHome />
                  <span>Home</span>
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="px-4 md:px-8 py-2 md:py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <FaChartLine />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-2xl hover:from-primary-600 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <FaArrowLeft />
                  <span>Back</span>
                </button>
              </div>

              <LeaderboardTable leaderboard={leaderboard} currentUser={currentUser} />
            </>
          ) : (
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-secondary-600 to-primary-600 rounded-xl flex items-center justify-center">
                      <FaChartLine className="text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Progress</span>
                  </div>
                  <span className="text-lg font-bold text-gray-800 dark:text-white">
                    {currentQuestionIndex + 1} / {quiz.questions.length}
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-secondary-600 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Timer and Controls */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <FaQuestionCircle className="text-primary-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl shadow-lg ${timeLeft <= 10 ? 'bg-gradient-to-r from-red-500 to-secondary-600 text-white' :
                      timeLeft <= 20 ? 'bg-gradient-to-r from-primary-500 to-primary-500 text-white' :
                        'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                      }`}>
                      <FaClock className="text-sm" />
                      <span className="font-mono text-sm font-bold">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Question */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl py-2 md:py-4 px-1 md:px-2 border border-white/20 shadow-2xl mb-2 md:mb-4">
                <div className="flex items-start space-x-2 md:space-x-4 mb-1 md:mb-2">
                  <div className="hidden md:flex w-8 h-8 bg-gradient-to-r from-red-500 to-primary-500 rounded-2xl items-center justify-center">
                    <span className="text-white font-bold text-lg">{currentQuestionIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm md:text-md lg:text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2 leading-relaxed break-words">
                      {currentQuestion.questionText}
                    </h3>

                    <div className="space-y-2 md:space-y-3">
                      {currentQuestion.options.map((opt, j) => {
                        const optionLetter = String.fromCharCode(65 + j);
                        const isSelected = answers[currentQuestionIndex] === opt;

                        return (
                          <div
                            key={j}
                            onClick={() => handleSelect(opt)}
                            className={`p-1 lg:p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${styles.touchManipulation} ${isSelected
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-red-400 dark:border-red-500 shadow-lg'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 hover:shadow-lg'
                              }`}
                          >
                            <div className="flex items-center space-x-2 md:space-x-4">
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm md:text-lg transition-all duration-300 flex-shrink-0 ${isSelected
                                ? 'bg-gradient-to-r from-red-500 to-primary-500 text-white shadow-lg'
                                : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                }`}>
                                {optionLetter}
                              </div>
                              <span className={`text-sm md:text-base lg:text-lg font-medium transition-colors duration-300 break-words flex-1 ${isSelected
                                ? 'text-red-800 dark:text-primary-200'
                                : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                {opt}
                              </span>
                              {isSelected && (
                                <div className="ml-auto flex-shrink-0">
                                  <FaCheck className="text-red-500 text-lg md:text-xl" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center items-center gap-1 md:gap-2 lg:gap-4 mb-2 md:mb-4">

                <div className="flex space-x-1 md:space-x-2 lg:space-x-4">

                  <button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestionIndex]}
                    className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-secondary-600 to-primary-600 text-white rounded-2xl hover:from-red-800 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg ${styles.touchManipulation} min-h-[40px] md:min-h-[48px]`}
                  >
                    <span className="font-medium text-xs md:text-sm lg:text-base">
                      {currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next'}
                    </span>
                    <FaArrowRight className="text-xs md:text-sm" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default AttemptQuizPage;







