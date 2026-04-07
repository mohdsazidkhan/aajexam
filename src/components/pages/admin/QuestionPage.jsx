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
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Table,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  BrainCircuit,
  X,
  Save,
  Settings,
  Fingerprint,
  Hash,
  Activity,
  Layers,
  Database,
  ArrowRight,
  ChevronRight,
  Calendar,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import useDebounce from '../../../hooks/useDebounce';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
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
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
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
      toast.error('Could not load questions. Please try again.');
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
      toast.error('Please fill in all answer choices.');
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
        toast.success('Question updated!');
        setEditingId(null);
      } else {
        await API.createQuestion(payload);
        toast.success('Question added!');
      }
      resetForm();
      setShowForm(false);
      fetchQuestions(currentPage, searchTerm, filters);

      // Scroll to top after successful submission to show updated list - mobile: top 200, desktop: top 0
      const scrollTop = isMobile ? 200 : 0;
      window.scrollTo({ top: scrollTop, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message || 'Could not save question. Please try again.');
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
        toast.success('Question deleted.');
        fetchQuestions(currentPage, searchTerm, filters);
      } catch (error) {
        console.error('Error deleting question:', error);
        toast.error('Could not delete question. Please try again.');
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
    <Card
      variant="white"
      className="p-0 border-none shadow-xl bg-white dark:bg-slate-900/60 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 dark:border-white/5">
              {[
                { label: 'NO.', icon: Hash },
                { label: 'QUESTION', icon: HelpCircle },
                { label: 'QUIZ', icon: BookOpen },
                { label: 'CORRECT ANSWER', icon: CheckCircle2 },
                { label: 'TIME LIMIT', icon: Clock },
                { label: 'DATE ADDED', icon: Calendar },
                { label: 'ACTIONS', icon: ArrowRight, align: 'text-right' }
              ].map((head, i) => (
                <th key={i} className={`px-4 lg:px-8 py-4 lg:py-8 ${head.align || 'text-left'}`}>
                  <div className={`flex items-center gap-3 ${head.align === 'text-right' ? 'justify-end' : ''}`}>
                    <head.icon className="w-4 h-4 text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{head.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50 dark:divide-white/5">
            {questions.map((question, index) => (
              <motion.tr
                key={question._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group hover:bg-indigo-500/5 transition-all"
              >
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <span className="text-xs font-black text-slate-400 font-mono">
                    #{((currentPage - 1) * itemsPerPage) + index + 1}
                  </span>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6 max-w-md">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 uppercase tracking-tight">
                      {question.questionText}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {question.options.map((opt, i) => (
                        <span key={i} className={`text-[8px] font-black px-2 py-0.5 rounded border ${i === question.correctAnswerIndex ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest truncate max-w-[150px]">
                      {question.quiz?.title || 'General'}
                    </span>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-500`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black tracking-tighter">OPTION {String.fromCharCode(65 + question.correctAnswerIndex)}</span>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-[10px] font-black tracking-widest">{question.timeLimit || 15}s</span>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      {new Date(question.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(question.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEdit(question)}
                      className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(question._id)}
                      className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
      {questions.map((question, index) => (
        <motion.div
          key={question._id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -8 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/50 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all group overflow-hidden flex flex-col"
        >
          {/* Gradient Header */}
          <div className="relative h-24 overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cyber-network.png')] opacity-10" />
            <div className="relative z-10 p-6 flex justify-between items-center text-white">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shadow-lg">
                {String.fromCharCode(65 + question.correctAnswerIndex)}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(question)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 hover:bg-white/40 transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(question._id)}
                  className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 hover:bg-rose-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          <div className="p-3 lg:p-8 flex-1 flex flex-col">
            <div className="mb-6 flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{question.quiz?.title || 'GENERAL'}</span>
              </div>
              <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-tight group-hover:text-indigo-500 transition-colors line-clamp-3">
                {question.questionText}
              </h3>
            </div>

            <div className="space-y-3 mb-4 lg:mb-8">
              {question.options.map((option, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all ${i === question.correctAnswerIndex
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                    : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <span className="text-xs font-black w-4">{String.fromCharCode(65 + i)}</span>
                  <span className="text-xs font-bold truncate flex-1">{option}</span>
                  {i === question.correctAnswerIndex && <CheckCircle2 className="w-4 h-4" />}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t-2 border-slate-50 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{question.timeLimit || 15}S</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {new Date(question.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // List View Component
  const ListView = () => (
    <div className="space-y-3 lg:space-y-6">
      {questions.map((question, index) => (
        <motion.div
          key={question._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white/50 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 p-3 lg:p-8 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
            <div className="flex items-start gap-3 lg:gap-8 flex-1">
              <div className="w-20 h-20 rounded-lg lg:rounded-[2rem] bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-3xl shadow-xl flex-shrink-0 group-hover:rotate-6 transition-transform">
                {String.fromCharCode(65 + question.correctAnswerIndex)}
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{question.quiz?.title || 'GENERAL'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black tracking-widest uppercase">ACTIVE</span>
                  </div>
                </div>
                <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-tight">
                  {question.questionText}
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {question.options.map((option, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl border-2 transition-all ${i === question.correctAnswerIndex
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400'
                        }`}
                    >
                      <span className="text-xs font-black w-4">{String.fromCharCode(65 + i)}</span>
                      <span className="text-xs font-bold truncate">{option}</span>
                      {i === question.correctAnswerIndex && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Limit:</span>
                     <span className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{question.timeLimit || 15}S</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-indigo-500" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Created:</span>
                     <span className="text-xs font-black text-slate-900 dark:text-white uppercase italic">{new Date(question.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:pl-8 lg:border-l-2 border-slate-50 dark:border-white/5">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEdit(question)}
                className="px-4 lg:px-8 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all"
              >
                <Edit3 className="w-4 h-4 inline mr-2" /> EDIT
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDelete(question._id)}
                className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"
              >
                <Trash2 className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Questions">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full max-auto text-slate-900 dark:text-white font-outfit ">
          <div className="mx-auto">
            {/* Page Header */}
            <div className="relative mb-4">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 pb-8 border-b-4 border-slate-100 dark:border-white/5 relative overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative z-10"
                >
                 
                   <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-4 italic">
                     ALL <span className="text-indigo-600 whitespace-nowrap">QUESTIONS</span>
                   </h1>
                  <p className="max-w-xl text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.1em] text-[10px] leading-relaxed">
                    Add and manage questions for your quizzes. {pagination.total || 0} questions across {quizzes.length} quizzes.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3 w-full lg:w-auto relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-between lg:justify-start items-center bg-slate-100/50 dark:bg-white/5 backdrop-blur-xl p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200/50 dark:border-white/10 w-full lg:w-auto"
                  >
                    <button onClick={() => setViewMode('table')} className={`flex-1 lg:flex-none p-4 rounded-2xl transition-all ${viewMode === 'table' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-500'}`}><Table className="w-5 h-5 mx-auto" /></button>
                    <button onClick={() => setViewMode('list')} className={`flex-1 lg:flex-none p-4 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-500'}`}><List className="w-5 h-5 mx-auto" /></button>
                    <button onClick={() => setViewMode('grid')} className={`flex-1 lg:flex-none p-4 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-500'}`}><LayoutGrid className="w-5 h-5 mx-auto" /></button>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleForm}
                    className="group relative w-full lg:w-auto px-4 lg:px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:shadow-indigo-500/20 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-3">
                      <Plus className="w-5 h-5" /> ADD QUESTION
                    </span>
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 lg:mt-10">
                {[
                  { label: 'Total Questions', value: pagination.total || 0, icon: Target, color: 'primary' },
                  { label: 'Default Time', value: '15s', icon: Clock, color: 'amber' },
                  { label: 'Active Quizzes', value: quizzes.length, icon: BookOpen, color: 'emerald' },
                  { label: 'Total Pages', value: pagination.totalPages || 0, icon: Database, color: 'purple' }
                ].map((stat, i) => (
                  <Card key={i} className="p-6 border-none shadow-sm flex items-center gap-4 bg-white dark:bg-slate-900">
                    <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</h4>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-4"
            >
              <div className="bg-white/50 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] p-6 border-4 border-slate-100 dark:border-white/5 shadow-2xl">
                <div className="flex flex-col lg:flex-row items-center gap-3 lg:gap-6">
                  <div className="flex-1 w-full relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-xs font-black uppercase outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                    <div className="relative group w-full lg:w-64">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Filter className="w-5 h-5" />
                      </div>
                      <select
                        value={filters.quiz}
                        onChange={(e) => handleFilterChange('quiz', e.target.value)}
                        className="w-full lg:w-auto pl-16 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">All Quizzes</option>
                        {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
                      </select>
                    </div>
                    <div className="relative w-full lg:w-32">
                      <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="w-full lg:w-auto px-3 lg:px-6 py-5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer text-center"
                      >
                        {[10, 20, 50, 100].map(val => <option key={val} value={val}>{val} per page</option>)}
                      </select>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearFilters}
                      className="w-full lg:w-auto p-5 bg-primary-500/10 text-primary-500 rounded-full hover:bg-primary-500 hover:text-white transition-all shadow-sm flex items-center justify-center"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Question Form Modal */}
            <AnimatePresence>
              {showForm && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] p-4 lg:p-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-[#0A0F1E] rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/5 w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden relative z-[101] flex flex-col"
                  >
                    <div className="p-4 md:p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                      <div className="flex justify-between items-start mb-4 lg:mb-10">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/80">{editingId ? 'EDIT QUESTION' : 'NEW QUESTION'}</span>
                           </div>
                           <h2 className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none italic">
                             {editingId ? 'Edit' : 'Add'} <span className="text-indigo-600">Question</span>
                           </h2>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 90 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-500 transition-colors shadow-sm"
                        >
                          <X className="w-6 h-6" />
                        </motion.button>
                      </div>

                      <form onSubmit={handleSubmit} className="gap-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                          <div className="space-y-4 lg:space-y-8">
                            {/* Quiz Selection */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">QUIZ</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                  <Layers className="w-5 h-5" />
                                </div>
                                <select
                                  value={quiz}
                                  onChange={(e) => setQuiz(e.target.value)}
                                  required
                                  className="w-full pl-14 pr-10 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                                >
                                  <option value="">Choose a quiz...</option>
                                  {quizzes.map((q) => <option key={q._id} value={q._id}>{q.title.toUpperCase()}</option>)}
                                </select>
                              </div>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">QUESTION TEXT</label>
                              <div className="relative group">
                                <textarea
                                  value={questionText}
                                  onChange={(e) => setQuestionText(e.target.value)}
                                  required
                                  placeholder="Type your question here..."
                                  rows="4"
                                  className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-2xl text-sm font-bold transition-all outline-none resize-none"
                                />
                              </div>
                            </div>

                            {/* Time Limit */}
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">TIME LIMIT (SEC)</label>
                              <div className="relative group">
                                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                  <Clock className="w-5 h-5" />
                                </div>
                                <input
                                  type="number"
                                  value={timeLimit}
                                  onChange={(e) => setTimeLimit(e.target.value)}
                                  placeholder="15"
                                  className="w-full pl-14 pr-6 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 lg:space-y-6">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 block mb-2">ANSWER CHOICES</label>
                            {options.map((option, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative flex items-center gap-4 p-2 rounded-lg lg:rounded-[2rem] border-2 transition-all ${correctAnswerIndex === index
                                  ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                  : 'bg-slate-50 dark:bg-white/5 border-transparent'
                                  }`}
                              >
                                <label className="relative flex items-center justify-center w-12 h-12 flex-shrink-0 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="correctAnswer"
                                    value={index}
                                    checked={correctAnswerIndex === index}
                                    onChange={(e) => setCorrectAnswerIndex(parseInt(e.target.value))}
                                    className="peer hidden"
                                  />
                                  <div className="absolute inset-0 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 peer-checked:border-emerald-500 peer-checked:bg-emerald-500 transition-all shadow-sm" />
                                  <span className={`relative text-xs font-black transition-colors ${correctAnswerIndex === index ? 'text-white' : 'text-slate-400'}`}>
                                    {String.fromCharCode(65 + index)}
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(index, e.target.value)}
                                  required
                                   placeholder={`Enter option ${String.fromCharCode(65 + index)}...`}
                                   className="flex-1 bg-transparent px-2 py-3 text-sm font-bold outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                 />
                                {correctAnswerIndex === index && (
                                  <div className="pr-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 lg:mt-12 flex flex-col lg:flex-row gap-4 pt-8 border-t-2 border-slate-50 dark:border-white/5">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                            className="flex-1 py-5 px-4 lg:px-8 rounded-2xl border-2 border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-rose-500 hover:text-white hover:border-transparent transition-all"
                          >
                            CANCEL
                          </motion.button>
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-[2] py-5 px-4 lg:px-8 rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
                          >
                             <Save className="w-5 h-5" /> {editingId ? 'SAVE CHANGES' : 'ADD QUESTION'}
                          </motion.button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Question List */}
            <div className="relative min-h-[400px]">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-24 space-y-3 lg:space-y-6"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                      <BrainCircuit className="absolute inset-0 m-auto w-10 h-10 text-indigo-500 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] mb-2 animate-pulse">Loading Questions</p>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Please wait...</p>
                    </div>
                  </motion.div>
                ) : questions.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-32 text-center"
                  >
                    <div className="w-20 lg:w-32 h-20 lg:h-32 rounded-xl lg:rounded-[3rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 lg:mb-8 relative group">
                      <div className="absolute inset-0 bg-indigo-500/10 rounded-xl lg:rounded-[3rem] group-hover:scale-110 transition-transform" />
                      <HelpCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 relative z-10" />
                    </div>
                    <h3 className="text-xl lg:text-3xl font-black italic tracking-tighter text-slate-300 dark:text-slate-700 uppercase mb-4">
                      {searchTerm ? 'No Questions Found' : 'No Questions Yet'}
                    </h3>
                    <p className="max-w-md text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      {searchTerm ? 'Try a different search term or adjust your filters.' : 'Add your first question to get started.'}
                    </p>
                    {searchTerm && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClearFilters}
                        className="mt-4 lg:mt-8 px-4 lg:px-8 py-4 bg-indigo-500/10 text-indigo-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all border-2 border-indigo-500/20"
                      >
                        Clear Filters
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pb-20"
                  >
                    {viewMode === 'table' && <TableView />}
                    {viewMode === 'grid' && <CardView />}
                    {viewMode === 'list' && <ListView />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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





