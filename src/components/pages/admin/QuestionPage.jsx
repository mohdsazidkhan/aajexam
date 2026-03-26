'use client';

import React, { useState, useEffect, useCallback } from 'react';
import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import SearchFilter from '../../SearchFilter';
import { FaEdit, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';
import { isMobile } from 'react-device-detect';
import useDebounce from '../../../hooks/useDebounce';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';

const QuestionPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  // Form states
  const [quiz, setQuiz] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [timeLimit, setTimeLimit] = useState(15);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // List states
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
  const [filters, setFilters] = useState({
    quiz: ''
  });

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchQuestions = useCallback(async (page = 1, search = '', filterParams = {}) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        ...(search && { search }),
        ...filterParams
      };
      const response = await API.getAdminQuestions(params);
      setQuestions(response.questions || response);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const fetchQuizzes = useCallback(async () => {
    try {
      const response = await API.getAdminAllQuizzes();
      setQuizzes(response.quizzes || response);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  }, []);

  const debouncedSearch = useDebounce(searchTerm, 1000); // 1s delay

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  useEffect(() => {
    fetchQuestions(currentPage, debouncedSearch, filters, itemsPerPage);
  }, [currentPage, debouncedSearch, filters, itemsPerPage, fetchQuestions]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (options.some(option => !option.trim())) {
      toast.error('All options must be filled');
      return;
    }

    const payload = {
      quiz,
      questionText,
      options: options.filter(option => option.trim()),
      correctAnswerIndex: parseInt(correctAnswerIndex),
      timeLimit: timeLimit ? parseInt(timeLimit) : undefined
    };

    try {
      if (editingId) {
        await API.updateQuestion(editingId, payload);
        toast.success('Question updated successfully!');
        setEditingId(null);
      } else {
        await API.createQuestion(payload);
        toast.success('Question created successfully!');
      }
      resetForm();
      setShowForm(false);
      fetchQuestions(currentPage, searchTerm, filters);

      // Scroll to top after successful submission to show updated list - mobile: top 200, desktop: top 0
      const scrollTop = isMobile ? 200 : 0;
      window.scrollTo({ top: scrollTop, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message || 'Failed to save question');
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setTimeLimit(15);
    setEditingId(null);
  };

  const handleEdit = (question) => {
    setEditingId(question._id);
    setQuiz(question.quiz._id || question.quiz);
    setQuestionText(question.questionText);
    setOptions([...question.options, '', '', '', ''].slice(0, 4));
    setCorrectAnswerIndex(question.correctAnswerIndex);
    setTimeLimit(question.timeLimit || '');
    setShowForm(!showForm);

    // Scroll to top when editing - mobile: top 200, desktop: top 0
    const scrollTop = isMobile ? 200 : 0;
    window.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  const handleToggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      // Scroll to top when opening the form - mobile: top 200, desktop: top 0
      const scrollTop = isMobile ? 200 : 0;
      window.scrollTo({ top: scrollTop, behavior: 'smooth' });
    }
    // Reset form when opening for new question
    if (!showForm && !editingId) {
      resetForm();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await API.deleteQuestion(id);
        toast.success('Question deleted successfully!');
        fetchQuestions(currentPage, searchTerm, filters);
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Failed to delete question');
      }
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ quiz: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const filterOptions = {
    quiz: {
      label: 'Quiz',
      options: quizzes.map(quiz => ({
        value: quiz._id,
        label: quiz.title
      }))
    }
  };

  // Table View Component
  const TableView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-[1600px] md:w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                S.No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Quiz
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Options
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Correct Answer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Time Limit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {questions.map((question) => (
              <tr key={question._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                  {((currentPage - 1) * itemsPerPage) + questions.indexOf(question) + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {question.questionText}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {question.quiz?.title || 'Unknown Quiz'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {question.options.map((option, index) => (
                      <div key={index} className="mb-1">
                        {String.fromCharCode(65 + index)}. {option}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {String.fromCharCode(65 + question.correctAnswerIndex)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-white">
                    {question.timeLimit || 'No limit'} seconds
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(() => {
                      const date = new Date(question.createdAt);
                      const day = date.getDate().toString().padStart(2, '0');
                      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                      const month = monthNames[date.getMonth()];
                      const year = date.getFullYear();
                      return `${day}-${month}-${year}`;
                    })()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(question.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
      {questions.map((question) => (
        <div key={question._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {question.questionText}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(question)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(question._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                <span className="font-medium">Quiz:</span> {question.quiz?.title || 'Unknown Quiz'}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {question.options.map((option, index) => (
                <div key={index} className={`flex items-center text-sm p-2 rounded ${index === question.correctAnswerIndex
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                  <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1">{option}</span>
                  {index === question.correctAnswerIndex && (
                    <FaCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400">
              Time Limit: {question.timeLimit || 'No limit'} seconds
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Created: {(() => {
                const date = new Date(question.createdAt);
                const day = date.getDate().toString().padStart(2, '0');
                const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                const month = monthNames[date.getMonth()];
                const year = date.getFullYear();
                return `${day}-${month}-${year}`;
              })()} at {new Date(question.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {questions.map((question) => (
          <div key={question._id} className="p-2 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex-col md:flex-row flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-md md:text-lg font-medium text-gray-900 dark:text-white">
                    {question.questionText}
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {String.fromCharCode(65 + question.correctAnswerIndex)}
                  </span>
                </div>

                <div className="mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Quiz:</span> {question.quiz?.title || 'Unknown Quiz'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {question.options.map((option, index) => (
                    <div key={index} className={`flex items-center text-sm p-2 rounded ${index === question.correctAnswerIndex
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      <span className="flex-1">{option}</span>
                      {index === question.correctAnswerIndex && (
                        <FaCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Time Limit: {question.timeLimit || 'No limit'} seconds
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Created: {(() => {
                    const date = new Date(question.createdAt);
                    const day = date.getDate().toString().padStart(2, '0');
                    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                    return `${day}-${month}-${year}`;
                  })()} at {new Date(question.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-0 md:ml-4">
                <button
                  onClick={() => handleEdit(question)}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(question._id)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Questions">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white">
          <div className="mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
              <div>
                <h2 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Questions ({pagination.total})
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Create, edit, and delete questions
                </p>
              </div>
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
                views={['table', 'list', 'grid']}
              />
              <Button
                variant="admin"
                onClick={handleToggleForm}
                icon={<FaPlus className="w-4 h-4" />}
              >
                Add Question
              </Button>
              <div className="flex items-center space-x-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                  <option value={1000}>1000</option>
                </select>
              </div>

            </div>

            <div className='mb-4'>
              {/* Search and Filters */}
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                filterOptions={filterOptions}
                placeholder="Search questions..."
              />
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">
                  {editingId ? 'Edit Question' : 'Add New Question'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Quiz
                        </label>
                        <select
                          value={quiz}
                          onChange={(e) => setQuiz(e.target.value)}
                          required
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Quiz</option>
                          {quizzes.map((q) => (
                            <option key={q._id} value={q._id}>
                              {q.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Question Text
                        </label>
                        <textarea
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          required
                          rows="3"
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time Limit (seconds)
                        </label>
                        <input
                          type="number"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(e.target.value)}
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional time limit"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Options
                        </label>
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2 mb-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              value={index}
                              checked={correctAnswerIndex === index}
                              onChange={(e) => setCorrectAnswerIndex(parseInt(e.target.value))}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              required
                              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="submit"
                      variant="admin"
                    >
                      {editingId ? 'Update' : 'Create'} Question
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        resetForm();
                      }}
                      className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loading size="md" color="gray" message="" />
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">❓</div>
                <h3 className="text-md md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No questions found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first question.'}
                </p>
              </div>
            ) : (
              <>
                {viewMode === 'table' && <TableView />}
                {viewMode === 'grid' && <CardView />}
                {viewMode === 'list' && <ListView />}
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
      </div >
    </AdminMobileAppWrapper >
  );
};

export default QuestionPage;




