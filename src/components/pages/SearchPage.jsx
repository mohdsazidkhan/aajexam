'use client';

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Head from "next/head";
import {
   Search,
   BookOpen,
   Trophy,
   FileText,
   User,
   Layers,
   Compass,
   Sparkles,
   History,
   Zap,
   Clock,
   Eye,
   ShieldCheck,
   ChevronLeft,
   ChevronRight,
   Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from "next/image";

import API from '../../lib/api';
import TestStartModal from "../TestStartModal";
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import Card from '../ui/Card';
import Button from '../ui/Button';

const SearchPage = () => {
   const router = useRouter();
   const searchParams = useSearchParams();
   const [query, setQuery] = useState("");
   const [quizzes, setQuizzes] = useState([]);
   const [categories, setCategories] = useState([]);
   const [subcategories, setSubcategories] = useState([]);
   const [blogs, setBlogs] = useState([]);
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

   const limit = 12;

   const fetchData = useCallback(async (searchQuery, pageNum = currentPage) => {
      if (isSearchingRef.current) return;
      const trimmedQuery = searchQuery?.trim();
      if (!trimmedQuery) {
         clearResults();
         return;
      }
      try {
         isSearchingRef.current = true;
         setLoading(true);
         const res = await API.searchAll({ query: trimmedQuery, page: pageNum, limit });
         if (res.success) {
            setQuizzes(res.quizzes || []);
            setCategories(res.categories || []);
            setSubcategories(res.subcategories || []);
            setBlogs(res.blogs || []);
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
      setQuizzes([]); setCategories([]); setSubcategories([]); setBlogs([]); setUsers([]);
      setGovtExamCategories([]); setGovtExams([]); setExamPatterns([]); setPracticeTests([]);
      setTotalPages(1);
   };

   const handleSearch = (e) => {
      e.preventDefault();
      if (loading || isSearchingRef.current) return;
      setCurrentPage(1);
      hasInitialSearchedRef.current = true;
      fetchData(query, 1);
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
      { key: 'all', label: 'All Results', icon: Compass },
      { key: 'quiz', label: 'Quizzes', icon: Trophy },
      { key: 'exam', label: 'Govt Exams', icon: ShieldCheck },
      { key: 'test', label: 'Practice Tests', icon: FileText },
      { key: 'category', label: 'Categories', icon: Layers },
      { key: 'blog', label: 'Articles', icon: BookOpen },
      { key: 'user', label: 'Students', icon: User }
   ];

   const getFilteredResults = () => {
      switch (activeTab) {
         case 'all': return [...categories, ...subcategories, ...quizzes, ...blogs, ...users, ...govtExamCategories, ...govtExams, ...examPatterns, ...practiceTests];
         case 'quiz': return quizzes;
         case 'exam': return [...govtExams, ...govtExamCategories];
         case 'test': return practiceTests;
         case 'category': return [...categories, ...subcategories];
         case 'blog': return blogs;
         case 'user': return users;
         default: return [];
      }
   };

   const results = getFilteredResults();

   return (
      <div className="min-h-screen bg-background-page animate-fade-in selection:bg-primary-500 selection:text-white">
         <Head>
            <title>Search | AajExam</title>
         </Head>

         <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-6 lg:space-y-12">

            {/* --- Search Bar Section --- */}
            <section className="relative text-center space-y-6 lg:space-y-8">
               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit tracking-tight leading-none px-4">Search <span className="text-primary-600">anything</span></h1>
                  <p className="text-sm lg:text-base font-semibold text-content-secondary max-w-2xl mx-auto px-6">Type to find quizzes, topics, exams, and articles.</p>
               </div>

               <Card className="max-w-3xl mx-auto p-1.5 lg:p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-none shadow-2xl rounded-2xl lg:rounded-[3rem] mx-4 lg:mx-auto">
                  <form onSubmit={handleSearch} className="flex items-center gap-2">
                     <div className="flex-1 relative group">
                        <Search className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-5 h-5 lg:w-6 lg:h-6 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                        <input
                           type="text"
                           className="w-full bg-transparent border-none focus:ring-0 py-4 lg:py-6 pl-12 lg:pl-16 pr-4 lg:pr-6 text-base lg:text-xl font-bold placeholder:text-slate-300 outline-none"
                           placeholder="Search quizzes, topics, exams, or articles..."
                           value={query}
                           onChange={(e) => {
                              setQuery(e.target.value);
                              if (!e.target.value.trim()) clearResults();
                           }}
                        />
                     </div>
                     <button className="bg-primary-500 hover:bg-primary-600 px-6 lg:px-10 rounded-xl lg:rounded-[2rem] py-3.5 lg:py-5 text-sm font-black text-white shadow-duo-primary transition-all" type="submit" disabled={loading}>
                        {loading ? '...' : (
                           <>
                              <span className="hidden lg:inline">Search now</span>
                              <Search className="lg:hidden w-5 h-5" />
                           </>
                        )}
                     </button>
                  </form>
               </Card>

               <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 px-4 lg:justify-center pb-2">
                  {['UPSC', 'SSC', 'Current Affairs', 'Practice Test', 'Quiz', 'Tech', 'AI'].map((tag, i) => (
                     <button key={i} onClick={() => { setQuery(tag); fetchData(tag, 1); }} className="flex-shrink-0 whitespace-nowrap px-5 py-2 bg-background-surface-secondary hover:bg-primary-500/10 hover:text-primary-600 rounded-full text-sm font-semibold transition-all">
                        {tag}
                     </button>
                  ))}
               </div>
            </section>

            {/* --- Tab Navigation --- */}
            <section className="sticky top-0 z-40 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md py-4 border-b border-border-primary !mt-0">
               <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar px-4 -mx-4 lg:px-0 lg:mx-0">
                  {tabs.map(tab => (
                     <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-3 px-2 lg:px-4 py-2 lg:py-4 rounded-xl lg:rounded-2xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-primary-500 text-white shadow-duo-primary scale-105' : 'bg-background-surface text-content-secondary hover:text-primary-600 hover:bg-primary-50'}`}
                     >
                        <tab.icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${activeTab === tab.key ? 'text-white' : 'text-primary-500'}`} />
                        {tab.label}
                     </button>
                  ))}
               </div>
            </section>

            {/* --- Search Results --- */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="py-8 flex justify-center"><Loading size="lg" /></div>
               ) : results.length === 0 && !query ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-12">
                     <div className="space-y-4 max-w-lg mx-auto">
                        <h3 className="text-xl lg:text-3xl xl:text-5xl font-black font-outfit uppercase tracking-tighter leading-none italic text-primary-600">What do you want <br />to study today?</h3>
                        <p className="text-sm lg:text-base font-bold text-content-secondary px-6">Search for a topic you want to practice and get started.</p>
                     </div>
                     <div className="flex flex-wrap justify-center gap-4 opacity-70">
                        <span className="flex items-center gap-2 text-xs font-black uppercase text-primary-600 bg-primary-100 dark:bg-primary-900/30 px-4 py-2 rounded-full"><Zap className="w-3 h-3" /> Quick access</span>
                        <span className="flex items-center gap-2 text-xs font-black uppercase text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full"><Trophy className="w-3 h-3" /> Top Quizzes</span>
                     </div>
                  </motion.div>
               ) : results.length === 0 && query ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-8">
                     <div className="w-20 lg:w-32 h-20 lg:h-32 bg-background-surface-secondary rounded-full flex items-center justify-center mx-auto opacity-50">
                        <History className="w-16 h-16 text-slate-300" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit">Nothing found</h3>
                        <p className="text-sm font-medium text-content-secondary">We could not find results for "{query}". Try a different word.</p>
                     </div>
                     <Button variant="ghost" onClick={() => { setQuery(""); clearResults(); }} className="text-sm font-semibold">Clear search</Button>
                  </motion.div>
               ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-8">
                     {results.map((item, idx) => (
                        <motion.div key={item._id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (idx % 12) * 0.05 }}>

                           {item.type === 'quiz' && (
                              <Card className="p-6 h-full flex flex-col justify-between group border-2 border-primary-500/10 hover:border-primary-500/30 transition-all overflow-hidden relative rounded-[3rem]">
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                       <div className="p-3 bg-primary-500/10 text-primary-600 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all">
                                          <Trophy className="w-5 h-5" />
                                       </div>
                                       <div className="text-xs font-semibold text-content-secondary bg-background-surface-secondary px-3 py-1 rounded-full">Quiz</div>
                                    </div>
                                    <h3 className="text-lg font-black font-outfit leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">{item.title}</h3>
                                    <p className="text-sm font-medium text-content-secondary">{item.category?.name || 'Education'}</p>
                                 </div>
                                 <Button variant="secondary" fullWidth className="mt-6 py-4 text-sm font-black shadow-duo-secondary rounded-2xl" onClick={() => { setSelectedQuiz(item); setShowQuizModal(true); }}>Start quiz</Button>
                                 <Zap className="absolute -bottom-6 -right-6 w-24 h-24 text-primary-600/5 group-hover:text-primary-600/10 transition-colors pointer-events-none" />
                              </Card>
                           )}

                           {item.type === 'test' && (
                              <Card className="p-6 h-full flex flex-col justify-between group border-2 border-primary-500/10 hover:border-primary-500/30 transition-all rounded-[3rem]">
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                       <div className="p-3 bg-primary-500/10 text-primary-600 rounded-2xl group-hover:bg-primary-500 group-hover:text-white transition-all">
                                          <FileText className="w-5 h-5" />
                                       </div>
                                       <div className="text-xs font-semibold text-white bg-primary-500 px-3 py-1 rounded-full shadow-sm">Practice test</div>
                                    </div>
                                    <h3 className="text-lg font-black font-outfit leading-tight group-hover:text-primary-600 transition-colors line-clamp-2">{item.title}</h3>
                                    <div className="flex gap-4">
                                       <span className="text-sm font-medium text-content-secondary"><Clock className="w-3 h-3 inline mr-1" /> {item.duration} min</span>
                                       <span className="text-sm font-medium text-content-secondary"><Sparkles className="w-3 h-3 inline mr-1" /> {item.totalMarks} marks</span>
                                    </div>
                                 </div>
                                 <Button variant="primary" fullWidth className="mt-6 py-4 text-sm font-black shadow-duo-primary rounded-2xl" onClick={() => { setSelectedTest(item); setShowTestModal(true); }}>Start test</Button>
                              </Card>
                           )}

                           {item.type === 'exam' && (
                              <Card className="p-6 h-full group flex flex-col justify-between border-2 border-blue-500/10 hover:border-blue-500/30 transition-all cursor-pointer rounded-[3rem]" onClick={() => router.push(`/govt-exams/exam/${item._id}`)}>
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                       <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                          <ShieldCheck className="w-5 h-5" />
                                       </div>
                                       <div className="text-xs font-semibold text-content-secondary bg-background-surface-secondary px-3 py-1 rounded-full">Exam</div>
                                    </div>
                                    <h3 className="text-lg font-black font-outfit leading-tight group-hover:text-blue-500 transition-colors line-clamp-2">{item.name}</h3>
                                    <p className="text-sm font-medium text-content-secondary">{item.category?.name || 'Government exams'} Ã‚Â· {item.testsCount || 0} tests</p>
                                 </div>
                                 <div className="flex items-center gap-2 text-blue-500 pt-6">
                                    <span className="text-sm font-semibold">View details</span>
                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                 </div>
                              </Card>
                           )}

                           {item.type === 'blog' && (
                              <Card className="h-full overflow-hidden flex flex-col group border-2 border-border-primary hover:border-indigo-500/30 transition-all cursor-pointer rounded-[3rem]" onClick={() => router.push(`/articles/${item.slug || item._id}`)}>
                                 <div className="h-40 overflow-hidden relative">
                                    <Image
                                       src={item.featuredImage || "/default_banner.png"}
                                       alt={item.title}
                                       fill
                                       className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 px-3 py-1 bg-indigo-500 text-white text-xs font-semibold rounded-full z-10">Article</div>
                                 </div>
                                 <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                    <h3 className="text-base font-black font-outfit leading-tight group-hover:text-indigo-500 transition-colors line-clamp-2">{item.title}</h3>
                                    <div className="flex items-center justify-between text-sm font-medium text-content-secondary">
                                       <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {item.views || 0}</span>
                                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.readingTime || 5} min read</span>
                                    </div>
                                 </div>
                              </Card>
                           )}

                           {(item.type === 'category' || item.type === 'subcategory') && (
                              <Card className="p-6 h-full group flex flex-col justify-between border-2 border-border-primary hover:border-slate-300 transition-all cursor-pointer rounded-[3rem]" onClick={() => router.push(`/${item.type}/${item._id}`)}>
                                 <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                       <div className="p-3 bg-background-surface-secondary text-content-secondary rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                                          <Layers className="w-5 h-5" />
                                       </div>
                                       <div className="text-xs font-semibold text-content-secondary">{item.type === 'subcategory' ? 'Topic' : 'Category'}</div>
                                    </div>
                                    <h3 className="text-xl font-black font-outfit leading-tight group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.name}</h3>
                                    <p className="text-sm font-medium text-content-secondary line-clamp-2">{item.description || 'Explore this area to find more topics, quizzes, and study material.'}</p>
                                 </div>
                                 <div className="flex items-center gap-2 text-content-secondary pt-6">
                                    <span className="text-sm font-semibold">Open {item.type === 'subcategory' ? 'topic' : 'category'}</span>
                                    <ChevronRight className="w-3 h-3" />
                                 </div>
                              </Card>
                           )}

                           {item.type === 'user' && (
                              <Card className="p-6 h-full flex flex-col justify-between group border-2 border-border-primary hover:border-pink-500/30 transition-all cursor-pointer rounded-[3rem]" onClick={() => item.username && router.push(`/u/${item.username}`)}>
                                 <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center text-white font-black text-2xl shadow-duo-secondary group-hover:scale-110 transition-transform">
                                       {(item.name || item.username || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                       <h3 className="text-lg font-black font-outfit truncate">{item.name || item.username}</h3>
                                       <p className="text-sm font-medium text-content-secondary">Student</p>
                                    </div>
                                 </div>
                                 <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl mt-6 border border-border-primary">
                                    <p className="text-sm font-medium text-content-secondary flex items-center gap-2"><Users className="w-3 h-3" /> {item.followersCount || 0} followers</p>
                                 </div>
                              </Card>
                           )}

                        </motion.div>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* --- Pagination --- */}
            {totalPages > 1 && (
               <section className="flex flex-col lg:flex-row justify-center items-center gap-6 py-12 px-4">
                  <Button
                     variant="ghost"
                     disabled={currentPage === 1 || loading}
                     onClick={() => { setCurrentPage(c => c - 1); fetchData(query, currentPage - 1); }}
                     className="w-full lg:w-auto px-8 py-4 rounded-xl lg:rounded-2xl bg-background-surface text-sm font-semibold shadow-sm border-b-4 border-border-primary active:border-b-0 transition-all font-outfit"
                  >
                     <ChevronLeft className="mr-2 w-5 h-5" /> Previous
                  </Button>

                  <div className="flex gap-2 items-center overflow-x-auto max-w-full pb-2 lg:pb-0 no-scrollbar">
                     {Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        const isVisible = Math.abs(currentPage - pageNum) <= 1 || pageNum === 1 || pageNum === totalPages;

                        if (!isVisible) {
                           if (pageNum === 2 || pageNum === totalPages - 1) return <span key={pageNum} className="text-slate-400">...</span>;
                           return null;
                        }

                        return (
                           <button
                              key={pageNum}
                              onClick={() => { setCurrentPage(pageNum); fetchData(query, pageNum); }}
                              className={`w-12 h-12 flex-shrink-0 rounded-xl lg:rounded-2xl text-xs font-black transition-all ${currentPage === pageNum ? 'bg-primary-500 text-white shadow-duo-primary scale-110' : 'bg-background-surface text-content-secondary border-2 border-border-primary'}`}
                           >
                              {pageNum}
                           </button>
                        );
                     })}
                  </div>

                  <Button
                     variant="ghost"
                     disabled={currentPage === totalPages || loading}
                     onClick={() => { setCurrentPage(c => c + 1); fetchData(query, currentPage + 1); }}
                     className="w-full lg:w-auto px-8 py-4 rounded-xl lg:rounded-2xl bg-background-surface text-sm font-semibold shadow-sm border-b-4 border-border-primary active:border-b-0 transition-all font-outfit"
                  >
                     Next <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
               </section>
            )}

            {/* --- Modals --- */}
            {showTestModal && selectedTest && <TestStartModal isOpen={showTestModal} onClose={() => setShowTestModal(false)} onConfirm={() => { setShowTestModal(false); if (selectedTest) { localStorage.setItem('testNavigationData', JSON.stringify({ fromPage: 'search', searchQuery: query, testData: selectedTest })); router.push(`/govt-exams/test/${selectedTest._id}/start`); } }} test={selectedTest} pattern={selectedTest.examPattern} exam={selectedTest.examPattern?.exam} category={selectedTest.examPattern?.exam?.category} />}
         </div>

         <UnifiedFooter />
      </div>
   );
};

export default SearchPage;


