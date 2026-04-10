"use client";

import React, { useEffect, useState, useCallback } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import Sidebar from '../../Sidebar';
import { useSelector } from "react-redux";
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { getCurrentUser } from "../../../utils/authUtils";
import Pagination from '../../Pagination';
import Button from '../../ui/Button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Plus, CheckCircle2, XCircle, Clock, Filter, LayoutGrid, List,
  Table as TableIcon, Search, Eye, Heart, Bookmark, MessageCircle,
  MoreVertical, ShieldCheck, Trash2, Edit3, ChevronDown, Activity,
  PieChart, HelpCircle, Info, FileText, ChevronRight, User as UserIcon
} from 'lucide-react';
import ViewToggle from '../../ViewToggle';

const TYPE_COLORS = {
  question: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fact: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  tip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  current_affairs: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  poll: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const STATUS_COLORS = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  archived: 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
};

const AdminReels = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCounts, setStatusCounts] = useState({});
  const [itemsPerPage] = useState(20);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const pathname = usePathname();
  const router = useRouter();

  // Screen size detection for default view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode('grid');
      } else {
        setViewMode('table');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await API.getAdminReels(params);
      if (res?.success) {
        setItems(res.data || []);
        setTotal(res.pagination?.total || 0);
        setStatusCounts(res.statusCounts || {});
      }
    } catch (err) {
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter, searchTerm, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      const res = await API.updateAdminReel(id, { status: newStatus });
      if (res?.success) {
        toast.success(`Reel ${newStatus} successfully`);
        load();
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this reel?')) return;
    setActionLoading(id);
    try {
      const res = await API.deleteAdminReel(id);
      if (res?.success) {
        toast.success('Reel deleted');
        load();
      }
    } catch (err) {
      toast.error('Failed to delete reel');
    } finally {
      setActionLoading(null);
    }
  };

  const getPreviewText = (item) => {
    if (item.type === 'question') return item.questionText || item.title;
    if (item.type === 'poll') return item.pollQuestion || item.title;
    return item.title || item.content;
  };

  const totalReels = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  const TYPE_ICONS = {
    question: HelpCircle,
    fact: Info,
    tip: Flame,
    current_affairs: FileText,
    poll: PieChart
  };

  return (
    <AdminMobileAppWrapper>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${isOpen ? 'lg:ml-60' : 'lg:ml-0'}`}>
          <div className="p-0 lg:p-6 max-w-full mx-auto mt-4 lg:mt-2">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-7 h-7 text-orange-500" /> Reels Management
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{totalReels} total reels</p>
              </div>
              <Link href="/admin/reels/create">
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Reel
                </Button>
              </Link>
            </div>

            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { label: 'All', value: '', count: totalReels },
                { label: 'Published', value: 'published', count: statusCounts.published || 0 },
                { label: 'Pending', value: 'pending', count: statusCounts.pending || 0 },
                { label: 'Draft', value: 'draft', count: statusCounts.draft || 0 },
                { label: 'Rejected', value: 'rejected', count: statusCounts.rejected || 0 },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${statusFilter === tab.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search reels by content or author..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    className="w-full pl-12 pr-4 py-3 rounded-[1.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none shadow-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                    className="pl-4 pr-10 py-3 rounded-[1.2rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 focus:border-primary-500 outline-none appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="question">Question</option>
                    <option value="fact">Fact</option>
                    <option value="tip">Tip/Trick</option>
                    <option value="current_affairs">Current Affairs</option>
                    <option value="poll">Poll</option>
                  </select>

                  {/* View Toggle - Only Visible on Desktop or when manual switch needed */}
                  <div className="hidden lg:block">
                    <ViewToggle currentView={viewMode} onViewChange={setViewMode} views={['table', 'grid']} />
                  </div>
                </div>
              </div>
            </div>

            {/* Reels Content Layer */}
            <AnimatePresence mode="wait">
              {loading ? (
                <div key="loading" className="py-20 flex flex-col items-center gap-4">
                  <Loading size="lg" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Archive...</p>
                </div>
              ) : items.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                    <Flame className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-xl font-black text-content-primary uppercase tracking-tight">No reels found</p>
                  <p className="text-sm text-content-secondary mt-2">Try adjusting your filters or search terms</p>
                </motion.div>
              ) : viewMode === 'table' ? (
                /* Custom Desktop Table */
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden lg:block overflow-hidden rounded-[2.5rem] border-4 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Reel Info</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Category</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Metrics</th>
                        <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800/30">
                      {items.map((item, i) => {
                        const Icon = TYPE_ICONS[item.type] || HelpCircle;
                        return (
                          <motion.tr key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group hover:bg-slate-50/80 dark:hover:bg-primary-500/5 transition-all">
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${TYPE_COLORS[item.type]}`}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-content-primary tracking-tight line-clamp-1 group-hover:text-primary-600 transition-colors uppercase italic">{getPreviewText(item)}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">{item.type}</span>
                                    <span className="text-[10px] font-bold text-slate-400">by {item.createdBy?.name || 'Ghost'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex flex-col gap-1">
                                <p className="text-xs font-black text-content-primary tracking-wide uppercase">{item.subject || 'General'}</p>
                                <p className="text-[10px] font-bold text-primary-500/80 tracking-widest uppercase">{item.examType || 'Universal'}</p>
                              </div>
                            </td>
                            <td className="px-6 py-6">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-content-primary">{item.viewsCount}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Views</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-content-primary">{item.likesCount}</span>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Likes</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 font-medium">
                              <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] border-b-4 ${STATUS_COLORS[item.status]}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleDelete(item._id)} className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                                <Link href={`/admin/reels/edit/${item._id}`} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><Edit3 className="w-4 h-4" /></Link>
                                {(item.status === 'pending' || item.status === 'rejected') && (
                                  <button onClick={() => handleStatusChange(item._id, 'published')} className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </motion.div>
              ) : (
                /* Custom Mobile Grid - 2 COLUMNS AS REQUESTED */
                <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item, i) => {
                    const Icon = TYPE_ICONS[item.type] || HelpCircle;
                    return (
                      <motion.div key={item._id} whileTap={{ scale: 0.98 }} className={`relative bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-4 flex flex-col h-full shadow-sm active:shadow-inner transition-all overflow-hidden`}>
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-500/5 to-transparent rounded-bl-[2rem] -z-0`} />

                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-duo ${TYPE_COLORS[item.type]}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0 mb-3">
                          <p className="text-[11px] font-black text-content-primary line-clamp-3 uppercase italic leading-tight mb-1">{getPreviewText(item)}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.subject}</p>
                        </div>

                        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase"><Eye className="w-3 h-3" /> {item.viewsCount}</div>
                              <div className="flex items-center gap-1 text-[9px] font-black text-rose-500/70 uppercase"><Heart className="w-3 h-3" /> {item.likesCount}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-3 h-3" /></button>
                              <Link href={`/admin/reels/edit/${item._id}`} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"><Edit3 className="w-3 h-3" /></Link>
                            </div>
                          </div>
                          
                          {(item.status === 'pending' || item.status === 'rejected') && (
                            <button onClick={() => handleStatusChange(item._id, 'published')} className="w-full py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" /> Approve & Live
                            </button>
                          )}
                        </div>

                        {/* Status Dot */}
                        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${item.status === 'published' ? 'bg-emerald-500' : item.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>


            {/* Pagination */}
            {total > itemsPerPage && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(total / itemsPerPage)}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminReels;
