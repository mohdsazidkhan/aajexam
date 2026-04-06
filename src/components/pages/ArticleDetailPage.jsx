'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
   ArrowLeft,
   Share2,
   Heart,
   Eye,
   Clock,
   Calendar,
   User,
   ChevronRight,
   BookOpen,
   MessageCircle,
   Facebook,
   Twitter,
   Linkedin,
   Send,
   ExternalLink,
   Target,
   ShieldCheck,
   Zap,
   Sparkles,
   Layers,
   BarChart3,
   Sticker
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { FaWhatsapp, FaTelegramPlane, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

import API from '../../lib/api';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import { safeLocalStorage } from '../../lib/utils/storage';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ArticleDetailPage = ({ article: initialArticle, slug: initialSlug }) => {
   const router = useRouter();
   const [article, setArticle] = useState(initialArticle);
   const [relatedArticles, setRelatedArticles] = useState([]);
   const [loading, setLoading] = useState(false);
   const [user, setUser] = useState(null);
   const [error, setError] = useState(null);
   const [liked, setLiked] = useState(false);
   const viewIncrementedRef = useRef(false);

   const isOpen = useSelector((state) => state.sidebar.isOpen);

   useEffect(() => {
      const storedUser = safeLocalStorage.getItem("userInfo");
      if (storedUser) setUser(JSON.parse(storedUser));

      if (initialArticle) {
         if (initialArticle?._id && !viewIncrementedRef.current) {
            viewIncrementedRef.current = true;
            try {
               API.incrementArticleViews(initialArticle._id).catch(() => { });
               setArticle(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : prev);
            } catch (e) { }
         }
         if (initialArticle.category) fetchRelatedArticles(initialArticle.category._id);
      }
   }, [initialArticle]);

   const fetchRelatedArticles = async (categoryId) => {
      try {
         const response = await API.getArticlesByCategory(categoryId, { limit: 4 });
         setRelatedArticles(response.data.articles || []);
      } catch (err) {
         console.error('Related articles not found');
      }
   };

   const handleLike = async () => {
      if (!article || liked) return;
      try {
         await API.incrementArticleLikes(article._id);
         setLiked(true);
         setArticle(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      } catch (err) {
         console.error('Failed to like article');
      }
   };

   const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
   const shareText = article?.metaTitle || article?.title || 'Article Detail';
   const encodedUrl = encodeURIComponent(pageUrl);
   const encodedText = encodeURIComponent(shareText);

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-IN', {
         year: 'numeric', month: 'long', day: 'numeric'
      });
   };

   if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loading size="lg" /></div>;

   if (error || !article) {
      return (
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 font-outfit">
            <Card className="p-12 text-center space-y-8 max-w-md border-2 border-slate-100 dark:border-slate-800 shadow-2xl rounded-[3rem] bg-white dark:bg-slate-800/80">
               <div className="w-24 h-24 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border-2 border-primary-500/10">
                  <Sticker className="w-12 h-12" />
               </div>
               <div className="space-y-3">
                  <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Article Not Found</h3>
                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed px-4">This article is no longer available or is being updated. Please try again later.</p>
               </div>
               <Button variant="primary" onClick={() => router.push('/articles')} className="w-full py-5 rounded-full text-xs font-black shadow-duo-primary uppercase font-outfit">VIEW ALL ARTICLES</Button>
            </Card>
         </div>
      );
   }

   return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white ${isOpen ? "pl-0 lg:pl-64" : ""}`}>

         {/* --- Header Section --- */}
         <section className="relative h-[100vh] lg:h-[80vh] w-full overflow-hidden">
            <motion.img
               initial={{ scale: 1.2, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 1.2 }}
               src={article.featuredImage || '/default_banner.png'}
               className="w-full h-full object-cover"
               alt={article.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end">
               <div className="container mx-auto px-3 lg:px-6 pb-12 lg:pb-20 max-w-5xl space-y-5 lg:space-y-8">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4">
                     {article.category && (
                        <div className="px-6 py-2 rounded-full bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-duo-primary border-2 border-primary-400">
                           {article.category.name}
                        </div>
                     )}
                     <div className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                        {article.readingTime || 5} MIN READ
                     </div>
                     {article.isFeatured && (
                        <div className="px-6 py-2 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest shadow-duo-amber flex items-center gap-2 border-2 border-amber-400">
                           <Sparkles className="w-3 h-3" /> FEATURED ARTICLE
                        </div>
                     )}
                  </motion.div>

                  <div className="space-y-6">
                     <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-xl md:text-2xl lg:text-4xl font-black font-outfit tracking-tight text-white leading-tight">
                        {article.title}
                     </motion.h1>
                     {article.excerpt && (
                        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-base lg:text-xl font-bold text-slate-300 italic max-w-3xl border-l-4 border-primary-500 pl-4 lg:pl-8">
                           "{article.excerpt}"
                        </motion.p>
                     )}
                  </div>

                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex items-center gap-8 pt-6">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black font-outfit scale-110">
                           {article.author?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AUTHOR</p>
                           <p className="text-lg font-black text-white uppercase">{article.author?.name || 'Anonymous'}</p>
                        </div>
                     </div>
                     <div className="h-10 w-px bg-white/10 hidden lg:block" />
                     <div className="hidden lg:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PUBLISHED</p>
                        <p className="text-lg font-black text-white uppercase">{formatDate(article.publishedAt || article.createdAt)}</p>
                     </div>
                  </motion.div>
               </div>
            </div>

            <Link href="/articles" className="absolute top-2 lg:top-8 left-8 p-2 lg:p-5 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all z-20 group">
               <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </Link>
         </section>

         {/* --- Article Content --- */}
         <main className="container mx-auto px-2 lg:px-6 -mt-6 lg:-mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 relative z-20 font-outfit">

            <div className="lg:col-span-8 space-y-6 lg:space-y-12">
               <Card className="p-5 lg:p-20 border-none shadow-2xl bg-white dark:bg-slate-800/80 backdrop-blur-xl relative overflow-hidden group rounded-[2rem] lg:rounded-[4rem]">
                  <article className="prose prose-2xl max-w-none dark:prose-invert font-medium">
                     <div
                        className="text-slate-700 dark:text-slate-100 leading-[1.8] font-outfit tracking-tight"
                        dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }}
                     />
                  </article>

                  <div className="mt-10 lg:mt-20 pt-6 lg:pt-12 border-t-2 border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                     <div className="flex items-center gap-4">
                        <button
                           onClick={handleLike}
                           disabled={liked}
                           className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${liked ? 'bg-primary-500 text-white shadow-duo-primary' : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:scale-105 border-2 border-slate-200 dark:border-slate-800'}`}
                        >
                           <Heart className={`w-4 h-4 ${liked ? 'fill-current text-white' : ''}`} />
                           {liked ? 'ADDED TO FAVORITES' : 'LIKE THIS'}
                        </button>
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl gap-2 border-2 border-slate-200 dark:border-slate-800">
                           <a href={`https://wa.me/?text=${encodedText}%0A${encodedUrl}`} target="_blank" className="p-3 bg-white dark:bg-slate-800 text-emerald-500 rounded-xl hover:scale-110 transition-transform shadow-sm"><FaWhatsapp className="w-5 h-5" /></a>
                           <a href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`} target="_blank" className="p-3 bg-white dark:bg-slate-800 text-sky-500 rounded-xl hover:scale-110 transition-transform shadow-sm"><FaTelegramPlane className="w-5 h-5" /></a>
                           <a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" className="p-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl hover:scale-110 transition-transform shadow-sm"><FaTwitter className="w-5 h-5" /></a>
                        </div>
                     </div>

                     {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                           {article.tags.slice(0, 4).map((tag, i) => (
                              <Link key={i} href={`/articles/tag/${encodeURIComponent(tag)}`} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:text-primary-700 dark:text-primary-500 transition-colors border-2 border-slate-200 dark:border-slate-800">
                                 #{tag}
                              </Link>
                           ))}
                        </div>
                     )}
                  </div>
                  <Sparkles className="absolute -top-24 -left-24 w-64 h-64 text-primary-700 dark:text-primary-500/5 pointer-events-none" />
               </Card>

               {/* Related Articles Section */}
               {relatedArticles.filter(a => a._id !== article._id).length > 0 && (
                  <section className="space-y-5 lg:space-y-8">
                     <div className="flex items-center gap-4">
                        <div className="p-3 lg:p-4 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[1.5rem] border-2 border-primary-500/10">
                           <Layers className="w-5 h-5 lg:w-6 lg:h-6" />
                        </div>
                        <h2 className="text-xl lg:text-3xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Related <span className="text-primary-700 dark:text-primary-500">Articles</span></h2>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-8">
                        {relatedArticles.filter(a => a._id !== article._id).slice(0, 2).map((a, i) => (
                           <Link key={a._id} href={`/articles/${a.slug}`}>
                              <Card className="p-4 lg:p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/40 transition-all flex gap-4 lg:gap-6 rounded-[2rem] lg:rounded-[3rem] group bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-xl active:translate-y-1">
                                 <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-[2rem] overflow-hidden flex-shrink-0 border-2 border-slate-100 dark:border-slate-700 relative">
                                    <img src={a.featuredImage || '/default_banner.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Related" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </div>
                                 <div className="flex-1 flex flex-col justify-center space-y-3">
                                    <p className="text-[8px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest">{a.category?.name || 'EDUCATION'}</p>
                                    <h4 className="text-base lg:text-lg font-black font-outfit uppercase line-clamp-2 leading-tight text-slate-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-500 transition-colors">{a.title}</h4>
                                    <div className="flex items-center gap-4 text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest font-outfit">
                                       <span className="flex items-center gap-1.5"><Eye className="w-3 h-3" /> {a.views || 0}</span>
                                       <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {a.readingTime || 5}MIN READ</span>
                                    </div>
                                 </div>
                              </Card>
                           </Link>
                        ))}
                     </div>
                  </section>
               )}
            </div>

            {/* Right Sidebar */}
            <aside className="lg:col-span-4 space-y-8">
               <Card className="p-5 lg:p-10 bg-slate-900 border-none shadow-2xl text-white sticky top-8 space-y-6 lg:space-y-10 rounded-[2rem] lg:rounded-[3rem] overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-primary-500 rounded-xl shadow-duo-primary">
                        <Zap className="w-5 h-5 text-white" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black font-outfit uppercase tracking-tight">Article Stats</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time stats</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-6 bg-slate-800/80 rounded-[2rem] border border-slate-700 space-y-1 hover:border-primary-500/50 transition-colors">
                        <Eye className="w-5 h-5 text-slate-400 mb-2" />
                        <p className="text-xl lg:text-2xl font-black font-outfit text-primary-400 leading-none">{article.views || 0}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOTAL VIEWS</p>
                     </div>
                     <div className="p-6 bg-slate-800/80 rounded-[2rem] border border-slate-700 space-y-1 hover:border-primary-500/50 transition-colors">
                        <Heart className="w-5 h-5 text-slate-400 mb-2" />
                        <p className="text-xl lg:text-2xl font-black font-outfit text-primary-400 leading-none">{article.likes || 0}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOTAL LIKES</p>
                     </div>
                  </div>

                  <div className="space-y-4 py-5 border-t border-slate-800">
                     <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Navigation</h5>
                     <div className="space-y-4">
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => router.push('/articles')}>
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all"><Layers className="w-5 h-5" /></div>
                              <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary-400 transition-colors">Browse All Articles</p>
                           </div>
                           <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                        {article.category && (
                           <div className="flex items-center justify-between group cursor-pointer" onClick={() => router.push(`/articles/category/${article.category._id}`)}>
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary-500 group-hover:text-white transition-all"><Target className="w-5 h-5" /></div>
                                 <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary-400 transition-colors">Category: {article.category.name}</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                           </div>
                        )}
                     </div>
                  </div>

                  <Button variant="primary" className="w-full py-5 rounded-2xl text-xs font-black shadow-duo-primary uppercase font-outfit" onClick={() => router.push('/home')}>BACK TO HOME</Button>
                  <Sparkles className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 text-white/5 pointer-events-none" />
               </Card>

               {/* Author Profile */}
               <Card className="p-8 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] text-center space-y-6 shadow-xl">
                  <div className="w-20 h-20 bg-primary-500 text-white rounded-[2rem] flex items-center justify-center mx-auto text-xl lg:text-3xl font-black font-outfit shadow-duo-primary border-4 border-white dark:border-slate-700">
                     {article.author?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="space-y-1 mt-2">
                     <h4 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">{article.author?.name || 'Anonymous Author'}</h4>
                     <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest px-8">Verified Contributor</p>
                  </div>
                  <div className="flex justify-center gap-4 pt-2">
                     <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-500 transition-colors border border-slate-100 dark:border-slate-800"><User className="w-5 h-5" /></div>
                     <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary-500 transition-colors border border-slate-100 dark:border-slate-800"><MessageCircle className="w-5 h-5" /></div>
                  </div>
               </Card>
            </aside>
         </main>

         <UnifiedFooter />
      </div>
   );
};

export default ArticleDetailPage;


