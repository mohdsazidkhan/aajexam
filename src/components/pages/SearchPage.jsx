'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import Link from "next/link";
import {
   Search,
   FileText,
   Compass,
   Sparkles,
   History,
   Zap,
   Clock,
   ShieldCheck,
   ChevronLeft,
   ChevronRight,
   User,
   Users,
   Trophy,
   X,
   Eye,
   Heart,
   HelpCircle,
   BookOpen,
   Newspaper,
   BarChart3,
   Play,
   ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';
import TestStartModal from "../TestStartModal";
import Loading from '../Loading';
import Button from '../ui/Button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

const SearchPage = () => {
   const router = useRouter();
   const searchParams = useSearchParams();
   const inputRef = useRef(null);
   const [query, setQuery] = useState("");
   const [isFocused, setIsFocused] = useState(false);
   const [users, setUsers] = useState([]);
   const [govtExamCategories, setGovtExamCategories] = useState([]);
   const [govtExams, setGovtExams] = useState([]);
   const [examPatterns, setExamPatterns] = useState([]);
   const [practiceTests, setPracticeTests] = useState([]);
   const [activeTab, setActiveTab] = useState('all');
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(false);
   const [showTestModal, setShowTestModal] = useState(false);
   const [selectedTest, setSelectedTest] = useState(null);
   const isSearchingRef = useRef(false);
   const hasInitialSearchedRef = useRef(false);

   // Reels & Blogs from global search
   const [searchReels, setSearchReels] = useState([]);
   const [blogs, setBlogs] = useState([]);

   // Follow state
   const [followMap, setFollowMap] = useState({});
   const [followLoading, setFollowLoading] = useState(null);

   // Explore grid
   const [trendingReels, setTrendingReels] = useState([]);
   const [trendingLoading, setTrendingLoading] = useState(true);

   const limit = 12;

   useEffect(() => {
      const loadTrending = async () => {
         try {
            const res = await API.getTrendingReels(12);
            if (res?.success) setTrendingReels(res.data || []);
         } catch (e) { console.error('Trending load failed:', e); }
         finally { setTrendingLoading(false); }
      };
      loadTrending();
   }, []);

   const fetchData = useCallback(async (searchQuery, pageNum = currentPage) => {
      if (isSearchingRef.current) return;
      const trimmedQuery = searchQuery?.trim()?.toLowerCase();
      if (!trimmedQuery) {
         clearResults();
         return;
      }
      try {
         isSearchingRef.current = true;
         setLoading(true);

         // Search all content
         const res = await API.searchAll({ query: trimmedQuery, page: pageNum, limit });
         if (res.success) {
            const usersList = res.users || [];
            setUsers(usersList);
            setGovtExamCategories(res.govtExamCategories || []);
            setGovtExams(res.govtExams || []);
            setExamPatterns(res.examPatterns || []);
            setPracticeTests(res.practiceTests || []);
            setBlogs(res.blogs || []);
            setSearchReels(res.reels || []);
            setTotalPages(res.totalPages || 1);
            checkFollowStatuses(usersList);
         }
      } catch (err) { console.error("Search failed:", err); }
      finally { setLoading(false); isSearchingRef.current = false; }
   }, [currentPage]);

   const clearResults = () => {
      setUsers([]);
      setGovtExamCategories([]); setGovtExams([]); setExamPatterns([]); setPracticeTests([]);
      setBlogs([]); setSearchReels([]);
      setTotalPages(1);
   };


   // Check follow status for user results
   const checkFollowStatuses = async (usersList) => {
      if (!isAuthenticated() || usersList.length === 0) return;
      for (const user of usersList) {
         const userId = user._id || user.id;
         if (userId && followMap[userId] === undefined) {
            try {
               const res = await API.request(`/api/users/follow-status/${userId}`);
               if (res?.success) {
                  setFollowMap(prev => ({ ...prev, [userId]: res.isFollowing }));
               }
            } catch {}
         }
      }
   };

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

   const handleSearch = (e) => {
      e.preventDefault();
      if (loading || isSearchingRef.current) return;
      setCurrentPage(1);
      hasInitialSearchedRef.current = true;
      fetchData(query, 1);
      inputRef.current?.blur();
   };

   useEffect(() => {
      const searchQuery = searchParams.get('q');
      if (searchQuery) {
         setQuery(searchQuery);
         hasInitialSearchedRef.current = true;
         setCurrentPage(1);
         fetchData(searchQuery, 1);
      }
   }, [searchParams]);

   const tabs = [
      { key: 'all', label: 'All', icon: Compass },
      { key: 'reels', label: 'Reels', icon: Play },
      { key: 'exam', label: 'Exams', icon: ShieldCheck },
      { key: 'test', label: 'Tests', icon: FileText },
      { key: 'blog', label: 'Blogs', icon: BookOpen },
      { key: 'user', label: 'People', icon: User },
   ];

   const getFilteredResults = () => {
      switch (activeTab) {
         case 'all': return [...govtExams, ...govtExamCategories, ...examPatterns, ...practiceTests, ...blogs, ...users];
         case 'reels': return []; // reels rendered separately via grid
         case 'exam': return [...govtExams, ...govtExamCategories, ...examPatterns];
         case 'test': return practiceTests;
         case 'blog': return blogs;
         case 'user': return users;
         default: return [];
      }
   };

   const results = getFilteredResults();
   const hasSearched = results.length > 0 || searchReels.length > 0 || (query && hasInitialSearchedRef.current);

   const REEL_TYPE_CONFIG = {
      question: { icon: HelpCircle, gradient: 'from-blue-600 to-indigo-700' },
      fact: { icon: BookOpen, gradient: 'from-purple-600 to-pink-600' },
      tip: { icon: Zap, gradient: 'from-yellow-500 to-orange-600' },
      current_affairs: { icon: Newspaper, gradient: 'from-red-500 to-rose-700' },
      poll: { icon: BarChart3, gradient: 'from-green-500 to-emerald-700' },
   };

   const formatCount = (n) => {
      if (!n) return '0';
      if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
      if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
      return n.toString();
   };

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-primary-500 selection:text-white">
         <Head>
            <title>Search | AajExam</title>
         </Head>

         {/* ── Fixed Header: Search bar + Tabs ── */}
         <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50">
            {/* Search Bar — Instagram style */}
            <div className="px-3 lg:px-8 pt-3 lg:pt-4 pb-2">
               <form onSubmit={handleSearch} className="flex items-center gap-2">
                  {hasSearched && (
                     <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); clearResults(); hasInitialSearchedRef.current = false; }} className="p-2 shrink-0 -ml-1">
                        <ArrowLeft className="w-5 h-5 text-slate-900 dark:text-white" />
                     </button>
                  )}
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2 lg:py-3 pl-9 pr-8 text-sm lg:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/30 border-none transition-all"
                        placeholder="Search"
                        value={query}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                        onChange={(e) => {
                           setQuery(e.target.value);
                           if (!e.target.value.trim()) { clearResults(); hasInitialSearchedRef.current = false; }
                        }}
                     />
                     {query && (
                        <button type="button" onClick={() => { setQuery(''); clearResults(); hasInitialSearchedRef.current = false; }} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-slate-300 dark:bg-slate-600">
                           <X className="w-3 h-3 text-white" />
                        </button>
                     )}
                  </div>
                  {(isFocused || query) && (
                     <button type="submit" disabled={loading || !query.trim()} className="text-sm font-bold text-primary-600 dark:text-primary-400 shrink-0 disabled:opacity-40">
                        Search
                     </button>
                  )}
               </form>
            </div>

            {/* Quick tags */}
            <div className="px-3 lg:px-8 pb-2">
               <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 lg:gap-2">
                  {['UPSC', 'SSC', 'Railway', 'Banking', 'Police', 'Current Affairs'].map((tag, i) => (
                     <button key={i} onClick={() => { setQuery(tag); setCurrentPage(1); hasInitialSearchedRef.current = true; fetchData(tag, 1); }}
                        className="flex-shrink-0 whitespace-nowrap px-4 lg:px-5 py-2 lg:py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500/10 hover:text-primary-600 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 transition-all">
                        {tag}
                     </button>
                  ))}
               </div>
            </div>

            {/* Tabs — only show when there are search results */}
            {hasSearched && (
               <div className="pb-0 border-b border-slate-100 dark:border-slate-800/50">
                  <div className="flex overflow-x-auto no-scrollbar gap-1 px-3 lg:px-8">
                     {tabs.map(tab => (
                        <button
                           key={tab.key}
                           onClick={() => setActiveTab(tab.key)}
                           className={`flex-shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] lg:text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
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
            )}
         </div>

         {/* ── Content ── */}
         <div className="pb-24">

            {/* Search Results */}
            {hasSearched && (
               <div className="py-3 lg:py-6">

                  {loading ? (
                     <div className="py-12 flex justify-center"><Loading size="lg" /></div>
                  ) : activeTab === 'all' ? (
                     /* ══════ ALL TAB — Sectioned Layout ══════ */
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

                        {/* ── Reels Section (horizontal scroll) ── */}
                        {searchReels.length > 0 && (
                           <div>
                              <div className="flex items-center justify-between px-4 mb-2">
                                 <div className="flex items-center gap-1.5">
                                    <Play className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                    <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Reels</h3>
                                 </div>
                                 <button onClick={() => setActiveTab('reels')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400">See all</button>
                              </div>
                              <div className="flex overflow-x-auto no-scrollbar gap-1.5 px-4 pb-1">
                                 {searchReels.slice(0, 8).map(reel => {
                                    const config = REEL_TYPE_CONFIG[reel.type] || REEL_TYPE_CONFIG.question;
                                    const ReelIcon = config.icon;
                                    const displayTitle = reel.type === 'question' ? reel.questionText : reel.type === 'poll' ? reel.pollQuestion : reel.title;
                                    return (
                                       <Link href="/reels" key={reel._id} className="shrink-0 w-28">
                                          <div className={`relative w-28 h-40 overflow-hidden rounded-xl bg-gradient-to-br ${config.gradient}`}>
                                             <div className="absolute top-1.5 left-1.5 z-10"><ReelIcon className="w-3 h-3 text-white/60" /></div>
                                             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-8 px-2 pb-2">
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
                                 })}
                              </div>
                           </div>
                        )}

                        {/* ── Exams Section ── */}
                        {[...govtExams, ...govtExamCategories, ...examPatterns].length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <ShieldCheck className="w-4 h-4 text-blue-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Exams</h3>
                              </div>
                              {[...govtExams, ...govtExamCategories, ...examPatterns].slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => item.type === 'exam' ? router.push(`/govt-exams/exam/${item._id}`) : item.type === 'examCategory' ? router.push(`/govt-exams`) : router.push(`/govt-exams`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                                       <ShieldCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name || item.title}</p>
                                       <p className="text-xs text-slate-400">{item.category?.name || item.type || ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {[...govtExams, ...govtExamCategories, ...examPatterns].length > 4 && (
                                 <button onClick={() => setActiveTab('exam')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all exams →</button>
                              )}
                           </div>
                        )}

                        {/* ── Tests Section ── */}
                        {practiceTests.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <FileText className="w-4 h-4 text-primary-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Tests</h3>
                              </div>
                              {practiceTests.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => { setSelectedTest(item); setShowTestModal(true); }}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
                                       <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400">{item.duration} min · {item.totalMarks} marks</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg shrink-0">START</span>
                                 </div>
                              ))}
                              {practiceTests.length > 4 && (
                                 <button onClick={() => setActiveTab('test')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all tests →</button>
                              )}
                           </div>
                        )}

                        {/* ── Blogs Section ── */}
                        {blogs.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <BookOpen className="w-4 h-4 text-purple-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Blogs</h3>
                              </div>
                              {blogs.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/blog/${item.slug}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0">
                                       <BookOpen className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400 truncate">{item.exam?.name || 'Blog'}{item.readingTime ? ` · ${item.readingTime} min read` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {blogs.length > 4 && (
                                 <button onClick={() => setActiveTab('blog')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all blogs →</button>
                              )}
                           </div>
                        )}

                        {/* ── People Section ── */}
                        {users.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <User className="w-4 h-4 text-orange-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">People</h3>
                              </div>
                              {users.slice(0, 4).map(item => {
                                 const userId = item._id || item.id;
                                 const isFollowing = followMap[userId];
                                 const isThisLoading = followLoading === userId;
                                 return (
                                    <div key={item._id} className="flex items-center gap-3 px-1 py-2.5 rounded-xl transition-colors">
                                       <div onClick={() => item.username && router.push(`/u/${item.username}`)} className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-[2px] shrink-0">
                                             <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white font-black text-sm">
                                                {(item.name || item.username || 'U').charAt(0).toUpperCase()}
                                             </div>
                                          </div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.username || item.name}</p>
                                             <p className="text-xs text-slate-400 truncate">{item.name}{item.followersCount ? ` · ${formatCount(item.followersCount)} followers` : ''}</p>
                                          </div>
                                       </div>
                                       {isAuthenticated() && userId && (
                                          <button onClick={(e) => { e.stopPropagation(); handleFollowToggle(userId); }} disabled={isThisLoading}
                                             className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' : 'bg-primary-500 text-white hover:bg-primary-600'} disabled:opacity-50`}>
                                             {isThisLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                                          </button>
                                       )}
                                    </div>
                                 );
                              })}
                              {users.length > 4 && (
                                 <button onClick={() => setActiveTab('user')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all people →</button>
                              )}
                           </div>
                        )}

                        {/* No results at all */}
                        {searchReels.length === 0 && [...govtExams, ...govtExamCategories, ...examPatterns].length === 0 && practiceTests.length === 0 && blogs.length === 0 && users.length === 0 && (
                           <div className="py-12 text-center space-y-3">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                                 <Search className="w-7 h-7 text-slate-300" />
                              </div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No results found</p>
                              <p className="text-xs text-slate-400">Try a different search term</p>
                           </div>
                        )}
                     </motion.div>

                  ) : activeTab === 'reels' ? (
                     /* ══════ REELS TAB — Full Grid ══════ */
                     <div className="px-3 lg:px-8">
                        {searchReels.length === 0 ? (
                           <div className="py-12 text-center space-y-3">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto"><Play className="w-7 h-7 text-slate-300" /></div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No reels found</p>
                              <p className="text-xs text-slate-400">Try a different search term</p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-3 gap-px lg:gap-0.5 rounded-xl overflow-hidden">
                              {searchReels.map(reel => {
                                 const config = REEL_TYPE_CONFIG[reel.type] || REEL_TYPE_CONFIG.question;
                                 const ReelIcon = config.icon;
                                 const displayTitle = reel.type === 'question' ? reel.questionText : reel.type === 'poll' ? reel.pollQuestion : reel.title;
                                 return (
                                    <Link href="/reels" key={reel._id}>
                                       <div className={`relative w-full overflow-hidden bg-gradient-to-br ${config.gradient} aspect-square`}>
                                          <div className="absolute top-2 left-2 z-10"><ReelIcon className="w-3.5 h-3.5 text-white/60" /></div>
                                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-10 px-2 pb-2">
                                             <p className="font-bold text-white leading-snug mb-1 text-[9px] line-clamp-2">{displayTitle || 'Untitled'}</p>
                                             <div className="flex items-center gap-2">
                                                <Play className="w-2 h-2 text-white/80 fill-white/80" /><span className="text-[8px] font-bold text-white/80">{formatCount(reel.viewsCount)}</span>
                                                {reel.likesCount > 0 && <><Heart className="w-2 h-2 text-white/80" /><span className="text-[8px] font-bold text-white/80">{formatCount(reel.likesCount)}</span></>}
                                             </div>
                                          </div>
                                       </div>
                                    </Link>
                                 );
                              })}
                           </div>
                        )}
                     </div>

                  ) : (
                     /* ══════ OTHER TABS — List View ══════ */
                     <div className="px-3 lg:px-8">
                        {results.length === 0 && query ? (
                           <div className="py-12 text-center space-y-3">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto"><Search className="w-7 h-7 text-slate-300" /></div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">No results found</p>
                              <p className="text-xs text-slate-400">Try a different search term</p>
                           </div>
                        ) : (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                              {results.map((item, idx) => (
                                 <div key={item._id || idx}>
                                    {/* User */}
                                    {item.type === 'user' && (() => {
                                       const userId = item._id || item.id;
                                       const isFollowing = followMap[userId];
                                       const isThisLoading = followLoading === userId;
                                       return (
                                          <div className="flex items-center gap-3 px-1 py-2.5 rounded-xl transition-colors">
                                             <div onClick={() => item.username && router.push(`/u/${item.username}`)} className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 rounded-xl">
                                                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-[2px] shrink-0">
                                                   <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white font-black text-lg">{(item.name || item.username || 'U').charAt(0).toUpperCase()}</div>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                   <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.username || item.name}</p>
                                                   <p className="text-xs text-slate-400 truncate">{item.name} {item.followersCount ? `· ${formatCount(item.followersCount)} followers` : ''}</p>
                                                </div>
                                             </div>
                                             {isAuthenticated() && userId && (
                                                <button onClick={(e) => { e.stopPropagation(); handleFollowToggle(userId); }} disabled={isThisLoading}
                                                   className={`shrink-0 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isFollowing ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' : 'bg-primary-500 text-white hover:bg-primary-600'} disabled:opacity-50`}>
                                                   {isThisLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
                                                </button>
                                             )}
                                          </div>
                                       );
                                    })()}
                                    {/* Test */}
                                    {item.type === 'test' && (
                                       <div onClick={() => { setSelectedTest(item); setShowTestModal(true); }} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                             <p className="text-xs text-slate-400">{item.duration} min · {item.totalMarks} marks</p>
                                          </div>
                                          <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg shrink-0">START</span>
                                       </div>
                                    )}
                                    {/* Exam */}
                                    {(item.type === 'exam' || item.type === 'examCategory' || item.type === 'pattern') && (
                                       <div onClick={() => item.type === 'exam' ? router.push(`/govt-exams/exam/${item._id}`) : router.push('/govt-exams')} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0"><ShieldCheck className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name || item.title}</p>
                                             <p className="text-xs text-slate-400">{item.category?.name || item.type || 'Exam'}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Blog */}
                                    {item.type === 'blog' && (
                                       <div onClick={() => router.push(`/blog/${item.slug}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                             <p className="text-xs text-slate-400 truncate">{item.exam?.name || 'Blog'}{item.readingTime ? ` · ${item.readingTime} min read` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                 </div>
                              ))}
                           </motion.div>
                        )}
                     </div>
                  )}
               </div>
            )}

            {/* Explore Grid — Instagram style (when no search) */}
            {!hasSearched && (
               <>
                  {trendingLoading ? (
                     <div className="py-12 flex justify-center"><Loading size="md" /></div>
                  ) : trendingReels.length > 0 ? (
                     <div className="grid grid-cols-3 gap-px lg:gap-0.5 bg-slate-200 dark:bg-slate-800">
                        {trendingReels.map((reel, idx) => {
                           const config = REEL_TYPE_CONFIG[reel.type] || REEL_TYPE_CONFIG.question;
                           const Icon = config.icon;
                           const displayTitle = reel.type === 'question' ? reel.questionText : reel.type === 'poll' ? reel.pollQuestion : reel.title;
                           const isLarge = idx % 9 === 4;

                           return (
                              <Link href="/reels" key={reel._id} className={isLarge ? 'col-span-2 row-span-2' : ''}>
                                 <div className={`relative w-full overflow-hidden bg-gradient-to-br ${config.gradient} ${isLarge ? 'aspect-square' : 'aspect-square'}`}>
                                    {/* Type icon — top left */}
                                    <div className="absolute top-2 left-2 z-10">
                                       <Icon className={`${isLarge ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-white/60`} />
                                    </div>

                                    {/* Bottom gradient + title + stats */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-10">
                                       <div className="px-2 pb-2">
                                          <p className={`font-bold text-white leading-snug mb-1 ${isLarge ? 'text-xs line-clamp-3' : 'text-[9px] line-clamp-2'}`}>
                                             {displayTitle || 'Untitled'}
                                          </p>
                                          <div className="flex items-center gap-2">
                                             <div className="flex items-center gap-0.5">
                                                <Play className={`${isLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'} text-white/80 fill-white/80`} />
                                                <span className={`${isLarge ? 'text-[10px]' : 'text-[8px]'} font-bold text-white/80`}>{formatCount(reel.viewsCount)}</span>
                                             </div>
                                             {reel.likesCount > 0 && (
                                                <div className="flex items-center gap-0.5">
                                                   <Heart className={`${isLarge ? 'w-2.5 h-2.5' : 'w-2 h-2'} text-white/80`} />
                                                   <span className={`${isLarge ? 'text-[10px]' : 'text-[8px]'} font-bold text-white/80`}>{formatCount(reel.likesCount)}</span>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </Link>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="py-16 text-center space-y-3">
                        <Compass className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto" />
                        <p className="text-sm font-bold text-slate-400">Explore content</p>
                        <p className="text-xs text-slate-300 dark:text-slate-600">Search for exams, tests, or people</p>
                     </div>
                  )}
               </>
            )}
         </div>

         {/* Modals */}
         {showTestModal && selectedTest && <TestStartModal isOpen={showTestModal} onClose={() => setShowTestModal(false)} onConfirm={() => { setShowTestModal(false); if (selectedTest) { localStorage.setItem('testNavigationData', JSON.stringify({ fromPage: 'search', searchQuery: query, testData: selectedTest })); router.push(`/govt-exams/test/${selectedTest._id}/start`); } }} test={selectedTest} pattern={selectedTest.examPattern} exam={selectedTest.examPattern?.exam} category={selectedTest.examPattern?.exam?.category} />}
      </div>
   );
};

export default SearchPage;
