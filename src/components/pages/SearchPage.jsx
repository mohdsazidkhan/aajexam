'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from 'react-redux';
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import {
   Search,
   FileText,
   Compass,
   Zap,
   ShieldCheck,
   ChevronRight,
   X,
   Heart,
   HelpCircle,
   BookOpen,
   Newspaper,
   BarChart3,
   Play,
   ArrowLeft,
   BrainCircuit,
   BookMarked,
   Layers,
   Hash,
   StickyNote,
   Globe,
   History,
   User,
   Loader2 as LoaderIcon,
   Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import { isAuthenticated, getUser } from '../../lib/auth';
import { ListSkeleton } from '../skeletons/PrivateSkeletons';

const TABS = [
   { key: 'all', label: 'All', icon: Compass },
   { key: 'exam', label: 'Exams', icon: ShieldCheck },
   { key: 'subject', label: 'Subjects', icon: BookMarked },
   { key: 'topic', label: 'Topics', icon: Layers },
   { key: 'quiz', label: 'Quizzes', icon: BrainCircuit },
   { key: 'hashtag', label: 'Hashtags', icon: Hash },
   { key: 'user', label: 'Users', icon: User },
   { key: 'reel', label: 'Reels', icon: Play },
   { key: 'test', label: 'Practice Tests', icon: FileText },
   { key: 'blog', label: 'Blogs', icon: BookOpen },
   { key: 'currentAffair', label: 'Current Affairs', icon: Globe },
   { key: 'note', label: 'Notes', icon: StickyNote },
   { key: 'examNews', label: 'Exam News', icon: Newspaper },
];

const SECTION_META = {
   exam: { label: 'Exams', icon: ShieldCheck, color: 'text-black dark:text-white' },
   test: { label: 'Practice Tests', icon: FileText, color: 'text-primary-500' },
   quiz: { label: 'Quizzes', icon: BrainCircuit, color: 'text-primary-500' },
   reel: { label: 'Reels', icon: Play, color: 'text-slate-500 dark:text-slate-400' },
   subject: { label: 'Subjects', icon: BookMarked, color: 'text-black dark:text-white' },
   topic: { label: 'Topics', icon: Layers, color: 'text-black dark:text-white' },
   blog: { label: 'Blogs', icon: BookOpen, color: 'text-black dark:text-white' },
   currentAffair: { label: 'Current Affairs', icon: Globe, color: 'text-black dark:text-white' },
   note: { label: 'Notes', icon: StickyNote, color: 'text-black dark:text-white' },
   examNews: { label: 'Exam News', icon: Newspaper, color: 'text-black dark:text-white' },
   hashtag: { label: 'Hashtags', icon: Hash, color: 'text-black dark:text-white' },
   user: { label: 'Users', icon: User, color: 'text-black dark:text-white' },
};

// Hashtags/Users sit right before Reels in the 'All' tab's section order.
const SECTION_ORDER = ['exam', 'test', 'quiz', 'hashtag', 'user', 'reel', 'subject', 'topic', 'blog', 'currentAffair', 'note', 'examNews'];

const EMPTY_SECTIONS = () => SECTION_ORDER.reduce((acc, key) => {
   acc[key] = { items: [], hasMore: false };
   return acc;
}, {});

const REEL_TYPE_CONFIG = {
   question: { icon: HelpCircle, gradient: 'bg-black dark:bg-white' },
   fact: { icon: BookOpen, gradient: 'bg-black dark:bg-white' },
   tip: { icon: Zap, gradient: 'bg-black dark:bg-white' },
   current_affairs: { icon: Newspaper, gradient: 'bg-black dark:bg-white' },
   poll: { icon: BarChart3, gradient: 'bg-primary-500' },
};

const formatCount = (n) => {
   if (!n) return '0';
   if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
   if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
   return n.toString();
};

const SearchPage = () => {
   const router = useRouter();
   const searchParams = useSearchParams();
   const inputRef = useRef(null);
   const sentinelRef = useRef(null);
   const headerRef = useRef(null);
   const [query, setQuery] = useState("");
   const [isFocused, setIsFocused] = useState(false);
   const [activeTab, setActiveTab] = useState('all');
   const [loading, setLoading] = useState(false);
   const [loadingMore, setLoadingMore] = useState(false);
   const [headerHeight, setHeaderHeight] = useState(0);

   const isSearchingRef = useRef(false);
   const activeTabRef = useRef('all');
   useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);

   const isSidebarOpen = useSelector((state) => state.sidebar?.isOpen ?? false);

   // 'All' tab: per-section preview data (populated by default in browse mode, before any query is typed)
   const [sections, setSections] = useState(EMPTY_SECTIONS());
   // Non-'all' tabs: paginated item lists, keyed by tab
   const [tabData, setTabData] = useState({});

   // Follow state
   const [followMap, setFollowMap] = useState({});
   const [followLoading, setFollowLoading] = useState(null);

   // Recent search keywords — fetched once for the logged-in user, shown only on input focus
   const [recentSearches, setRecentSearches] = useState([]);
   useEffect(() => {
      if (!isAuthenticated()) return;
      API.getSearchHistory().then(res => {
         if (res?.success) setRecentSearches(res.terms || []);
      }).catch(() => {});
   }, []);

   // Header is `fixed` (truly pinned, unlike `sticky`) — measure its real height
   // so the content below can be pushed down by exactly that much, on any breakpoint.
   useEffect(() => {
      const measure = () => setHeaderHeight(headerRef.current?.offsetHeight || 0);
      measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
   }, [isFocused, query, recentSearches.length]);

   const saveSearchTerm = (term) => {
      const trimmed = term?.trim();
      if (!trimmed || !isAuthenticated()) return;
      setRecentSearches(prev => [trimmed, ...prev.filter(t => t !== trimmed)].slice(0, 10));
      API.saveSearchHistory(trimmed).catch(() => {});
   };

   // Check follow status for user results — one batched call, and each userId is only
   // ever checked once (across All-tab previews + the dedicated Users tab), not per-render.
   const checkedFollowIdsRef = useRef(new Set());
   const checkFollowStatuses = useCallback(async (usersList) => {
      if (!isAuthenticated() || !usersList || usersList.length === 0) return;
      const currentUser = getUser();
      const currentUserId = String(currentUser?._id || currentUser?.id || '');
      const idsToCheck = [];
      usersList.forEach(user => {
         const userId = user._id || user.id;
         if (!userId) return;
         const idStr = String(userId);
         if (idStr === currentUserId || checkedFollowIdsRef.current.has(idStr)) return;
         checkedFollowIdsRef.current.add(idStr);
         idsToCheck.push(idStr);
      });
      if (idsToCheck.length === 0) return;
      try {
         const res = await API.getFollowStatuses(idsToCheck);
         if (res?.success) setFollowMap(prev => ({ ...prev, ...res.statuses }));
      } catch {}
   }, []);

   const extractUsers = (items) => (items || []).filter(i => i.type === 'user');

   // query may be '' — that's valid "browse" mode (no search typed yet), the backend
   // then returns the latest/most relevant items per category instead of search matches.
   const fetchAllSections = useCallback(async (searchQuery) => {
      if (isSearchingRef.current) return;
      isSearchingRef.current = true;
      setLoading(true);
      try {
         const res = await API.searchWeb({ query: (searchQuery || '').trim(), type: 'all' });
         if (res.success) {
            setSections(res.sections);
            checkFollowStatuses(extractUsers(res.sections?.user?.items));
         }
      } catch (err) { console.error('Search failed:', err); }
      finally { setLoading(false); isSearchingRef.current = false; }
   }, [checkFollowStatuses]);

   const fetchTabPage = useCallback(async (searchQuery, tabType, pageNum, append) => {
      if (pageNum === 1) setLoading(true); else setLoadingMore(true);
      try {
         const res = await API.searchWeb({ query: (searchQuery || '').trim(), type: tabType, page: pageNum, limit: 24 });
         if (res.success) {
            setTabData(prev => ({
               ...prev,
               [tabType]: {
                  items: append ? [...(prev[tabType]?.items || []), ...res.items] : res.items,
                  page: pageNum,
                  hasMore: res.hasMore,
               }
            }));
            if (tabType === 'user') checkFollowStatuses(extractUsers(res.items));
         }
      } catch (err) { console.error('Search failed:', err); }
      finally { setLoading(false); setLoadingMore(false); }
   }, [checkFollowStatuses]);

   const runSearch = useCallback((searchQuery, tab) => {
      setTabData({});
      if (tab === 'all') fetchAllSections(searchQuery);
      else fetchTabPage(searchQuery, tab, 1, false);
   }, [fetchAllSections, fetchTabPage]);

   const handleSearch = (e) => {
      e.preventDefault();
      if (loading || isSearchingRef.current) return;
      setActiveTab('all');
      runSearch(query, 'all');
      saveSearchTerm(query);
      inputRef.current?.blur();
   };

   const resetToBrowse = () => {
      setQuery('');
      setActiveTab('all');
      runSearch('', 'all');
   };

   useEffect(() => {
      const q = searchParams.get('q') || '';
      setQuery(q);
      setActiveTab('all');
      runSearch(q, 'all');
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [searchParams]);

   const handleTabChange = (tabKey) => {
      setActiveTab(tabKey);
      if (tabKey !== 'all' && !tabData[tabKey]) {
         fetchTabPage(query, tabKey, 1, false);
      }
   };

   const loadMore = useCallback(() => {
      const tab = activeTabRef.current;
      if (tab === 'all') return;
      const current = tabData[tab];
      if (!current || !current.hasMore || loadingMore) return;
      fetchTabPage(query, tab, (current.page || 1) + 1, true);
   }, [tabData, loadingMore, query, fetchTabPage]);

   // Infinite scroll — observe sentinel at bottom of the active tab's list
   useEffect(() => {
      if (activeTab === 'all' || activeTab === 'reel') return undefined;
      const node = sentinelRef.current;
      if (!node) return undefined;
      const observer = new IntersectionObserver((entries) => {
         if (entries[0]?.isIntersecting) loadMore();
      }, { rootMargin: '200px' });
      observer.observe(node);
      return () => observer.disconnect();
   }, [activeTab, loadMore, tabData]);

   const currentTabData = tabData[activeTab] || { items: [], hasMore: false };

   // Follow/unfollow toggle
   const handleFollowToggle = async (userId) => {
      if (!isAuthenticated()) { toast.error('Login to follow'); return; }
      setFollowLoading(userId);
      try {
         const isCurrentlyFollowing = followMap[userId];
         if (isCurrentlyFollowing) {
            await API.request(`/api/users/unfollow/${userId}`, { method: 'DELETE' });
            setFollowMap(prev => ({ ...prev, [userId]: false }));
            toast.success('Unfollowed');
         } else {
            await API.request(`/api/users/follow/${userId}`, { method: 'POST' });
            setFollowMap(prev => ({ ...prev, [userId]: true }));
            toast.success('Following!');
         }
      } catch (err) {
         toast.error('Failed');
      } finally {
         setFollowLoading(null);
      }
   };

   const goToTag = (tag) => {
      setQuery(tag);
      setActiveTab('all');
      runSearch(tag, 'all');
      saveSearchTerm(tag);
   };

   // ── Shared row renderer — one item, any type ──
   const ResultRow = ({ item }) => {
      switch (item.type) {
         case 'user': {
            const userId = item._id || item.id;
            const currentUser = getUser();
            const currentUserId = currentUser?._id || currentUser?.id;
            const isSelf = isAuthenticated() && currentUserId && String(currentUserId) === String(userId);
            const isFollowing = followMap[userId];
            const isThisLoading = followLoading === userId;
            return (
               <div className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-colors">
                  <div onClick={() => item.username && router.push(`/u/${item.username}`)} className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 rounded-lg lg:rounded-xl">
                     <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-black dark:bg-white p-[2px] shrink-0">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white font-black text-lg">{(item.name || item.username || 'U').charAt(0).toUpperCase()}</div>
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.username || item.name}</p>
                        <p className="text-xs text-slate-400 truncate">{item.name} {item.followersCount ? `· ${formatCount(item.followersCount)} followers` : ''}</p>
                     </div>
                  </div>
                  {isSelf ? (
                     <span className="shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 dark:text-slate-500">You</span>
                  ) : isAuthenticated() && userId && (
                     <button onClick={(e) => { e.stopPropagation(); handleFollowToggle(userId); }} disabled={isThisLoading}
                        className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' : 'bg-primary-500 text-white hover:bg-primary-600'} disabled:opacity-50`}>
                        {isThisLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                     </button>
                  )}
               </div>
            );
         }
         case 'test':
            return (
               <div onClick={() => router.push(`/govt-exams/test/${item.slug || item._id}/start`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary-500 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-white" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                     <p className="text-xs text-slate-400">{item.duration} min · {item.totalMarks} marks</p>
                  </div>
                  <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg shrink-0">START</span>
               </div>
            );
         case 'exam':
         case 'examCategory':
         case 'pattern':
            return (
               <div onClick={() => item.type === 'exam' ? router.push(`/govt-exams/exam/${item.slug}`) : router.push('/govt-exams')} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name || item.title}</p>
                     <p className="text-xs text-slate-400">{item.category?.name || item.type || 'Exam'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         case 'quiz':
            return (
               <div onClick={() => router.push(`/quiz/${item.slug || item._id}`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary-500 flex items-center justify-center shrink-0"><BrainCircuit className="w-5 h-5 text-white" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                     <p className="text-xs text-slate-400">
                        {item.subject?.name || ''}{item.topic?.name ? ` · ${item.topic.name}` : ''} · {item.duration} min · {item.totalMarks} marks
                     </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                     <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg">START</span>
                     {item.totalAttempts > 0 && (
                        <span className="text-[9px] text-slate-400">{formatCount(item.totalAttempts)} played</span>
                     )}
                  </div>
               </div>
            );
         case 'subject':
            return (
               <div onClick={() => router.push(`/subjects/${item.slug}`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><BookMarked className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                     <p className="text-xs text-slate-400">{item.exam?.name || 'General'}{item.description ? ` · ${item.description}` : ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         case 'topic':
            return (
               <div onClick={() => router.push(`/topics/${item.slug}`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><Layers className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                     <p className="text-xs text-slate-400">{item.subject?.name || ''}{item.exams?.length ? ` · ${item.exams.map(e => e.name).join(', ')}` : ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         case 'hashtag':
            return (
               <div onClick={() => goToTag(item.tag)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><Hash className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white">#{item.tag}</p>
                     <p className="text-xs text-slate-400">{item.count} question{item.count !== 1 ? 's' : ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         case 'blog':
            return (
               <div onClick={() => router.push(`/blog/${item.slug}`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                     <p className="text-xs text-slate-400 truncate">{item.exam?.name || 'Blog'}{item.readingTime ? ` · ${item.readingTime} min read` : ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         case 'note':
            return (
               <div onClick={() => router.push(`/notes/${item.slug}`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><StickyNote className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                     <p className="text-xs text-slate-400 truncate">{(item.noteType || '').replace('_', ' ')}{item.subject?.name ? ` · ${item.subject.name}` : ''}{item.exam?.name ? ` · ${item.exam.name}` : ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         case 'examNews':
            return (
               <div onClick={() => router.push(`/exam-news/${item.slug}`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><Newspaper className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                     <p className="text-xs text-slate-400 truncate">{(item.type || '').replace('_', ' ')}{item.exam?.name ? ` · ${item.exam.name}` : item.examName ? ` · ${item.examName}` : ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         case 'currentAffair':
            return (
               <div onClick={() => router.push(`/current-affairs/${item.slug}`)} className="flex items-center gap-3 px-3 py-3 rounded-lg lg:rounded-xl cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 active:bg-slate-50 dark:active:bg-slate-900 transition-colors">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0"><Globe className="w-5 h-5 text-white dark:text-black" /></div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                     <p className="text-xs text-slate-400 truncate">{item.category || ''}{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ''}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
               </div>
            );
         default:
            return null;
      }
   };

   const renderReelCard = (reel, size = 'small') => {
      const config = REEL_TYPE_CONFIG[reel.type] || REEL_TYPE_CONFIG.question;
      const ReelIcon = config.icon;
      const displayTitle = reel.type === 'question' ? reel.questionText : reel.type === 'poll' ? reel.pollQuestion : reel.title;
      const isGrid = size === 'grid';
      return (
         <Link href="/reels" key={reel._id} className={isGrid ? '' : 'shrink-0 w-28'}>
            <div className={`relative w-full overflow-hidden ${config.gradient} ${isGrid ? 'aspect-square' : 'h-40'}`}>
               <div className="absolute top-1.5 left-1.5 z-10"><ReelIcon className="w-3 h-3 text-white/60" /></div>
               <div className="absolute inset-x-0 bottom-0 bg-black/80 pt-8 px-2 pb-2">
                  <p className="text-[9px] font-bold text-white leading-tight line-clamp-2 mb-1">{displayTitle || 'Untitled'}</p>
                  <div className="flex items-center gap-1.5">
                     <Play className="w-2 h-2 text-white/80 fill-white/80" />
                     <span className="text-[8px] font-bold text-white/70">{formatCount(reel.viewsCount)}</span>
                     {reel.likesCount > 0 && <>
                        <Heart className="w-2 h-2 text-white/70" />
                        <span className="text-[8px] font-bold text-white/70">{formatCount(reel.likesCount)}</span>
                     </>}
                  </div>
               </div>
            </div>
         </Link>
      );
   };

   const hasAnySectionResults = SECTION_ORDER.some(key => (sections[key]?.items || []).length > 0);

   return (
      <div className="min-h-screen bg-background-page selection:bg-primary-500 selection:text-white">
         <Head>
            <title>Search | AajExam</title>
         </Head>

         {/* ── Fixed Header: Search bar + Tabs — truly pinned to top on web and mobile ── */}
         <div
            ref={headerRef}
            className={`fixed top-0 lg:top-16 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 transition-[left] duration-300 ease-in-out ${
               isAuthenticated() && isSidebarOpen ? 'lg:left-60' : ''
            }`}
         >
            {/* Search Bar — Instagram style */}
            <div className="px-3 lg:px-8 pt-3 lg:pt-4 pb-2">
               <form onSubmit={handleSearch} className="flex items-center gap-2">
                  {query && (
                     <button type="button" aria-label="Clear search" onClick={resetToBrowse} className="p-2 shrink-0 -ml-1">
                        <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
                     </button>
                  )}
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl py-2 lg:py-3 pl-9 pr-8 text-sm lg:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border-none transition-all"
                        placeholder="Search"
                        value={query}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                        onChange={(e) => {
                           setQuery(e.target.value);
                           if (!e.target.value.trim()) resetToBrowse();
                        }}
                     />
                     {query && (
                        <button type="button" onClick={resetToBrowse} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-slate-300 dark:bg-slate-600">
                           <X className="w-3 h-3 text-white" />
                        </button>
                     )}

                     {/* Recent searches — only while focused, before any query is typed */}
                     {isFocused && !query.trim() && recentSearches.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg lg:rounded-xl shadow-lg z-50 overflow-hidden">
                           {recentSearches.map((term, i) => (
                              <button
                                 key={i}
                                 type="button"
                                 onClick={() => goToTag(term)}
                                 className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                 <History className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                 <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{term}</span>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
                  {(isFocused || query) && (
                     <button type="submit" disabled={loading || !query.trim()} className="text-sm font-bold text-primary-600 dark:text-primary-400 shrink-0 disabled:opacity-40">
                        Search
                     </button>
                  )}
               </form>
            </div>

            {/* Tabs — always visible, right after the search input */}
            <div className="pb-0 border-b border-slate-100 dark:border-slate-800/50">
               <div className="flex overflow-x-auto no-scrollbar gap-1 px-3 lg:px-8">
                  {TABS.map(tab => (
                     <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        className={`flex-shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] lg:text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                           activeTab === tab.key
                              ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white'
                              : 'text-slate-400 border-transparent'
                        }`}
                     >
                        <tab.icon className="w-3.5 h-3.5" />
                        {tab.label}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* ── Content — pushed down by the fixed header's real measured height ── */}
         <div className="pb-24" style={{ paddingTop: headerHeight }}>
            <div className="py-3 lg:py-6">

                  {loading ? (
                     <div className="px-3 lg:px-8"><ListSkeleton rows={6} /></div>
                  ) : activeTab === 'all' ? (
                     /* ══════ ALL TAB — Sectioned Layout ══════ */
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                        {/* ── Sections, in SECTION_ORDER (Reels rendered as a horizontal-scroll strip) ── */}
                        {SECTION_ORDER.map(key => {
                           const meta = SECTION_META[key];
                           const section = sections[key];
                           if (!section || section.items.length === 0) return null;
                           const Icon = meta.icon;

                           if (key === 'reel') {
                              return (
                                 <div key={key}>
                                    <div className="flex items-center justify-between px-4 mb-2">
                                       <div className="flex items-center gap-1.5">
                                          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                          <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{meta.label}</h3>
                                       </div>
                                       <button onClick={() => handleTabChange('reel')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400">See all</button>
                                    </div>
                                    <div className="flex overflow-x-auto no-scrollbar gap-1.5 px-4 pb-1">
                                       {section.items.map(reel => renderReelCard(reel, 'small'))}
                                    </div>
                                 </div>
                              );
                           }

                           return (
                              <div key={key} className="px-3 lg:px-8">
                                 <div className="flex items-center gap-1.5 mb-2">
                                    <Icon className={`w-4 h-4 ${meta.color}`} />
                                    <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{meta.label}</h3>
                                 </div>
                                 <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-1">
                                    {section.items.map((item, idx) => <ResultRow item={item} key={item._id || item.tag || idx} />)}
                                 </div>
                                 {section.hasMore && (
                                    <button onClick={() => handleTabChange(key)} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all {meta.label.toLowerCase()} →</button>
                                 )}
                              </div>
                           );
                        })}

                        {/* No results at all */}
                        {!hasAnySectionResults && (
                           <div className="py-12 text-center space-y-3">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                 <Search className="w-7 h-7 text-slate-300" />
                              </div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No results found</p>
                              <p className="text-xs text-slate-400">Try a different search term</p>
                           </div>
                        )}
                     </motion.div>

                  ) : activeTab === 'reel' ? (
                     /* ══════ REELS TAB — Full Grid ══════ */
                     <div className="px-3 lg:px-8">
                        {currentTabData.items.length === 0 ? (
                           <div className="py-12 text-center space-y-3">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto"><Play className="w-7 h-7 text-slate-300" /></div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No reels found</p>
                              <p className="text-xs text-slate-400">Try a different search term</p>
                           </div>
                        ) : (
                           <>
                              <div className="grid grid-cols-3 lg:grid-cols-4 gap-px lg:gap-0.5 rounded-lg lg:rounded-xl overflow-hidden">
                                 {currentTabData.items.map(reel => renderReelCard(reel, 'grid'))}
                              </div>
                              {currentTabData.hasMore && (
                                 <div className="flex justify-center py-4">
                                    <button onClick={loadMore} disabled={loadingMore} className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1.5 disabled:opacity-50">
                                       {loadingMore && <LoaderIcon className="w-3.5 h-3.5 animate-spin" />} Load more
                                    </button>
                                 </div>
                              )}
                           </>
                        )}
                     </div>

                  ) : (
                     /* ══════ OTHER TABS — Infinite-scroll List View ══════ */
                     <div className="px-3 lg:px-8">
                        {currentTabData.items.length === 0 ? (
                           <div className="py-12 text-center space-y-3">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto"><Search className="w-7 h-7 text-slate-300" /></div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No results found</p>
                              <p className="text-xs text-slate-400">Try a different search term</p>
                           </div>
                        ) : (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-1">
                              {currentTabData.items.map((item, idx) => (
                                 <ResultRow item={item} key={item._id || item.tag || idx} />
                              ))}
                              <div ref={sentinelRef} className="h-1" />
                              {loadingMore && (
                                 <div className="flex justify-center py-4">
                                    <LoaderIcon className="w-4 h-4 animate-spin text-slate-400" />
                                 </div>
                              )}
                           </motion.div>
                        )}
                     </div>
                  )}
            </div>
         </div>
      </div>
   );
};

export default SearchPage;
