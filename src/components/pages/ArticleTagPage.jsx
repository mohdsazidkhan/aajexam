'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import {
   ArrowLeft,
   Hash,
   Zap,
   Layers,
   Eye,
   Heart,
   Sparkles,
   ChevronRight,
   BookOpen,
   Search,
   Database,
   ArrowRight,
   ShieldCheck,
   Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import UnifiedFooter from '../UnifiedFooter';
import API from '../../lib/api';
import Loading from '../Loading';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PAGE_LIMIT = 12;

const ArticleTagPage = () => {
   const router = useRouter();
   const { tagName } = router.query;
   const [articles, setArticles] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);

   const fetchArticles = useCallback(async (pageNum) => {
      if (!tagName) return;
      setLoading(true);
      try {
         const res = await API.getArticlesByTag(tagName, { page: pageNum, limit: PAGE_LIMIT });
         const payload = res.data || res;
         const list = payload.articles || (payload.data && payload.data.articles) || payload.items || payload.results || payload || [];
         setArticles(list);

         const pagination = payload.pagination || (payload.data && payload.data.pagination) || null;
         setTotalPages(pagination?.totalPages || payload.totalPages || 1);
      } catch (e) {
         setError('Failed to load articles');
         setArticles([]);
      } finally { setLoading(false); }
   }, [tagName]);

   useEffect(() => {
      if (tagName) {
         setPage(1);
         fetchArticles(1);
      }
   }, [tagName, fetchArticles]);

   useEffect(() => {
      if (tagName && page > 1) fetchArticles(page);
   }, [page, tagName, fetchArticles]);

   const seoTitle = tagName ? `#${tagName?.toUpperCase()} Articles` : 'Tagged Articles';
   const seoDescription = tagName ? `View all articles tagged with #${tagName?.toUpperCase()} on AajExam.` : 'Explore articles by tag on AajExam.';

   return (
      <>
         <Head>
            <title>{seoTitle} - AajExam Platform</title>
            <meta name="description" content={seoDescription} />
         </Head>

         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white font-outfit">
            <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-12">

               {/* --- Header Section --- */}
               <header className="relative flex flex-col lg:flex-row items-center justify-between gap-8 pt-8 px-4">
                  <div className="space-y-4 text-center lg:text-left">
                     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-500/10 text-primary-700 dark:text-primary-500 text-[10px] font-black uppercase tracking-widest border-2 border-primary-500/10">
                        <Hash className="w-3 h-3" /> TAG FILTER ACTIVE
                     </motion.div>
                     <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                        #{tagName?.toUpperCase() || 'Knowledge'} <span className="text-primary-700 dark:text-primary-500">Articles</span>
                     </h1>
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] max-w-2xl px-4 lg:px-0">
                        Showing all articles associated with the "{tagName}" tag.
                     </p>
                  </div>

                  <div className="flex gap-4">
                     <Button variant="ghost" onClick={() => router.push('/articles')} className="px-8 py-5 rounded-[2rem] bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900">
                        <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO ARTICLES
                     </Button>
                  </div>
               </header>

               {/* --- Article List --- */}
               <AnimatePresence mode="wait">
                  {loading ? (
                     <div className="py-24 flex justify-center"><Loading size="lg" /></div>
                  ) : articles.length === 0 ? (
                     <div className="py-32 text-center space-y-8">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-slate-200 dark:border-slate-700">
                           <Layers className="w-12 h-12 text-slate-300" />
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">No Articles Found</h3>
                           <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed px-4">No articles found with this tag. Please explore other categories.</p>
                        </div>
                        <Button variant="secondary" onClick={() => router.push('/articles')} className="rounded-full px-10 py-5 text-xs font-black shadow-duo-secondary uppercase tracking-widest font-outfit">EXPLORE OTHER TAGS</Button>
                     </div>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {articles.map((a, idx) => (
                           <Link key={a._id} href={`/articles/${a.slug}`}>
                              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                                 <Card className="group relative overflow-hidden transition-all duration-500 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 flex flex-col h-full rounded-[3rem] bg-white dark:bg-slate-800/50">
                                    <div className="h-64 overflow-hidden relative">
                                       <img
                                          src={a.featuredImage || "/default_banner.png"}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-[3rem]"
                                          alt={a.title}
                                          onError={(e) => { e.target.src = "/default_banner.png"; }}
                                       />
                                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                                       <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center">
                                          <div className="px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[8px] font-black uppercase tracking-widest">
                                             TAGGED: {tagName?.toUpperCase()}
                                          </div>
                                          <p className="text-[8px] font-black text-white/60 uppercase tracking-widest">{new Date(a.createdAt).toLocaleDateString()}</p>
                                       </div>
                                    </div>

                                    <div className="p-4 lg:p-8 flex-1 flex flex-col space-y-4">
                                       <div className="space-y-4">
                                          <h3 className="text-xl font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white group-hover:text-primary-700 dark:text-primary-500 transition-colors line-clamp-2">
                                             {a.title}
                                          </h3>
                                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-3 italic opacity-80 group-hover:opacity-100 transition-opacity">
                                             "{a.excerpt || a.content?.substring(0, 150)}..."
                                          </p>
                                       </div>

                                       <div className="mt-auto pt-6 border-t-2 border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                          <div className="flex items-center gap-6">
                                             <div className="flex items-center gap-2">
                                                <Eye className="w-4 h-4 text-slate-300" />
                                                <span className="text-[10px] font-black font-outfit text-slate-600 dark:text-slate-400">{a.views || 0}</span>
                                             </div>
                                             <div className="flex items-center gap-2">
                                                <Zap className="w-4 h-4 text-slate-300" />
                                                <span className="text-[10px] font-black font-outfit text-slate-600 dark:text-slate-400">PUBLISHED</span>
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
               {totalPages > 1 && (
                  <nav className="flex flex-col lg:flex-row items-center justify-between p-8 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-xl gap-6">
                     <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest font-outfit">
                        PAGE {page} OF {totalPages}
                     </p>
                     <div className="flex items-center gap-2">
                        {[...Array(totalPages)].map((_, i) => {
                           const p = i + 1;
                           return (
                              <button
                                 key={p}
                                 onClick={() => setPage(p)}
                                 className={`w-12 h-12 rounded-2xl text-[10px] font-black transition-all font-outfit ${page === p ? 'bg-primary-500 text-white shadow-duo-secondary' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-slate-100 dark:border-slate-800'}`}
                              >
                                 {p}
                              </button>
                           );
                        })}
                     </div>
                  </nav>
               )}

            </div>
            <UnifiedFooter />
         </div>
      </>
   );
};

export default ArticleTagPage;


