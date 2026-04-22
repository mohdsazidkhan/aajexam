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
   ArrowLeft,
   BrainCircuit,
   BookMarked,
   Layers,
   Hash,
   StickyNote,
   Target,
   RotateCcw,
   Globe,
   MessageSquare,
   Award
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

   // Reels, Blogs, Quizzes, Subjects, Topics, Hashtags from global search
   const [searchReels, setSearchReels] = useState([]);
   const [blogs, setBlogs] = useState([]);
   const [quizzes, setQuizzes] = useState([]);
   const [subjects, setSubjects] = useState([]);
   const [topics, setTopics] = useState([]);
   const [hashtags, setHashtags] = useState([]);
   const [notes, setNotes] = useState([]);
   const [dailyChallenges, setDailyChallenges] = useState([]);
   const [revision, setRevision] = useState([]);
   const [examNews, setExamNews] = useState([]);
   const [currentAffairs, setCurrentAffairs] = useState([]);
   const [communityQuestions, setCommunityQuestions] = useState([]);
   const [mentors, setMentors] = useState([]);

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
            setQuizzes(res.quizzes || []);
            setSubjects(res.subjects || []);
            setTopics(res.topics || []);
            setHashtags(res.hashtags || []);
            setSearchReels(res.reels || []);
            setNotes(res.notes || []);
            setDailyChallenges(res.dailyChallenges || []);
            setRevision(res.revision || []);
            setExamNews(res.examNews || []);
            setCurrentAffairs(res.currentAffairs || []);
            setCommunityQuestions(res.communityQuestions || []);
            setMentors(res.mentors || []);
            setTotalPages(res.totalPages || 1);
            checkFollowStatuses(usersList);
         }
      } catch (err) { console.error("Search failed:", err); }
      finally { setLoading(false); isSearchingRef.current = false; }
   }, [currentPage]);

   const clearResults = () => {
      setUsers([]);
      setGovtExamCategories([]); setGovtExams([]); setExamPatterns([]); setPracticeTests([]);
      setBlogs([]); setQuizzes([]); setSubjects([]); setTopics([]); setHashtags([]); setSearchReels([]);
      setNotes([]); setDailyChallenges([]); setRevision([]); setExamNews([]);
      setCurrentAffairs([]); setCommunityQuestions([]); setMentors([]);
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
      { key: 'exam', label: 'Exams', icon: ShieldCheck },
      { key: 'reels', label: 'Reels', icon: Play },
      { key: 'subject', label: 'Subjects', icon: BookMarked },
      { key: 'topic', label: 'Topics', icon: Layers },
      { key: 'quiz', label: 'Quizzes', icon: BrainCircuit },
      { key: 'test', label: 'Practice Tests', icon: FileText },
      { key: 'user', label: 'Users', icon: User },
      { key: 'hashtag', label: 'Hashtags', icon: Hash },
      { key: 'blog', label: 'Blogs', icon: BookOpen },
      { key: 'note', label: 'Notes', icon: StickyNote },
      { key: 'dailyChallenge', label: 'Daily Challenge', icon: Target },
      { key: 'revision', label: 'Revision', icon: RotateCcw },
      { key: 'examNews', label: 'Exam News', icon: Newspaper },
      { key: 'currentAffair', label: 'Current Affairs', icon: Globe },
      { key: 'communityQuestion', label: 'Community Question', icon: MessageSquare },
      { key: 'mentor', label: 'Mentors', icon: Award },
   ];

   const getFilteredResults = () => {
      switch (activeTab) {
         case 'all': return [
            ...govtExams, ...govtExamCategories, ...examPatterns,
            ...practiceTests, ...quizzes,
            ...subjects.map(s => ({...s, type: 'subject'})),
            ...topics.map(t => ({...t, type: 'topic'})),
            ...blogs, ...users, ...notes, ...dailyChallenges, ...revision,
            ...examNews, ...currentAffairs, ...communityQuestions, ...mentors,
         ];
         case 'reels': return []; // reels rendered separately via grid
         case 'quiz': return quizzes;
         case 'subject': return subjects.map(s => ({...s, type: 'subject'}));
         case 'topic': return topics.map(t => ({...t, type: 'topic'}));
         case 'hashtag': return hashtags.map(h => ({...h, type: 'hashtag'}));
         case 'exam': return [...govtExams, ...govtExamCategories, ...examPatterns];
         case 'test': return practiceTests;
         case 'blog': return blogs;
         case 'user': return users;
         case 'note': return notes;
         case 'dailyChallenge': return dailyChallenges;
         case 'revision': return revision;
         case 'examNews': return examNews;
         case 'currentAffair': return currentAffairs;
         case 'communityQuestion': return communityQuestions;
         case 'mentor': return mentors;
         default: return [];
      }
   };

   const results = getFilteredResults();
   const hasSearched = results.length > 0 || searchReels.length > 0 || quizzes.length > 0 || (query && hasInitialSearchedRef.current);

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

                        {/* ── Quizzes Section ── */}
                        {quizzes.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <BrainCircuit className="w-4 h-4 text-emerald-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Quizzes</h3>
                              </div>
                              {quizzes.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/quiz/${item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0">
                                       <BrainCircuit className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400">
                                          {item.subject?.name || ''}{item.topic?.name ? ` · ${item.topic.name}` : ''} · {item.duration} min · {item.totalMarks} marks
                                       </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">START</span>
                                       {item.totalAttempts > 0 && (
                                          <span className="text-[9px] text-slate-400">{formatCount(item.totalAttempts)} played</span>
                                       )}
                                    </div>
                                 </div>
                              ))}
                              {quizzes.length > 4 && (
                                 <button onClick={() => setActiveTab('quiz')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all quizzes →</button>
                              )}
                           </div>
                        )}

                        {/* ── Subjects Section ── */}
                        {subjects.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <BookMarked className="w-4 h-4 text-indigo-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Subjects</h3>
                              </div>
                              {subjects.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/subjects/${item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                                       <BookMarked className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                       <p className="text-xs text-slate-400">{item.exam?.name || 'General'}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {subjects.length > 4 && (
                                 <button onClick={() => setActiveTab('subject')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all subjects →</button>
                              )}
                           </div>
                        )}

                        {/* ── Topics Section ── */}
                        {topics.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <Layers className="w-4 h-4 text-cyan-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Topics</h3>
                              </div>
                              {topics.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/topics/${item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                                       <Layers className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                       <p className="text-xs text-slate-400">{item.subject?.name || ''}{item.exams?.length ? ` · ${item.exams.map(e => e.name).join(', ')}` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {topics.length > 4 && (
                                 <button onClick={() => setActiveTab('topic')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all topics →</button>
                              )}
                           </div>
                        )}

                        {/* ── Hashtags Section ── */}
                        {hashtags.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <Hash className="w-4 h-4 text-rose-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Hashtags</h3>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                 {hashtags.slice(0, 12).map((item, i) => (
                                    <button key={i} onClick={() => { setQuery(item.tag); fetchData(item.tag, 1); }}
                                       className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-all">
                                       #{item.tag} <span className="text-[10px] text-slate-400 ml-1">{item.count}</span>
                                    </button>
                                 ))}
                              </div>
                              {hashtags.length > 12 && (
                                 <button onClick={() => setActiveTab('hashtag')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2 mt-1">See all hashtags →</button>
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

                        {/* ── Notes Section ── */}
                        {notes.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <StickyNote className="w-4 h-4 text-amber-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Notes</h3>
                              </div>
                              {notes.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/notes/${item.slug || item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
                                       <StickyNote className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400 truncate">{(item.noteType || '').replace('_', ' ')}{item.subject?.name ? ` · ${item.subject.name}` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {notes.length > 4 && <button onClick={() => setActiveTab('note')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all notes →</button>}
                           </div>
                        )}

                        {/* ── Daily Challenges Section ── */}
                        {dailyChallenges.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <Target className="w-4 h-4 text-red-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Daily Challenges</h3>
                              </div>
                              {dailyChallenges.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/daily-challenge`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shrink-0">
                                       <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400 truncate">{item.date ? new Date(item.date).toLocaleDateString() : ''}{item.totalMarks ? ` · ${item.totalMarks} marks` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {dailyChallenges.length > 4 && <button onClick={() => setActiveTab('dailyChallenge')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all daily challenges →</button>}
                           </div>
                        )}

                        {/* ── Revision Section ── */}
                        {revision.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <RotateCcw className="w-4 h-4 text-teal-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Revision Queue</h3>
                              </div>
                              {revision.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/revision`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center shrink-0">
                                       <RotateCcw className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.questionSnapshot?.questionText || item.sourceTitle || 'Revision item'}</p>
                                       <p className="text-xs text-slate-400 truncate">{(item.source || '').replace('_', ' ')}{item.totalReviews ? ` · ${item.totalReviews} reviews` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {revision.length > 4 && <button onClick={() => setActiveTab('revision')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all revision items →</button>}
                           </div>
                        )}

                        {/* ── Exam News Section ── */}
                        {examNews.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <Newspaper className="w-4 h-4 text-sky-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Exam News</h3>
                              </div>
                              {examNews.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/exam-news/${item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0">
                                       <Newspaper className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400 truncate">{(item.type || '').replace('_', ' ')}{item.exam?.name ? ` · ${item.exam.name}` : item.examName ? ` · ${item.examName}` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {examNews.length > 4 && <button onClick={() => setActiveTab('examNews')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all exam news →</button>}
                           </div>
                        )}

                        {/* ── Current Affairs Section ── */}
                        {currentAffairs.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <Globe className="w-4 h-4 text-fuchsia-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Current Affairs</h3>
                              </div>
                              {currentAffairs.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/current-affairs/${item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shrink-0">
                                       <Globe className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                       <p className="text-xs text-slate-400 truncate">{item.category || ''}{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {currentAffairs.length > 4 && <button onClick={() => setActiveTab('currentAffair')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all current affairs →</button>}
                           </div>
                        )}

                        {/* ── Community Questions Section ── */}
                        {communityQuestions.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <MessageSquare className="w-4 h-4 text-lime-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Community Questions</h3>
                              </div>
                              {communityQuestions.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/community-questions/${item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-700 flex items-center justify-center shrink-0">
                                       <MessageSquare className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.question}</p>
                                       <p className="text-xs text-slate-400 truncate">{item.author?.name || item.author?.username || 'Anon'}{item.exam?.name ? ` · ${item.exam.name}` : ''}{item.answerCount ? ` · ${item.answerCount} answers` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {communityQuestions.length > 4 && <button onClick={() => setActiveTab('communityQuestion')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all community questions →</button>}
                           </div>
                        )}

                        {/* ── Mentors Section ── */}
                        {mentors.length > 0 && (
                           <div className="px-4">
                              <div className="flex items-center gap-1.5 mb-2">
                                 <Award className="w-4 h-4 text-yellow-500" />
                                 <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">Mentors</h3>
                              </div>
                              {mentors.slice(0, 4).map(item => (
                                 <div key={item._id} onClick={() => router.push(`/mentor/${item._id}`)}
                                    className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shrink-0">
                                       <Award className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.user?.name || item.user?.username || 'Mentor'}</p>
                                       <p className="text-xs text-slate-400 truncate">{(item.specialization || []).join(', ')}{item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ''}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                 </div>
                              ))}
                              {mentors.length > 4 && <button onClick={() => setActiveTab('mentor')} className="text-[11px] font-bold text-primary-600 dark:text-primary-400 px-1 py-2">See all mentors →</button>}
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
                        {searchReels.length === 0 && [...govtExams, ...govtExamCategories, ...examPatterns].length === 0 && practiceTests.length === 0 && quizzes.length === 0 && subjects.length === 0 && topics.length === 0 && hashtags.length === 0 && blogs.length === 0 && users.length === 0 && notes.length === 0 && dailyChallenges.length === 0 && revision.length === 0 && examNews.length === 0 && currentAffairs.length === 0 && communityQuestions.length === 0 && mentors.length === 0 && (
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
                                    {/* Quiz */}
                                    {item.type === 'quiz' && (
                                       <div onClick={() => router.push(`/quiz/${item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shrink-0"><BrainCircuit className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                             <p className="text-xs text-slate-400">
                                                {item.subject?.name || ''}{item.topic?.name ? ` · ${item.topic.name}` : ''} · {item.duration} min · {item.totalMarks} marks
                                             </p>
                                          </div>
                                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                                             <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">START</span>
                                             {item.totalAttempts > 0 && (
                                                <span className="text-[9px] text-slate-400">{formatCount(item.totalAttempts)} played</span>
                                             )}
                                          </div>
                                       </div>
                                    )}
                                    {/* Subject */}
                                    {item.type === 'subject' && (
                                       <div onClick={() => router.push(`/subjects/${item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0"><BookMarked className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                             <p className="text-xs text-slate-400">{item.exam?.name || 'General'}{item.description ? ` · ${item.description}` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Topic */}
                                    {item.type === 'topic' && (
                                       <div onClick={() => router.push(`/topics/${item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0"><Layers className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                                             <p className="text-xs text-slate-400">{item.subject?.name || ''}{item.exams?.length ? ` · ${item.exams.map(e => e.name).join(', ')}` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Hashtag */}
                                    {item.type === 'hashtag' && (
                                       <div onClick={() => { setQuery(item.tag); fetchData(item.tag, 1); }} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0"><Hash className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white">#{item.tag}</p>
                                             <p className="text-xs text-slate-400">{item.count} question{item.count !== 1 ? 's' : ''}</p>
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
                                    {/* Note */}
                                    {item.type === 'note' && (
                                       <div onClick={() => router.push(`/notes/${item.slug || item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0"><StickyNote className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                             <p className="text-xs text-slate-400 truncate">{(item.noteType || '').replace('_', ' ')}{item.subject?.name ? ` · ${item.subject.name}` : ''}{item.exam?.name ? ` · ${item.exam.name}` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Daily Challenge */}
                                    {item.type === 'dailyChallenge' && (
                                       <div onClick={() => router.push(`/daily-challenge`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shrink-0"><Target className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                             <p className="text-xs text-slate-400 truncate">{item.date ? new Date(item.date).toLocaleDateString() : ''}{item.totalMarks ? ` · ${item.totalMarks} marks` : ''}{item.exam?.name ? ` · ${item.exam.name}` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Revision */}
                                    {item.type === 'revision' && (
                                       <div onClick={() => router.push(`/revision`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center shrink-0"><RotateCcw className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.questionSnapshot?.questionText || item.sourceTitle || 'Revision item'}</p>
                                             <p className="text-xs text-slate-400 truncate">{(item.source || '').replace('_', ' ')}{item.totalReviews ? ` · ${item.totalReviews} reviews` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Exam News */}
                                    {item.type === 'examNews' && (
                                       <div onClick={() => router.push(`/exam-news/${item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shrink-0"><Newspaper className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                             <p className="text-xs text-slate-400 truncate">{(item.type || '').replace('_', ' ')}{item.exam?.name ? ` · ${item.exam.name}` : item.examName ? ` · ${item.examName}` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Current Affair */}
                                    {item.type === 'currentAffair' && (
                                       <div onClick={() => router.push(`/current-affairs/${item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-700 flex items-center justify-center shrink-0"><Globe className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</p>
                                             <p className="text-xs text-slate-400 truncate">{item.category || ''}{item.date ? ` · ${new Date(item.date).toLocaleDateString()}` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Community Question */}
                                    {item.type === 'communityQuestion' && (
                                       <div onClick={() => router.push(`/community-questions/${item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-lime-500 to-green-700 flex items-center justify-center shrink-0"><MessageSquare className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.question}</p>
                                             <p className="text-xs text-slate-400 truncate">{item.author?.name || item.author?.username || 'Anon'}{item.exam?.name ? ` · ${item.exam.name}` : ''}{item.answerCount ? ` · ${item.answerCount} answers` : ''}</p>
                                          </div>
                                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                                       </div>
                                    )}
                                    {/* Mentor */}
                                    {item.type === 'mentor' && (
                                       <div onClick={() => router.push(`/mentor/${item._id}`)} className="flex items-center gap-3 px-1 py-2.5 rounded-xl cursor-pointer active:bg-slate-100 dark:active:bg-slate-800 transition-colors">
                                          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shrink-0"><Award className="w-5 h-5 text-white" /></div>
                                          <div className="min-w-0 flex-1">
                                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.user?.name || item.user?.username || 'Mentor'}</p>
                                             <p className="text-xs text-slate-400 truncate">{(item.specialization || []).join(', ')}{item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ''}{item.helpedStudents ? ` · ${item.helpedStudents} helped` : ''}</p>
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
