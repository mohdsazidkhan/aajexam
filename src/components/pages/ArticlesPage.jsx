'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
   Book,
   Search,
   LayoutGrid,
   List,
   Star,
   Pin,
   Clock,
   Eye,
   ThumbsUp,
   ChevronRight,
   Layers,
   Sparkles,
   TrendingUp,
   Target,
   BarChart3,
   ArrowRight,
   Filter,
   Zap,
   BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from "react-redux";

import API from "../../lib/api";
import useDebounce from "../../hooks/useDebounce";
import UnifiedFooter from "../UnifiedFooter";
import Sidebar from "../Sidebar";
import Loading from "../Loading";
import { safeLocalStorage } from "../../lib/utils/storage";
import Card from '../ui/Card';
import Button from '../ui/Button';

const ArticlesPage = () => {
   const router = useRouter();
   const [articles, setArticles] = useState([]);
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [filters, setFilters] = useState({ search: "", category: "", featured: false });
   const debouncedSearch = useDebounce(filters.search, 500);
   const [pagination, setPagination] = useState({});
   const currentPage = parseInt(router.query.page || '1', 10);
   const [viewMode, setViewMode] = useState('grid');

   const user = JSON.parse(safeLocalStorage.getItem("userInfo") || "null");
   const isOpen = useSelector((state) => state.sidebar.isOpen);

   const fetchArticles = useCallback(async () => {
      setLoading(true);
      try {
         const params = {
            page: currentPage,
            limit: 9,
            search: debouncedSearch,
            category: filters.category,
            featured: filters.featured,
         };
         const response = await API.getPublishedArticles(params);
         if (response.success && response.data) {
            setArticles(response.data.articles || []);
            setPagination(response.data.pagination || {});
         }
      } catch (err) {
         setError("Failed to load articles");
      }
      finally { setLoading(false); }
   }, [currentPage, debouncedSearch, filters.category, filters.featured]);

   const fetchCategories = async () => {
      try {
         const response = await API.getPublicCategories();
         setCategories(response.data || []);
      } catch (err) {
         console.error('Failed to load categories');
      }
   };

   useEffect(() => {
      fetchArticles();
      fetchCategories();
   }, [fetchArticles]);

   const handleFilterChange = (name, value) => {
      setFilters(prev => ({ ...prev, [name]: value }));
      router.push({ pathname: '/articles', query: { ...router.query, page: undefined } }, undefined, { shallow: true });
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-IN", {
         year: "numeric", month: "short", day: "numeric"
      });
   };

   return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 selection:bg-primary-500 selection:text-white ${isOpen ? "pl-0 lg:pl-64" : ""}`}>
         {user && user.role === "admin" && <Sidebar />}

         <div className="container mx-auto px-2 lg:px-6 py-4 lg:py-12 max-w-7xl animate-fade-in space-y-6 lg:space-y-12 font-outfit">

            {/* --- Header Section --- */}
            <header className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
               <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-24 h-24 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-primary-500/10">
                  <BookOpen className="w-12 h-12" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-xl lg:text-5xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Learning <span className="text-primary-700 dark:text-primary-500">Center</span></h1>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em] max-w-2xl mx-auto px-4">Read helpful articles and study guides to improve your knowledge.</p>
               </div>
            </header>

            {/* --- Search Section --- */}
            <section className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 bg-white dark:bg-slate-800/80 backdrop-blur-xl p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl relative z-20">
               <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                  <input
                     type="text"
                     placeholder="Search articles..."
                     className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-5 pl-14 pr-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-300 placeholder:font-bold"
                     value={filters.search}
                     onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
               </div>

               <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-x-auto flex-nowrap scroll-smooth no-scrollbar">
                     {categories.slice(0, 3).map(cat => (
                        <button
                           key={cat._id}
                           onClick={() => handleFilterChange('category', filters.category === cat._id ? '' : cat._id)}
                           className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${filters.category === cat._id ? 'bg-primary-500 text-white shadow-duo-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm'}`}
                        >
                           {cat.name}
                        </button>
                     ))}
                     <select
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none px-4 text-slate-600 dark:text-slate-400 cursor-pointer font-outfit shrink-0"
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                     >
                        <option value="">+ ALL CATEGORIES</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                     </select>
                  </div>

                  <button
                     onClick={() => handleFilterChange('featured', !filters.featured)}
                     className={`p-4 rounded-2xl transition-all border-2 ${filters.featured ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 shadow-duo-amber' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                     <Star className={`w-5 h-5 ${filters.featured ? 'fill-current' : ''}`} />
                  </button>

                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 ml-auto flex-nowrap shrink-0">
                     <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        <LayoutGrid className="w-5 h-5" />
                     </button>
                     <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                        <List className="w-5 h-5" />
                     </button>
                  </div>
               </div>
            </section>

            {/* --- Article Feed --- */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="py-24 flex justify-center"><Loading size="lg" /></div>
               ) : articles.length === 0 ? (
                  <div className="py-32 text-center space-y-8">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-slate-200 dark:border-slate-700">
                        <Layers className="w-12 h-12 text-slate-300" />
                     </div>
                     <div className="space-y-4">
                        <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight">No Articles Found</h3>
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed px-4">We couldn't find any articles matching your search. Try using different keywords.</p>
                     </div>
                     <Button variant="primary" onClick={() => setFilters({ search: "", category: "", featured: false })} className="rounded-full px-10 py-5 text-xs font-black shadow-duo-primary uppercase tracking-widest font-outfit">RESET FILTERS</Button>
                  </div>
               ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8" : "space-y-4 lg:space-y-8"}>
                     {articles.map((article, idx) => (
                        <Link key={article._id} href={`/articles/${article.slug}`}>
                           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                              <Card className={`group relative overflow-hidden transition-all duration-500 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 rounded-[2rem] lg:rounded-[3rem] ${viewMode === 'list' ? 'flex flex-col lg:flex-row' : 'flex flex-col'}`}>
                                 <div className={`${viewMode === 'list' ? 'lg:w-1/3' : 'w-full'} h-64 overflow-hidden relative`}>
                                    <img
                                       src={article.featuredImage || "/default_banner.png"}
                                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-[3rem]"
                                       alt={article.title}
                                       onError={(e) => { e.target.src = "/default_banner.png"; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                                    <div className="absolute top-4 left-6 flex gap-2">
                                       {article.isFeatured && (
                                          <div className="p-2 bg-amber-500 text-white rounded-lg shadow-duo-amber transform -rotate-12 group-hover:rotate-0 transition-transform">
                                             <Star className="w-4 h-4 fill-current" />
                                          </div>
                                       )}
                                       {article.isPinned && (
                                          <div className="p-2 bg-primary-500 text-white rounded-lg shadow-duo-secondary transform rotate-12 group-hover:rotate-0 transition-transform">
                                             <Pin className="w-4 h-4 fill-current" />
                                          </div>
                                       )}
                                    </div>

                                    <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
                                       <p className="text-[10px] font-black text-white/80 uppercase tracking-widest font-outfit">{formatDate(article.publishedAt || article.createdAt)}</p>
                                       {article.category && (
                                          <span className="px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-widest">
                                             {article.category.name}
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 <div className="p-4 lg:p-8 flex-1 flex flex-col space-y-4">
                                    <div className="space-y-4">
                                       <h3 className="text-xl font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white group-hover:text-primary-700 dark:text-primary-500 transition-colors line-clamp-2">
                                          {article.title}
                                       </h3>
                                       <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-3 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                          "{article.excerpt || article.content?.substring(0, 150)}..."
                                       </p>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                       <div className="flex items-center gap-6">
                                          <div className="flex items-center gap-2">
                                             <Eye className="w-4 h-4 text-slate-300" />
                                             <span className="text-[10px] font-black font-outfit text-slate-600 dark:text-slate-400">{article.views || 0}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <Clock className="w-4 h-4 text-slate-300" />
                                             <span className="text-[10px] font-black font-outfit text-slate-600 dark:text-slate-400">{article.readingTime || 5}MIN READ</span>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-2 text-primary-700 dark:text-primary-500 group-hover:translate-x-2 transition-transform">
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em] font-outfit">READ MORE</span>
                                          <ArrowRight className="w-4 h-4" />
                                       </div>
                                    </div>
                                 </div>
                                 <Sparkles className="absolute -bottom-12 -left-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
                              </Card>
                           </motion.div>
                        </Link>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* --- Pagination --- */}
            {pagination.totalPages > 1 && (
               <nav className="flex flex-col lg:flex-row items-center justify-between p-8 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl gap-6">
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest font-outfit">
                     PAGE {pagination.page} OF {pagination.totalPages} | {pagination.total} TOTAL ARTICLES
                  </p>
                  <div className="flex items-center gap-2">
                     <Button
                        variant="ghost"
                        disabled={!pagination.hasPrev}
                        onClick={() => router.push({ pathname: '/articles', query: { ...router.query, page: Math.max(currentPage - 1, 1) } }, undefined, { shallow: true })}
                        className="w-12 h-12 rounded-2xl p-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 border-none hover:bg-slate-200 dark:hover:bg-slate-800"
                     >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                     </Button>

                     {[...Array(pagination.totalPages)].map((_, i) => {
                        const p = i + 1;
                        if (p > currentPage + 2 || p < currentPage - 2) return null;
                        return (
                           <button
                              key={p}
                              onClick={() => router.push({ pathname: '/articles', query: { ...router.query, page: p } }, undefined, { shallow: true })}
                              className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all font-outfit ${currentPage === p ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'}`}
                           >
                              {p}
                           </button>
                        );
                     })}

                     <Button
                        variant="ghost"
                        disabled={!pagination.hasNext}
                        onClick={() => router.push({ pathname: '/articles', query: { ...router.query, page: Math.min(currentPage + 1, pagination.totalPages) } }, undefined, { shallow: true })}
                        className="w-12 h-12 rounded-2xl p-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 border-none hover:bg-slate-200 dark:hover:bg-slate-800"
                     >
                        <ChevronRight className="w-5 h-5" />
                     </Button>
                  </div>
               </nav>
            )}

         </div>
         <UnifiedFooter />
      </div>
   );
};

export default ArticlesPage;


