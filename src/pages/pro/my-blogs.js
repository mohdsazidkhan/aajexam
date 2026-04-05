'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import {
   Plus,
   Edit,
   History,
   Trash2,
   Grid,
   List,
   Table,
   Search,
   Filter,
   CircleCheck,
   Clock,
   CircleAlert,
   Globe,
   FileText,
   Sparkles,
   ArrowRight,
   Layers,
   BarChart3,
   Archive,
   ChevronRight,
   TrendingUp,
   Zap,
   LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { isMobile } from 'react-device-detect';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import ViewToggle from '../../components/ViewToggle';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/Loading';

const MyBlogsPage = () => {
   const router = useRouter();
   const [blogs, setBlogs] = useState([]);
   const [loading, setLoading] = useState(true);
   const [statusFilter, setStatusFilter] = useState('all');
   const [blogCount, setBlogCount] = useState({ currentCount: 0, limit: 10, remaining: 10, canAddMore: true });
   const [viewMode, setViewMode] = useState('grid');

   const fetchStats = useCallback(async () => {
      try {
         const response = await API.getCurrentMonthBlogCount();
         if (response.success && response.data) setBlogCount(response.data);
      } catch (e) { console.error('Limit check offline'); }
   }, []);

   const fetchBlogs = useCallback(async () => {
      setLoading(true);
      try {
         const params = statusFilter !== 'all' ? { status: statusFilter } : {};
         const response = await API.getMyBlogs(params);
         if (response.success) setBlogs(response.data || []);
      } catch (e) { toast.error('Archive synchronization failed'); }
      finally { setLoading(false); }
   }, [statusFilter]);

   useEffect(() => {
      fetchBlogs();
      fetchStats();
   }, [fetchBlogs, fetchStats]);

   const handleDeleteBlog = async (blogId, blogTitle) => {
      if (!window.confirm(`Permanently purge "${blogTitle}" from archive?`)) return;
      try {
         const res = await API.deleteBlog(blogId);
         if (res.success) {
            toast.success('Intel Purged');
            fetchBlogs();
         }
      } catch (e) { toast.error('Deletion protocol failed'); }
   };

   const getStatusToken = (status) => {
      const config = {
         pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock, label: 'PENDING REVIEW' },
         approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CircleCheck, label: 'VERIFIED' },
         rejected: { color: 'text-primary-500', bg: 'bg-primary-500/10', icon: CircleAlert, label: 'PURGED' },
         published: { color: 'text-primary-500', bg: 'bg-primary-500/10', icon: Globe, label: 'PUBLISHED' },
         default: { color: 'text-slate-400', bg: 'bg-slate-100', icon: FileText, label: 'DRAFT' }
      };
      const { color, bg, icon: Icon, label } = config[status] || config.default;
      return (
         <div className={`px-4 py-1.5 rounded-xl ${bg} ${color} flex items-center gap-2 text-[8px] font-black uppercase tracking-widest border border-current opacity-80`}>
            <Icon className="w-3 h-3" /> {label}
         </div>
      );
   };

   return (
      <MobileAppWrapper title="Personal Codex">
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">

            <div className="container mx-auto px-2 lg:px-6 py-4 max-w-7xl space-y-12">

               {/* --- Codex Hero --- */}
               <header className="relative flex flex-col lg:flex-row items-center justify-between gap-8 pt-8">
                  <div className="space-y-4 text-center lg:text-left">
                     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                        <Archive className="w-3 h-3" /> PERSONAL KNOWLEDGE ARCHIVE
                     </motion.div>
                     <h1 className="text-4xl lg:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-outfit uppercase tracking-tight leading-none text-slate-900 dark:text-white">
                        Personal <span className="text-primary-500">Codex</span>
                     </h1>
                     <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl">Manage your synchronized journal units and reward yields</p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                     <Button variant="ghost" onClick={() => router.push('/pro/blog-rewards-history')} className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <History className="w-4 h-4 mr-2" /> BOUNTY LOGS
                     </Button>
                     <Button variant="primary" onClick={() => router.push('/pro/create-blog')} className="px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-primary">
                        <Plus className="w-4 h-4 mr-2" /> NEW Creation
                     </Button>
                  </div>
               </header>

               {/* --- Quota Status Hub --- */}
               <Card className={`p-8 border-2 transition-all ${!blogCount.canAddMore ? 'bg-primary-500/5 border-primary-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 shadow-xl'}`}>
                  <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                     <div className="flex items-center gap-6">
                        <div className={`p-5 rounded-2xl ${!blogCount.canAddMore ? 'bg-primary-500/10 text-primary-500' : 'bg-primary-500/10 text-primary-500'}`}>
                           <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly Publication Quota</p>
                           <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase tracking-tighter text-slate-900 dark:text-white">
                              {blogCount.currentCount} / {blogCount.limit} UNITS COMPLETED
                           </h3>
                        </div>
                     </div>
                     <div className="flex-1 w-full max-w-md">
                        <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${(blogCount.currentCount / blogCount.limit) * 100}%` }} className="h-full bg-primary-500 shadow-duo-secondary" />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{blogCount.remaining} SLOTS AVAILABLE IN CURRENT SECTOR</p>
                           {!blogCount.canAddMore && <span className="px-3 py-1 bg-primary-500 text-white rounded-lg text-[8px] font-black uppercase shadow-duo-primary">QUOTA FULL</span>}
                        </div>
                     </div>
                  </div>
               </Card>

               {/* --- Inventory Matrix Hub --- */}
               <div className="space-y-8">
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                     <div className="flex flex-wrap gap-2">
                        {['all', 'pending', 'approved', 'rejected', 'published'].map(status => (
                           <button
                              key={status}
                              onClick={() => setStatusFilter(status)}
                              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-primary-500 text-white shadow-duo-primary' : 'text-slate-400 hover:text-slate-600'}`}
                           >
                              {status}
                           </button>
                        ))}
                     </div>

                     <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <button onClick={() => setViewMode('grid')} className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-500' : 'text-slate-400'}`}><LayoutGrid className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-500' : 'text-slate-400'}`}><List className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('table')} className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-500' : 'text-slate-400'}`}><Table className="w-5 h-5" /></button>
                     </div>
                  </div>

                  <AnimatePresence mode="wait">
                     {loading ? (
                        <div className="py-24 flex justify-center"><Loading size="lg" /></div>
                     ) : blogs.length === 0 ? (
                        <div className="py-32 text-center space-y-8">
                           <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                              <Layers className="w-12 h-12 text-slate-300" />
                           </div>
                           <div className="space-y-4">
                              <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">Archive Quadrant Empty</h3>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">No journal units detected in this sector. Initiating first Creation protocol is recommended.</p>
                              <Button variant="primary" onClick={() => router.push('/pro/create-blog')} className="px-10 py-5 rounded-full text-xs font-black shadow-duo-primary uppercase tracking-widest">START Creation</Button>
                           </div>
                        </div>
                     ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8" : viewMode === 'list' ? "space-y-6" : "overflow-x-auto"}>
                           {viewMode === 'table' ? (
                              <table className="w-full text-left border-separate border-spacing-y-4">
                                 <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <tr>
                                       <th className="px-8 py-4">Question</th>
                                       <th className="px-8 py-4">Status Matrix</th>
                                       <th className="px-8 py-4 text-center">Bounty Yield</th>
                                       <th className="px-8 py-4 text-right">Sync Protocol</th>
                                    </tr>
                                 </thead>
                                 <tbody>
                                    {blogs.map(blog => (
                                       <tr key={blog._id} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border-none">
                                          <td className="px-8 py-6 rounded-l-[2rem]">
                                             <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden flex-shrink-0 bg-slate-100">
                                                   <img src={blog.featuredImage || '/default_banner.png'} className="w-full h-full object-cover" alt="Blog" />
                                                </div>
                                                <div>
                                                   <p className="text-lg font-black font-outfit uppercase leading-tight text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{blog.title}</p>
                                                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">SECTOR: {blog.category?.name || 'ACADEMY'}</p>
                                                </div>
                                             </div>
                                          </td>
                                          <td className="px-8 py-6 uppercase">{getStatusToken(blog.status)}</td>
                                          <td className="px-8 py-6 text-center tabular-nums">
                                             {blog.rewardAmount ? (
                                                <div className="inline-flex items-center gap-2 text-emerald-500 font-black font-outfit text-xl">
                                                   <Zap className="w-5 h-5 fill-current" /> ₹{blog.rewardAmount}
                                                </div>
                                             ) : <span className="text-slate-300 font-black text-xs italic opacity-50 font-outfit">SCANNING...</span>}
                                          </td>
                                          <td className="px-8 py-6 text-right rounded-r-[2rem]">
                                             <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {blog.status === 'pending' && (
                                                   <>
                                                      <button onClick={() => router.push(`/pro/create-blog?edit=${blog._id}`)} className="p-4 bg-primary-500/10 text-primary-500 rounded-xl hover:bg-primary-500 hover:text-white transition-all"><Edit className="w-5 h-5" /></button>
                                                      <button onClick={() => handleDeleteBlog(blog._id, blog.title)} className="p-4 bg-primary-500/10 text-primary-500 rounded-xl hover:bg-primary-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                                                   </>
                                                )}
                                                <button onClick={() => router.push(`/articles/${blog.slug}`)} className="p-4 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-xl hover:text-primary-500"><ChevronRight className="w-5 h-5" /></button>
                                             </div>
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                              </table>
                           ) : blogs.map((blog, idx) => (
                              <motion.div key={blog._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                 <Card className={`group relative overflow-hidden transition-all duration-500 border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 ${viewMode === 'list' ? 'flex flex-col lg:flex-row p-6 items-center gap-8' : 'flex flex-col'}`}>
                                    <div className={`${viewMode === 'list' ? 'w-24 lg:w-48 h-24 lg:h-48 lg:w-56 lg:h-56' : 'h-64'} rounded-[2.5rem] overflow-hidden relative flex-shrink-0`}>
                                       <img src={blog.featuredImage || '/default_banner.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-[3rem]" alt="Blog" />
                                       <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                                       <div className="absolute top-4 left-6 flex gap-2">
                                          {getStatusToken(blog.status)}
                                       </div>
                                    </div>

                                    <div className={`p-8 flex-1 space-y-6 ${viewMode === 'list' ? 'py-2' : ''}`}>
                                       <div className="space-y-4">
                                          <h3 className="text-md md:text-xl lg:text-2xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-2">{blog.title}</h3>
                                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 italic">
                                             <Layers className="w-3 h-3" /> {blog.category?.name || 'ACADEMY ARCHIVE'}
                                          </p>
                                       </div>

                                       {blog.rewardAmount && (
                                          <div className="flex items-center gap-4 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 w-fit">
                                             <Zap className="w-5 h-5 text-emerald-500 fill-current" />
                                             <span className="text-lg font-black font-outfit text-emerald-500">BOUNTY: ₹{blog.rewardAmount}</span>
                                          </div>
                                       )}

                                       <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SYNCED {new Date(blog.createdAt).toLocaleDateString()}</p>
                                          <div className="flex items-center gap-3">
                                             {blog.status === 'pending' && (
                                                <div className="flex gap-2">
                                                   <button onClick={() => router.push(`/pro/create-blog?edit=${blog._id}`)} className="p-3 bg-primary-500/10 text-primary-500 rounded-xl hover:bg-primary-500 hover:text-white transition-all"><Edit className="w-4 h-4" /></button>
                                                   <button onClick={() => handleDeleteBlog(blog._id, blog.title)} className="p-3 bg-primary-500/10 text-primary-500 rounded-xl hover:bg-primary-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                             )}
                                             <button onClick={() => router.push(`/articles/${blog.slug}`)} className="flex items-center gap-2 text-primary-500 group-hover:translate-x-2 transition-transform">
                                                <span className="text-[10px] font-black uppercase tracking-widest">WIKI LINK</span>
                                                <ArrowRight className="w-4 h-4" />
                                             </button>
                                          </div>
                                       </div>
                                    </div>
                                    <Sparkles className="absolute -bottom-12 -left-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-500/5 pointer-events-none" />
                                 </Card>
                              </motion.div>
                           ))}
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>

            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default MyBlogsPage;

