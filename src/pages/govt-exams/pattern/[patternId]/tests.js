'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../../../lib/api';
import { FaArrowLeft, FaClock, FaLock, FaUnlock, FaPlay, FaTrophy, FaHistory, FaEye } from 'react-icons/fa';
import { getCurrentUser, isTokenValid, secureLogout } from '../../../../lib/utils/authUtils';
import Loading from '../../../../components/Loading';
import TestStartModal from '../../../../components/TestStartModal';
import dbConnect from '../../../../lib/db';
import PracticeTest from '../../../../models/PracticeTest';
import ExamPattern from '../../../../models/ExamPattern';
import Exam from '../../../../models/Exam';
import ExamCategory from '../../../../models/ExamCategory';

const PatternTests = ({ patternId, initialPattern = null, initialTests = [], initialPagination = null, initialError = '', seo }) => {
  // ... (rest of the component remains same)
  const router = useRouter();
  const [pattern, setPattern] = useState(initialPattern);
  const [tests, setTests] = useState(initialTests);
  const [loading, setLoading] = useState(!initialTests.length && !initialError);
  const [error, setError] = useState(initialError);
  const [page, setPage] = useState(initialPagination?.page || 1);
  const [totalPages, setTotalPages] = useState(initialPagination?.pages || 1);
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [exam, setExam] = useState(initialPattern?.exam || null);
  const [category, setCategory] = useState(initialPattern?.exam?.category || null);
  const [user, setUser] = useState(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const hasInitialDataRef = useRef(!!initialTests.length);

  const fetchTests = useCallback(async (targetPage) => {
    if (!patternId) return;

    try {
      setLoading(true);
      setError('');
      const res = await API.getTestsByPattern(patternId, { page: targetPage, limit: 10 });

      if (res?.success) {
        const fetchedTests = res.data || [];
        let enhancedTests = fetchedTests;

        const activeUser = getCurrentUser();
        if (activeUser && !user) {
          setUser(activeUser);
        }

        if (activeUser?._id && isTokenValid()) {
          try {
            const attemptsRes = await API.getUserTestResults(activeUser._id, { limit: 100 });
            if (attemptsRes?.success) {
              const attemptMap = (attemptsRes.data || []).reduce((acc, attempt) => {
                const practiceTestId = attempt.practiceTest?._id?.toString?.() || attempt.practiceTest?.toString?.();
                if (practiceTestId) {
                  acc[practiceTestId] = {
                    attemptId: attempt._id,
                    status: attempt.status,
                    score: attempt.score,
                    correctCount: attempt.correctCount,
                    wrongCount: attempt.wrongCount,
                    submittedAt: attempt.submittedAt,
                    totalTime: attempt.totalTime,
                    accuracy: attempt.accuracy,
                    rank: attempt.rank,
                    percentile: attempt.percentile,
                  };
                }
                return acc;
              }, {});

              enhancedTests = fetchedTests.map(test => {
                const attempt = attemptMap[test._id?.toString?.()];
                if (attempt) {
                  return { ...test, userAttempt: attempt };
                }
                return test;
              });
            }
          } catch (attemptErr) {
            console.error('Failed to fetch attempt data:', attemptErr);
            if (attemptErr?.response?.status === 401 || attemptErr?.message === 'Invalid token') {
              secureLogout(router, false);
              return;
            }
          }
        }

        setTests(enhancedTests);
        if (res.pagination) {
          setTotalPages(res.pagination.pages || 1);
        }
        if (res.pattern) {
          setPattern(res.pattern);
          if (res.pattern.exam) {
            setExam(res.pattern.exam);
            if (res.pattern.exam.category) {
              setCategory(res.pattern.exam.category);
            }
          }
        }
      } else {
        setError('Failed to load practice tests. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching tests:', err);
      if (err?.response?.status === 401 || err?.message === 'Invalid token') {
        secureLogout(router, false);
        return;
      }
      setError('Failed to load practice tests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [patternId, user]);

  useEffect(() => {
    setIsClientReady(true);
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    if (!patternId) return;

    if (page === 1 && hasInitialDataRef.current) {
      hasInitialDataRef.current = false;
      return;
    }

    fetchTests(page);
  }, [patternId, page, fetchTests]);

  useEffect(() => {
    if (!patternId || !isClientReady) return;
    fetchTests(page);
  }, [patternId, page, fetchTests, isClientReady]);

  const handleStartTest = (test) => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/govt-exams/test/${test._id}/start`));
      return;
    }

    if (!test.isFree && !user.hasSubscription) {
      router.push('/subscription');
      return;
    }

    // Show modal instead of navigating directly
    setSelectedTest(test);
    setShowTestModal(true);
  };

  const handleViewResult = (test) => {
    if (!test?.userAttempt?.attemptId) return;

    const resultPayload = {
      attemptId: test.userAttempt.attemptId,
      score: test.userAttempt.score ?? 0,
      correctCount: test.userAttempt.correctCount ?? 0,
      wrongCount: test.userAttempt.wrongCount ?? 0,
      accuracy: test.userAttempt.accuracy ?? 0,
      totalTime: test.userAttempt.totalTime ?? 0,
      rank: test.userAttempt.rank ?? null,
      percentile: test.userAttempt.percentile ?? null,
      testTitle: test.title,
      totalQuestions: test.questionCount ?? (test.examPattern?.sections?.reduce?.((acc, section) => acc + (section.questionCount || 0), 0) || 0),
      submittedAt: test.userAttempt.submittedAt,
      sectionWiseScore: {}
    };

    try {
      localStorage.setItem(`test_result_${test._id}`, JSON.stringify(resultPayload));
    } catch (error) {
      console.warn('Unable to cache result payload for test', test._id, error);
    }

    router.push(`/govt-exams/test/${test._id}/result?attempt=${test.userAttempt.attemptId}`);
  };

  const handleConfirmTestStart = () => {
    setShowTestModal(false);
    if (selectedTest) {
      router.push(`/govt-exams/test/${selectedTest._id}/start`);
    }
  };

  const handleCancelTestStart = () => {
    setShowTestModal(false);
    setSelectedTest(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="lg" color="gray" message="Loading tests..." />
      </div>
    );
  }

  const patternTitle = pattern?.title || 'Exam Pattern';
  const examName = exam?.name || '';
  const categoryName = category?.name || '';
  const testCount = tests.length;
  const duration = pattern?.duration ? `${Math.floor(pattern.duration / 60)}h ${pattern.duration % 60}m` : '';
  const totalMarks = pattern?.totalMarks || '';

  return (
    <>
      <Head>
        <title>{seo?.title || `${patternTitle} - Practice Tests | AajExam`}</title>
        {seo?.description && <meta name="description" content={seo.description} />}
        {seo?.keywords && <meta name="keywords" content={seo.keywords} />}
        <meta property="og:type" content="website" />
        {seo?.title && <meta property="og:title" content={seo.title} />}
        {seo?.description && <meta property="og:description" content={seo.description} />}
        {seo?.image && <meta property="og:image" content={seo.image} />}
        {seo?.url && <meta property="og:url" content={seo.url} />}
        <meta name="twitter:card" content="summary_large_image" />
        {seo?.title && <meta name="twitter:title" content={seo.title} />}
        {seo?.description && <meta name="twitter:description" content={seo.description} />}
        {seo?.image && <meta name="twitter:image" content={seo.image} />}
        {seo?.url && <link rel="canonical" href={seo.url} />}
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2 lg:px-4">
        <div className="container mx-auto py-0 px-0 lg:px-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between gap-2 mb-2 lg:mb-4">

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors"
            >
              <FaArrowLeft /> Back
            </button>

            {/* Pattern Info */}
            {pattern && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl py-2 px-4 text-white">
                <h1 className="text-md lg:text-2xl font-bold">{pattern.title}</h1>
                <div className="flex flex-wrap gap-2 lg:gap-4 text-sm">
                  {pattern.duration && (
                    <div className="flex items-center gap-1 lg:gap-2">
                      <FaClock /> {Math.floor(pattern.duration / 60)}h {pattern.duration % 60}m
                    </div>
                  )}
                  {pattern.totalMarks && (
                    <div className="flex items-center gap-2">
                      <FaTrophy /> {pattern.totalMarks} marks
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tests List */}
          {tests.length > 0 ? (
            <div className="space-y-4">
              {tests.map((test) => (
                <div
                  key={test._id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${!test.isFree && !user?.hasSubscription ? 'opacity-75' : ''
                    }`}
                >
                  <div className="p-2 lg:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white mb-0 lg:mb-2">
                          {test.title}
                        </h3>
                        {test.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {test.description}
                          </p>
                        )}
                      </div>
                      {!test.isFree && (
                        <span
                          className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${user?.hasSubscription
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {user?.hasSubscription ? (
                            <>
                              <FaUnlock /> Unlocked
                            </>
                          ) : (
                            <>
                              <FaLock /> Premium
                            </>
                          ) || 'Premium'}
                        </span>
                      )}
                      {test.isFree && (
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                          <FaUnlock /> Free
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {test.totalMarks && (
                          <div className="flex items-center gap-1">
                            <FaTrophy /> {test.totalMarks} marks
                          </div>
                        )}
                        {test.questionCount && (
                          <div className="flex items-center gap-1">
                            <FaHistory /> {test.questionCount} questions
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartTest(test)}
                          disabled={!test.isFree && !user?.hasSubscription}
                          className={`px-3 lg:px-6 py-1 lg:py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${!test.isFree && !user?.hasSubscription
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transform hover:scale-105'
                            }`}
                        >
                          <FaPlay /> {test?.userAttempt?.status === 'Completed' ? 'Retake Test' : 'Start Test'}
                        </button>

                        {test?.userAttempt?.status === 'Completed' && (
                          <button
                            onClick={() => handleViewResult(test)}
                            className="px-3 lg:px-6 py-1 lg:py-2 rounded-lg font-semibold bg-white dark:bg-gray-900 border border-red-500 text-primary-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
                          >
                            <FaEye /> View Result
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
              <FaPlay className="text-6xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                No Tests Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Practice tests will appear here once they're added
              </p>
            </div>
          )}
        </div>
      </div>

      <TestStartModal
        isOpen={showTestModal}
        test={selectedTest}
        pattern={pattern}
        exam={exam}
        category={category}
        onClose={handleCancelTestStart}
        onConfirm={handleConfirmTestStart}
      />
    </>
  );
};

export default PatternTests;

export async function getServerSideProps({ params, query }) {
  const patternId = params?.patternId;

  if (!patternId) {
    return { notFound: true };
  }

  try {
    await dbConnect();

    const page = parseInt(query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [tests, total, pattern] = await Promise.all([
      PracticeTest.find({ examPattern: patternId })
        .populate('examPattern', 'title duration totalMarks sections')
        .select('-questions.correctAnswerIndex')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PracticeTest.countDocuments({ examPattern: patternId }),
      ExamPattern.findById(patternId)
        .populate({
          path: 'exam',
          populate: { path: 'category', select: 'name type' }
        })
        .lean()
    ]);

    if (!pattern) {
      return { notFound: true };
    }

    const patternTitle = pattern?.title || 'Exam Pattern';
    const examName = pattern?.exam?.name;
    const categoryName = pattern?.exam?.category?.name;
    const testCount = total;

    const descriptionSegments = [
      pattern?.description,
      `Practice ${testCount || 'multiple'} ${testCount === 1 ? 'practice test' : 'practice tests'}${examName ? ` for ${examName}` : ''}${categoryName ? ` (${categoryName})` : ''}.`
    ].filter(Boolean);
    const description = descriptionSegments.join(' ');

    const keywordSet = new Set([
      patternTitle,
      examName,
      categoryName,
      'practice test',
      'mock test',
      'government exam',
      'exam preparation'
    ].filter(Boolean));

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    const seo = {
      title: `${patternTitle} - Practice Tests | AajExam`,
      description,
      keywords: Array.from(keywordSet).join(', '),
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams/pattern/${patternId}/tests` : undefined
    };

    return {
      props: {
        patternId,
        initialPattern: JSON.parse(JSON.stringify(pattern)),
        initialTests: JSON.parse(JSON.stringify(tests)),
        initialPagination: { page, pages: Math.ceil(total / limit) },
        seo
      }
    };
  } catch (error) {
    console.error('Failed to pre-render govt exam pattern tests:', error);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    const fallbackSeo = {
      title: 'Practice Tests | AajExam',
      description: 'Practice government exam patterns with realistic mock tests on AajExam.',
      keywords: 'practice test, mock test, government exam',
      image: '/logo.png',
      url: baseUrl ? `${baseUrl}/govt-exams/pattern/${patternId}/tests` : undefined
    };

    return {
      props: {
        patternId,
        initialPattern: null,
        initialTests: [],
        initialPagination: { page: 1, pages: 1 },
        initialError: 'Failed to load practice tests. Please try again.',
        seo: fallbackSeo
      }
    };
  }
}

