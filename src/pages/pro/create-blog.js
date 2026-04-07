'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import {
   ArrowLeft,
   Image as ImageIcon,
   X,
   Upload,
   Book,
   PenTool,
   Zap,
   ShieldCheck,
   Target,
   Sparkles,
   Save,
   Send,
   Globe,
   FileText,
   Layers,
   BarChart3,
   Calendar,
   Type,
   Trash2,
   CircleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import CustomEditor from '../../components/CustomEditor';
import Loading from '../../components/Loading';
import { getCurrentUser } from '../../lib/utils/authUtils';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const CreateBlogPage = () => {
   const router = useRouter();
   const [formData, setFormData] = useState({
      title: '', content: '', excerpt: '', category: '', tags: '',
      featuredImageFile: null, featuredImage: '', metaTitle: '', metaDescription: ''
   });
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(false);
   const [submitting, setSubmitting] = useState(false);
   const [previewImage, setPreviewImage] = useState(null);
   const [user, setUser] = useState(null);
   const [isDragging, setIsDragging] = useState(false);
   const [isEditMode, setIsEditMode] = useState(false);
   const [blogId, setBlogId] = useState(null);
   const [blogCount, setBlogCount] = useState({ currentCount: 0, limit: 10, remaining: 10, canAddMore: true });
   const [loadingBlog, setLoadingBlog] = useState(false);

   const fetchStats = useCallback(async () => {
      try {
         const response = await API.getCurrentMonthBlogCount();
         if (response.success && response.data) setBlogCount(response.data);
      } catch (e) { console.error('Limit check offline'); }
   }, []);

   const fetchBlogForEdit = useCallback(async (id) => {
      try {
         setLoadingBlog(true);
         const response = await API.getMyBlog(id);
         if (response?.success && response.data) {
            const blog = response.data;
            if (blog.status !== 'pending') {
               toast.error('Protocol Lock: Only pending blogs can be edited');
               router.push('/pro/my-blogs');
               return;
            }
            setFormData({
               title: blog.title || '', content: blog.content || '', excerpt: blog.excerpt || '',
               category: blog.category?._id || blog.category || '',
               tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
               featuredImageFile: null, featuredImage: blog.featuredImage || '',
               metaTitle: blog.metaTitle || '', metaDescription: blog.metaDescription || ''
            });
            if (blog.featuredImage) setPreviewImage(blog.featuredImage);
         }
      } catch (e) { router.push('/pro/my-blogs'); }
      finally { setLoadingBlog(false); }
   }, [router]);

   useEffect(() => {
      setUser(getCurrentUser());
      const fetchCats = async () => {
         try {
            const res = await API.getPublicCategories();
            setCategories(res.data || res.categories || res || []);
         } catch (e) { console.error('Categories offline'); }
      };
      fetchCats();

      if (typeof window !== 'undefined') {
         const urlParams = new URLSearchParams(window.location.search);
         const editId = urlParams.get('edit');
         if (editId) {
            setIsEditMode(true);
            setBlogId(editId);
            fetchBlogForEdit(editId);
         } else { fetchStats(); }
      }
   }, [fetchBlogForEdit, fetchStats]);

   const stripHtml = (html) => {
      if (!html) return '';
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: name === 'excerpt' ? stripHtml(value) : value }));
   };

   const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
         if (file.size > 5 * 1024 * 1024) return toast.error('Imprint too large (>5MB)');
         setFormData(prev => ({ ...prev, featuredImageFile: file }));
         const reader = new FileReader();
         reader.onloadend = () => setPreviewImage(reader.result);
         reader.readAsDataURL(file);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!isEditMode && !blogCount.canAddMore) return toast.error('Monthly Creation Quota Full');
      if (!formData.title.trim()) return toast.error('Protocol Incomplete: Missing Title');
      if (stripHtml(formData.content).length < 50) return toast.error('Insufficient Intel Density');

      setSubmitting(true);
      try {
         const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
         const payload = { ...formData, tags: tagsArray.length > 0 ? tagsArray : undefined };

         const res = isEditMode && blogId ? await API.updateBlog(blogId, payload) : await API.createBlog(payload);
         if (res.success) {
            toast.success(isEditMode ? 'Creation Updated' : 'Journal Broadcasted to Review Sector');
            router.push('/pro/my-blogs');
         }
      } catch (err) {
         toast.error(err?.response?.data?.message || 'Creation transmission failed');
      } finally { setSubmitting(false); }
   };

   const formProgress = () => {
      let completed = 0;
      if (formData.title.trim()) completed += 20;
      if (formData.category) completed += 20;
      if (stripHtml(formData.content).length > 200) completed += 40;
      if (previewImage) completed += 20;
      return completed;
   };

   if (loadingBlog) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Loading size="lg" /></div>;

   return (
      <MobileAppWrapper title={isEditMode ? 'Sync Journal' : 'Synthesize Journal'}>
         <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">

            <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-12">

               {/* --- Creation Hero --- */}
               <header className="relative flex flex-col lg:flex-row items-center justify-between gap-8 pt-8 text-center lg:text-left">
                  <div className="space-y-4">
                     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest border border-primary-500/20">
                        <PenTool className="w-3 h-3" /> INTEL Creation CONSOLE
                     </motion.div>
                     <h1 className="text-4xl lg:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black font-outfit uppercase tracking-tight leading-none">
                        Journal <span className="text-primary-500">{isEditMode ? 'Sync' : 'Creation'}</span>
                     </h1>
                     <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Architect knowledge units for the academy library</p>
                  </div>

                  <div className="flex gap-4">
                     <Button variant="ghost" onClick={() => router.back()} className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" /> DISCONTINUE
                     </Button>
                  </div>
               </header>

               {/* --- Quota Status Hub --- */}
               {!isEditMode && (
                  <Card className={`p-8 border-2 transition-all ${!blogCount.canAddMore ? 'bg-primary-500/5 border-primary-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 shadow-xl'}`}>
                     <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                           <div className={`p-5 rounded-2xl ${!blogCount.canAddMore ? 'bg-primary-500/10 text-primary-500' : 'bg-primary-500/10 text-primary-500'}`}>
                              <FileText className="w-8 h-8" />
                           </div>
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly Broadcast Quota</p>
                              <h3 className="text-xl lg:text-2xl font-black font-outfit uppercase">{blogCount.currentCount} / {blogCount.limit} TRANSMITTED</h3>
                           </div>
                        </div>
                        <div className="flex-1 w-full max-w-sm">
                           <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(blogCount.currentCount / blogCount.limit) * 100}%` }} className="h-full bg-primary-500" />
                           </div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-2 flex justify-between">
                              <span>{blogCount.remaining} SLOTS REMAINING</span>
                              <span>MAX {blogCount.limit} UNITS/MO</span>
                           </p>
                        </div>
                     </div>
                  </Card>
               )}

               {/* --- Main Creation Terminal --- */}
               <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-12">

                     {/* Featured Visual Imprint */}
                     <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-800 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                           <div className="p-3 bg-primary-500 rounded-xl text-white shadow-duo-secondary">
                              <ImageIcon className="w-5 h-5" />
                           </div>
                           <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Visual Imprint</h3>
                        </div>

                        {previewImage ? (
                           <div className="relative group">
                              <div className="relative h-96 rounded-[2.5rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                                 <img src={previewImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-[3rem]" alt="Preview" />
                                 <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button type="button" onClick={() => setPreviewImage(null)} className="p-6 bg-primary-500 text-white rounded-3xl shadow-duo-primary transform -translate-y-4 group-hover:translate-y-0 transition-all">
                                       <Trash2 className="w-8 h-8" />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        ) : (
                           <div
                              onDrop={(e) => { e.preventDefault(); handleImageChange({ target: { files: e.dataTransfer.files } }); }}
                              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                              onDragLeave={() => setIsDragging(false)}
                              className={`border-4 border-dashed rounded-[3rem] p-16 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-primary-500 bg-primary-500/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-primary-400'}`}
                           >
                              <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <div className="w-20 h-20 bg-primary-500/10 text-primary-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                                 <Upload className="w-10 h-10" />
                              </div>
                              <h4 className="text-xl font-black font-outfit uppercase tracking-tight">Sync Visual Frequency</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{isDragging ? 'DROP INTEL NOW' : 'DRAG DROP OR CLICK TO UPLOAD'}</p>
                           </div>
                        )}
                        <Sparkles className="absolute -top-12 -right-12 w-24 lg:w-48 h-24 lg:h-48 text-primary-500/5 pointer-events-none" />
                     </Card>

                     {/* Intel Core Unit */}
                     <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-800 space-y-8">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="p-3 bg-primary-500 rounded-xl text-white shadow-duo-primary">
                              <Type className="w-5 h-5" />
                           </div>
                           <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-slate-900 dark:text-white">Intel Blueprint</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TRANSMISSION TITLE</p>
                              <input
                                 type="text"
                                 name="title"
                                 value={formData.title}
                                 onChange={handleChange}
                                 className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 font-black uppercase tracking-widest placeholder:text-slate-300 focus:outline-none focus:border-primary-500 transition-all"
                                 placeholder="Synthesize title..."
                              />
                           </div>
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KNOWLEDGE SECTOR</p>
                              <select
                                 name="category"
                                 value={formData.category}
                                 onChange={handleChange}
                                 className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 font-black uppercase tracking-widest focus:outline-none focus:border-primary-500 transition-all appearance-none"
                              >
                                 <option value="">SELECT SECTOR</option>
                                 {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                              </select>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">INTEL Creation (CONTENT)</p>
                           <div className="border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-slate-50 dark:bg-transparent">
                              <CustomEditor value={formData.content} onChange={c => setFormData(p => ({ ...p, content: c }))} minHeight="500px" />
                           </div>
                        </div>
                     </Card>
                  </div>

                  {/* Sidebar: Synchronization Hub */}
                  <aside className="lg:col-span-4 space-y-8">
                     <Card className="p-8 bg-slate-900 text-white border-none shadow-2xl sticky top-8 space-y-10 overflow-hidden group">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-primary-500 rounded-xl text-white shadow-duo-secondary">
                              <Zap className="w-5 h-5" />
                           </div>
                           <div>
                              <h4 className="text-lg font-black font-outfit uppercase tracking-tight">Sync Status</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol validation matrix</p>
                           </div>
                        </div>

                        <div className="space-y-6">
                           <div className="flex items-end justify-between">
                              <p className="text-5xl font-black font-outfit text-primary-500 tabular-nums">{formProgress()}%</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 font-mono">STABILITY</p>
                           </div>
                           <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${formProgress()}%` }} className="h-full bg-gradient-to-r from-primary-600 to-primary-400 shadow-duo-secondary" />
                           </div>
                        </div>

                        <div className="space-y-8">
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target className="w-3 h-3" /> Journal Briefing</p>
                              <textarea
                                 name="excerpt"
                                 value={formData.excerpt}
                                 onChange={handleChange}
                                 rows={4}
                                 className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-xs font-black uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-primary-500 transition-all resize-none"
                                 placeholder="Synthesize brief summary..."
                              />
                           </div>

                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Globe className="w-3 h-3" /> SEO Expansion</p>
                              <div className="space-y-4">
                                 <input
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary-500 transition-all"
                                    placeholder="SEO NODE TITLE"
                                 />
                                 <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl p-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary-500 transition-all resize-none"
                                    rows={3}
                                    placeholder="SEO SIGNAL DESCRIPTION"
                                 />
                              </div>
                           </div>
                        </div>

                        <div className="pt-2">
                           <Button
                              variant="secondary"
                              size="lg"
                              disabled={submitting || formProgress() < 40}
                              onClick={handleSubmit}
                              className="w-full py-6 rounded-3xl text-sm font-black uppercase tracking-widest shadow-duo-secondary"
                           >
                              {submitting ? <Loading size="sm" color="white" /> : (
                                 <span className="flex items-center justify-center gap-3">
                                    <Send className="w-4 h-4" /> BROADCAST INTEL
                                 </span>
                              )}
                           </Button>
                           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.25em] text-center mt-6 italic">
                              * Intel subject to high-level verification before academy entry.
                           </p>
                        </div>
                        <Sparkles className="absolute -bottom-24 -right-24 w-64 h-64 text-primary-500/5 pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                     </Card>

                     {/* Tips Bento */}
                     <div className="p-8 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-[2.5rem] space-y-6">
                        <div className="flex items-center gap-3">
                           <ShieldCheck className="w-6 h-6 text-emerald-500" />
                           <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Scholar Guidelines</h5>
                        </div>
                        <ul className="space-y-4">
                           {[
                              'Incorporate high-yield academy keywords',
                              'High-resolution visual imprint required',
                              'Minimal 500 word Creation for Elite tier',
                              'Source verification tokens mandatory'
                           ].map((tip, i) => (
                              <li key={i} className="flex items-start gap-3">
                                 <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{tip}</p>
                              </li>
                           ))}
                        </ul>
                     </div>
                  </aside>
               </form>

            </div>
         </div>
      </MobileAppWrapper>
   );
};

export default CreateBlogPage;

