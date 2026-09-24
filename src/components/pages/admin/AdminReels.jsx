"use client";

import React, { useEffect, useState, useCallback } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import { getCurrentUser } from "../../../utils/authUtils";
import Pagination from '../../Pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Plus, CheckCircle2, XCircle, Clock, Filter, LayoutGrid, List,
  Table as TableIcon, Search, Eye, Heart, Bookmark, MessageCircle,
  MoreVertical, ShieldCheck, Trash2, Edit3, ChevronDown, Activity,
  PieChart, HelpCircle, Info, FileText, ChevronRight, User as UserIcon,
  Music, Timer
} from 'lucide-react';
import { AdminTableSkeleton } from '../../skeletons/AdminSkeletons';
import ResponsiveTable from '../../ResponsiveTable';
import Sidebar from '../../Sidebar';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

const TYPE_COLORS = {
  question: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white',
  fact: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  tip: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white',
  current_affairs: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white',
  poll: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
};

const STATUS_COLORS = {
  published: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400',
  pending: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white',
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  rejected: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/30 dark:text-white',
  archived: 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
};

const AdminReels = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCounts, setStatusCounts] = useState({});
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024 ? 'grid' : 'table');
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (subjectFilter) params.subject = subjectFilter;
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
  }, [page, statusFilter, typeFilter, subjectFilter, searchTerm, itemsPerPage]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    API.getAdminReelsAnalytics()
      .then(res => {
        if (res?.success) {
          const subjects = (res.data?.subjectBreakdown || []).map(s => s._id).filter(Boolean).sort();
          setSubjectOptions(subjects);
        }
      })
      .catch(() => {});
  }, []);

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

  const columns = [
    {
      key: 'reelInfo', header: 'Reel Info', render: (_, item) => {
        const Icon = TYPE_ICONS[item.type] || HelpCircle;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type]}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{getPreviewText(item)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">{item.type}</span>
                <span className="text-[10px] font-bold text-slate-400">by {item.createdBy?.name || 'Ghost'}</span>
              </div>
              {item.audioFile && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Music className="w-3 h-3 text-black dark:text-white" />
                  <span className="text-[10px] font-semibold text-black/80 dark:text-white/80">{item.audioFile.replace(/\.(mp3|wav|ogg)$/, '').split('-').slice(0, -1).join(' ')}</span>
                  {item.duration > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5"><Timer className="w-3 h-3" />{item.duration}s</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      key: 'category', header: 'Category', render: (_, item) => (
        <div className="flex flex-col gap-0.5">
          <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{item.subject || 'General'}</p>
          <p className="text-[10px] font-bold text-primary-500/80 uppercase">{item.examType || 'Universal'}</p>
        </div>
      )
    },
    {
      key: 'metrics', header: 'Metrics', align: 'center', render: (_, item) => (
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">{item.viewsCount}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase">Views</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">{item.likesCount}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase">Likes</span>
          </div>
        </div>
      )
    },
    {
      key: 'status', header: 'Status', align: 'center', render: (_, item) => (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${STATUS_COLORS[item.status]}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, item) => (
        <div className="flex items-center justify-end gap-1.5">
          {(item.status === 'pending' || item.status === 'rejected') && (
            <button onClick={() => handleStatusChange(item._id, 'published')} className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600 hover:bg-primary-700 hover:text-white transition-all" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
          )}
          <Link href={`/admin/reels/edit/${item._id}`} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" title="Edit"><Edit3 className="w-3.5 h-3.5" /></Link>
          <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="h-[calc(100vh-64px)] max-md:h-[calc(100vh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><Flame className="w-6 h-6 text-black dark:text-white shrink-0" /> Reels <span className="text-slate-400 dark:text-slate-500">({totalReels})</span></h1>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
            <div className="relative col-span-2 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reels by content or author..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
              />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm max-w-full lg:max-w-[180px] truncate">
              <option value="">All Status ({totalReels})</option>
              <option value="published">Published ({statusCounts.published || 0})</option>
              <option value="pending">Pending ({statusCounts.pending || 0})</option>
              <option value="draft">Draft ({statusCounts.draft || 0})</option>
              <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
            </select>
            <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }} className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm max-w-full lg:max-w-[180px] truncate">
              <option value="">All Types</option>
              <option value="question">Question</option>
              <option value="fact">Fact</option>
              <option value="tip">Tip/Trick</option>
              <option value="current_affairs">Current Affairs</option>
              <option value="poll">Poll</option>
            </select>
            <select value={subjectFilter} onChange={e => { setSubjectFilter(e.target.value); setPage(1); }} className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm max-w-full lg:max-w-[180px] truncate">
              <option value="">All Categories</option>
              {subjectOptions.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              {[
                { icon: TableIcon, id: 'table', label: 'Table View' },
                { icon: List, id: 'list', label: 'List View' },
                { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  title={mode.label}
                  className={`p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  <mode.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
            <Link href="/admin/reels/create" className="col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700 shrink-0">
              <Plus className="w-4 h-4" /> Create Reel
            </Link>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0 overflow-hidden">
                {items.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Flame className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-lg font-black text-slate-500 uppercase">No reels found</p>
                    <p className="text-sm text-slate-400 mt-2">Try adjusting your filters or search terms</p>
                  </div>
                ) : viewMode === 'table' ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
                    <ResponsiveTable data={items} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No reels found" fillHeight />
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                    {items.map((item) => {
                      const Icon = TYPE_ICONS[item.type] || HelpCircle;
                      return (
                        <div key={item._id} className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type]}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wide ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-snug">{getPreviewText(item)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.subject}</p>
                            {item.audioFile && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Music className="w-3 h-3 text-black dark:text-white shrink-0" />
                                <span className="text-[9px] font-semibold text-black/80 dark:text-white/80 truncate">{item.audioFile.replace(/\.(mp3|wav|ogg)$/, '').split('-').slice(0, -1).join(' ')}</span>
                                {item.duration > 0 && (
                                  <span className="text-[9px] font-bold text-slate-400 shrink-0">{item.duration}s</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase"><Eye className="w-3 h-3" /> {item.viewsCount}</div>
                              <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase"><Heart className="w-3 h-3" /> {item.likesCount}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              {(item.status === 'pending' || item.status === 'rejected') && (
                                <button onClick={() => handleStatusChange(item._id, 'published')} className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                              )}
                              <Link href={`/admin/reels/edit/${item._id}`} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500" title="Edit"><Edit3 className="w-3.5 h-3.5" /></Link>
                              <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full overflow-auto space-y-3">
                    {items.map((item) => {
                      const Icon = TYPE_ICONS[item.type] || HelpCircle;
                      return (
                        <div key={item._id} className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type]}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">{getPreviewText(item)}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">{item.type}</span>
                              <span className="text-[10px] font-bold text-slate-400">by {item.createdBy?.name || 'Ghost'}</span>
                              <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase"><Eye className="w-3 h-3" /> {item.viewsCount}</div>
                              <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase"><Heart className="w-3 h-3" /> {item.likesCount}</div>
                            </div>
                          </div>
                          <span className={`shrink-0 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${STATUS_COLORS[item.status]}`}>
                            {item.status}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {(item.status === 'pending' || item.status === 'rejected') && (
                              <button onClick={() => handleStatusChange(item._id, 'published')} className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-600" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                            )}
                            <Link href={`/admin/reels/edit/${item._id}`} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500" title="Edit"><Edit3 className="w-3.5 h-3.5" /></Link>
                            <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 dark:bg-white/30 text-black dark:text-white" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {total > 0 && (
                <div className="shrink-0">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / itemsPerPage) || 1}
                    onPageChange={setPage}
                    totalItems={total}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(n) => { setItemsPerPage(n); setPage(1); }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReels;
