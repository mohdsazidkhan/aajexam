'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../../../lib/api';
import {
  FaTrophy, FaChartLine, FaUsers, FaCheckCircle,
  FaTimesCircle, FaRedo, FaShare, FaCrown, FaHome, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import Loading from '../../../../components/Loading';
import { getCurrentUser, secureLogout } from '../../../../lib/utils/authUtils';

const TestResult = () => {
  const router = useRouter();
  const { testId, attempt } = router.query;
  const user = getCurrentUser();

  const [result, setResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // summary, review, leaderboard
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailedTest, setDetailedTest] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);

  useEffect(() => {
    if (testId) {
      fetchLeaderboard();
    }
  }, [testId]);

  // Fetch leaderboard only - results come from URL query or submit redirect
  const fetchLeaderboard = async () => {
    try {
      const res = await API.getTestLeaderboard(testId, { limit: 10 });
      if (res?.success) {
        setLeaderboard(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    }
  };

  useEffect(() => {
    if (!router.isReady || !testId || !attempt) return;

    const fetchAttemptDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError('');
        const res = await API.getTestAttemptDetail(testId, attempt);
        if (res?.success) {
          const { attempt: attemptData, test: testData, sectionWiseScore } = res.data || {};
          setAttemptDetail(attemptData || null);
          setDetailedTest(testData || null);

          setResult((prev) => {
            const updated = {
              ...(prev || {}),
              score: attemptData?.score ?? prev?.score ?? 0,
              correctCount: attemptData?.correctCount ?? prev?.correctCount ?? 0,
              wrongCount: attemptData?.wrongCount ?? prev?.wrongCount ?? 0,
              accuracy: attemptData?.accuracy ?? prev?.accuracy ?? 0,
              totalTime: attemptData?.totalTime ?? prev?.totalTime ?? 0,
              rank: attemptData?.rank ?? prev?.rank ?? null,
              percentile: attemptData?.percentile ?? prev?.percentile ?? 0,
              testTitle: testData?.title ?? prev?.testTitle ?? 'Practice Test',
              totalQuestions: testData?.questions?.length ?? prev?.totalQuestions ?? 0,
              sectionWiseScore: sectionWiseScore || prev?.sectionWiseScore || {}
            };
            return updated;
          });

          try {
            const storagePayload = {
              attemptId: attemptData?.attemptId,
              score: attemptData?.score ?? 0,
              correctCount: attemptData?.correctCount ?? 0,
              wrongCount: attemptData?.wrongCount ?? 0,
              accuracy: attemptData?.accuracy ?? 0,
              totalTime: attemptData?.totalTime ?? 0,
              rank: attemptData?.rank ?? null,
              percentile: attemptData?.percentile ?? 0,
              testTitle: testData?.title ?? 'Practice Test',
              totalQuestions: testData?.questions?.length ?? 0,
              sectionWiseScore: sectionWiseScore || {}
            };
            localStorage.setItem(`test_result_${testId}`, JSON.stringify(storagePayload));
          } catch (storageErr) {
            console.warn('Failed to cache result summary:', storageErr);
          }

          setLoading(false);
        } else {
          setDetailError('Failed to load attempt details. Please try again later.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching attempt details:', err);
        if (err?.response?.status === 401 || err?.message === 'Invalid token') {
          secureLogout(router, false);
          return;
        }
        if (err?.response?.status === 404) {
          setError('Attempt not found. It may have expired or been removed.');
        } else {
          setDetailError(err?.message || 'Failed to load attempt details.');
        }
        setLoading(false);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchAttemptDetail();
  }, [router.isReady, testId, attempt, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get result from localStorage if available (passed from submit)
      const savedResult = localStorage.getItem(`test_result_${testId}`);
      if (savedResult) {
        try {
          setResult(JSON.parse(savedResult));
          localStorage.removeItem(`test_result_${testId}`);
          setLoading(false);
        } catch (e) {
          console.error('Error parsing result:', e);
        }
      }
    }
  }, [testId]);

  const answerMap = useMemo(() => {
    const map = {};
    if (!attemptDetail?.answers) return map;
    attemptDetail.answers.forEach((answer) => {
      if (answer?.questionId) {
        map[answer.questionId.toString()] = answer;
      }
    });
    return map;
  }, [attemptDetail]);

  const sectionStats = useMemo(() => {
    if (!detailedTest?.examPattern?.sections) return [];
    const counts = {};
    (detailedTest?.questions || []).forEach((question) => {
      const sectionName = question.section || 'General';
      counts[sectionName] = (counts[sectionName] || 0) + 1;
    });
    return detailedTest.examPattern.sections.map((section) => ({
      name: section.name || 'Section',
      questionCount: counts[section.name] ?? section.questionCount ?? 0,
      marksPerQuestion: section.marksPerQuestion ?? null,
      negativePerQuestion: section.negativePerQuestion ?? null
    }));
  }, [detailedTest]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="lg" color="gray" message="Loading results..." />
      </div>
    );
  }

  if (!result && !error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FaTrophy className="text-6xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No Results Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please complete a test to view results
          </p>
          <button
            onClick={() => router.push(`/govt-exams/test/${testId}/start`)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { score, accuracy, rank, percentile, correctCount, wrongCount, sectionWiseScore = {} } = result;
  const scoreValue = typeof score === 'number' ? score : Number(score) || 0;
  const accuracyValue = typeof accuracy === 'number' ? accuracy : Number(accuracy) || 0;
  const percentileValue = typeof percentile === 'number' ? percentile : Number(percentile) || 0;
  const rankValue = typeof rank === 'number' ? `#${rank}` : rank ? `#${rank}` : 'N/A';
  const testTitle = result?.testTitle || 'Practice Test';
  const totalQuestions = result?.totalQuestions || Math.max((correctCount || 0) + (wrongCount || 0), 0);
  const notAttempted = Math.max(totalQuestions - ((correctCount || 0) + (wrongCount || 0)), 0);
  const userId = user?.id;
  const topPerformer = leaderboard?.[0];
  const youInLeaderboard = leaderboard?.find(entry => entry.user?._id === userId);

  return (
    <>
      <Head>
        <title>{testTitle} - Test Results | AajExam</title>
        <meta name="description" content={`Test Results: ${testTitle}. Score: ${scoreValue}, Accuracy: ${accuracyValue.toFixed(1)}%, Rank: #${rankValue}, Percentile: ${percentileValue.toFixed(1)}. ${correctCount} correct, ${wrongCount} wrong out of ${totalQuestions} questions.`} />
        <meta name="keywords" content={`${testTitle}, test results, exam results, practice test results, score, accuracy, rank, percentile`} />
        <meta property="og:title" content={`${testTitle} - Test Results | AajExam`} />
        <meta property="og:description" content={`Test Results: Score ${scoreValue}, Accuracy ${accuracyValue.toFixed(1)}%, Rank #${rankValue}, Percentile ${percentileValue.toFixed(1)}.`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${testTitle} - Test Results | AajExam`} />
        <meta name="twitter:description" content={`Test Results: Score ${scoreValue}, Accuracy ${accuracyValue.toFixed(1)}%, Rank #${rankValue}.`} />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2 lg:px-4">
        <div className="container mx-auto py-0 lg:py-4 px-0 lg:px-10">
          {/* Summary Header */}
          <div className="rounded-2xl p-4 lg:p-8 mb-4 lg:mb-8 text-center text-white 
  bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 
  dark:from-gray-800 dark:via-gray-900 dark:to-black 
  transition-all duration-500 shadow-lg hover:shadow-2xl">
            <FaTrophy className="text-3xl lg:text-5xl mx-auto mb-2 lg:mb-4 text-yellow-500" />
            <h2 className="text-md lg:text-2xl font-bold uppercase tracking-wide text-gray-800 dark:text-yellow-500 mb-2">
              {testTitle}
            </h2>
            <h1 className="text-xl lg:text-3xl font-bold mb-2 text-gray-800 dark:text-green-500">Test Completed! 🎉</h1>
            <p className="textmd lg:text-lg opacity-90 text-gray-800 dark:text-white">Great job on completing the test</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4 mb-4 lg:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg text-center">
              <FaCheckCircle className="text-green-500 text-3xl mx-auto mb-2" />
              <div className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{scoreValue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg text-center">
              <FaChartLine className="text-blue-500 text-3xl mx-auto mb-2" />
              <div className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{accuracyValue.toFixed(1)}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg text-center">
              <FaTrophy className="text-yellow-500 text-3xl mx-auto mb-2" />
              <div className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{rankValue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rank</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg text-center">
              <FaUsers className="text-yellow-500 text-3xl mx-auto mb-2" />
              <div className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">{percentileValue.toFixed(1)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Percentile</div>
            </div>
          </div>

          {/* Leaderboard Highlight */}
          {leaderboard.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg mb-4 lg:mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">Live Leaderboard</h2>
                  <p className="text-md lg:text-lg text-gray-600 dark:text-gray-400">
                    See how you stack up against other students in real time.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3">
                  <FaTrophy className="text-blue-500 text-2xl" />
                  <div>
                    <div className="text-xs text-blue-500 uppercase font-semibold">Top Performer</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {topPerformer?.user?.name || 'Anonymous'}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {`Score ${topPerformer?.score ?? 0} • Accuracy ${topPerformer?.accuracy !== undefined && topPerformer?.accuracy !== null
                        ? (topPerformer?.accuracy?.toFixed ? topPerformer.accuracy.toFixed(1) : topPerformer.accuracy)
                        : 0
                        }%`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-600 from-red-600 text-white">
                    <tr>
                      <th className="py-1 px-2 lg:py-3 lg:px-4 text-left font-semibold">Rank</th>
                      <th className="py-1 px-2 lg:py-3 lg:px-4 text-left font-semibold">Student</th>
                      <th className="py-1 px-2 lg:py-3 lg:px-4 text-center font-semibold">Score</th>
                      <th className="py-1 px-2 lg:py-3 lg:px-4 text-center font-semibold">Accuracy</th>
                      <th className="py-1 px-2 lg:py-3 lg:px-4 text-center font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => {
                      const isCurrentUser = entry.user?._id === userId;
                      return (
                        <tr
                          key={entry._id || idx}
                          className={`border-b border-gray-200 dark:border-gray-700 ${isCurrentUser ? 'bg-yellow-50 dark:bg-yellow-900/30' : ''
                            }`}
                        >
                          <td className="py-1 px-2 lg:py-3 lg:px-4 font-semibold text-gray-900 dark:text-white">
                            {idx + 1}
                          </td>
                          <td className="py-1 px-2 lg:py-3 lg:px-4 text-gray-700 dark:text-gray-300">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {entry.user?.name || 'Anonymous'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              @{entry.user?.username || entry.user?.email?.split('@')[0] || 'student'}
                            </div>
                          </td>
                          <td className="py-1 px-2 lg:py-3 lg:px-4 text-center font-bold text-gray-900 dark:text-white">
                            {entry.score}
                          </td>
                          <td className="py-1 px-2 lg:py-3 lg:px-4 text-center text-gray-700 dark:text-gray-300">
                            {entry.accuracy?.toFixed ? entry.accuracy.toFixed(1) : `${entry.accuracy}%`}
                          </td>
                          <td className="py-1 px-2 lg:py-3 lg:px-4 text-center text-gray-700 dark:text-gray-300">
                            {entry.totalTime ? formatTime(entry.totalTime) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {youInLeaderboard ? null : (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  Leaderboard shows the top {leaderboard.length} students. Keep practicing to climb the ranks!
                </div>
              )}
            </div>
          )}

          {/* Detailed Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg mb-4 lg:mb-8">
            <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-6">Performance Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 lg:gap-6">
              <div className="text-center p-2 lg:p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="text-xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {correctCount}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Correct Answers</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <div className="text-xl lg:text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {wrongCount}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Wrong Answers</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="text-xl lg:text-4xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                  {notAttempted}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">Not Attempted</div>
              </div>
            </div>
          </div>

          {/* Section-wise Score */}
          {Object.keys(sectionWiseScore).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg mb-4 lg:mb-8">
              <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-6">Section-wise Performance</h2>
              <div className="space-y-4">
                {Object.entries(sectionWiseScore).map(([section, data]) => (
                  <div key={section} className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 lg:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm lg:text-md font-semibold text-gray-900 dark:text-white">{section}</span>
                      <span className="text-sm lg:text-lg font-bold text-blue-600 dark:text-blue-400">
                        {data.score} marks
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-green-600 dark:text-green-400">✓ {data.correct} Correct</div>
                      <div className="text-red-600 dark:text-red-400">✗ {data.wrong} Wrong</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Details */}
          {detailedTest && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg mb-4 lg:mb-8">
              <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-3 lg:mb-6">Test Details</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-3 lg:mb-6">
                <div className="p-2 lg:p-4 rounded-lg bg-gray-100 dark:bg-gray-700/40">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Questions</div>
                  <div className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">{detailedTest?.questions?.length ?? totalQuestions}</div>
                </div>
                <div className="p-2 lg:p-4 rounded-lg bg-gray-100 dark:bg-gray-700/40">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Marks</div>
                  <div className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">{detailedTest?.totalMarks ?? '—'}</div>
                </div>
                <div className="p-2 lg:p-4 rounded-lg bg-gray-100 dark:bg-gray-700/40">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Duration</div>
                  <div className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {detailedTest?.duration ? `${Math.floor(detailedTest.duration / 60)}h ${detailedTest.duration % 60}m` : '—'}
                  </div>
                </div>
                <div className="p-2 lg:p-4 rounded-lg bg-gray-100 dark:bg-gray-700/40">
                  <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Sections</div>
                  <div className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {sectionStats.length || detailedTest?.examPattern?.sections?.length || 0}
                  </div>
                </div>
              </div>
              {sectionStats.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Section Breakdown</h3>
                  <div className="flex flex-wrap gap-2">
                    {sectionStats.map((section) => (
                      <span
                        key={section.name}
                        className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-yellow-700 dark:text-yellow-300 text-xs font-semibold"
                      >
                        {section.name} • {section.questionCount} Qs
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Question Review */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 lg:p-6 shadow-lg mb-4 lg:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">Question Review</h2>
              {detailLoading && (
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-red-500 animate-spin" />
                  Loading detailed answers...
                </span>
              )}
            </div>

            {detailError && (
              <div className="mb-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-200">
                {detailError}
              </div>
            )}

            {!detailLoading && !detailError && (!detailedTest?.questions?.length || !attemptDetail) && (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Question details are not available for this attempt.
              </div>
            )}

            {!detailLoading && !detailError && detailedTest?.questions?.length > 0 && (
              <div className="space-y-4">
                {detailedTest.questions.map((question, index) => {
                  const answer = answerMap[question._id?.toString?.()] || answerMap[question._id];
                  const selectedIndex = answer?.selectedIndex;
                  const skipped = selectedIndex === -1;
                  const answered =
                    selectedIndex !== undefined &&
                    selectedIndex !== null &&
                    selectedIndex !== -1;
                  const isCorrect = answered ? answer?.isCorrect : false;
                  const statusLabel = answered
                    ? isCorrect
                      ? 'Correct'
                      : 'Incorrect'
                    : skipped
                      ? 'Skipped'
                      : 'Not Attempted';
                  const statusClass = answered
                    ? isCorrect
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                    : skipped
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
                  const correctOption = question.options?.[question.correctAnswerIndex] ?? '—';
                  const selectedOptionText =
                    answered && question.options && question.options[selectedIndex] !== undefined
                      ? question.options[selectedIndex]
                      : skipped
                        ? 'Skipped'
                        : 'Not Attempted';

                  return (
                    <details
                      key={question._id || index}
                      className="group border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer select-none">
                        <div>
                          <div className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Question {index + 1}
                          </div>
                          {question.section && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Section: {question.section}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
                            {statusLabel}
                          </span>
                          <span className="text-gray-500 dark:text-gray-300 transition-transform group-open:-rotate-180">
                            <FaChevronDown />
                          </span>
                        </div>
                      </summary>
                      <div className="px-4 pb-5 space-y-4">
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {question.questionText}
                        </p>

                        <div className="space-y-3">
                          {(question.options || []).map((option, optionIndex) => {
                            const optionLetter = String.fromCharCode(65 + optionIndex);
                            const isSelected = answered && selectedIndex === optionIndex;
                            const isCorrectOption = question.correctAnswerIndex === optionIndex;

                            let optionClasses =
                              'border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 flex items-start gap-3 text-sm transition-colors';
                            if (isCorrectOption) {
                              optionClasses =
                                'border border-green-500 bg-green-50 dark:bg-green-900/30 rounded-xl px-4 py-3 flex items-start gap-3 text-sm';
                            }
                            if (isSelected && !isCorrectOption) {
                              optionClasses =
                                'border border-red-500 bg-red-50 dark:bg-red-900/30 rounded-xl px-4 py-3 flex items-start gap-3 text-sm';
                            }
                            if (isSelected && isCorrectOption) {
                              optionClasses =
                                'border border-green-600 bg-green-100 dark:bg-green-900/40 rounded-xl px-4 py-3 flex items-start gap-3 text-sm';
                            }

                            return (
                              <div key={optionIndex} className={optionClasses}>
                                <span className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold">
                                  {optionLetter}
                                </span>
                                <div className="flex-1 text-gray-900 dark:text-gray-100">{option}</div>
                                {isSelected && (
                                  <span className="text-xs font-semibold text-red-600 dark:text-red-300">
                                    Your choice
                                  </span>
                                )}
                                {isCorrectOption && (
                                  <FaCheckCircle className="text-green-500 dark:text-green-300 text-lg" />
                                )}
                                {isSelected && !isCorrectOption && (
                                  <FaTimesCircle className="text-red-500 dark:text-red-300 text-lg" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
                            <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">Your Answer</div>
                            <div>
                              {answered
                                ? `${String.fromCharCode(65 + selectedIndex)}. ${selectedOptionText}`
                                : skipped
                                  ? 'Skipped'
                                  : 'Not Attempted'}
                            </div>
                          </div>
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                            <div className="font-semibold text-green-800 dark:text-green-200 mb-1">Correct Answer</div>
                            <div>
                              {question.correctAnswerIndex !== undefined && question.correctAnswerIndex !== null
                                ? `${String.fromCharCode(65 + question.correctAnswerIndex)}. ${correctOption}`
                                : 'Not available'}
                            </div>
                          </div>
                        </div>

                        {answer?.timeTaken ? (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Time spent: {formatTime(answer.timeTaken * 1000)}
                          </div>
                        ) : null}

                        {question.explanation && (
                          <div className="rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
                            <div className="font-semibold mb-2">Explanation</div>
                            <p className="whitespace-pre-wrap">{question.explanation}</p>
                          </div>
                        )}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push(`/govt-exams/test/${testId}/start`)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <FaRedo /> Retake Test
            </button>
            <button
              onClick={() => router.push('/govt-exams')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2"
            >
              <FaHome /> Browse More Tests
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestResult;

