'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import Head from 'next/head';
import { FaClock, FaQuestionCircle, FaStar, FaLayerGroup, FaArrowLeft } from 'react-icons/fa';
import API from '../../lib/api';
import QuizStartModal from '../QuizStartModal';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';

const PAGE_SIZE = 9;

const SubcategoryDetailPage = () => {
  const router = useRouter();
  const { subcategoryId } = router.query;
  const [subcategory, setSubcategory] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  useEffect(() => {
    fetchSubcategory();
    fetchQuizzes(page);
    // eslint-disable-next-line
  }, [subcategoryId, page]);

  const fetchSubcategory = async () => {
    try {
      // Try to get subcategory from homepage data first
      const homeData = JSON.parse(localStorage.getItem('homeData'));
      if (homeData && homeData.subcategories) {
        const found = homeData.subcategories.find(sub => sub._id === subcategoryId);
        if (found) {
          setSubcategory(found);
          return;
        }
      }

      // If not found in homeData, try to fetch from API
      // We need to fetch all subcategories since we don't have the categoryId
      const response = await API.request('/api/student/subcategories');
      if (response && response.length > 0) {
        const found = response.find(sub => sub._id === subcategoryId);
        setSubcategory(found || null);
      } else {
        setSubcategory(null);
      }
    } catch (err) {
      console.error('Error fetching subcategory:', err);
      setSubcategory(null);
    }
  };

  const fetchQuizzes = async (pageNum) => {
    setLoading(true);
    setError('');
    try {
      const res = await API.request(`/api/student/quizzes/public/level-based?subcategory=${subcategoryId}&page=${pageNum}&limit=${PAGE_SIZE}`);
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
      // Store navigation data in localStorage (more persistent than sessionStorage)
      const navigationData = {
        fromPage: 'subcategory',
        quizData: selectedQuiz,
        subcategoryId: subcategoryId,
        competitionType,
      };
      localStorage.setItem('quizNavigationData', JSON.stringify(navigationData));
      router.push(`/attempt-quiz/${selectedQuiz._id}`);
    }
  };

  const handleCancelQuizStart = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  return (
    <>
      <Head>
        <title>{subcategory ? `${subcategory.name} - AajExam` : 'Subcategory - AajExam'}</title>
        <meta name="description" content={subcategory ? `Explore ${subcategory.name} quizzes on AajExam. Test your knowledge and compete for prizes.` : 'Explore subcategory quizzes on AajExam platform.'} />
        <meta name="keywords" content={`${subcategory?.name || 'subcategory'} quiz, ${subcategory?.name || 'subcategory'} questions, AajExam ${subcategory?.name || 'subcategory'}`} />
      </Head>
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
        {/* Hero Section with Subcategory Name and Description */}
        {subcategory && (
          <div className="bg-gradient-to-r from-yellow-800 via-orange-800 to-red-800 text-white py-6 lg:py-12 px-4 lg:px-6 shadow-2xl">
            <div className="max-w-5xl mx-auto text-center">
              <div className="mb-4">
                <h1 className="text-2xl sm:text-5xl font-bold mb-4 drop-shadow-lg animate-fade-in">
                  {subcategory.name}
                </h1>
                {subcategory.category && (
                  <p className="text-md lg:text-xl text-yellow-100 mb-3 max-w-2xl mx-auto">
                    Category: <span className="font-semibold">{subcategory.category.name}</span>
                  </p>
                )}
                {subcategory.description && (
                  <p className="text-sm lg:text-xl text-yellow-100 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
                    {subcategory.description}
                  </p>
                )}
              </div>
              <div className="flex justify-center items-center gap-4 mt-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                  <span className="text-sm font-semibold">Take Quizzes</span>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                  <span className="text-sm font-semibold">Test Knowledge</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto py-4 px-4 lg:px-10">
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-900">
              <Loading size="lg" color="gray" message="Loading quizzes..." />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold py-10">{error}</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center text-gray-500 font-medium py-10">No quizzes found for this subcategory.</div>
          ) : (
            <>
              <div className="flex flex-row items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h2 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2 sm:gap-3">
                  <FaQuestionCircle className="text-red-500" />
                  Quizzes ({quizzes?.length})
                </h2>
                <button
                  onClick={() => router.back()}
                  className="px-3 md:px-4 py-1 md:py-2 bg-gradient-to-r from-yellow-500 to-red-600 text-white rounded-2xl hover:from-yellow-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                >
                  <FaArrowLeft />
                  <span>Go Back</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6 lg:gap-6 xl:gap-8 mb-2 md:mb-4 lg:mb-6 xl:mb-8">
                {quizzes.map((quiz) => (
                  <div key={quiz._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-2 lg:p-6 border-2 border-yellow-400 hover:border-red-500 cursor-pointer flex flex-col justify-between">
                    <div>
                      <h2 className="tex-md lg:text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
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
                      className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-red-500 hover:from-red-500 hover:to-yellow-500 text-white font-semibold py-2 rounded-xl transition-all duration-300 shadow-md text-center"
                    >
                      Start Quiz
                    </button>

                  </div>
                ))}
              </div>
              {/* Pagination */}
              <div className="flex justify-center gap-2 mt-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50">Prev</button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button key={idx} onClick={() => setPage(idx + 1)} className={`px-4 py-2 rounded-lg font-semibold ${page === idx + 1 ? 'bg-yellow-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>{idx + 1}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold disabled:opacity-50">Next</button>
              </div>
            </>
          )}
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

export default SubcategoryDetailPage;




