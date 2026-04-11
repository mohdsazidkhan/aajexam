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

import API from '../../lib/api';
import TestStartModal from "../TestStartModal";
import Loading from '../Loading';
import Button from '../ui/Button';

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

   // Explore grid
   const [trendingReels, setTrendingReels] = useState([]);
   const [trendingLoading, setTrendingLoading] = useState(true);

   const limit = 12;

   useEffect(() => {
      const loadTrending = async () => {
         try {
            const res = await API.getTrendingReels(24);
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
         const res = await API.searchAll({ query: trimmedQuery, page: pageNum, limit });
         if (res.success) {
            setUsers(res.users || []);
            setGovtExamCategories(res.govtExamCategories || []);
            setGovtExams(res.govtExams || []);
            setExamPatterns(res.examPatterns || []);
            setPracticeTests(res.practiceTests || []);
            setTotalPages(res.totalPages || 1);
         }
      } catch (err) { console.error("Search failed:", err); }
      finally { setLoading(false); isSearchingRef.current = false; }
   }, [currentPage]);

   const clearResults = () => {
      setUsers([]);
      setGovtExamCategories([]); setGovtExams([]); setExamPatterns([]); setPracticeTests([]);
      setTotalPages(1);
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
      if (searchQuery && !hasInitialSearchedRef.current) {
         setQuery(searchQuery);
         hasInitialSearchedRef.current = true;
         fetchData(searchQuery, 1);
      }
   }, [searchParams, fetchData]);

   const tabs = [
      { key: 'all', label: 'All', icon: Compass },
      { key: 'exam', label: 'Exams', icon: ShieldCheck },
      { key: 'test', label: 'Tests', icon: FileText },
      { key: 'user', label: 'People', icon: User },
   ];

   const getFilteredResults = () => {
      switch (activeTab) {
         case 'all': return [...govtExams, ...govtExamCategories, ...examPatterns, ...practiceTests, ...users];
         case 'exam': return [...govtExams, ...govtExamCategories, ...examPatterns];
         case 'test': return practiceTests;
         case 'user': return users;
         default: return [];
      }
   };

   const results = getFilteredResults();
   const hasSearched = results.length > 0 || (query && hasInitialSearchedRef.current);

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
                     <button type="button" onClick={() => { setQuery(''); clearResults(); hasInitialSearchedRef.current = false; }} className="p-1 shrink-0">
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
                        className="flex-shrink-0 whitespace-nowrap px-3 lg:px-4 py-1 lg:py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-500/10 hover:text-primary-600 rounded-full text-[11px] lg:text-xs font-bold text-slate-600 dark:text-slate-400 transition-all">
                        {tag}
                     </button>
                  ))}
               </div>
            </div>

            {/* Tabs — only show when there are search results */}
            {hasSearched && (
               <div className="px-3 lg:px-8 pb-0">
                  <div className="flex gap-0 border-b-0">
                     {tabs.map(tab => (
                        <button
                           key={tab.key}
                           onClick={() => setActiveTab(tab.key)}
                           className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] lg:text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
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
               <div className="px-3 lg:px-8 py-3 lg:py-6">
                  <AnimatePresence mode="wait">
                     {loading ? (
                        <div className="py-12 flex justify-center"><Loading size="lg" /></div>
                     ) : results.length === 0 && query ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center space-y-3">
                           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                              <Search className="w-7 h-7 text-slate-300" />
                           </div>
                           <p className="text-sm font-bold text-slate-900 dark:text-white">No results found</p>
                           <p className="text-xs text-slate-400">Try a different search term</p>
                        </motion.div>
                     ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                           {results.map((item, idx) => (
                              <div key={item._id || idx}>

                                 {/* User result — Instagram style row */}
                                 {item.type === 'user' && (
                                    <div
                                       onClick={() => item.username && router.push(`/u/${item.username}`)}
                                       className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                                    >
                                       <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 p-[2px] shrink-0">
                                          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white font-black text-lg">
                                             {(item.name || item.username || 'U').charAt(0).toUpperCase()}
                                          </div>
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.username || item.name}</p>
                                          <p className="text-xs text-slate-400 truncate">{item.name} {item.followersCount ? `· ${formatCount(item.followersCount)} followers` : ''}</p>
                                       </div>
                                    </div>
                                 )}

                                 {/* Test result */}
                                 {item.type === 'test' && (
                                    <div
                                       onClick={() => { setSelectedTest(item); setShowTestModal(true); }}
                                       className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                                    >
                                       <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shrink-0">
                                          <FileText className="w-5 h-5 text-white" />
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                          <p className="text-xs text-slate-400">{item.duration} min · {item.totalMarks} marks</p>
                                       </div>
                                       <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg shrink-0">START</span>
                                    </div>
                                 )}

                                 {/* Exam result */}
                                 {item.type === 'exam' && (
                                    <div
                                       onClick={() => router.push(`/govt-exams/exam/${item._id}`)}
                                       className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors"
                                    >
                                       <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0">
                                          <ShieldCheck className="w-5 h-5 text-white" />
                                       </div>
                                       <div className="min-w-0 flex-1">
                                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                          <p className="text-xs text-slate-400">{item.category?.name || 'Govt Exam'} · {item.testsCount || 0} tests</p>
                                       </div>
                                       <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                    </div>
                                 )}
                              </div>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {/* Pagination */}
                  {totalPages > 1 && (
                     <div className="flex justify-center items-center gap-4 py-6">
                        <button
                           disabled={currentPage === 1 || loading}
                           onClick={() => { setCurrentPage(c => c - 1); fetchData(query, currentPage - 1); }}
                           className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-30 transition-all"
                        >
                           Previous
                        </button>
                        <span className="text-xs font-bold text-slate-400">{currentPage} / {totalPages}</span>
                        <button
                           disabled={currentPage === totalPages || loading}
                           onClick={() => { setCurrentPage(c => c + 1); fetchData(query, currentPage + 1); }}
                           className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold disabled:opacity-30 transition-all"
                        >
                           Next
                        </button>
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
