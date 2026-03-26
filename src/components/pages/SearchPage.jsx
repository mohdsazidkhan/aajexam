'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import API from '../../lib/api';
import QuizStartModal from "../QuizStartModal";
import TestStartModal from "../TestStartModal";

import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';

const SearchPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [govtExamCategories, setGovtExamCategories] = useState([]);
  const [govtExams, setGovtExams] = useState([]);
  const [examPatterns, setExamPatterns] = useState([]);
  const [practiceTests, setPracticeTests] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const isSearchingRef = useRef(false);
  const hasInitialSearchedRef = useRef(false);

  const limit = 12;

  const fetchData = async (searchQuery, pageNum = currentPage) => {
    // Prevent multiple simultaneous API calls
    if (isSearchingRef.current) {
      return;
    }

    const trimmedQuery = searchQuery?.trim();
    if (!trimmedQuery) {
      // Clear results if query is empty
      setQuizzes([]);
      setCategories([]);
      setSubcategories([]);
      setBlogs([]);
      setUsers([]);
      setGovtExamCategories([]);
      setGovtExams([]);
      setExamPatterns([]);
      setPracticeTests([]);
      setTotalPages(1);
      return;
    }

    try {
      isSearchingRef.current = true;
      setLoading(true);
      const res = await API.searchAll({
        query: trimmedQuery,
        page: pageNum,
        limit,
      });
      if (res.success) {
        setQuizzes(res.quizzes || []);
        setCategories(res.categories || []);
        setSubcategories(res.subcategories || []);
        setBlogs(res.blogs || []);
        setUsers(res.users || []);
        setGovtExamCategories(res.govtExamCategories || []);
        setGovtExams(res.govtExams || []);
        setExamPatterns(res.examPatterns || []);
        setPracticeTests(res.practiceTests || []);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
      isSearchingRef.current = false;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (loading || isSearchingRef.current) return;
    setCurrentPage(1);
    hasInitialSearchedRef.current = true;
    fetchData(query);
  };

  // Effect for initial search from navigation - only run once on mount
  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery && !hasInitialSearchedRef.current) {
      setQuery(searchQuery);
      hasInitialSearchedRef.current = true;
      // Auto-search only when coming from URL with query parameter on initial mount
      fetchData(searchQuery, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  const handleQuizAttempt = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleCancelQuizStart = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  const handleConfirmQuizStart = (competitionType) => {
    setShowQuizModal(false);
    if (selectedQuiz) {
      // Store navigation data in localStorage
      localStorage.setItem('quizNavigationData', JSON.stringify({
        fromPage: 'search',
        searchQuery: query,
        quizData: selectedQuiz,
        competitionType,
      }));
      router.push(`/attempt-quiz/${selectedQuiz._id}`);
    }
  };

  const handleTestAttempt = (test) => {
    setSelectedTest(test);
    setShowTestModal(true);
  };

  const handleCancelTestStart = () => {
    setShowTestModal(false);
    setSelectedTest(null);
  };

  const handleConfirmTestStart = () => {
    setShowTestModal(false);
    if (selectedTest) {
      // Store navigation data in localStorage
      localStorage.setItem('testNavigationData', JSON.stringify({
        fromPage: 'search',
        searchQuery: query,
        testData: selectedTest
      }));
      router.push(`/govt-exams/test/${selectedTest._id}/start`);
    }
  };

  // Combine all results for "All" tab
  const getAllResults = () => {
    return [
      ...categories,
      ...subcategories,
      ...quizzes,
      ...blogs,
      ...users,
      ...govtExamCategories,
      ...govtExams,
      ...examPatterns,
      ...practiceTests
    ];
  };

  // Get filtered results based on active tab
  const getFilteredResults = () => {
    switch (activeTab) {
      case 'all':
        return getAllResults();
      case 'category':
        return categories;
      case 'subcategory':
        return subcategories;
      case 'quiz':
        return quizzes;
      case 'blog':
        return blogs;
      case 'user':
        return users;
      case 'examCategory':
        return govtExamCategories;
      case 'exam':
        return govtExams;
      case 'pattern':
        return examPatterns;
      case 'test':
        return practiceTests;
      default:
        return getAllResults();
    }
  };

  // Get tab counts
  const getTabCounts = () => {
    return {
      all: getAllResults().length,
      category: categories.length,
      subcategory: subcategories.length,
      quiz: quizzes.length,
      blog: blogs.length,
      user: users.length,
      examCategory: govtExamCategories.length,
      exam: govtExams.length,
      pattern: examPatterns.length,
      test: practiceTests.length
    };
  };

  const tabCounts = getTabCounts();
  const filteredResults = getFilteredResults();

  return (
    <>
      <Head>
        <title>Search Quizzes - AajExam Find Your Perfect Quiz</title>
        <meta name="description" content="Search and discover quizzes on AajExam platform. Find quizzes by category, subcategory, or keywords. Explore thousands of skill-based quiz questions." />
        <meta name="keywords" content="search quizzes, quiz search, AajExam search, find quiz, quiz discovery" />
        <meta property="og:title" content="Search Quizzes - AajExam Find Your Perfect Quiz" />
        <meta property="og:description" content="Search and discover quizzes on AajExam platform. Find quizzes by category, subcategory, or keywords. Explore thousands of skill-based quiz questions." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Search Quizzes - AajExam Find Your Perfect Quiz" />
        <meta name="twitter:description" content="Search and discover quizzes on AajExam platform. Find quizzes by category, subcategory, or keywords. Explore thousands of skill-based quiz questions." />
      </Head>

      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="px-4 md:px-10 py-8 container mx-auto">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              className="p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded w-full"
              placeholder="Search quizzes, categories, exams, patterns, tests..."
              value={query}
              onChange={(e) => {
                const newValue = e.target.value;
                setQuery(newValue);
                // Reset state when input is cleared
                if (!newValue.trim()) {
                  setQuizzes([]);
                  setCategories([]);
                  setSubcategories([]);
                  setBlogs([]);
                  setUsers([]);
                  setGovtExamCategories([]);
                  setGovtExams([]);
                  setExamPatterns([]);
                  setPracticeTests([]);
                  setCurrentPage(1);
                  setTotalPages(1);
                  setActiveTab('all');
                }
              }}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-yellow-500 to-red-600 text-white px-4 py-2 rounded shadow hover:opacity-90"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="text-center py-8">
              <Loading size="md" color="yellow" message="Loading..." />
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="mt-4 mb-4">
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'category', label: 'Categories' },
                    { key: 'subcategory', label: 'Subcategories' },
                    { key: 'quiz', label: 'Quizzes' },
                    { key: 'blog', label: 'Blogs' },
                    { key: 'user', label: 'Users' },
                    { key: 'examCategory', label: 'Exam Categories' },
                    { key: 'exam', label: 'Exams' },
                    { key: 'pattern', label: 'Patterns' },
                    { key: 'test', label: 'Tests' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === tab.key
                        ? 'bg-gradient-to-r from-yellow-500 to-red-600 text-white border-b-2 border-yellow-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      {tab.label} ({tabCounts[tab.key] || 0})
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Grid */}
              <div className="mt-4">
                {filteredResults.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No results found for "{query}" in {activeTab === 'all' ? 'all categories' : activeTab}.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                    {filteredResults.map((item) => {
                      // Render based on type
                      switch (item.type) {
                        case 'category':
                          return (
                            <div
                              key={item._id}
                              onClick={() => router.push(`/category/${item._id}`)}
                              className="border cursor-pointer border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          );

                        case 'subcategory':
                          return (
                            <div
                              key={item._id}
                              onClick={() => router.push(`/subcategory/${item._id}`)}
                              className="border cursor-pointer border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                {item.name}
                              </h3>
                              {item.category && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Category: {item.category.name}
                                </p>
                              )}
                              {item.description && (
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          );

                        case 'quiz':
                          return (
                            <div
                              key={item._id}
                              className="border-2 border-gray-200 dark:border-yellow-400 bg-white dark:bg-gray-800 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200"
                            >
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                Category:{" "}
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  {item.category?.name || "N/A"}
                                </span>
                                {item.subcategory && (
                                  <>
                                    {" "}| Subcategory:{" "}
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                      {item.subcategory?.name || "N/A"}
                                    </span>
                                  </>
                                )}
                              </p>
                              <button
                                onClick={() => handleQuizAttempt(item)}
                                className="mt-3 w-full bg-gradient-to-r from-yellow-600 to-red-600 hover:from-yellow-700 hover:to-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-base text-center"
                              >
                                Start Quiz
                              </button>
                            </div>
                          );

                        case 'blog':
                          return (
                            <div
                              key={item._id}
                              onClick={() => router.push(`/articles/${item.slug || item._id}`)}
                              className="border cursor-pointer border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              {item.featuredImage && (
                                <img
                                  src={item.featuredImage}
                                  alt={item.title}
                                  className="w-full h-32 object-cover rounded mb-2"
                                />
                              )}
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              {item.excerpt && (
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {item.excerpt}
                                </p>
                              )}
                              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                {item.readingTime && (
                                  <span>⏱️ {item.readingTime} min</span>
                                )}
                                {item.views && (
                                  <span>👁️ {item.views}</span>
                                )}
                              </div>
                            </div>
                          );

                        case 'examCategory':
                          return (
                            <div
                              key={item._id}
                              onClick={() => router.push(`/govt-exams/category/${item._id}`)}
                              className="border cursor-pointer border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                  {item.name}
                                </h3>
                                <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">
                                  {item.type === 'Central' || item.type === 'State' ? item.type : 'Central'}
                                </span>
                              </div>
                              {item.description && (
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-2 flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                                {item.examsCount !== undefined && (
                                  <span>📚 {item.examsCount} Exams</span>
                                )}
                                {item.testsCount !== undefined && (
                                  <span>📝 {item.testsCount} Tests</span>
                                )}
                              </div>
                            </div>
                          );

                        case 'exam':
                          return (
                            <div
                              key={item._id}
                              onClick={() => router.push(`/govt-exams/exam/${item._id}`)}
                              className="border cursor-pointer border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                {item.name}
                              </h3>
                              {item.code && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Code: {item.code}
                                </p>
                              )}
                              {item.category && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Category: {item.category.name} ({item.category.type})
                                </p>
                              )}
                              {item.description && (
                                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-2 flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                                {item.patternsCount !== undefined && (
                                  <span>📋 {item.patternsCount} Patterns</span>
                                )}
                                {item.testsCount !== undefined && (
                                  <span>📝 {item.testsCount} Tests</span>
                                )}
                              </div>
                            </div>
                          );

                        case 'pattern':
                          return (
                            <div
                              key={item._id}
                              onClick={() => router.push(`/govt-exams/pattern/${item._id}/tests`)}
                              className="border cursor-pointer border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              {item.exam && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Exam: {item.exam.name}
                                </p>
                              )}
                              <div className="mt-2 flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                                {item.duration && (
                                  <span>Duration: {item.duration} min</span>
                                )}
                                {item.totalMarks && (
                                  <span>Marks: {item.totalMarks}</span>
                                )}
                              </div>
                              {item.testsCount !== undefined && (
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                  <span>📝 {item.testsCount} Tests</span>
                                </div>
                              )}
                            </div>
                          );

                        case 'test':
                          return (
                            <div
                              key={item._id}
                              className="border-2 border-orange-200 dark:border-orange-400 bg-white dark:bg-gray-800 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200"
                            >
                              <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                                {item.title}
                              </h3>
                              {item.examPattern && item.examPattern.exam && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  Exam:{" "}
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {item.examPattern.exam.name}
                                  </span>
                                </p>
                              )}
                              <div className="mt-2 flex gap-2 text-xs text-gray-600 dark:text-gray-400">
                                {item.duration && (
                                  <span>Duration: {item.duration} min</span>
                                )}
                                {item.totalMarks && (
                                  <span>Marks: {item.totalMarks}</span>
                                )}
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className={`text-xs px-2 py-1 rounded ${item.isFree
                                  ? 'bg-green-500 text-white'
                                  : 'bg-yellow-500 text-white'
                                  }`}>
                                  {item.isFree ? 'Free' : 'Premium'}
                                </span>
                                <button
                                  onClick={() => handleTestAttempt(item)}
                                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-1 px-4 rounded-lg shadow hover:shadow-lg transition-all duration-300 text-sm"
                                >
                                  Start Test
                                </button>
                              </div>
                            </div>
                          );

                        case 'user':
                          return (
                            <div
                              key={item._id}
                              onClick={() => {
                                if (item.username) {
                                  router.push(`/u/${item.username}`);
                                }
                              }}
                              className="border cursor-pointer border-pink-200 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20 rounded-lg p-2 lg:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
                            >
                              <div className="flex items-center gap-3">

                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 from-red-500 flex items-center justify-center text-white font-bold text-lg">
                                  {(item.name || item.username || item.email || 'U').charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h3 className="text-md lg:text-lg font-bold text-gray-900 dark:text-white truncate">
                                    {item.name || item.username || item.email || 'User'}
                                  </h3>
                                  {item.username && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                      @{item.username}
                                    </p>
                                  )}
                                  {item.bio && (
                                    <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                                      {item.bio}
                                    </p>
                                  )}
                                  <div className="mt-2 flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                                    {item.followersCount !== undefined && (
                                      <span>👥 {item.followersCount} followers</span>
                                    )}
                                    {item.level && item.level.currentLevel !== undefined && (
                                      <span>⭐ Level {item.level.currentLevel}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );

                        default:
                          return null;
                      }
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-10 mb-6 space-x-2 flex-wrap gap-2">
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => {
                    if (loading || isSearchingRef.current) return;
                    const newPage = Math.max(currentPage - 1, 1);
                    setCurrentPage(newPage);
                    fetchData(query, newPage);
                  }}
                  className="px-4 py-2 rounded-lg border text-sm font-medium border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    disabled={loading}
                    onClick={() => {
                      if (loading || isSearchingRef.current) return;
                      const newPage = i + 1;
                      setCurrentPage(newPage);
                      fetchData(query, newPage);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${currentPage === i + 1
                      ? "bg-gradient-to-r from-yellow-600 to-red-600 text-white border-yellow-600 shadow-lg"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => {
                    if (loading || isSearchingRef.current) return;
                    const newPage = Math.min(currentPage + 1, totalPages);
                    setCurrentPage(newPage);
                    fetchData(query, newPage);
                  }}
                  className="px-4 py-2 rounded-lg border text-sm font-medium border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>

              {/* Quiz Start Confirmation Modal */}
              {showQuizModal &&
                <QuizStartModal
                  isOpen={showQuizModal}
                  onClose={handleCancelQuizStart}
                  onConfirm={handleConfirmQuizStart}
                  quiz={selectedQuiz}
                />
              }

              {/* Test Start Confirmation Modal */}
              {showTestModal && selectedTest &&
                <TestStartModal
                  isOpen={showTestModal}
                  onClose={handleCancelTestStart}
                  onConfirm={handleConfirmTestStart}
                  test={selectedTest}
                  pattern={selectedTest.examPattern}
                  exam={selectedTest.examPattern?.exam}
                  category={selectedTest.examPattern?.exam?.category}
                />
              }
            </>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default SearchPage;


