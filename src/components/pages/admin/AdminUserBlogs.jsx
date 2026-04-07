'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Sidebar from '../../Sidebar';
import Loading from '../../Loading';
import { useSelector } from 'react-redux';
import ViewToggle from '../../ViewToggle';
import { isMobile } from 'react-device-detect';
import { safeLocalStorage } from '../../../lib/utils/storage';
import { toast } from 'react-toastify';
import { 
  FileText, Search, Filter, LayoutGrid, List, Eye, Heart, 
  Trash2, CheckCircle2, X, Clock, MessageSquare, 
  Settings, User, Layers, Sparkles, Zap, Award, ShieldCheck, Ban, ArrowRight, RotateCcw, Users, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';

const AdminUserBlogs = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    rewardTier: ''
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    rewardTier: ''
  });
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
      }
    } catch (e) { }
    return isMobile ? 'grid' : 'table';
  });

  // Ensure Grid on small screens after mount and on orientation change
  useEffect(() => {
    try {
      const enforceGridOnSmall = () => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          setViewMode('grid');
        }
      };
      enforceGridOnSmall();
      window.addEventListener('orientationchange', enforceGridOnSmall);
      return () => {
        window.removeEventListener('orientationchange', enforceGridOnSmall);
      };
    } catch (e) { }
  }, []);

  const user = (() => {
    const raw = safeLocalStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  })();
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [currentPage, filters]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 10,
        ...filters
      };

      const response = await API.getAdminUserBlogs(params);
      if (response?.success) {
        setBlogs(response.blogs || []);
        setPagination(response.pagination || {});
      } else {
        setError('Unable to load blogs. Please try again later.');
      }
    } catch (err) {
      console.error('Error fetching user blogs:', err);
      setError('Unable to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.getAdminCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const handleViewContent = (blog) => {
    setSelectedBlog(blog);
    setShowContentModal(true);
  };

  const handleStatusChange = (blog) => {
    setSelectedBlog(blog);
    setStatusFormData({
      status: blog.status || 'pending',
      rewardTier: blog.rewardTier || ''
    });
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedBlog) return;

    try {
      if (statusFormData.status === 'approved' && !statusFormData.rewardTier) {
        toast.error('Please select a reward tier when approving a blog');
        return;
      }

      const updateData = {
        status: statusFormData.status
      };

      if (statusFormData.status === 'approved') {
        updateData.rewardTier = statusFormData.rewardTier;
      } else {
        updateData.rewardTier = null;
      }

      const response = await API.updateArticle(selectedBlog._id, updateData);

      if (response?.success) {
        toast.success('Blog status updated successfully');
        setShowStatusModal(false);
        setSelectedBlog(null);
        setStatusFormData({ status: '', rewardTier: '' });
        fetchBlogs();
      } else {
        toast.error(response?.message || 'Failed to update blog status');
      }
    } catch (err) {
      console.error('Error updating blog status:', err);
      toast.error(err?.response?.data?.message || 'Failed to update blog status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this blog post? This action cannot be undone.')) {
      try {
        await API.deleteArticle(id);
        toast.success('Blog post deleted successfully');
        fetchBlogs();
      } catch (err) {
        console.error('Error deleting blog:', err);
        toast.error('Failed to delete blog post. Please try again.');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', text: 'In Review', icon: <Clock className="w-3 h-3" /> },
      approved: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', text: 'Approved', icon: <ShieldCheck className="w-3 h-3" /> },
      rejected: { color: 'bg-rose-500/10 text-rose-500 border-rose-500/20', text: 'Rejected', icon: <Ban className="w-3 h-3" /> },
      published: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', text: 'Published', icon: <Zap className="w-3 h-3" /> },
      draft: { color: 'bg-slate-500/10 text-slate-500 border-slate-500/20', text: 'Draft', icon: <FileText className="w-3 h-3" /> }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getRewardTierBadge = (tier) => {
    if (!tier) return null;
    const tierConfig = {
      normal: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', text: '₹5' },
      good: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', text: '₹10' },
      high: { color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', text: '₹15' }
    };
    const config = tierConfig[tier];
    if (!config) return null;
    return (
      <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${config.color} whitespace-nowrap flex items-center gap-1.5`}>
        <Award className="w-3 h-3" /> REWARD: {config.text}
      </span>
    );
  };

  const renderTableView = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden"
    >
      <div className="overflow-x-auto selection:bg-indigo-500/30">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">#</th>
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Blog</th>
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Views / Likes</th>
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-4 lg:px-8 py-3 lg:py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 dark:divide-white/5">
            {blogs.map((blog, index) => (
              <motion.tr
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={blog._id}
                className="group hover:bg-indigo-500/5 transition-all text-nowrap"
              >
                <td className="px-4 lg:px-8 py-3 lg:py-6 text-[10px] font-black text-slate-400 tabular-nums">
                  {((currentPage - 1) * 10) + index + 1}
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center gap-4">
                    <img
                      className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-white/10 group-hover:ring-indigo-500/50 transition-all shadow-lg"
                      src={blog.featuredImage || '/default_banner.png'}
                      alt={blog.title}
                    />
                    <div className="max-w-[250px]">
                      <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight line-clamp-1" title={blog.title}>
                        {blog.title}
                      </div>
                      <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 italic">Student Blog</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{blog.author?.name || 'Unknown User'}</div>
                  <div className="text-[9px] font-bold text-slate-400 tracking-widest">{blog.author?.email || 'No email'}</div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-lg text-[9px] font-black uppercase border border-slate-200 dark:border-white/5">
                    {blog.category?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center flex-wrap gap-2">
                    {getStatusBadge(blog.status)}
                    {getRewardTierBadge(blog.rewardTier)}
                    {blog.rewardCredited && (
                      <span className="p-1 px-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-500/5">
                        <Zap className="w-3 h-3 fill-current" /> REWARD PAID
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center gap-3 lg:gap-6 text-slate-400">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-[11px] font-black tabular-nums">{blog.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span className="text-[11px] font-black tabular-nums">{blog.likes || 0}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest whitespace-nowrap">
                    <div className="mb-1">{formatDate(blog.createdAt)}</div>
                    <div className="opacity-50 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(blog.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                </td>
                <td className="px-4 lg:px-8 py-3 lg:py-6">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => handleViewContent(blog)} className="p-2 hover:bg-indigo-500 hover:text-white rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleStatusChange(blog)} className="p-2 hover:bg-amber-500 hover:text-white rounded-lg transition-colors"><Settings className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(blog._id)} className="p-2 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <img
              src={blog.featuredImage || '/default_banner.png'}
              alt={blog.title}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{blog.title}</h3>
                {getStatusBadge(blog.status)}
                {getRewardTierBadge(blog.rewardTier)}
                {blog.rewardCredited && <span className="text-green-500" title="Reward credited">ðŸ’°</span>}
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-4">
                <span>By {blog.author?.name || 'Unknown'}</span>
                <span>In {blog.category?.name || 'Uncategorized'}</span>
                <span>ðŸ‘ï¸ {blog.views || 0}</span>
                <span>â¤ï¸ {blog.likes || 0}</span>
              </div>
              <div className="mt-1 text-xs text-slate-700 dark:text-gray-400">
                Posted on {formatDate(blog.createdAt)} at {new Date(blog.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Button onClick={() => handleViewContent(blog)} variant="admin" size="small">View Blog</Button>
                <Button onClick={() => handleStatusChange(blog)} variant="admin" size="small">Update Status</Button>
                <Button onClick={() => handleDelete(blog._id)} variant="danger" size="small">Delete</Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {blogs.map((blog) => (
        <div key={blog._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="mb-3">
            <img
              src={blog.featuredImage || '/default_banner.png'}
              alt={blog.title}
              className="w-full h-40 rounded-lg object-cover"
            />
          </div>
          <div className="flex flex-col items-start justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">{blog.title}</h3>
            <div className="flex items-end gap-1">
              {getStatusBadge(blog.status)}
              {getRewardTierBadge(blog.rewardTier)}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 flex flex-wrap gap-3">
            <span>{blog.author?.name || 'Unknown'}</span>
            <span>{blog.category?.name || 'Uncategorized'}</span>
          </div>
          <div className="mt-2 text-xs text-slate-700 dark:text-gray-400 flex items-center gap-4">
            <span>ðŸ‘ï¸ {blog.views || 0}</span>
            <span>â¤ï¸ {blog.likes || 0}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={() => handleViewContent(blog)} variant="admin" size="small">View Blog</Button>
            <Button onClick={() => handleStatusChange(blog)} variant="admin" size="small">Update Status</Button>
            <Button onClick={() => handleDelete(blog._id)} variant="danger" size="small">Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <AdminMobileAppWrapper title="Student Blogs">
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505]">
          {user?.role === 'admin' && <Sidebar />}
          <div className="adminContent p-4 lg:p-12 w-full text-slate-900 dark:text-white ">
            <div className="flex flex-col items-center justify-center py-48 space-y-4 lg:space-y-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <MessageSquare className="w-10 h-10 absolute inset-0 m-auto text-indigo-500 animate-pulse" />
              </div>
              <div className="text-center text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Loading user blogs...</div>
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Student Blogs">
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-slate-900 dark:text-white font-outfit selection:bg-indigo-500/30">
        {user?.role === 'admin' && <Sidebar />}
        <div className="adminContent p-4 lg:p-12 w-full max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-12 mb-4 lg:mb-12 shadow-2xl overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 lg:p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageSquare className="w-64 h-64 text-indigo-500 -rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-3 lg:space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">BLOG MANAGEMENT</span>
                </div>

                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                  STUDENT <span className="text-indigo-600">BLOGS</span>
                </h1>

                <p className="max-w-2xl text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed">
                  Review and manage blog posts written by students. Approve, reward, or reject submissions from one place.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/50 dark:bg-black/20 p-3 rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5">
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'list', 'grid']} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-3 lg:p-10 rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl mb-4 lg:mb-12 relative overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-indigo-500 pl-3">Search Blogs</label>
                <div className="relative group/field">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="SEARCH BLOGS..."
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-amber-500 pl-3">Status</label>
                <div className="relative group/field">
                  <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-amber-500 transition-colors" />
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-amber-500/20 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">ALL STATUSES</option>
                    <option value="pending">IN REVIEW</option>
                    <option value="approved">APPROVED</option>
                    <option value="rejected">REJECTED</option>
                    <option value="published">PUBLISHED</option>
                    <option value="draft">DRAFT</option>
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-blue-500 pl-3">Category</label>
                <div className="relative group/field">
                  <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-blue-500 transition-colors" />
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-blue-500/20 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">ALL CATEGORIES</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-emerald-500 pl-3">Reward Tier</label>
                <div className="relative group/field">
                  <Award className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/field:text-emerald-500 transition-colors" />
                  <select
                    name="rewardTier"
                    value={filters.rewardTier}
                    onChange={handleFilterChange}
                    className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-emerald-500/20 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">ALL TIERS</option>
                    <option value="normal">NORMAL — ₹5</option>
                    <option value="good">GOOD — ₹10</option>
                    <option value="high">HIGH — ₹15</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-rose-500/10 border-4 border-rose-500/20 rounded-xl lg:rounded-[3rem] p-4 lg:p-10 flex items-center gap-3 lg:gap-6 shadow-2xl">
                <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg">
                  <Ban className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-rose-500 uppercase tracking-tighter">Something Went Wrong</h4>
                  <p className="text-sm font-bold text-rose-500/70 uppercase tracking-widest">{error}</p>
                </div>
              </motion.div>
            ) : blogs.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-32 text-center shadow-2xl">
                <div className="w-32 h-32 rounded-2xl lg:rounded-[3.5rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 lg:mb-8 mx-auto">
                  <FileText className="w-16 h-16 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black italic tracking-tighter text-slate-300 uppercase mb-4">No User Blogs Found</h3>
                <p className="max-w-md text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mx-auto">There are no blog posts matching your filters. Try adjusting your search or filters above.</p>
              </motion.div>
            ) : (
              <div className="space-y-4 lg:space-y-12 pb-24">
                {viewMode === 'table' ? renderTableView() :
                  viewMode === 'list' ? renderListView() :
                    renderGridView()}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content Modal */}
      {showContentModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">
                {selectedBlog.title}
              </h2>
              <button
                onClick={() => {
                  setShowContentModal(false);
                  setSelectedBlog(null);
                }}
                className="text-slate-700 dark:text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Ã¢Å“â€¢
              </button>
            </div>
            <div className="p-3 lg:p-6">
              <img
                src={selectedBlog.featuredImage || '/default_banner.png'}
                alt={selectedBlog.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Written by</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBlog.author?.name || 'Unknown'} ({selectedBlog.author?.email || 'No email provided'})
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedBlog.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  {getStatusBadge(selectedBlog.status)}
                </div>
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
                    {selectedBlog.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {selectedBlog.excerpt && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Summary</h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedBlog.excerpt}</p>
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Content</h3>
                <div
                  className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => {
                    setShowContentModal(false);
                    handleStatusChange(selectedBlog);
                  }}
                  variant="admin"
                >
                  Update Status
                </Button>
                <Button
                  onClick={() => {
                    setShowContentModal(false);
                    setSelectedBlog(null);
                  }}
                  variant="secondary"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Update Blog Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status (required)
                </label>
                <select
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reward Tier {statusFormData.status === 'approved' && '(required)'}
                  {statusFormData.status === 'approved' && <span className="text-xs text-slate-700 dark:text-gray-400"> — must be set when approving</span>}
                </label>
                <select
                  value={statusFormData.rewardTier || ''}
                  onChange={(e) => setStatusFormData(prev => ({ ...prev, rewardTier: e.target.value || '' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Choose a reward tier</option>
                  <option value="normal">Normal — ₹5</option>
                  <option value="good">Good — ₹10</option>
                  <option value="high">High — ₹15</option>
                </select>
                {statusFormData.status === 'approved' && !statusFormData.rewardTier && (
                  <p className="mt-1 text-xs text-red-500">Please select a reward tier when approving a blog</p>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleStatusSubmit}
                  variant="admin"
                  fullWidth
                >
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedBlog(null);
                    setStatusFormData({ status: '', rewardTier: '' });
                  }}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminMobileAppWrapper>
  );
};

export default AdminUserBlogs;



