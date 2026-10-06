'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  MessageCircle,
  Check,
  X,
  Trash2,
  Search,
  User,
  Clock,
  Table2,
  List,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../../lib/api';
import Sidebar from '../../Sidebar';
import Pagination from '../../Pagination';
import ResponsiveTable from '../../ResponsiveTable';
import useDebounce from '../../../hooks/useDebounce';
import { useSSR } from '../../../hooks/useSSR';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const statusColor = (s) => {
  if (s === 'approved') return 'bg-primary-50 dark:bg-primary-500/10 text-primary-600';
  if (s === 'pending') return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600';
  return 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400';
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
};

export default function CommunityModeration() {
  const { isMounted } = useSSR();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [busyId, setBusyId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'table' | 'list' | 'grid'

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: itemsPerPage });
      if (status) params.set('status', status);
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await API.request(`/api/admin/community/questions?${params}`);
      if (res?.success) {
        setItems(res.data || []);
        setPagination(res.pagination || {});
        setStatusCounts(res.statusCounts || {});
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, itemsPerPage, status, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id, newStatus) => {
    setBusyId(id);
    try {
      const res = await API.request(`/api/admin/community/questions/${id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) });
      if (res?.success) {
        toast.success(`Marked ${newStatus}`);
        fetchData();
      } else {
        toast.error(res?.message || 'Failed to update');
      }
    } catch (e) {
      toast.error('Failed to update');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this question?')) return;
    setBusyId(id);
    try {
      const res = await API.request(`/api/community-questions/${id}`, { method: 'DELETE' });
      if (res?.success) {
        toast.success('Deleted');
        fetchData();
      } else {
        toast.error(res?.message || 'Failed to delete');
      }
    } catch (e) {
      toast.error('Failed to delete');
    } finally {
      setBusyId(null);
    }
  };

  const renderActions = (item, isBusy) => (
    <div className="flex items-center gap-1.5 shrink-0">
      {item.status !== 'approved' && (
        <button disabled={isBusy} onClick={() => updateStatus(item._id, 'approved')} title="Approve" className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-all disabled:opacity-50">
          <Check className="w-4 h-4" />
        </button>
      )}
      {item.status !== 'rejected' && (
        <button disabled={isBusy} onClick={() => updateStatus(item._id, 'rejected')} title="Reject" className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all disabled:opacity-50">
          <X className="w-4 h-4" />
        </button>
      )}
      <button disabled={isBusy} onClick={() => handleDelete(item._id)} title="Delete permanently" className="p-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all disabled:opacity-50">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  const columns = [
    {
      key: 'status', header: 'Status', render: (_, item) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${statusColor(item.status)}`}>{item.status}</span>
      )
    },
    {
      key: 'content', header: 'Question', render: (_, item) => (
        <p className="text-sm font-bold text-black dark:text-white truncate max-w-md">{item.question}</p>
      )
    },
    {
      key: 'author', header: 'Author', render: (_, item) => (
        <span className="whitespace-nowrap">{item.author?.name || item.author?.username || 'Unknown'}</span>
      )
    },
    {
      key: 'stats', header: 'Stats', render: (_, item) => (
        <span className="whitespace-nowrap text-slate-400">{item.answerCount || 0} answers &middot; {item.views || 0} views</span>
      )
    },
    {
      key: 'date', header: 'Date', render: (_, item) => (
        <span className="whitespace-nowrap">{formatDate(item.createdAt)}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, item) => renderActions(item, busyId === item._id)
    }
  ];

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        placeholder="Search questions..."
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl text-sm"
      />
    </div>
  );

  const statusFilterSelect = (
    <select
      value={status}
      onChange={(e) => { setStatus(e.target.value); setPage(1); }}
      className="w-full px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl text-xs font-bold bg-slate-50 dark:bg-black text-slate-900 dark:text-white outline-none focus:border-primary-700"
    >
      <option value="">All statuses</option>
      <option value="pending">Pending ({statusCounts.pending || 0})</option>
      <option value="approved">Approved ({statusCounts.approved || 0})</option>
      <option value="rejected">Rejected ({statusCounts.rejected || 0})</option>
    </select>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={page}
      totalPages={pagination.totalPages || 1}
      onPageChange={setPage}
      totalItems={pagination.total || 0}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(v) => { setItemsPerPage(v); setPage(1); }}
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { mode: 'table', icon: Table2, label: 'Table View' },
        { mode: 'list', icon: List, label: 'List View' },
        { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
      ].map(({ mode, icon: Icon, label }) => (
        <button key={mode} onClick={() => setViewMode(mode)} title={label}
          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  useAdminMobileHeader({
    title: 'Community Q&A',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {statusFilterSelect}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen p-3 xl:p-8">
        <AdminTableSkeleton showHeader={false} showFilters={false} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      {isMounted && <Sidebar />}
      <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-4">

        {/* Title + filters live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto">
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 xl:py-20 text-center bg-white/50 dark:bg-white/5 rounded-2xl xl:rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm"
              >
                <div className="p-4 xl:p-10 bg-slate-100/50 dark:bg-white/5 rounded-lg xl:rounded-xl xl:rounded-[3rem] mb-4 xl:mb-8 shadow-sm">
                  <MessageCircle className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl xl:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">Nothing to Review</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No questions match these filters right now.</p>
              </motion.div>
            ) : viewMode === 'table' ? (
              <motion.div key="table" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ResponsiveTable data={items} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} />
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start' : 'flex flex-col gap-3'}>
                {items.map((item, i) => {
                  const isBusy = busyId === item._id;
                  return (
                    <motion.div
                      key={item._id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i, 10) * 0.03 }}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${statusColor(item.status)}`}>{item.status}</span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                            <User className="w-3.5 h-3.5" /> {item.author?.name || item.author?.username || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                            <Clock className="w-3.5 h-3.5" /> {formatDate(item.createdAt)}
                          </span>
                        </div>

                        {renderActions(item, isBusy)}
                      </div>

                      <p className="text-sm font-bold text-black dark:text-white leading-relaxed">{item.question}</p>
                      {item.options?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.options.map((o, idx) => (
                            <span key={idx} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${o.isCorrect ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>{o.text}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400">
                        <span>{item.exam?.name || 'General'}</span>
                        <span>{item.answerCount || 0} answers</span>
                        <span>{item.views || 0} views</span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
