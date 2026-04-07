'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Sidebar from '../../Sidebar';
import CustomEditor from '../../CustomEditor';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, LayoutGrid, List, Table as TableIcon,
  Search as SearchIcon, ChevronRight, Eye, Heart, StickyNote, Star,
  ShieldCheck, Trash2, Edit3, CheckCircle2, Ban, Archive, MoreVertical,
  ArrowRight, Users, TrendingUp, BarChart3, Database, Globe, Info, Clock, Bell, Layers,
  Binary, Activity, Box, Boxes, Zap, Cpu, X, Upload, Image as ImageIcon, Link as LinkIcon,
  Settings, Key, Save, AlertCircle, Sparkles
} from 'lucide-react';
import { safeLocalStorage } from '../../../lib/utils/storage';

const AdminArticleForm = () => {
  const router = useRouter();
  const { id } = router.query;
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: '',
    featuredImage: '',
    featuredImageAlt: '',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
    isPinned: false,
    status: 'draft',
    rewardTier: ''
  });

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const user = (() => {
    const raw = safeLocalStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  })();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const generateSlug = (title) => {
    return (title || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  useEffect(() => {
    fetchCategories();
  }, []);



  const fetchCategories = async () => {
    try {
      // Fetch all categories without pagination limit
      const response = await API.getAdminCategories({ limit: 100, page: 1 });
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback: try without params
      try {
        const fallbackResponse = await API.getAdminCategories();
        setCategories(fallbackResponse.categories || []);
      } catch (fallbackErr) {
        console.error('Error fetching categories (fallback):', fallbackErr);
        setCategories([]);
      }
    }
  };



  const fetchArticle = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.getAdminArticle(id);
      const article = response.article;

      // Truncate metaDescription to 160 characters if it exceeds the limit
      const metaDescription = article.metaDescription || '';
      const truncatedMetaDescription = metaDescription.length > 160
        ? metaDescription.substring(0, 160).trim()
        : metaDescription;

      setFormData({
        title: article.title || '',
        content: article.content || '',
        excerpt: article.excerpt || '',
        category: article.category?._id || '',
        tags: article.tags?.join(', ') || '',
        featuredImage: article.featuredImage || '',
        featuredImageAlt: article.featuredImageAlt || '',
        metaTitle: article.metaTitle || '',
        metaDescription: truncatedMetaDescription,
        isFeatured: article.isFeatured || false,
        isPinned: article.isPinned || false,
        status: article.status || 'draft',
        rewardTier: article.rewardTier || ''
      });
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Could not load the article. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      fetchArticle();
    }
  }, [isEdit, fetchArticle]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content: content
    }));
  };

  // Helper function to check if content is empty (only whitespace or empty tags)
  const isContentEmpty = (content) => {
    if (!content) return true;
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent === '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setFormData(prev => ({
      ...prev,
      featuredImageFile: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate content
    if (isContentEmpty(formData.content)) {
      setError('Please write the article body before saving.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Truncate metaDescription to 160 characters if it exceeds the limit
      const truncatedMetaDescription = formData.metaDescription
        ? formData.metaDescription.substring(0, 160).trim()
        : '';

      const articleData = {
        ...formData,
        slug: generateSlug(formData.title),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        metaDescription: truncatedMetaDescription,
        // Only include rewardTier if status is approved
        rewardTier: formData.status === 'approved' ? formData.rewardTier : undefined
      };

      // Validate reward tier when approving
      if (formData.status === 'approved' && !formData.rewardTier) {
        setError('Please choose a payment amount before approving the article.');
        setLoading(false);
        return;
      }
      // Keep file separate from URL field to avoid conflicts
      if (formData.featuredImageFile) {
        articleData.featuredImageFile = formData.featuredImageFile;
      }

      if (isEdit) {
        await API.updateArticle(id, articleData);
      } else {
        await API.createArticle(articleData);
      }

      router.push('/admin/articles');
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err.message || 'Could not save the article. Please check your entries and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <AdminMobileAppWrapper title={isEdit ? "Edit Article" : "Create Article"}>
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && <Sidebar />}
          <div className="adminContent p-4 w-full text-gray-900 dark:text-white ">
            <div className="flex flex-col items-center justify-center py-24 space-y-3 lg:space-y-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <Database className="w-10 h-10 absolute inset-0 m-auto text-indigo-500 animate-pulse" />
              </div>
              <div className="text-center text-slate-400 font-black uppercase tracking-widest text-sm">Loading article details...</div>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title={isEdit ? "Edit Article" : "Create Article"}>
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && <Sidebar />}
        <div className="adminContent p-4 w-full text-gray-900 dark:text-white font-outfit ">
          {/* Article Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-4 lg:mb-12"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent blur-3xl -z-10 rounded-full" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="p-2 bg-indigo-500/20 text-indigo-500 rounded-lg">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/80">
                    {isEdit ? 'Editing Article' : 'New Article'}
                  </span>
                </motion.div>
                <h1 className="text-2xl lg:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                  {isEdit ? 'Edit' : 'Create'} <span className="text-indigo-500">Article</span>
                </h1>
                <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {isEdit ? 'Make changes to this article and save when ready.' : 'Write and publish a new article for students to read and learn from.'}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/admin/articles">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 lg:px-8 py-4 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 transition-all flex items-center gap-3"
                  >
                    <X className="w-4 h-4" /> Go Back
                  </motion.button>
                </Link>
                <motion.button
                  onClick={handleSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={loading}
                  className="px-4 lg:px-10 py-5 bg-indigo-500 text-white rounded-lg lg:rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 flex items-center justify-center gap-3 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                  {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isEdit ? 'Save Changes' : 'Publish Article'}
                </motion.button>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-8">
              {/* Left Column: Core Content */}
              <div className="lg:col-span-2 space-y-4 lg:space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] p-4 lg:p-10 border-4 border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-4 lg:mb-8">
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Title and Body</h3>
                  </div>

                  <div className="space-y-4 lg:space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-indigo-500 pl-3">Article Title (required)</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-3xl text-sm font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-300 shadow-inner"
                      />
                      {formData.title && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 bg-indigo-500/5 rounded-2xl border-2 border-dashed border-indigo-500/20"
                        >
                          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                            <LinkIcon className="w-3 h-3" /> URL Preview: <span className="text-slate-500 font-bold">/articles/{generateSlug(formData.title)}</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-emerald-500 pl-3">Article Body (required)</label>
                      <div className="border-4 border-slate-100 dark:border-white/5 rounded-xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-950">
                        <CustomEditor
                          value={formData.content}
                          onChange={handleContentChange}
                          placeholder="Start writing your article here..."
                          minHeight="500px"
                          toolbarButtons="all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-blue-500 pl-3">Short Summary (shown in article previews)</label>
                      <textarea
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        rows={3}
                        placeholder="A 1-2 sentence overview that appears on listing pages..."
                        className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500/30 rounded-3xl text-xs font-bold outline-none transition-all placeholder:text-slate-300 shadow-inner resize-none"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Media & SEO Settings */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] p-4 lg:p-10 border-4 border-slate-100 dark:border-white/5 shadow-2xl"
                >
                  <div className="flex items-center gap-4 mb-4 lg:mb-8">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                      <Globe className="w-6 h-6" />
                    </div>
                    <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cover Image & Search Settings</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-3 lg:space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-indigo-500 pl-3">Cover Image</label>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <label className="flex-1 cursor-pointer">
                              <div className="px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                                <Upload className="w-4 h-4 group-hover:animate-bounce" /> Upload from device
                              </div>
                              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                          </div>
                          <div className="relative">
                            <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="url"
                              name="featuredImage"
                              value={formData.featuredImage}
                              onChange={handleChange}
                              placeholder="Or paste an image URL here..."
                              className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-[10px] font-black outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-indigo-500 pl-3">Image Description (for accessibility)</label>
                        <input
                          type="text"
                          name="featuredImageAlt"
                          value={formData.featuredImageAlt}
                          onChange={handleChange}
                          placeholder="Briefly describe what the image shows..."
                          className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-[10px] font-black outline-none transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 lg:space-y-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-emerald-500 pl-3">Search Engine Title</label>
                        <div className="relative">
                          <input
                            type="text"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            maxLength={60}
                            placeholder="Title shown in Google results (max 60 chars)..."
                            className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl text-[10px] font-black outline-none transition-all shadow-inner"
                          />
                          <div className="absolute right-4 bottom-2 text-[8px] font-black text-slate-300">{formData.metaTitle.length}/60</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-emerald-500 pl-3">Search Engine Description</label>
                        <div className="relative">
                          <textarea
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            maxLength={160}
                            rows={4}
                            placeholder="Summary shown below the title in Google results (max 160 chars)..."
                            className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl text-[10px] font-black outline-none transition-all shadow-inner resize-none"
                          />
                          <div className="absolute right-4 bottom-2 text-[8px] font-black text-slate-300">{formData.metaDescription.length}/160</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Configuration & Settings */}
              <div className="space-y-4 lg:space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] p-4 lg:p-10 border-4 border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-4 lg:mb-8">
                    <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                      <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Publishing Options</h3>
                  </div>

                  <div className="space-y-4 lg:space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-blue-500 pl-3">Category (required)</label>
                      <div className="relative">
                        <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500/30 rounded-2xl text-xs font-black uppercase outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Choose a category...</option>
                          {categories.map(category => (
                            <option key={category._id} value={category._id}>{category.name.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-indigo-500 pl-3">Tags (comma separated)</label>
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleChange}
                          placeholder="e.g. physics, exam tips, class 10..."
                          className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-xs font-black outline-none transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-emerald-500 pl-3">Publication Status</label>
                      <div className="relative">
                        <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl text-xs font-black uppercase outline-none transition-all appearance-none cursor-pointer"
                        >
                           <option value="draft">DRAFT - Not yet submitted</option>
                           <option value="pending">PENDING - Awaiting review</option>
                           <option value="approved">APPROVED - Ready to go live</option>
                           <option value="published">PUBLISHED - Visible to readers</option>
                           <option value="rejected">REJECTED - Needs revision</option>
                           <option value="archived">ARCHIVED - Hidden from readers</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-slate-100 dark:border-white/5">
                      <motion.div
                        onClick={() => handleChange({ target: { name: 'isFeatured', type: 'checkbox', checked: !formData.isFeatured } })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${formData.isFeatured ? 'bg-indigo-500 border-indigo-600' : 'bg-slate-50 dark:bg-white/5 border-transparent'}`}
                      >
                        <Star className={`w-5 h-5 ${formData.isFeatured ? 'text-white fill-current' : 'text-slate-400'}`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${formData.isFeatured ? 'text-white' : 'text-slate-400'}`}>Featured on Homepage</span>
                      </motion.div>
                      <motion.div
                        onClick={() => handleChange({ target: { name: 'isPinned', type: 'checkbox', checked: !formData.isPinned } })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${formData.isPinned ? 'bg-indigo-500 border-indigo-600' : 'bg-slate-50 dark:bg-white/5 border-transparent'}`}
                      >
                        <ArrowRight className={`w-5 h-5 rotate-[-45deg] ${formData.isPinned ? 'text-white' : 'text-slate-400'}`} />
                        <span className={`text-[8px] font-black uppercase tracking-widest ${formData.isPinned ? 'text-white' : 'text-slate-400'}`}>Pinned to Top</span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Reward Tier Selection */}
                <AnimatePresence>
                  {(formData.status === 'pending' || formData.status === 'approved') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] p-4 lg:p-10 border-4 border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 mb-4 lg:mb-8">
                        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                          <Zap className="w-6 h-6" />
                        </div>
                        <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Author Payment</h3>
                      </div>

                      <div className="space-y-4">
                        {['normal', 'good', 'high'].map((tier) => (
                          <motion.div
                            key={tier}
                            onClick={() => handleChange({ target: { name: 'rewardTier', value: tier } })}
                            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between group ${formData.rewardTier === tier
                              ? tier === 'normal' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                                : tier === 'good' ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                                  : 'bg-indigo-500/10 border-indigo-500 text-indigo-500'
                              : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:border-slate-200'
                              }`}
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                                {tier === 'normal' ? 'Standard' : tier === 'good' ? 'Good Quality' : 'Outstanding'}
                              </span>
                              <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">
                                {tier === 'normal' ? 'Meets basic guidelines' : tier === 'good' ? 'Well-written and informative' : 'Exceptional depth and quality'}
                              </span>
                            </div>
                            <span className="text-xl lg:text-2xl font-black tracking-tighter">
                              ₹{tier === 'normal' ? '5' : tier === 'good' ? '10' : '15'}
                            </span>
                            {formData.rewardTier === tier && (
                              <div className={`absolute -right-2 -top-2 p-1.5 rounded-full shadow-lg border-2 border-white dark:border-slate-900 ${tier === 'normal' ? 'bg-emerald-500' : tier === 'good' ? 'bg-blue-500' : 'bg-indigo-500'
                                }`}>
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {formData.status === 'approved' && !formData.rewardTier && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-6 p-4 bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl flex items-center gap-3"
                        >
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Please choose a payment amount before approving this article</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-rose-500/10 border-2 border-rose-500/20 rounded-3xl p-6 flex items-center gap-4 shadow-xl"
                >
                  <div className="p-3 bg-rose-500 text-white rounded-2xl">
                    <Ban className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Something went wrong</h4>
                    <p className="text-xs font-bold text-rose-500/70 uppercase">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminArticleForm;


