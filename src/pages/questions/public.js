'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import API from '../../lib/api';
import UnifiedFooter from '../../components/UnifiedFooter';
import PublicQuestionsList from '../../components/PublicQuestionsList';
import { toast } from 'react-toastify';
// Removed SearchFilter; using inline search tailored to this page

const PublicUserQuestions = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const observerTarget = useRef(null);
  const isInitialMount = useRef(true);
  const isLoadingRef = useRef(false);
  const searchTermRef = useRef(searchTerm);

  // Update ref when searchTerm changes
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  // Initial load - replaces all items
  const load = useCallback(async (resetPage = false) => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    const currentPage = resetPage ? 1 : page;
    setLoading(true);
    try {
      // Pass empty string if searchTerm is blank to get default questions
      const searchParam = searchTermRef.current.trim() || '';
      const res = await API.getPublicUserQuestions({ page: currentPage, limit, search: searchParam });
      if (res?.success) {
        const list = res.data || [];
        setItems(list);
        setTotal(res.pagination?.total || 0);
        setPage(currentPage);
        setHasMore(list.length === limit && list.length < (res.pagination?.total || 0));
      }
    } catch (e) {
      console.error('Failed to load public questions', e);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [limit]);

  // Load more - appends to existing items
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const currentPage = page;
      const nextPage = currentPage + 1;
      const searchParam = searchTermRef.current.trim() || '';
      const res = await API.getPublicUserQuestions({ page: nextPage, limit, search: searchParam });
      if (res?.success) {
        const newItems = res.data || [];
        setItems(prev => {
          const updated = [...prev, ...newItems];
          setPage(nextPage);
          setHasMore(newItems.length === limit && updated.length < (res.pagination?.total || 0));
          return updated;
        });
      }
    } catch (e) {
      console.error('Failed to load more questions', e);
    } finally {
      setLoadingMore(false);
    }
  }, [page, limit, loadingMore, hasMore]);

  // Handle search
  const handleSearch = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setIsSearchActive(true);
    load(true);
  }, [load]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(1);
    setHasMore(true);
    setIsSearchActive(false);
  }, []);

  // Initial load - only once on mount
  useEffect(() => {
    if (isInitialMount.current) {
      load(true);
      isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when searchTerm is cleared (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current && searchTerm === '' && !isSearchActive) {
      setPage(1);
      setHasMore(true);
      load(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isSearchActive]);

  // Infinite scroll observer
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  const answer = async (q, idx) => {
    try {
      if (typeof q.selectedOptionIndex === 'number') return;

      // Immediately show visual feedback
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, selectedOptionIndex: idx, isAnswered: true } : it));

      await API.answerUserQuestion(q._id, idx);
      toast.success('Answer submitted successfully!');
    } catch (e) {
      toast.error(e?.message || 'Failed to submit Answer!');
      // Revert the visual feedback on error
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, selectedOptionIndex: undefined, isAnswered: false } : it));
    }
  };

  const like = async (q) => {
    try {
      const res = await API.likeUserQuestion(q._id);
      if (res?.data?.firstTime) {
        setItems(prev => prev.map(it => it._id === q._id ? { ...it, likesCount: (it.likesCount || 0) + 1 } : it));
      }
    } catch (e) { }
  };

  const share = async (q) => {
    try {
      await API.shareUserQuestion(q._id);
      setItems(prev => prev.map(it => it._id === q._id ? { ...it, sharesCount: (it.sharesCount || 0) + 1 } : it));
      if (navigator.share) {
        navigator.share({ title: 'User Question', text: q.questionText, url: window.location.href }).catch(() => { });
      }
    } catch (e) { }
  };

  const view = async (q) => {
    try {
      const res = await API.incrementUserQuestionView(q._id);
      if (res?.data?.firstTime) {
        setItems(prev => prev.map(it => it._id === q._id ? { ...it, viewsCount: (it.viewsCount || 0) + 1 } : it));
      }
    } catch (e) { }
  };

  // Not using generic table columns; page has a custom list UI

  const content = (
    <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 py-6">

        <div className='mb-4 flex flex-col lg:flex-row justify-between items-center gap-4'>

          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions ({total})</h1>
            <p className="text-gray-600 dark:text-gray-400">Answer, like, share user questions</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (isSearchActive) {
                    handleClearSearch();
                  } else {
                    handleSearch();
                  }
                }
              }}
              placeholder="Search by question, name, username, email..."
              className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => {
                if (isSearchActive) {
                  handleClearSearch();
                } else {
                  handleSearch();
                }
              }}
              className={`px-4 py-2 ${isSearchActive
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-secondary-600 hover:bg-secondary-700'
                } text-white rounded-lg text-sm whitespace-nowrap`}
            >
              {isSearchActive ? 'Clear' : 'Search'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-3">
            <div className="h-2 w-24 bg-secondary-200 dark:bg-secondary-900 rounded animate-pulse"></div>
          </div>
        )}

        <PublicQuestionsList
          items={items}
          onAnswer={answer}
          onLike={like}
          onShare={share}
          onView={view}
          startIndex={0}
        />

        {/* Loading More Indicator */}
        {loadingMore && (
          <div className="flex justify-center items-center py-8">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-secondary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-secondary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-secondary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Observer Target for Infinite Scroll */}
        <div ref={observerTarget} className="h-10"></div>

        {/* End of Results Message */}
        {!hasMore && items.length > 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">🎉 You've reached the end!</p>
            <p className="text-xs mt-1">No more questions to load</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg mb-2">📝 No questions found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Public Questions - AajExam Platform</title>
        <meta name="description" content="Browse and answer community questions on AajExam. Test your knowledge, help others learn, and engage with questions from users worldwide." />
        <meta name="keywords" content="public questions, community questions, answer questions, knowledge sharing, Q&A platform" />
        <meta property="og:title" content="Public Questions - AajExam Platform" />
        <meta property="og:description" content="Browse and answer community questions on AajExam. Test your knowledge and help others learn." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Public Questions - AajExam" />
        <meta name="twitter:description" content="Browse and answer community questions on AajExam Platform." />
      </Head>
      <>
        {content}
        <UnifiedFooter />
      </>
    </>
  );
};

export default PublicUserQuestions;
