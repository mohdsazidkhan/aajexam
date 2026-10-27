'use client';

import Select from '../../../components/common/ui/Select';
import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, CheckCircle, ShieldCheck, Search, Table as TableIcon, List, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/common/ui/Card';
import ResponsiveTable from '../../../components/common/ResponsiveTable';
import Pagination from '../../../components/common/Pagination';
import Sidebar from '../../../components/admin/Sidebar';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
import AdminRoute from '../../../components/admin/Route';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const SOURCE_LABELS = {
  quiz: 'Quiz',
  practice_test: 'Practice Test',
  daily_challenge: 'Daily Challenge',
  reel: 'Reel'
};

const STATUS_COLORS = {
  active: 'text-primary-600',
  mastered: 'bg-primary-600 text-on-primary',
  suspended: 'bg-background-surface-secondary text-content-secondary'
};

const AdminRevisionPage = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.request('/api/admin/revision/stats');
        if (res?.success) {
          setStats(res.data || null);
        } else {
          toast.error(res?.message || 'Unable to load revision stats');
        }
      } catch (error) {
        toast.error('Unable to load revision stats');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (statusFilter) params.set('status', statusFilter);
        const res = await API.request(`/api/admin/revision?${params.toString()}`);
        if (res?.success) {
          setItems(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalItems(res.pagination?.total ?? (res.data || []).length);
        } else {
          toast.error(res?.message || 'Unable to load revision queue');
        }
      } catch (error) {
        toast.error('Unable to load revision queue');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [page, itemsPerPage, debouncedSearch, statusFilter]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const columns = [
    {
      key: 'user', header: 'User', render: (_, item) => (
        <div>
          <div className="font-bold text-content-primary">{item.user?.name || item.user?.username || 'Unknown User'}</div>
          <div className="text-[10px] text-content-muted">{item.user?.email || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'question', header: 'Question', render: (_, item) => (
        <div>
          <p className="font-bold text-content-primary whitespace-nowrap">{item.questionSnapshot?.questionText || 'Untitled Question'}</p>
          <div className="text-[10px] text-content-muted uppercase tracking-[0.08em]">{item.questionSnapshot?.subject || 'General'} &middot; {item.questionSnapshot?.topic || 'N/A'} &middot; {item.questionSnapshot?.difficulty || 'medium'}</div>
        </div>
      )
    },
    {
      key: 'source', header: 'Source', render: (_, item) => (
        <div>
          <span className="text-[10px] font-bold text-primary-500/80 uppercase tracking-[0.08em]">{SOURCE_LABELS[item.source] || item.source}</span>
          <div className="text-[10px] text-content-muted whitespace-nowrap">{item.sourceTitle || '-'}</div>
        </div>
      )
    },
    {
      key: 'reviews', header: 'Reviews', align: 'center', render: (_, item) => (
        <span className="text-content-muted">{item.correctReviews ?? 0}/{item.totalReviews ?? 0}</span>
      )
    },
    {
      key: 'nextReviewDate', header: 'Next Review', render: (_, item) => (
        <span className="text-content-muted whitespace-nowrap">{formatDate(item.nextReviewDate)}</span>
      )
    },
    {
      key: 'status', header: 'Status', align: 'center', render: (_, item) => (
        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] ${STATUS_COLORS[item.status] || STATUS_COLORS.active}`}>
          {item.status}
        </span>
      )
    }
  ];

  const statBadges = (
    !statsLoading && stats && (
      <>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-background-surface rounded-lg border border-border-primary shrink-0">
          <div className="p-1 text-primary-600 rounded-md shrink-0"><Clock className="w-3 h-3" /></div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-content-primary tabular-nums tracking-tight whitespace-nowrap">{stats.dueToday ?? 0}</div>
            <div className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">Due Today</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-background-surface rounded-lg border border-border-primary shrink-0">
          <div className="p-1 text-primary-600 rounded-md shrink-0"><ShieldCheck className="w-3 h-3" /></div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-content-primary tabular-nums tracking-tight whitespace-nowrap">{stats.totalItems ?? 0}</div>
            <div className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">Total Active</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-background-surface rounded-lg border border-border-primary shrink-0">
          <div className="p-1 text-primary-600 rounded-md shrink-0"><CheckCircle className="w-3 h-3" /></div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-content-primary tabular-nums tracking-tight whitespace-nowrap">{stats.mastered ?? 0}</div>
            <div className="text-[8px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">Mastered</div>
          </div>
        </div>
      </>
    )
  );

  const searchInput = (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input
        type="text"
        placeholder="Search by user or question..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
      />
    </div>
  );

  const statusFilterSelect = (
    <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="mastered">Mastered</option>
      <option value="suspended">Suspended</option>
    </Select>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { mode: 'table', icon: TableIcon, label: 'Table View' },
        { mode: 'list', icon: List, label: 'List View' },
        { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
      ].map(({ mode, icon: Icon, label }) => (
        <button key={mode} onClick={() => setViewMode(mode)} title={label}
          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}>
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  const paginationControl = totalItems > 0 && (
    <Pagination
      compact
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setPage(1); }}
    />
  );

  useAdminMobileHeader({
    title: 'Revision Queue',
    count: totalItems,
    filters: (
      <>
        {statBadges}
        {searchInput}
        {statusFilterSelect}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
        <Head>
          <title>Admin Revision Queue - AajExam</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <Sidebar />
        <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0">
              {items.length === 0 ? (
                <Card className="text-center text-content-muted">
                  No revision queue items found.
                </Card>
              ) : viewMode === 'table' ? (
                <Card className="!p-0 overflow-hidden h-auto xl:h-full flex flex-col" padded={false}>
                  <ResponsiveTable data={items} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                </Card>
              ) : viewMode === 'grid' ? (
                <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                  {items.map((item) => (
                    <Card as="article" key={item._id} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-content-muted uppercase tracking-[0.08em]">{SOURCE_LABELS[item.source] || item.source}</div>
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] ${STATUS_COLORS[item.status] || STATUS_COLORS.active}`}>{item.status}</span>
                      </div>
                      <h2 className="text-base font-bold text-content-primary line-clamp-2">{item.questionSnapshot?.questionText || 'Untitled Question'}</h2>
                      <div className="text-xs text-content-muted">By {item.user?.name || item.user?.username || 'Unknown User'}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-content-secondary mt-2 pt-2 border-t border-border-primary">
                        <div>
                          <div className="font-bold text-content-primary">{item.correctReviews ?? 0}/{item.totalReviews ?? 0}</div>
                          <div>Reviews</div>
                        </div>
                        <div>
                          <div className="font-bold text-content-primary">{item.questionSnapshot?.difficulty || 'medium'}</div>
                          <div>Difficulty</div>
                        </div>
                        <div>
                          <div className="font-bold text-content-primary">{formatDate(item.nextReviewDate)}</div>
                          <div>Next Review</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-full overflow-auto space-y-2 xl:space-y-3">
                  {items.map((item) => (
                    <Card as="article" key={item._id}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <div className="text-sm text-content-muted uppercase tracking-[0.08em]">{SOURCE_LABELS[item.source] || item.source}</div>
                          <h2 className="text-xl font-bold text-content-primary">{item.questionSnapshot?.questionText || 'Untitled Question'}</h2>
                          <div className="text-sm text-content-muted mt-1">
                            By {item.user?.name || item.user?.username || 'Unknown User'}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] shrink-0 ${STATUS_COLORS[item.status] || STATUS_COLORS.active}`}>{item.status}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-content-secondary">
                        <div className="space-y-1">
                          <div className="font-bold text-content-primary">{item.correctReviews ?? 0}/{item.totalReviews ?? 0}</div>
                          <div>Reviews</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-content-primary">{item.questionSnapshot?.difficulty || 'medium'}</div>
                          <div>Difficulty</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-content-primary">{formatDate(item.nextReviewDate)}</div>
                          <div>Next Review</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminRevisionPage;
