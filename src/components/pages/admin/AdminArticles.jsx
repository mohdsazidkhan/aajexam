'use client';

import config from '../../../lib/config/appConfig';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Sidebar from '../../Sidebar';
import Loading from '../../Loading';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, LayoutGrid, List, Table as TableIcon,
  Search as SearchIcon, ChevronRight, Eye, Heart, StickyNote, Star,
  ShieldCheck, Trash2, Edit3, CheckCircle2, Ban, Archive, MoreVertical,
  ArrowRight, Users, TrendingUp, BarChart3, Database, Globe, Info, Clock, Bell, Layers,
  Binary, Activity, Box, Boxes, Zap, Cpu
} from 'lucide-react';
import ViewToggle from '../../ViewToggle';
import Pagination from '../../Pagination';
import { isMobile } from 'react-device-detect';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import { safeLocalStorage } from '../../../lib/utils/storage';

const AdminArticles = () => {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    isFeatured: '',
    isPinned: ''
  });
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return (isMobile || window.innerWidth < 768) ? 'grid' : 'table';
      }
    } catch (e) { }
    return isMobile ? 'grid' : 'table';
  });

  // Derived Stats for Section Header
  const articleStats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    featured: articles.filter(a => a.isFeatured).length,
    avgViews: articles.length ? Math.round(articles.reduce((acc, curr) => acc + (curr.views || 0), 0) / articles.length) : 0
  };

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
    fetchArticles();
    fetchCategories();
  }, [currentPage, filters, itemsPerPage]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...filters
      };

      const response = await API.getAdminArticles(params);
      setArticles(response.articles || []);
      setPagination(response.pagination || {});
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError('Failed to load articles');
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await API.deleteArticle(id);
        fetchArticles();
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Failed to delete article');
      }
    }
  };
  const handlePublish = async (id) => {
    try {
      await API.publishArticle(id);
      fetchArticles();
    } catch (err) {
      console.error('Error publishing article:', err);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await API.unpublishArticle(id);
      fetchArticles();
    } catch (err) {
      console.error('Error unpublishing article:', err);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await API.toggleFeatured(id);
      fetchArticles();
    } catch (err) {
      console.error('Error toggling featured status:', err);
      alert('Failed to toggle featured status');
    }
  };

  const handleTogglePinned = async (id) => {
    try {
      await API.togglePinned(id);
      fetchArticles();
    } catch (err) {
      console.error('Error toggling pinned status:', err);
      alert('Failed to toggle pinned status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: {
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        text: 'Published',
        icon: <Zap className="w-3 h-3" />
      },
      draft: {
        color: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        text: 'Draft',
        icon: <Cpu className="w-3 h-3" />
      },
      pending: {
        color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        text: 'Pending',
        icon: <Activity className="w-3 h-3" />
      },
      approved: {
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        text: 'Approved',
        icon: <ShieldCheck className="w-3 h-3" />
      },
      rejected: {
        color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        text: 'Rejected',
        icon: <Ban className="w-3 h-3" />
      },
      archived: {
        color: 'bg-slate-700/10 text-slate-700 border-slate-700/20 dark:text-slate-400',
        text: 'Archived',
        icon: <Archive className="w-3 h-3" />
      }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 text-[8px] font-black uppercase tracking-widest ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRewardTierBadge = (rewardTier) => {
    if (!rewardTier) return null;
    const tierConfig = {
      normal: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', text: '₹5' },
      good: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', text: '₹10' },
      high: { color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', text: '₹15' }
    };
    const config = tierConfig[rewardTier];
    if (!config) return null;
    return (
      <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${config.color} whitespace-nowrap`}>
        REWARD: {config.text}
      </span>
    );
  };

  const renderTableView = () => (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-xl rounded-xl lg:rounded-[2.5rem] shadow-xl border-2 border-slate-100 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y-2 divide-slate-100 dark:divide-gray-700">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">S.No.</th>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Article</th>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Author</th>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</th>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Stats</th>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Created</th>
              <th className="px-3 lg:px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y-2 divide-slate-100 dark:divide-gray-700">
            {articles.map((article) => (
              <tr key={article._id} className="hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-500">
                  {((currentPage - 1) * (pagination.limit || itemsPerPage)) + articles.indexOf(article) + 1}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-xl object-cover border-2 border-slate-100"
                        src={article.featuredImage || '/default_banner.png'}
                        alt={article.title}
                      />
                    </div>
                    <div className="ml-4 max-w-96" >
                      <div className="text-xs font-black uppercase text-gray-900 dark:text-white" title={article.title}>
                        {article.title?.length > 40 ? article.title?.substring(0, 40) + '...' : article.title}
                        {article.isFeatured && (
                          <span className="ml-2 text-indigo-500">â˜…</span>
                        )}
                        {article.isPinned && (
                          <span className="ml-2 text-indigo-500">ðŸ“Œ</span>
                        )}
                      </div>
                      {article.slug && (
                        <div className="text-[10px] text-indigo-500/70 font-black mt-1" title={article.slug}>
                          <code>/{article.slug?.length > 40 ? article.slug?.substring(0, 40) + '...' : article.slug}</code>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900 dark:text-white uppercase">
                  {article.author?.name || 'Unknown'}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900 dark:text-white">
                  {article.category?.name || 'General'}
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center flex-wrap gap-1">
                    {getStatusBadge(article.status)}
                    {getRewardTierBadge(article.rewardTier, article.rewardAmount)}
                    {article.rewardCredited && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 ml-2" title="Reward credited">
                        ðŸ’°
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-[10px] font-black uppercase text-gray-500">
                  <div className="flex space-x-4">
                    <span>ðŸ‘ï¸ {article.views || 0}</span>
                    <span>â¤ï¸ {article.likes || 0}</span>
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-[10px] font-black uppercase text-gray-500">
                  <div className="font-black text-gray-900 dark:text-white">
                    {formatDate(article.createdAt)}
                  </div>
                  <div className="opacity-50">
                    {new Date(article.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push(`/admin/articles/${article._id}/edit`)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors text-indigo-500"
                      title="Edit"
                    >
                      âœŽ
                    </button>
                    {article.status === 'published' ? (
                      <button
                        onClick={() => handleUnpublish(article._id)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                        title="Unpublish"
                      >
                        ðŸš«
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublish(article._id)}
                        className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                        title="Publish"
                      >
                        ðŸš€
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(article._id)}
                      className={`p-2 rounded-xl transition-colors ${article.isFeatured ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'hover:bg-slate-50'}`}
                      title="Featured"
                    >
                      â˜…
                    </button>
                    <button
                      onClick={() => handleTogglePinned(article._id)}
                      className={`p-2 rounded-xl transition-colors ${article.isPinned ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500' : 'hover:bg-slate-50'}`}
                      title="Pinned"
                    >
                      ðŸ“Œ
                    </button>
                    <button
                      onClick={() => handleDelete(article._id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-red-500"
                      title="Delete"
                    >
                      ðŸ—‘ï¸
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article._id} className="bg-white dark:bg-gray-800 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-gray-700 p-6 shadow-xl hover:-translate-y-1 transition-all">
          <div className="flex items-start gap-3 lg:gap-6">
            <img
              src={article.featuredImage || '/default_banner.png'}
              alt={article.title}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black uppercase text-gray-900 dark:text-white">{article.title}</h3>
                {getStatusBadge(article.status)}
                {getRewardTierBadge(article.rewardTier, article.rewardAmount)}
                {article.rewardCredited && <span className="text-emerald-500" title="Reward credited">ðŸ’°</span>}
                {article.isFeatured && <span className="text-indigo-500">â˜…</span>}
                {article.isPinned && <span className="text-indigo-500">ðŸ“Œ</span>}
              </div>
              <div className="mt-2 text-[10px] font-black uppercase text-gray-500 flex flex-wrap gap-4">
                <span>By {article.author?.name || 'Unknown'}</span>
                <span>In {article.category?.name || 'General'}</span>
                <span>ðŸ‘ï¸ {article.views || 0} VIEWS</span>
                <span>â¤ï¸ {article.likes || 0} LIKES</span>
              </div>
              <div className="mt-2 text-[10px] font-black uppercase text-slate-400">
                Created: {formatDate(article.createdAt)} AT {new Date(article.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </div>
              {article.slug && (
                <div className="text-[10px] text-indigo-500/70 font-black mt-2">
                  <code>/{article.slug}</code>
                </div>
              )}
              <div className="mt-6 flex items-center gap-4">
                <Button variant="primary" size="sm" onClick={() => router.push(`/admin/articles/${article._id}/edit`)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-3 lg:px-6 py-3">Edit</Button>
                {article.status === 'published' ? (
                  <Button variant="ghost" size="sm" onClick={() => handleUnpublish(article._id)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-3 lg:px-6 py-3">Unpublish</Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={() => handlePublish(article._id)} className="rounded-xl font-black uppercase text-[10px] tracking-widest px-3 lg:px-6 py-3 bg-emerald-500 hover:bg-emerald-600 border-none">Publish</Button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={() => handleToggleFeatured(article._id)} className={`p-2 rounded-xl transition-colors ${article.isFeatured ? 'bg-indigo-50 text-indigo-500' : 'hover:bg-slate-50'}`}>â˜…</button>
                  <button onClick={() => handleTogglePinned(article._id)} className={`p-2 rounded-xl transition-colors ${article.isPinned ? 'bg-indigo-50 text-indigo-500' : 'hover:bg-slate-50'}`}>ðŸ“Œ</button>
                  <button onClick={() => handleDelete(article._id)} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500">ðŸ—‘ï¸</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-6">
      {articles.map((article) => (
        <div key={article._id} className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-gray-700 p-5 shadow-xl hover:-translate-y-1 transition-all group">
          <div className="mb-4 relative overflow-hidden rounded-2xl">
            <img
              src={article.featuredImage || '/default_banner.png'}
              alt={article.title}
              className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {getStatusBadge(article.status)}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase text-gray-900 dark:text-white line-clamp-2 leading-tight">{article.title}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {getRewardTierBadge(article.rewardTier, article.rewardAmount)}
              {article.rewardCredited && <span className="text-emerald-500 text-xs">ðŸ’°</span>}
              {article.isFeatured && <span className="text-indigo-500">â˜…</span>}
              {article.isPinned && <span className="text-indigo-500">ðŸ“Œ</span>}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-slate-50 dark:border-gray-700">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
              <span>{article.author?.name || 'Unknown'}</span>
              <div className="flex items-center gap-3">
                <span>ðŸ‘ï¸ {article.views || 0}</span>
                <span>â¤ï¸ {article.likes || 0}</span>
              </div>
            </div>
            <p className="mt-2 text-[9px] font-black uppercase text-slate-300">
              {formatDate(article.createdAt)}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t-2 border-slate-50 dark:border-gray-700 pt-4">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/articles/${article._id}/edit`)} className="rounded-xl px-4 py-2 font-black uppercase text-[10px] tracking-tight">Edit</Button>
            <div className="flex items-center gap-2">
              <button onClick={() => handleDelete(article._id)} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors">ðŸ—‘ï¸</button>
              {article.status !== 'published' ? (
                <button onClick={() => handlePublish(article._id)} className="p-2 hover:bg-emerald-50 text-emerald-500 rounded-xl transition-colors">ðŸš€</button>
              ) : (
                <button onClick={() => handleUnpublish(article._id)} className="p-2 hover:bg-slate-50 text-gray-400 rounded-xl transition-colors">ðŸš«</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );



  if (loading) {
    return (
      <AdminMobileAppWrapper title="Articles">
        <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
          {user?.role === 'admin' && <Sidebar />}
          <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading articles..." />
            </div>
          </div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Articles">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && <Sidebar />}
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-4 lg:mb-10"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 mb-4"
                >
                  <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/80">ARTICLE MANAGEMENT</span>
                </motion.div>
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                  ARTICLES & <span className="text-indigo-500">RESOURCES</span>
                </h1>
                <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Create and manage educational articles for the platform.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Articles', value: articleStats.total, icon: FileText, color: 'indigo' },
                  { label: 'Published', value: articleStats.published, icon: Zap, color: 'emerald' },
                  { label: 'Featured', value: articleStats.featured, icon: Star, color: 'indigo' },
                  { label: 'Avg. Views', value: articleStats.avgViews, icon: Eye, color: 'blue' }
                ].map((stat, idx) => (
                  <div key={idx} className="px-3 lg:px-6 py-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-white/5 shadow-sm">
                    <stat.icon className={`w-4 h-4 text-${stat.color}-500 mb-2`} />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white leading-none tabular-nums">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 lg:mt-10 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-6">
              <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border-2 border-slate-100 dark:border-white/10">
                <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'list', 'grid']} />
              </div>

              <Button
                variant="primary"
                onClick={() => router.push('/admin/articles/create')}
                icon={Plus}
                className="w-full lg:w-auto px-4 lg:px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-duo-primary bg-indigo-500 hover:bg-indigo-600 border-none"
              >
                CREATE NEW ARTICLE
              </Button>
            </div>
          </motion.div>

          <Card
            variant="white"
            className="p-6 lg:p-10 mb-4 border-none shadow-xl bg-white dark:bg-slate-900/60 relative overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-8 relative z-10">
              <div className="lg:col-span-2 space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search</label>
                <div className="relative">
                  <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search articles..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-black uppercase outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="relative">
                  <Activity className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full pl-12 pr-8 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-xs font-black uppercase outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <div className="relative">
                  <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="category"
                    value={filters.category}
                    onChange={handleFilterChange}
                    className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-xs font-black uppercase outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-indigo-500 pl-3">Featured</label>
                <div className="relative">
                  <Star className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="isFeatured"
                    value={filters.isFeatured}
                    onChange={handleFilterChange}
                    className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-2xl text-xs font-black uppercase outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">All</option>
                    <option value="true">Featured Only</option>
                    <option value="false">Not Featured</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-slate-400 pl-3">Per Page</label>
                <div className="relative">
                  <Box className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      const newItemsPerPage = Number(e.target.value);
                      setItemsPerPage(newItemsPerPage);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-slate-400/30 rounded-2xl text-xs font-black uppercase outline-none transition-all appearance-none cursor-pointer"
                  >
                    {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v} items</option>)}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Article List */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 space-y-3 lg:space-y-6"
                >
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <Database className="w-10 h-10 absolute inset-0 m-auto text-indigo-500 animate-pulse" />
                  </div>
                  <div className="text-center text-slate-400 font-bold uppercase tracking-widest text-sm">Loading articles...</div>
                </motion.div>
              ) : articles.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-32 text-center bg-white/30 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/5"
                >
                  <div className="w-20 lg:w-32 h-20 lg:h-32 rounded-2xl lg:rounded-[3.5rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 lg:mb-8">
                    <StickyNote className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-xl lg:text-3xl font-black italic tracking-tighter text-slate-300 dark:text-slate-700 uppercase mb-4">
                    No Articles Found
                  </h3>
                  <p className="max-w-md text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4 lg:px-8">
                    No articles match your current filters. Try adjusting your search terms, status, or category to find what you're looking for.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Table View */}
                  {viewMode === 'table' && (
                    <div className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden overflow-x-auto custom-scrollbar">
                      <table className="w-full">
                        <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 uppercase">
                      {['Article', 'Category', 'Status', 'Reward', 'Views & Likes', 'Date Created', 'Actions'].map((head) => (
                        <th key={head} className="px-4 lg:px-8 py-3 lg:py-6 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{head}</th>
                      ))}
                    </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-100 dark:divide-white/5">
                          {articles.map((article, i) => (
                            <motion.tr
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              key={article._id}
                              className="group hover:bg-indigo-500/5 transition-all"
                            >
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img src={article.featuredImage || '/default_banner.png'} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-white/10 group-hover:ring-indigo-500/50 transition-all shadow-lg" alt="" />
                                    {article.isPinned && <div className="absolute -top-2 -right-2 p-1.5 bg-indigo-500 text-white rounded-lg shadow-lg"><ArrowRight className="w-3 h-3 rotate-[-45deg]" /></div>}
                                  </div>
                                  <div className="max-w-[250px]">
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight line-clamp-1">{article.title}</h4>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 italic">By {article.author?.name?.toUpperCase() || 'UNKNOWN AUTHOR'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-lg text-[9px] font-black uppercase border border-slate-200 dark:border-white/5">{article.category?.name || 'GENERAL'}</span>
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                {getStatusBadge(article.status)}
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                {getRewardTierBadge(article.rewardTier)}
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                <div className="flex items-center gap-4 text-slate-400">
                                  <div className="flex items-center gap-1.5">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-xs font-black tabular-nums">{article.views || 0}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Heart className="w-4 h-4" />
                                    <span className="text-xs font-black tabular-nums">{article.likes || 0}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                  <div className="text-slate-900 dark:text-white mb-1">{formatDate(article.createdAt)}</div>
                                  <div className="opacity-50 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                <div className="flex items-center gap-3">
                                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => router.push(`/admin/articles/${article._id}/edit`)} className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/5">
                                    <Edit3 className="w-4 h-4" />
                                  </motion.button>

                                  {article.status === 'published' ? (
                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleUnpublish(article._id)} className="p-3 bg-slate-500/10 text-slate-500 rounded-2xl border border-slate-500/20 hover:bg-slate-500 hover:text-white transition-all shadow-lg" title="Unpublish">
                                      <Ban className="w-4 h-4" />
                                    </motion.button>
                                  ) : (
                                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handlePublish(article._id)} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg" title="Publish">
                                      <Zap className="w-4 h-4" />
                                    </motion.button>
                                  )}

                                  <div className="w-[1px] h-8 bg-slate-100 dark:bg-white/5 mx-1" />

                                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(article._id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5">
                                    <Trash2 className="w-4 h-4" />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Grid View */}
                  {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                      {articles.map((article, i) => (
                        <motion.div
                          key={article._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="group bg-white dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col relative"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img src={article.featuredImage || '/default_banner.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 rounded-xl lg:rounded-[3rem]" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                              {article.isFeatured && <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-xl"><Star className="w-4 h-4 fill-current" /></div>}
                              {article.isPinned && <div className="p-2 bg-primary-500 text-white rounded-xl shadow-xl"><ArrowRight className="w-4 h-4 rotate-[-45deg]" /></div>}
                            </div>
                            <div className="absolute bottom-4 left-4">
                              {getStatusBadge(article.status)}
                            </div>
                          </div>

                          <div className="p-3 lg:p-8 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/10">{article.category?.name || 'UNCATEGORIZED'}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatDate(article.createdAt)}</span>
                            </div>

                            <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-4 line-clamp-2 min-h-[3rem]">{article.title}</h3>

                            <div className="flex items-center justify-between py-3 lg:py-6 border-y-2 border-slate-100 dark:border-white/5 my-auto">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-[10px] font-black text-white dark:text-slate-900 uppercase italic">
                                  {article.author?.name?.substring(0, 1) || '?'}
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{article.author?.name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col items-end">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Views</span>
                                  <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{article.views || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 lg:mt-8 flex items-center gap-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push(`/admin/articles/${article._id}/edit`)}
                                className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl"
                              >
                                EDIT ARTICLE
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleDelete(article._id)}
                                className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === 'list' && (
                    <div className="space-y-3 lg:space-y-6">
                      {articles.map((article, i) => (
                        <motion.div
                          key={article._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white/80 dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-8 group hover:border-indigo-500/20 transition-all shadow-xl"
                        >
                          <div className="relative w-full lg:w-48 h-32 lg:h-32 shrink-0 overflow-hidden rounded-2xl shadow-xl">
                            <img src={article.featuredImage || '/default_banner.png'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                            <div className="absolute inset-0 bg-black/20" />
                            <div className="absolute bottom-3 left-3">
                              {getStatusBadge(article.status)}
                            </div>
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{article.category?.name || 'GENERAL'}</span>
                              <div className="h-1 w-1 bg-slate-300 dark:bg-white/10 rounded-full" />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(article.createdAt)}</span>
                            </div>
                            <h3 className="text-md md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-indigo-500 transition-colors">{article.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 lg:gap-6 pt-2">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">By {article.author?.name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-500/50" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{article.views || 0} Views</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-rose-500/50" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{article.likes || 0} Likes</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pl-0 lg:pl-10 lg:border-l-2 border-slate-100 dark:border-white/5">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              onClick={() => router.push(`/admin/articles/${article._id}/edit`)}
                              className="px-4 lg:px-10 py-5 bg-white dark:bg-white/5 text-slate-900 dark:text-white rounded-lg lg:rounded-[2rem] font-black text-[10px] uppercase tracking-widest border-2 border-slate-100 dark:border-white/10 hover:border-indigo-500/30 shadow-lg transition-all"
                            >
                              EDIT ARTICLE
                            </motion.button>

                            <div className="relative">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                onClick={() => handleDelete(article._id)}
                                className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-lg"
                              >
                                <Trash2 className="w-5 h-5" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-16 flex justify-center"
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 lg:mt-12 bg-rose-500/10 border-2 border-rose-500/20 rounded-3xl p-6 flex items-center gap-4 shadow-xl"
            >
              <div className="p-3 bg-rose-500 text-white rounded-2xl">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest">Something Went Wrong</h4>
                <p className="text-xs font-bold text-rose-500/70 uppercase">{error}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <style jsx global>{`
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 1.5rem center;
          background-size: 1em;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #312e81;
          border-radius: 10px;
        }
      `}</style>
    </AdminMobileAppWrapper>
  );
};

export default AdminArticles;


