'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import API from '../../lib/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { isAuthenticated, getCurrentUser } from '../../lib/utils/authUtils';
import {
  MessageSquarePlus,
  Heart,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

const CommunityQuestionsPage = () => {
  const router = useRouter();
  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exams, setExams] = useState([]);
  const [pagination, setPagination] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const [filters, setFilters] = useState({
    exam: '',
    sort: 'latest'
  });

  const currentPage = parseInt(router.query.page || '1', 10);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: 15,
        sort: filters.sort,
        ...(filters.exam && { exam: filters.exam })
      };
      const res = await API.getCommunityQuestions(params);
      if (res.success) {
        setQuestions(res.questions || []);
        setPagination(res.pagination || {});
      }
    } catch (err) {
      console.error('Error fetching community questions:', err);
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters.sort, filters.exam]);

  const fetchExams = async () => {
    try {
      const examRes = await API.getPublicExams({ limit: 500 });
      setExams(examRes.data?.exams || examRes.data || []);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchExams();
  }, [fetchQuestions]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    router.push({ pathname: '/community-questions', query: {} }, undefined, { shallow: true });
  };

  const handleLike = async (questionId) => {
    if (!authenticated) {
      router.push('/login');
      return;
    }
    try {
      const res = await API.toggleCommunityQuestionLike(questionId);
      if (res.success) {
        setQuestions(prev => prev.map(q => {
          if (q._id === questionId) {
            return {
              ...q,
              likes: res.liked ? q.likes + 1 : q.likes - 1,
              likedBy: res.liked
                ? [...(q.likedBy || []), currentUser?.id]
                : (q.likedBy || []).filter(id => id !== currentUser?.id)
            };
          }
          return q;
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleDelete = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      setDeletingId(questionId);
      const res = await API.deleteCommunityQuestion(questionId);
      if (res.success) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
      }
    } catch (err) {
      console.error('Error deleting question:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (page) => {
    router.push({ pathname: '/community-questions', query: { page } }, undefined, { shallow: true });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isLikedByMe = (q) => {
    if (!currentUser?.id) return false;
    return (q.likedBy || []).some(id => id === currentUser.id || id?._id === currentUser.id);
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-content-primary uppercase tracking-tight">
              Community Questions
            </h1>
            <p className="text-sm text-content-muted mt-1">
              Practice questions shared by fellow students
            </p>
          </div>
          {authenticated && (
            <Link href="/community-questions/ask">
              <Button className='mx-auto' variant="primary" size="sm" icon={MessageSquarePlus}>
                Post Question
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-0 lg:mb-6" radius="2xl">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-content-muted" />
            <span className="text-xs font-bold text-content-muted uppercase tracking-wider">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={filters.exam}
              onChange={(e) => handleFilterChange('exam', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border-primary bg-background-surface text-sm font-semibold text-content-primary focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam._id} value={exam._id}>
                  {exam.name}
                </option>
              ))}
            </select>

            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border-primary bg-background-surface text-sm font-semibold text-content-primary focus:outline-none focus:border-primary-500 transition-colors"
            >
              <option value="latest">Latest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <Card className="text-center py-4 lg:py-8">
            <p className="text-content-muted text-sm">{error}</p>
            <button onClick={fetchQuestions} className="mt-3 mx-auto text-primary-500 text-sm font-bold hover:underline">
              Try Again
            </button>
          </Card>
        ) : questions.length === 0 ? (
          <Card className="text-center py-4 lg:py-8">
            <MessageSquarePlus className="w-12 h-12 text-content-muted mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-content-primary mb-1">No Questions Yet</h3>
            <p className="text-sm text-content-muted mb-4">Be the first to share a question with the community!</p>
            {authenticated && (
              <Link href="/community-questions/ask">
                <Button className='mx-auto' variant="primary" size="sm" icon={MessageSquarePlus}>
                  Post First Question
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 container py-4 lg:py-8">
            {questions.map((q) => (
              <Card key={q._id} radius="2xl" hoverable className="group">
                {/* Author & Meta */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {q.author?.profilePicture ? (
                      <img
                        src={q.author.profilePicture}
                        alt={q.author.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-black">
                        {(q.author?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <Link href={`/profile/${q.author?.username || ''}`} className="text-sm font-bold text-content-primary hover:text-primary-500 transition-colors">
                        {q.author?.name || 'Anonymous'}
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] text-content-muted">
                        <Calendar className="w-3 h-3" />
                        {formatDate(q.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase">
                      {q.exam?.name || q.exam?.code || 'Exam'}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm lg:text-base font-semibold text-content-primary leading-relaxed mb-3 whitespace-pre-line">
                  {q.question}
                </p>

                {/* Image */}
                {q.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border-2 border-border-primary">
                    <img src={q.image} alt="Question" className="w-full max-h-80 object-contain bg-slate-50 dark:bg-slate-900" />
                  </div>
                )}

                {/* Options (preview only — no correct highlight, explanation hidden) */}
                {q.options && q.options.filter(o => o.text?.trim()).length > 0 && (
                  <div className="space-y-2 mb-3">
                    {q.options.filter(o => o.text?.trim()).map((opt, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-xl border-2 border-border-primary bg-background-surface text-content-secondary text-sm font-semibold"
                      >
                        <span className="font-black mr-2 text-xs">{String.fromCharCode(65 + i)}.</span>
                        {opt.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Open to answer CTA */}
                <Link
                  href={`/community-questions/${q._id}`}
                  className="flex items-center justify-between px-3 py-2 mb-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors group"
                >
                  <span className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">
                    Attempt & See Explanation
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary-600 dark:text-primary-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(q._id)}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
                        isLikedByMe(q)
                          ? 'text-rose-500'
                          : 'text-content-muted hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLikedByMe(q) ? 'fill-current' : ''}`} />
                      {q.likes || 0}
                    </button>
                    <Link href={`/community-questions/${q._id}`} className="flex items-center gap-1.5 text-xs font-bold text-content-muted hover:text-primary-500 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {q.answerCount || 0}
                    </Link>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-content-muted">
                      <Eye className="w-4 h-4" />
                      {q.views || 0}
                    </span>
                  </div>

                  {/* Delete button for own questions */}
                  {currentUser && (currentUser.id === (q.author?._id || q.author) || currentUser.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(q._id)}
                      disabled={deletingId === q._id}
                      className="flex items-center gap-1 text-xs font-bold text-content-muted hover:text-rose-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === q._id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border-2 border-border-primary text-content-muted hover:border-primary-500 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-sm font-bold text-content-primary">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="p-2 rounded-xl border-2 border-border-primary text-content-muted hover:border-primary-500 hover:text-primary-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Login prompt for unauthenticated users */}
        {!authenticated && (
          <Card className="mt-6 text-center" variant="primary" radius="2xl">
            <p className="text-sm font-bold text-white mb-3">
              Login to post your own questions and like others!
            </p>
            <Link href="/login">
              <Button variant="white" size="sm" className='mx-auto'>
                Login Now
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommunityQuestionsPage;
