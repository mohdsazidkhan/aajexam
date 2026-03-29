'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import { FaCrown, FaStar, FaMedal, FaRocket, FaBrain, FaChartLine, FaArrowLeft, FaClock, FaQuestionCircle, FaLayerGroup, FaUserGraduate, FaAward, FaTrophy, FaGem, FaMagic } from 'react-icons/fa';
import API from '../../lib/api';
import QuizStartModal from '../QuizStartModal';
import { MdFormatListNumbered } from 'react-icons/md';
import MonthlyRewardsInfo from '../MonthlyRewardsInfo';
// MobileAppWrapper import removed
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import config from '../../lib/config/appConfig';

const LevelDetailPage = () => {
  const router = useRouter();
  const { levelNumber } = router.query;
  const [levelInfo, setLevelInfo] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchLevelDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.getPublicLevels();
      if (res.success) {
        const currentLevel = res.data.find(lvl => lvl.levelNumber === Number(levelNumber));
        if (currentLevel) {
          setLevelInfo(currentLevel);
          fetchQuizzes();
        } else {
          setError('Level not found');
        }
      } else {
        setError('Failed to load level details');
      }
    } catch (err) {
      console.error('Error fetching level details:', err);
      setError('Failed to load level details');
    }
  }, [levelNumber]);

  useEffect(() => {
    if (levelNumber !== undefined) {
      fetchLevelDetails();
    }
  }, [levelNumber]);

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.getLevelBasedQuizzes({ level: levelNumber, page: 1, limit: 10 });
      if (res.success) {
        setQuizzes(res.data);
        setHasMore(res.pagination?.hasNextPage || false);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [levelNumber]);

  const loadMoreQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const nextPage = page + 1;
      console.log('Loading more quizzes - Current page:', page, 'Next page:', nextPage);
      const res = await API.getLevelBasedQuizzes({ level: levelNumber, page: nextPage, limit: 10 });
      if (res.success) {
        console.log('New quizzes received:', res.data.length);
        // Append new quizzes to existing ones
        setQuizzes(prevQuizzes => {
          console.log('Previous quizzes count:', prevQuizzes.length);
          const newQuizzes = [...prevQuizzes, ...res.data];
          console.log('Total quizzes after append:', newQuizzes.length);
          return newQuizzes;
        });
        setPage(nextPage);
        setHasMore(res.pagination?.hasNextPage || false);
      } else {
        setError('Failed to load more quizzes');
      }
    } catch (err) {
      console.error('Error loading more quizzes:', err);
      setError('Failed to load more quizzes');
    } finally {
      setLoading(false);
    }
  }, [levelNumber, page]);

  const getIconForLevel = (iconName) => {
    const icons = {
      'school': FaUserGraduate,
      'star': FaStar,
      'rocket-launch': FaRocket,
      'psychology': FaBrain,
      'trending-up': FaChartLine,
      'emoji-events': FaTrophy,
      'diamond': FaGem,
      'workspace-premium': FaAward,
      'auto-awesome': FaStar,
      'auto-fix-high': FaMagic,
      'celebration': FaTrophy,
      'crown': FaCrown,
      'medal': FaMedal
    };
    return icons[iconName] || FaStar;
  };

  useEffect(() => {
    if (levelInfo) {
      // Reset state when level changes
      setQuizzes([]);
      setPage(1);
      setHasMore(true);
      setError('');
      fetchQuizzes(); // Initial load
    }
  }, [levelInfo, levelNumber, fetchQuizzes]);

  const handleQuizClick = (quizId) => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      router.push('/login');
      return;
    }
    const quiz = quizzes.find(q => q._id === quizId);
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleConfirmQuizStart = (competitionType) => {
    setShowQuizModal(false);
    if (selectedQuiz) {
      // Store navigation data in localStorage
      localStorage.setItem('quizNavigationData', JSON.stringify({
        fromPage: 'level-detail',
        levelNumber: levelNumber,
        quizData: selectedQuiz,
        competitionType,
      }));
      router.push(`/attempt-quiz/${selectedQuiz._id}`);
    }
  };

  const handleCancelQuizStart = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  if (!levelInfo && !loading) {
    return (
      <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-4">Level Not Found</h1>
            <button
              onClick={() => router.push('/')}
              className="bg-secondary-600 text-white px-6 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark">
        <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">

            <div className="border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-start mb-4 gap-2 sm:gap-0">
                <div className={`p-2 sm:p-3 rounded-full bg-gradient-to-r ${levelInfo?.color || 'from-primary-400 to-secondary-500'} mr-0 sm:mr-4`}>
                  {(() => {
                    const IconComponent = getIconForLevel(levelInfo?.emoji);
                    return <IconComponent className="text-white text-xl sm:text-2xl" />;
                  })()}
                </div>
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white">Level {levelNumber} - {levelInfo?.name}</h1>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">{levelInfo?.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-4">
                  <div className="text-lg sm:text-lg lg:text-2xl font-bold text-primary-600">{levelInfo?.quizzesRequired}</div>
                  <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">Quizzes</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-4">
                  <div className="text-lg sm:text-lg lg:text-2xl font-bold text-green-600">{levelInfo?.requiredSubscription || 'Free'}</div>
                  <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">Plan</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-4">
                  <div className="text-lg sm:text-lg lg:text-2xl font-bold text-primary-600">₹{levelInfo?.requiredSubscription === 'Pro' ? '99' : levelInfo?.requiredSubscription === 'Premium' ? '49' : levelInfo?.requiredSubscription === 'Basic' ? '9' : '0'}</div>
                  <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">Amount</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 sm:p-4">
                  <div className="text-lg sm:text-lg lg:text-2xl font-bold text-primary-600">₹0</div>
                  <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">Prize</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">Level {levelNumber} Quizzes</h2>
              <button
                onClick={() => router.push("/home")}
                className="px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-2xl hover:from-primary-600 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <FaArrowLeft />
                <span>Go Back</span>
              </button>
            </div>

            {loading ? (
              <div className="text-center py-6 sm:py-8">
                <Loading size="lg" color="yellow" message="Loading quizzes..." />
              </div>
            ) : error ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-primary-600 dark:text-red-400 text-sm sm:text-base">{error}</p>
              </div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">No quizzes available for this level yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-6 xl:gap-8 mb-2 md:mb-4 lg:mb-6 xl:mb-8">
                  {quizzes.map((quiz, index) => (
                    <div key={quiz._id} className="border-2 border-red-600 hover:border-primary-500 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="p-2 md:p-6 ">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                              {index + 1}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{quiz.title}</h3>
                          </div>

                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{quiz.description}</p>

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                          <div className="flex items-center space-x-2 md:space-x-4">
                            <div className="flex items-center">
                              <FaQuestionCircle className="mr-1" />
                              <span>{quiz.questionCount || 0} Q's</span>
                            </div>
                            <div className="flex items-center">
                              <FaLayerGroup className="mr-1" />
                              <span>{quiz.category?.name || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                              <MdFormatListNumbered className="mr-1" />
                              <span>{quiz.totalMarks || 'N/A'} Marks</span>
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-1" />
                              <span>{quiz.timeLimit} Mins.</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleQuizClick(quiz._id)}
                          className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-red-600 hover:to-primary-500 text-white font-semibold py-2 rounded-xl transition-all duration-300 shadow-md text-center"
                        >
                          Start Quiz
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreQuizzes}
                      disabled={loading}
                      className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Load More (10 quizzes)'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quiz Start Confirmation Modal */}
        <QuizStartModal
          isOpen={showQuizModal}
          onClose={handleCancelQuizStart}
          onConfirm={handleConfirmQuizStart}
          quiz={selectedQuiz}
        />
      </div>
      <UnifiedFooter />
    </>
  );
};

export default LevelDetailPage;




