"use client";

import React, { useEffect, useState, useCallback } from "react";
import API from '../../../lib/api';
import { toast } from 'react-hot-toast';
import { getCurrentUser } from "../../../utils/authUtils";
import Pagination from '../../common/Pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { m as motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Plus, CheckCircle2, XCircle, Clock, Filter, LayoutGrid, List,
  Table as TableIcon, Search, Eye, Heart, Bookmark, MessageCircle,
  MoreVertical, ShieldCheck, Trash2, Edit3, ChevronDown, Activity,
  PieChart, HelpCircle, Info, FileText, ChevronRight, User as UserIcon,
  Music, Timer
} from 'lucide-react';
import { AdminTableSkeleton } from '../Skeletons';
import ResponsiveTable from '../../common/ResponsiveTable';
import Sidebar from '../Sidebar';
import StyledSelect from '../../common/ui/StyledSelect';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const TYPE_COLORS = {
  question: 'bg-background-surface-secondary text-content-primary',
  fact: 'text-primary-600',
  tip: 'bg-background-surface-secondary text-content-primary',
  current_affairs: 'bg-background-surface-secondary text-content-primary',
  poll: 'text-primary-600',
};

const STATUS_COLORS = {
  published: 'text-primary-600',
  pending: 'bg-background-surface-secondary text-content-primary',
  draft: 'bg-background-surface-secondary text-content-secondary',
  rejected: 'bg-background-surface-secondary text-content-primary',
  archived: 'bg-background-surface-secondary text-content-muted dark:bg-slate-800',
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
  const [viewMode, setViewMode] = useState('table');
  const router = useRouter();

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

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
              <p className="font-bold text-content-primary">{getPreviewText(item)}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] px-2 py-0.5 bg-background-surface-secondary rounded-lg">{item.type}</span>
                <span className="text-[10px] font-bold text-content-muted">by {item.createdBy?.name || 'Ghost'}</span>
              </div>
              {item.audioFile && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Music className="w-3 h-3 text-content-primary" />
                  <span className="text-[10px] font-semibold text-black/80 dark:text-white/80">{item.audioFile.replace(/\.(mp3|wav|ogg)$/, '').split('-').slice(0, -1).join(' ')}</span>
                  {item.duration > 0 && (
                    <span className="text-[10px] font-bold text-content-muted flex items-center gap-0.5"><Timer className="w-3 h-3" />{item.duration}s</span>
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
          <p className="text-xs font-bold text-content-secondary uppercase">{item.subject || 'General'}</p>
          <p className="text-[10px] font-bold text-primary-500/80 uppercase">{item.examType || 'Universal'}</p>
        </div>
      )
    },
    {
      key: 'metrics', header: 'Metrics', align: 'center', render: (_, item) => (
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-content-secondary">{item.viewsCount}</span>
            <span className="text-[9px] font-bold text-content-muted uppercase">Views</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-content-secondary">{item.likesCount}</span>
            <span className="text-[9px] font-bold text-content-muted uppercase">Likes</span>
          </div>
        </div>
      )
    },
    {
      key: 'status', header: 'Status', align: 'center', render: (_, item) => (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] ${STATUS_COLORS[item.status]}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, item) => (
        <div className="flex items-center justify-end gap-1.5">
          {(item.status === 'pending' || item.status === 'rejected') && (
            <button onClick={() => handleStatusChange(item._id, 'published')} className="p-1.5 rounded-lg text-on-primary hover:bg-primary-700 hover:text-white transition-all bg-primary-600" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
          )}
          <Link href={`/admin/reels/edit/${item._id}`} className="p-1.5 rounded-lg bg-background-surface-secondary text-content-muted hover:bg-background-surface-secondary transition-all" title="Edit"><Edit3 className="w-3.5 h-3.5" /></Link>
          <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-background-surface-secondary text-content-primary hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input
        type="text"
        placeholder="Search reels by content or author..."
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
      />
    </div>
  );

  const statusFilterSelect = (
    <StyledSelect
      value={statusFilter}
      onChange={val => { setStatusFilter(val); setPage(1); }}
      options={[
        { value: '', label: `All Status (${totalReels})` },
        { value: 'published', label: `Published (${statusCounts.published || 0})` },
        { value: 'pending', label: `Pending (${statusCounts.pending || 0})` },
        { value: 'draft', label: `Draft (${statusCounts.draft || 0})` },
        { value: 'rejected', label: `Rejected (${statusCounts.rejected || 0})` }
      ]}
      className="w-full xl:max-w-[180px]"
    />
  );

  const typeFilterSelect = (
    <StyledSelect
      value={typeFilter}
      onChange={val => { setTypeFilter(val); setPage(1); }}
      options={[
        { value: '', label: 'All Types' },
        { value: 'question', label: 'Question' },
        { value: 'fact', label: 'Fact' },
        { value: 'tip', label: 'Tip/Trick' },
        { value: 'current_affairs', label: 'Current Affairs' },
        { value: 'poll', label: 'Poll' }
      ]}
      className="w-full xl:max-w-[180px]"
    />
  );

  const subjectFilterSelect = (
    <StyledSelect
      value={subjectFilter}
      onChange={val => { setSubjectFilter(val); setPage(1); }}
      options={[{ value: '', label: 'All Categories' }, ...subjectOptions.map(subject => ({ value: subject, label: subject }))]}
      className="w-full xl:max-w-[180px]"
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: List, id: 'list', label: 'List View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          title={mode.label}
          className={`border border-primary-600 flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const createReelLink = (
    <Link href="/admin/reels/create" className="w-full col-span-2 xl:col-span-1 flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:brightness-110 bg-primary-600">
      <Plus className="w-4 h-4" /> Create Reel
    </Link>
  );

  const paginationControl = total > 0 && (
    <Pagination
      compact
      currentPage={page}
      totalPages={Math.ceil(total / itemsPerPage) || 1}
      onPageChange={setPage}
      totalItems={total}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(n) => { setItemsPerPage(n); setPage(1); }}
    />
  );

  useAdminMobileHeader({
    title: 'Reels',
    count: totalReels,
    filters: (
      <>
        {searchInput}
        {statusFilterSelect}
        {typeFilterSelect}
        {subjectFilterSelect}
        {viewToggleButtons}
        {createReelLink}
        {paginationControl}
      </>
    )
  });

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0 overflow-auto">
                {items.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-20 h-20 bg-background-surface-secondary rounded-md flex items-center justify-center mx-auto mb-4 border border-primary-600">
                      <Flame className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-lg font-bold text-content-muted">No reels found</p>
                    <p className="text-sm text-content-muted mt-2">Try adjusting your filters or search terms</p>
                  </div>
                ) : viewMode === 'table' ? (
                  <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
                    <ResponsiveTable data={items} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No reels found" fillHeight />
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                    {items.map((item, idx) => {
                      const Icon = TYPE_ICONS[item.type] || HelpCircle;
                      const serialNumber = (page - 1) * itemsPerPage + idx + 1;
                      return (
                        <div key={item._id} className="relative bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type]}`}>
                              <Icon className="w-5 h-5" />
                              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{serialNumber}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wide ${STATUS_COLORS[item.status]}`}>{item.status}</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-content-primary leading-snug">{getPreviewText(item)}</p>
                            <p className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mt-1">{item.subject}</p>
                            {item.audioFile && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <Music className="w-3 h-3 text-content-primary shrink-0" />
                                <span className="text-[9px] font-semibold text-black/80 dark:text-white/80 truncate">{item.audioFile.replace(/\.(mp3|wav|ogg)$/, '').split('-').slice(0, -1).join(' ')}</span>
                                {item.duration > 0 && (
                                  <span className="text-[9px] font-bold text-content-muted shrink-0">{item.duration}s</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-content-muted uppercase"><Eye className="w-3 h-3" /> {item.viewsCount}</div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-content-muted uppercase"><Heart className="w-3 h-3" /> {item.likesCount}</div>
                            </div>
                            <div className="flex items-center gap-1">
                              {(item.status === 'pending' || item.status === 'rejected') && (
                                <button onClick={() => handleStatusChange(item._id, 'published')} className="p-1.5 rounded-lg text-on-primary bg-primary-600" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                              )}
                              <Link href={`/admin/reels/edit/${item._id}`} className="p-1.5 rounded-lg bg-background-surface-secondary text-content-muted" title="Edit"><Edit3 className="w-3.5 h-3.5" /></Link>
                              <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-background-surface-secondary text-content-primary" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full overflow-auto space-y-3">
                    {items.map((item, idx) => {
                      const Icon = TYPE_ICONS[item.type] || HelpCircle;
                      const serialNumber = (page - 1) * itemsPerPage + idx + 1;
                      return (
                        <div key={item._id} className="flex items-center gap-3 bg-background-surface rounded-xl border border-border-primary p-4 relative">
                          <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type]}`}>
                            <Icon className="w-5 h-5" />
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{serialNumber}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-content-primary truncate">{getPreviewText(item)}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] px-2 py-0.5 bg-background-surface-secondary rounded-lg">{item.type}</span>
                              <span className="text-[10px] font-bold text-content-muted">by {item.createdBy?.name || 'Ghost'}</span>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-content-muted uppercase"><Eye className="w-3 h-3" /> {item.viewsCount}</div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-content-muted uppercase"><Heart className="w-3 h-3" /> {item.likesCount}</div>
                            </div>
                          </div>
                          <span className={`shrink-0 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] ${STATUS_COLORS[item.status]}`}>
                            {item.status}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {(item.status === 'pending' || item.status === 'rejected') && (
                              <button onClick={() => handleStatusChange(item._id, 'published')} className="p-1.5 rounded-lg text-on-primary bg-primary-600" title="Approve"><CheckCircle2 className="w-3.5 h-3.5" /></button>
                            )}
                            <Link href={`/admin/reels/edit/${item._id}`} className="p-1.5 rounded-lg bg-background-surface-secondary text-content-muted" title="Edit"><Edit3 className="w-3.5 h-3.5" /></Link>
                            <button onClick={() => handleDelete(item._id)} className="p-1.5 rounded-lg bg-background-surface-secondary text-content-primary" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReels;
