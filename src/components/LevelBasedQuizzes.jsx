import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaStar, FaClock, FaQuestionCircle, FaFilter, FaLevelUpAlt, FaArrowLeft } from 'react-icons/fa';
import API from '../lib/utils/api';
import { toast } from 'react-toastify';
import { useSSR } from '../hooks/useSSR';
import QuizStartModal from './QuizStartModal';
import Loading from './Loading';

const LevelBasedQuizzes = () => {
  // All hooks must be called at the top level, before any conditional returns
  const { isMounted, isRouterReady, router } = useSSR();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userLevel, setUserLevel] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    difficulty: '',
    level: '',
    attempted: '',
    search: '',
    page: 1
  });
  const [searchInput, setSearchInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // Don't render anything during SSR
  if (!isMounted) {
    return <div>Loading...</div>;
  }



  // Only fetch quizzes and categories when relevant filters/search/page change
  useEffect(() => {
    fetchCategories();
    fetchQuizzes();
    // eslint-disable-next-line
  }, [filters.category, filters.subcategory, filters.difficulty, filters.level, filters.attempted, filters.search, filters.page]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await API.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    try {
      // Only fetch subcategories if a category is selected
      if (filters.category) {
        const response = await API.getSubcategories(filters.category);
        setSubcategories(response);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  }, [filters.category]);

  const fetchQuizzes = useCallback(async () => {
    try {
      // Only show main loading on initial load, not on search
      if (!searchLoading) {
        setLoading(true);
      }
      // Create a clean filters object with only non-empty values
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          cleanFilters[key] = filters[key];
        }
      });

      const response = await API.getLevelQuizzes(cleanFilters);

      if (response?.success) {
        setQuizzes(response.data);
        setUserLevel(response.userLevel);
        setPagination(response.pagination);
        // Set default filter to user's current level if not already set
        if (!filters.level && response.userLevel?.currentLevel) {
          setFilters(prev => ({ ...prev, level: response.userLevel.currentLevel.toString(), page: 1 }));
        }
      }
    } catch (err) {
      console.log('HomePage Data:', err);
      // Try to show a more specific error message if available
      let msg = err?.response?.data?.message || err?.message || err?.toString();
      if (msg && msg !== '[object Object]') {
        setError(msg);
      } else {
        setError('Failed to load home page data');
      }
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [filters, searchLoading]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await API.getProfile();
      setUser(response);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  // Only fetch user profile once on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchLoading(true);
      setFilters(prev => ({
        ...prev,
        search: searchInput,
        page: 1 // Reset to first page when search changes
      }));
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    fetchSubcategories();
  }, [fetchSubcategories]);



  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value,
        page: 1 // Reset to first page when filters change
      };

      // Clear subcategory when category changes
      if (key === 'category') {
        newFilters.subcategory = '';
      }

      return newFilters;
    });
  };

  const handleSearchChange = (value) => {
    setSearchInput(value);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleAttemptQuiz = (quiz) => {
    if (!user?.subscriptionStatus || user.subscriptionStatus === 'none') {
      toast.error('You need an active subscription to attempt quizzes!');
      return;
    }

    if (!quiz.attemptStatus.canAttempt) {
      toast.error('You have already attempted this quiz!');
      return;
    }

    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleQuizClick = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleConfirmQuizStart = () => {
    setShowQuizModal(false);
    if (selectedQuiz && isRouterReady && router) {
      // Store navigation data in localStorage
      localStorage.setItem('quizNavigationData', JSON.stringify({
        fromPage: 'level-quizzes',
        quizData: selectedQuiz
      }));
      router.push(`/attempt-quiz/${selectedQuiz._id}`);
    }
  };

  const handleCancelQuizStart = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelMatchColor = (levelMatch) => {
    if (levelMatch.exact) return 'bg-yellow-100 text-yellow-800';
    if (levelMatch.withinRange) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getLevelName = (level) => {
    const levelNames = {
      0: 'Starter',
      1: 'Rookie',
      2: 'Explorer',
      3: 'Thinker',
      4: 'Strategist',
      5: 'Achiever',
      6: 'Mastermind',
      7: 'Champion',
      8: 'Prodigy',
      9: 'Wizard',
      10: 'Legend'
    };
    return levelNames[level] || `Level ${level}`;
  };

  const getLevelColor = (level) => {
    const colors = [
      'bg-yellow-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500', 'bg-yellow-600', 'bg-red-600'
    ];
    return colors[(level - 1) % colors.length];
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <Loading size="lg" color="yellow" message="Loading quizzes..." />
      </div>
    );
  }

  return (
    <>
      {error && error.toLowerCase().includes('subscription') ? (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20 flex flex-col items-center justify-center">
            <div className="text-center mb-6">
              <div className="text-red-600 text-3xl mb-2">⚠️</div>
              <p className="text-red-600 text-lg font-semibold mb-4">{error}</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Subscribe now to unlock all quizzes and levels!</p>
              <Link
                href="/subscription"
                className="inline-block bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
              >
                Subscribe Now
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          {/* User Level Info */}
          {userLevel && (
            <div className="bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-lg p-2 md:p-6 mb-4 md:mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-md lg:text-2xl font-bold mb-2">
                    Level {userLevel.currentLevel} - {userLevel.levelName}
                  </h2>
                  <p className="text-yellow-100">
                    Progress to next level: {userLevel.progress}%
                  </p>
                </div>
                <div className="text-right">
                  <FaLevelUpAlt className="text-4xl text-yellow-300" />
                </div>
              </div>
              <div className="mt-4 w-full bg-yellow-400 rounded-full h-2">
                <div
                  className="bg-yellow-300 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${userLevel.progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 md:p-6 mb-2 md:mb-8">
            <div className="flex items-center justify-between flex-col md:flex-row mb-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-600" />
                <h3 className="text-lg font-semibold text-white dark:text-gray-100">Filters</h3>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search quizzes, categories, subcategories..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 pr-0 md:pr-8"
                    disabled={searchLoading}
                  />
                  {searchLoading && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subcategory
                </label>
                <select
                  value={filters.subcategory}
                  onChange={(e) => handleFilterChange('subcategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!filters.category}
                >
                  <option value="">All Subcategories</option>
                  {subcategories.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Level {userLevel && `(Current: ${userLevel.currentLevel})`}
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange('level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="1">Level 1 - Rookie</option>
                  <option value="2">Level 2 - Explorer</option>
                  <option value="3">Level 3 - Thinker</option>
                  <option value="4">Level 4 - Strategist</option>
                  <option value="5">Level 5 - Achiever</option>
                  <option value="6">Level 6 - Mastermind</option>
                  <option value="7">Level 7 - Champion</option>
                  <option value="8">Level 8 - Prodigy</option>
                  <option value="9">Level 9 - Wizard</option>
                  <option value="10">Level 10 - Legend</option>
                </select>
                {filters.level && (
                  <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Showing Level {filters.level} - {getLevelName(parseInt(filters.level))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attempt Status
                </label>
                <select
                  value={filters.attempted}
                  onChange={(e) => handleFilterChange('attempted', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Quizzes</option>
                  <option value="not_attempted">Not Attempted</option>
                  <option value="attempted">Attempted</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 items-center mt-2">
                <button
                  onClick={() => {
                    setFilters({ category: '', subcategory: '', difficulty: '', level: '', attempted: '', search: '', page: 1 });
                    setSearchInput('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          {(filters.category || filters.subcategory || filters.difficulty || filters.level || filters.attempted || filters.search) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FaFilter className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Category: {categories.find(c => c._id === filters.category)?.name}
                  </span>
                )}
                {filters.subcategory && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Subcategory: {subcategories.find(s => s._id === filters.subcategory)?.name}
                  </span>
                )}
                {filters.difficulty && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Difficulty: {filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}
                  </span>
                )}
                {filters.level && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Level: {filters.level} - {getLevelName(parseInt(filters.level))}
                  </span>
                )}
                {filters.attempted && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Status: {filters.attempted === 'attempted' ? 'Attempted' : 'Not Attempted'}
                  </span>
                )}
                {filters.search && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    Search: "{filters.search}"
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Removed 'Available by Level' filter. Default is user's current level. */}

          {/* Quizzes Grid */}
          <div className="mb-8">
            <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h2 className="text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                {filters.level
                  ? `Level ${filters.level} - ${getLevelName(parseInt(filters.level))} Quizzes`
                  : 'Your Level Quizzes'
                }
              </h2>

              <button
                onClick={() => isRouterReady && router && router.push("/home")}
                className="px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-2xl hover:from-blue-600 hover:from-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <FaArrowLeft />
                <span>Go Back</span>
              </button>
            </div>
            {quizzes.length === 0 && !searchLoading ? (
              <div className="text-center py-12">
                <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No quizzes found for your current level and filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 md:p-6 border-2 transition-all duration-300 hover:shadow-lg ${quiz.isRecommended ? 'border-blue-500' :
                        quiz.hasAttempted ? 'border-gray-300' : 'border-green-500'
                      }`}
                  >
                    {/* Quiz Header */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                        {quiz.title}
                      </h3>
                      {quiz.isRecommended && (
                        <FaStar className="text-yellow-500 text-xl" />
                      )}
                    </div>

                    {/* Quiz Description */}
                    {quiz.description && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.4em',
                        maxHeight: '4.2em'
                      }}>
                        {quiz.description}
                      </p>
                    )}

                    {/* Quiz Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaClock />
                        <span>{quiz.timeLimit || 30} minutes</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FaQuestionCircle />
                        <span>{quiz.totalMarks || 'Variable'} questions</span>
                      </div>

                      {quiz.category && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Category: {quiz.category.name}
                        </div>
                      )}

                      {quiz.subcategory && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Subcategory: {quiz.subcategory.name}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                        {quiz.difficulty}
                      </span>

                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelMatchColor(quiz.levelMatch)} flex items-center gap-1`}>
                        <div className={`w-2 h-2 rounded-full ${getLevelColor(quiz.requiredLevel)}`}></div>
                        Level {quiz.requiredLevel} - {getLevelName(quiz.requiredLevel)}
                      </span>

                      {/* Show if this is the user's current level */}
                      {userLevel && quiz.requiredLevel === userLevel.currentLevel && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Your Level
                        </span>
                      )}

                      {/* Attempt Status */}
                      {quiz.attemptStatus.hasAttempted && (
                        <div className="flex flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.attemptStatus.isHighScore ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {quiz.attemptStatus.isHighScore ? 'High Score!' : 'Attempted'}
                          </span>

                          {quiz.attemptStatus.bestScore && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Score: {quiz.attemptStatus.bestScore}%
                            </span>
                          )}

                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Completed
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    {quiz.attemptStatus.hasAttempted ? (
                      <button
                        onClick={() => isRouterReady && router && router.push(`/quiz-result/${quiz.attemptStatus.attemptId}`)}
                        className="w-full py-2 px-4 rounded-md font-medium bg-orange-600 text-white hover:bg-orange-700 transition"
                      >
                        View Result
                      </button>
                    ) : quiz.requiredLevel === userLevel?.currentLevel ? (
                      <button
                        onClick={() => handleQuizClick(quiz)}
                        className="w-full py-2 px-4 rounded-md font-medium bg-orange-600 text-white hover:bg-orange-700 transition text-center"
                      >
                        Start Quiz
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2 px-4 rounded-md font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        Locked
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>)}

      {/* Quiz Start Confirmation Modal */}
      <QuizStartModal
        isOpen={showQuizModal}
        onClose={handleCancelQuizStart}
        onConfirm={handleConfirmQuizStart}
        quiz={selectedQuiz}
      />
    </>
  );
};

export default LevelBasedQuizzes;
