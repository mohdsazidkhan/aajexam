'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaTrophy, FaChartLine, FaTh, FaList, FaTable } from 'react-icons/fa';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { isMobile } from 'react-device-detect';

const AdminUserQuizScores = ({ userId }) => {
  console.log('📦 AdminUserQuizScores rendered with userId:', userId);
  const router = useRouter();
  const [quizScores, setQuizScores] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table'); // 'grid', 'list', 'table'
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchQuizScores = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20
      };

      const response = await API.getUserQuizBestScores(userId, params);
      if (response.success) {
        setQuizScores(response.data || []);
        setUser(response.user || null);
        setPagination(response.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setUser(null);
        setQuizScores([]);
      }
    } catch (error) {
      console.error('Error fetching quiz scores:', error);
      toast.error('Failed to fetch quiz scores');
      setQuizScores([]);
    } finally {
      setLoading(false);
    }
  }, [userId, page]);

  useEffect(() => {
    if (userId) {
      fetchQuizScores();
    }
  }, [userId, page, fetchQuizScores]);

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-orange-700 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadge = (percentage) => {
    if (percentage >= 75) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    if (percentage >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
  };

  // Show loading state
  if (loading) {
    return (
      <AdminMobileAppWrapper title="User Quiz Scores">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          <Sidebar />
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <Loading size="lg" color="blue" message="" />
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  // Show error state if user is not found
  if (!user) {
    return (
      <AdminMobileAppWrapper title="User Quiz Scores">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          <Sidebar />
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => router.push('/admin/prev-month-played-users')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
            </div>
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                User Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                The user data could not be loaded. Please try again.
              </p>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="User Quiz Scores">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        <Sidebar />
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/prev-month-played-users')}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="text-xl" />
                </button>
                <div>
                  <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                    Quiz Best Scores {user?.monthYear ? `- ${user.monthYear}` : ''}
                  </h2>
                  {user && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {user.name} ({user.email})
                    </p>
                  )}
                </div>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                  <FaTh className="text-lg" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                  <FaList className="text-lg" />
                  <span>List</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                  <FaTable className="text-lg" />
                  <span>Table</span>
                </button>
              </div>
            </div>

            {/* User Info Card */}
            {user && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-600 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">Total Quizzes</div>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {pagination.total}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">High Score Quizzes</div>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {user?.monthlyProgress?.highScoreWins || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">Total Score</div>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {user?.getScore} / {user?.totalScore}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">Accuracy</div>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {user?.monthlyProgress?.accuracy || 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700 dark:text-blue-400">Page</div>
                    <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                      {pagination.page} / {pagination.totalPages}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quiz Scores Table */}
            {quizScores.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Quiz Scores Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This user has no quiz scores for the selected month.
                </p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
                    {quizScores.map((score, index) => {
                      const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                      const percentage = score.bestScorePercentage || 0;
                      const lastAttemptDate = score.lastAttemptDate
                        ? new Date(score.lastAttemptDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                        : 'N/A';
                      const lastAttemptTime = score.lastAttemptDate
                        ? new Date(score.lastAttemptDate).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                        : 'N/A';

                      return (
                        <div key={score.quizId || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                          <div className={`p-4 text-white ${percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                            percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                              'bg-gradient-to-r from-red-500 to-pink-600'
                            }`}>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm opacity-90">#{serialNumber}</div>
                                <div className="text-lg font-bold">{score.quiz?.title || 'Quiz ' + serialNumber}</div>
                                {score.quiz?.category && (
                                  <div className="text-sm opacity-80">{score.quiz.category}</div>
                                )}
                              </div>
                              {score.isHighScore && (
                                <FaTrophy className="text-2xl opacity-90" />
                              )}
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Best Score</div>
                                <div className="text-xl font-bold text-gray-900 dark:text-white">
                                  {score.bestScore || 0}
                                </div>
                              </div>
                              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Percentage</div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBadge(percentage)}`}>
                                  {percentage}%
                                </span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">High Score:</span>
                                <span className={`font-medium ${score.isHighScore ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                  {score.isHighScore ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Date:</span>
                                <span className="text-gray-900 dark:text-white font-medium">{lastAttemptDate}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Time:</span>
                                <span className="text-gray-900 dark:text-white font-medium">{lastAttemptTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {quizScores.map((score, index) => {
                      const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                      const percentage = score.bestScorePercentage || 0;
                      const lastAttemptDate = score.lastAttemptDate
                        ? new Date(score.lastAttemptDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                        : 'N/A';
                      const lastAttemptTime = score.lastAttemptDate
                        ? new Date(score.lastAttemptDate).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })
                        : 'N/A';

                      return (
                        <div key={score.quizId || index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow">
                          <div className="p-2 md:p-4 lg:p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${percentage >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                  percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                                    'bg-gradient-to-r from-red-500 to-pink-600'
                                  }`}>
                                  {serialNumber}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm lg:text-lg font-bold text-gray-900 dark:text-white">
                                      {score.quiz?.title || 'Quiz ' + serialNumber}
                                    </h3>
                                    {score.isHighScore && (
                                      <FaTrophy className="text-green-600 dark:text-green-400" />
                                    )}
                                  </div>
                                  {score.quiz?.category && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{score.quiz.category}</div>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Best Score</div>
                                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                                    {score.bestScore || 0}
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Percentage</div>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-bold ${getScoreBadge(percentage)}`}>
                                    {percentage}%
                                  </span>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Date</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{lastAttemptDate}</div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Time</div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">{lastAttemptTime}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Table View */}
                {viewMode === 'table' && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              S.No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Quiz Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Best Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Percentage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              High Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Last Attempt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {quizScores.map((score, index) => {
                            const serialNumber = (pagination.page - 1) * pagination.limit + index + 1;
                            const percentage = score.bestScorePercentage || 0;
                            return (
                              <tr key={score.quizId || index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                  {serialNumber}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {score.quiz?.title || 'Quiz ' + (serialNumber)}
                                  </div>
                                  {score.quiz?.category && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {score.quiz.category}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {score.bestScore || 0}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadge(percentage)}`}>
                                    {percentage}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {score.isHighScore ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                                      <FaTrophy className="mr-1" />
                                      Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                                      No
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                  {score.lastAttemptDate
                                    ? new Date(score.lastAttemptDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                    : 'N/A'
                                  }
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                  {score.lastAttemptDate
                                    ? new Date(score.lastAttemptDate).toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true
                                    })
                                    : 'N/A'
                                  }
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-col lg:flex-row items-center justify-start lg:justify-between mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} quiz scores
                    </div>
                    <div className="flex flex-col lg:flex-row items-center gap-2 mt-2 lg:mt-0">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <FaChevronLeft className="text-sm" />
                        <span>Previous</span>
                      </button>
                      <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <span>Next</span>
                        <FaChevronRight className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminUserQuizScores;

