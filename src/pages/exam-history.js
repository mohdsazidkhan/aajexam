'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useGlobalError } from '../contexts/GlobalErrorContext';
import { useTokenValidation } from '../hooks/useTokenValidation';
import API from '../lib/api'
import Pagination from '../components/Pagination';
import { FaClock, FaCheckCircle, FaTimesCircle, FaGraduationCap, FaEye, FaList, FaTh, FaTable, FaSearch } from 'react-icons/fa';
import { useRouter } from 'next/router';
// MobileAppWrapper import removed
import UnifiedFooter from '../components/UnifiedFooter';
import Loading from '../components/Loading';
import { isMobile } from 'react-device-detect';
import config from '../lib/config/appConfig';
import Seo from '../components/Seo';

const ExamHistoryPage = () => {
  const [examHistory, setExamHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [currentView, setCurrentView] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
      }
    } catch (e) { }
    return isMobile ? 'grid' : 'table';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  const { handleError } = useGlobalError();
  const { isValidating } = useTokenValidation();
  const router = useRouter();

  const itemsPerPage = 10;

  useEffect(() => {
    if (!isValidating) {
      fetchExamHistory();
    }
  }, [currentPage, searchTerm, filters, isValidating]);

  // Ensure Grid on small screens after mount and on orientation change
  useEffect(() => {
    try {
      const enforceGridOnSmall = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setCurrentView('grid');
        }
      };
      enforceGridOnSmall();
      window.addEventListener('resize', enforceGridOnSmall);
      window.addEventListener('orientationchange', enforceGridOnSmall);
      return () => {
        window.removeEventListener('resize', enforceGridOnSmall);
        window.removeEventListener('orientationchange', enforceGridOnSmall);
      };
    } catch (e) { }
  }, []);

  const fetchExamHistory = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...filters
      };

      const response = await API.getExamAttemptHistory(params);
      const payload = response?.data || response;
      const attempts = payload.attempts || payload.items || [];

      setExamHistory(attempts);
      setTotalPages(payload.pagination?.totalPages || payload.pagination?.pages || 1);
      setTotalItems(payload.pagination?.totalAttempts || payload.pagination?.total || (attempts.length || 0));
    } catch (error) {
      handleError(error, 'Failed to fetch exam history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'Abandoned':
        return <FaTimesCircle className="text-red-500" />;
      case 'InProgress':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 dark:text-green-400';
      case 'Abandoned':
        return 'text-red-600 dark:text-red-400';
      case 'InProgress':
        return 'text-orange-700 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '0:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatAttemptedDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatAttemptedTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleViewDetails = (attempt) => {
    if (attempt.practiceTest) {
      router.push(`/govt-exams/test/${attempt.practiceTest}/result?attempt=${attempt._id}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      category: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Render Table View
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Test
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Time Spent
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {examHistory.map((attempt) => (
            <tr key={attempt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-0 lg:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {attempt.testTitle || 'Unknown Test'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {attempt.examName || 'Unknown Exam'} - {attempt.patternTitle || 'Unknown Pattern'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {attempt.categoryName || 'No Category'}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-center">
                  <div className="font-semibold text-blue-600 dark:text-blue-400">
                    {attempt.score}/{attempt.totalMarks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {attempt.accuracy ? `${attempt.accuracy.toFixed(1)}%` : '0%'} Accuracy
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {attempt.correctCount || 0} Correct, {attempt.wrongCount || 0} Wrong
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-center">
                  {attempt.rank ? (
                    <>
                      <div className="font-semibold text-orange-700 dark:text-yellow-400">
                        #{attempt.rank}
                      </div>
                      {attempt.percentile && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {attempt.percentile.toFixed(1)}%ile
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(attempt.status)}
                  <span className={`font-medium ${getStatusColor(attempt.status)}`}>
                    {attempt.status || 'Unknown'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <FaClock className="mr-1" />
                  {formatTime(attempt.totalTime)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                {formatAttemptedDate(attempt.submittedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                {formatAttemptedTime(attempt.submittedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleViewDetails(attempt)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1"
                >
                  <FaEye />
                  <span>View Result</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Render List View
  const renderListView = () => (
    <div className="space-y-4">
      {examHistory.map((attempt) => (
        <div
          key={attempt._id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 lg:p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Test
                  </div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {attempt.testTitle || 'Unknown Test'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {attempt.examName || 'Unknown Exam'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {attempt.patternTitle || 'Unknown Pattern'} • {attempt.categoryName || 'No Category'}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Score
                  </div>
                  <div className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                    {attempt.score}/{attempt.totalMarks}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {attempt.accuracy ? `${attempt.accuracy.toFixed(1)}%` : '0%'} Accuracy
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {attempt.correctCount || 0} Correct • {attempt.wrongCount || 0} Wrong
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Performance
                  </div>
                  {attempt.rank ? (
                    <div>
                      <div className="font-semibold text-orange-700 dark:text-yellow-400">
                        Rank #{attempt.rank}
                      </div>
                      {attempt.percentile && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {attempt.percentile.toFixed(1)}%ile
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400">-</div>
                  )}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <FaClock className="mr-1" />
                    {formatTime(attempt.totalTime)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Status
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(attempt.status)}
                    <span className={`font-medium ${getStatusColor(attempt.status)}`}>
                      {attempt.status || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Date
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatAttemptedDate(attempt.submittedAt)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                    Time
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatAttemptedTime(attempt.submittedAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => handleViewDetails(attempt)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FaEye />
                <span>View Result</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Render Grid View
  const renderGridView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {examHistory.map((attempt) => (
        <div
          key={attempt._id}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 lg:p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer"
          onClick={() => handleViewDetails(attempt)}
        >
          {/* Card Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-lg flex items-center justify-center">
                <FaGraduationCap className="text-white text-xl" />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${attempt.accuracy >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : attempt.accuracy >= 50
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {attempt.accuracy >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE ? 'High Score' : attempt.accuracy >= 50 ? 'Good' : 'Attempted'}
              </div>
            </div>
            <h3 className="font-bold text-md lg:text-lg text-gray-900 dark:text-white mb-1">
              {attempt.testTitle || 'Unknown Test'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {attempt.examName || 'Unknown Exam'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {attempt.patternTitle || 'Unknown Pattern'} • {attempt.categoryName || 'No Category'}
            </p>
          </div>

          {/* Card Content */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {attempt.score}/{attempt.totalMarks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Accuracy:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {attempt.accuracy?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Correct/Wrong:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {attempt.correctCount || 0}/{attempt.wrongCount || 0}
              </span>
            </div>
            {attempt.rank && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rank:</span>
                <span className="font-semibold text-orange-700 dark:text-yellow-400">
                  #{attempt.rank}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
              <span className="font-semibold text-gray-900 dark:text-white flex items-center">
                <FaClock className="mr-1 text-xs" />
                {formatTime(attempt.totalTime)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatAttemptedDate(attempt.submittedAt)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatAttemptedTime(attempt.submittedAt)}
              </span>
            </div>
          </div>

          {/* Card Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(attempt.status)}
                <span className={`text-sm font-medium ${getStatusColor(attempt.status)}`}>
                  {attempt.status || 'Unknown'}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(attempt);
                }}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-1 text-sm font-semibold"
              >
                <FaEye />
                <span>View Result</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && examHistory.length === 0) {
    return (
      <>
        <Seo
          title="Exam History - SUBG QUIZ"
          description="View your complete exam attempt history, track your performance over time, and review past exam attempts with detailed scores and statistics."
          noIndex={true}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <Loading size="md" color="blue" message="Loading exam history..." />
          </div>
        </div>
        <UnifiedFooter />
      </>
    );
  }

  return (
    <>
      <Seo
        title="Exam History - SUBG QUIZ"
        description="View your complete exam attempt history, track your performance over time, and review past exam attempts with detailed scores and statistics."
        noIndex={true}
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 lg:py-8">
        <div className="container mx-auto px-4 lg:px-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 lg:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FaGraduationCap className="mr-3 text-blue-500" />
                Exam History
              </h1>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by test name, exam, or category..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Abandoned">Abandoned</option>
                  <option value="InProgress">In Progress</option>
                </select>
                {(searchTerm || filters.status) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentView('table')}
                  className={`p-2 rounded-lg transition-colors ${currentView === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  title="Table View"
                >
                  <FaTable />
                </button>
                <button
                  onClick={() => setCurrentView('list')}
                  className={`p-2 rounded-lg transition-colors ${currentView === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  title="List View"
                >
                  <FaList />
                </button>
                <button
                  onClick={() => setCurrentView('grid')}
                  className={`p-2 rounded-lg transition-colors ${currentView === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  title="Grid View"
                >
                  <FaTh />
                </button>
              </div>
            </div>



            {/* Content */}
            {loading ? (
              <div className="text-center py-12">
                <Loading size="md" color="blue" message="Loading..." />
              </div>
            ) : examHistory.length === 0 ? (
              <div className="text-center py-12">
                <FaGraduationCap className="mx-auto text-gray-400 text-5xl mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">No exam history found</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">
                  {searchTerm || filters.status ? 'Try adjusting your filters' : 'Start attempting exams to see your history here'}
                </p>
              </div>
            ) : (
              <>
                {currentView === 'table' && renderTableView()}
                {currentView === 'list' && renderListView()}
                {currentView === 'grid' && renderGridView()}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default ExamHistoryPage;
