'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import Head from 'next/head';
import { FaClock, FaQuestionCircle, FaStar, FaLayerGroup, FaFolder, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import API from '../../lib/api';
import QuizStartModal from '../QuizStartModal';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';

const PAGE_SIZE = 9;

const CategoryDetailPage = () => {
  const router = useRouter();
  const { categoryId } = router.query;
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  console.log(quizzes, 'quizzes');
  useEffect(() => {
    fetchCategory();
    fetchSubcategories();
    fetchQuizzes(page);
    // eslint-disable-next-line
  }, [categoryId, page]);

  const fetchCategory = async () => {
    try {
      // Use homeData or fetch from API if needed
      const categories = await API.getCategories();
      const found = categories.find(cat => cat._id === categoryId);
      setCategory(found || null);
    } catch {
      setCategory(null);
    }
  };

  const fetchSubcategories = async () => {
    try {
      setSubcategoriesLoading(true);
      const res = await API.getSubcategories(categoryId);
      setSubcategories(res || []);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const fetchQuizzes = async (pageNum) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.request(`/api/student/quizzes/public/level-based?category=${categoryId}&page=${pageNum}&limit=${PAGE_SIZE}`);
      if (res.success) {
        setQuizzes(res.data);
        setTotalPages(res.pagination.totalPages);
      } else {
        setError('Failed to load quizzes');
      }
    } catch (err) {
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

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
        fromPage: 'category',
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

  const handleSubcategoryClick = (subcategoryId) => {
    router.push(`/subcategory/${subcategoryId}`);
  };

  return (
    <>
      <Head>
        <title>{category ? `${category.name} - AajExam` : 'Category - AajExam'}</title>
        <meta name="description" content={category ? `Explore ${category.name} quizzes on AajExam. Test your knowledge and compete for prizes.` : 'Explore category quizzes on AajExam platform.'} />
        <meta name="keywords" content={`${category?.name || 'category'} quiz, ${category?.name || 'category'} questions, AajExam ${category?.name || 'category'}`} />
      </Head>
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
        {/* Hero Section with Category Name and Description */}
        {category && (
          <div className="bg-gradient-to-r from-yellow-800 via-orange-800 to-red-800 text-white py-6 lg:py-12 px-4 lg:px-6 shadow-2xl">
            <div className="container mx-auto text-center">
              <div className="mb-4">
                <h1 className="text-2xl sm:text-5xl font-bold mb-4 drop-shadow-lg animate-fade-in">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-sm lg:text-xl text-red-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="flex justify-center items-center gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                  <span className="text-sm font-semibold">Explore Quizzes</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                  <span className="text-sm font-semibold">Learn & Grow</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 lg:px-10 py-8">

          {/* Subcategories Section */}
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2 sm:gap-3">
                <FaFolder className="text-red-500" />
                Subcategories ({subcategories?.length})
              </h2>
              <button
                onClick={() => router.push("/home")}
                className="px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-2xl hover:from-yellow-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <FaArrowLeft />
                <span>Go Back</span>
              </button>
            </div>

            {subcategoriesLoading ? (
              <div className="flex justify-center items-center h-20 sm:h-32">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600"></div>
              </div>
            ) : subcategories.length === 0 ? (
              <div className="text-center text-gray-500 font-medium py-6 sm:py-8 bg-white/50 dark:bg-gray-800/50 rounded-2xl">
                No subcategories found for this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-6 xl:gap-8 mb-2 md:mb-4 lg:mb-6 xl:mb-8">
                {subcategories.map((subcategory) => (
                  <div
                    key={subcategory._id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-2 lg:p-6 border-2 border-red-400 hover:border-yellow-500 cursor-pointer group"
                    onClick={() => handleSubcategoryClick(subcategory._id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-yellow-500 rounded-xl flex items-center justify-center">
                        <FaFolder className="text-white text-xl" />
                      </div>
                      <FaArrowRight className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                      {subcategory.name}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-200">
                      <span>Explore quizzes</span>
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                        Browse
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quizzes Section */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2 sm:gap-3">
                <FaStar className="text-yellow-500" />
                Quizzes ({quizzes.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-32 sm:h-64">
                <Loading size="lg" color="gray" message="" />
              </div>
            ) : error ? (
              <div className="text-center text-red-600 font-semibold py-6 sm:py-10 text-sm sm:text-base">{error}</div>
            ) : quizzes.length === 0 ? (
              <div className="text-center text-gray-500 font-medium py-6 sm:py-10 bg-white/50 dark:bg-gray-800/50 rounded-2xl text-sm sm:text-base">
                No quizzes found for this category.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-6 xl:gap-8 mb-2 md:mb-4 lg:mb-6 xl:mb-8">
                  {quizzes.map((quiz) => (
                    <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-2 lg:p-6 border-2 border-red-400 hover:border-yellow-500 cursor-pointer flex flex-col justify-between">
                      <div>
                        <h2 className="text-md md:tex-md lg:text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                          {quiz.title} {quiz.isRecommended && <FaStar className="text-yellow-400" />}
                        </h2>
                        {quiz.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{quiz.description}</p>}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1"><FaClock /> {quiz.timeLimit || 30} min</span>
                          <span className="flex items-center gap-1"><FaQuestionCircle /> {quiz.totalMarks || 'Variable'} Qs</span>
                          <span className="flex items-center gap-1"><FaLayerGroup /> Level {quiz.requiredLevel}</span>
                          {quiz.difficulty && <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-semibold">{quiz.difficulty}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuizClick(quiz._id)}
                        className="mt-4 w-full bg-gradient-to-r from-red-500 to-yellow-500 hover:from-yellow-500 hover:to-red-500 text-white font-semibold py-2 rounded-xl transition-all duration-300 shadow-md text-center"
                      >
                        Start Quiz
                      </button>
                    </div>
                  ))}
                </div>
                {/* Pagination - Responsive */}
                <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-2 sm:mt-4 w-full">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50 text-xs sm:text-base"
                  >
                    Prev
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPage(idx + 1)}
                      className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold text-xs sm:text-base ${page === idx + 1 ? 'bg-yellow-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-2 sm:px-4 py-1 sm:py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50 text-xs sm:text-base"
                  >
                    Next
                  </button>
                </div>
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

export default CategoryDetailPage;




