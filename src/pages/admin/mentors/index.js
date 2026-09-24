'use client';
import React, { useState, useEffect } from 'react';
import { Users, Shield, Eye, Star, Table2, List, LayoutGrid, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import ResponsiveTable from '../../../components/ResponsiveTable';
import Pagination from '../../../components/Pagination';
import Sidebar from '../../../components/Sidebar';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
import AdminRoute from '../../../components/AdminRoute';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';

const statusColor = (s) => {
  if (s === 'active') return 'bg-primary-50 dark:bg-primary-500/10 text-primary-600';
  if (s === 'pending') return 'bg-slate-100 dark:bg-slate-800 dark:bg-white/10 text-black dark:text-white dark:text-white';
  if (s === 'suspended') return 'bg-slate-100 dark:bg-slate-800 dark:bg-white/10 text-black dark:text-white dark:text-white';
  return 'bg-slate-100 dark:bg-slate-800 dark:bg-white/10 text-black dark:text-white dark:text-white';
};

const StatusSelect = ({ mentor, onChange }) => (
  <select
    value={mentor.status}
    onChange={e => onChange(mentor._id, e.target.value, e.target.value === 'active' ? true : undefined)}
    className="px-2 py-1.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-bold bg-slate-50 dark:bg-black text-slate-900 dark:text-white outline-none focus:border-primary-700"
  >
    <option value="pending">Pending</option>
    <option value="active">Active</option>
    <option value="suspended">Suspended</option>
    <option value="rejected">Rejected</option>
  </select>
);

const AdminMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: itemsPerPage });
      if (filter) params.set('status', filter);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await API.request(`/api/admin/mentors?${params}`);
      if (res?.success) { setMentors(res.data || []); setTotalPages(res.pagination?.totalPages || 1); setTotalItems(res.pagination?.total ?? (res.data || []).length); }
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, filter, itemsPerPage, debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const updateStatus = async (id, status, isVerified) => {
    try {
      const res = await API.request(`/api/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify({ status, isVerified }) });
      if (res?.success) { toast.success('Updated'); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };
  const verify = async (id) => updateStatus(id, 'active', true);

  const columns = [
    {
      key: 'user', header: 'Mentor', render: (_, m) => (
        <Link href={`/admin/mentors/${m._id}`} className="flex items-center gap-2 group max-w-xs">
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate flex items-center gap-1.5">
              {m.user?.name || 'Unknown'}
              {m.isVerified && <Shield className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{m.user?.email}</p>
          </div>
        </Link>
      )
    },
    {
      key: 'examsCleared', header: 'Exam(s)', render: (_, m) => (
        <span className="whitespace-nowrap">
          {m.examsCleared?.length ? `${m.examsCleared[0].examName} (${m.examsCleared[0].year})${m.examsCleared.length > 1 ? ` +${m.examsCleared.length - 1}` : ''}` : '—'}
        </span>
      )
    },
    {
      key: 'rating', header: 'Rating', align: 'center', render: (_, m) => (
        <span className="flex items-center justify-center gap-1"><Star className="w-3 h-3 text-black dark:text-white" />{m.rating?.toFixed(1) || '0.0'}</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, m) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${statusColor(m.status)}`}>{m.status}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, m) => (
        <div className="flex items-center justify-end gap-2">
          <StatusSelect mentor={m} onChange={updateStatus} />
          {m.status === 'active' && !m.isVerified && (
            <button onClick={() => verify(m._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Verify"><Shield className="w-3.5 h-3.5 text-black dark:text-white" /></button>
          )}
          <Link href={`/admin/mentors/${m._id}`} className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors" title="View full details"><Eye className="w-3.5 h-3.5 text-primary-600" /></Link>
        </div>
      )
    }
  ];

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <Head><title>Manage Mentors - Admin</title></Head>
        <Sidebar />
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><Users className="w-6 h-6 text-primary-600 shrink-0" /> Mentors <span className="text-slate-400 dark:text-slate-500">({totalItems})</span></h1>
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by username, name, email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
                />
              </div>
              <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs font-bold bg-slate-50 dark:bg-black text-slate-900 dark:text-white outline-none focus:border-primary-700">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="flex items-center gap-1">
                {[
                  { mode: 'table', icon: Table2, label: 'Table View' },
                  { mode: 'list', icon: List, label: 'List View' },
                  { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button key={mode} onClick={() => setViewMode(mode)} title={label}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0 overflow-hidden">
          {mentors.length === 0 ? (
            <Card className="!py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No mentor applications found</p>
            </Card>
          ) : viewMode === 'table' ? (
            /* ── Table View ── */
            <Card className="!p-0 overflow-hidden h-full flex flex-col" padded={false}>
              <ResponsiveTable data={mentors} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
            </Card>
          ) : viewMode === 'grid' ? (
            /* ── Grid View ── */
            <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
              {mentors.map((m, i) => (
                <Card key={m._id || i} className="!p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${statusColor(m.status)}`}>{m.status}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Star className="w-3 h-3 text-black dark:text-white" /> {m.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <Link href={`/admin/mentors/${m._id}`} className="group">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors flex items-center gap-1.5">
                        {m.user?.name || 'Unknown'}
                        {m.isVerified && <Shield className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{m.user?.email}</p>
                    {m.examsCleared?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {m.examsCleared.slice(0, 2).map((e, j) => (
                          <span key={j} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-600 dark:text-slate-300">{e.examName} ({e.year})</span>
                        ))}
                      </div>
                    )}
                    {m.strategy && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{m.strategy}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <StatusSelect mentor={m} onChange={updateStatus} />
                    <div className="flex items-center gap-1">
                      {m.status === 'active' && !m.isVerified && (
                        <button onClick={() => verify(m._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Verify"><Shield className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                      )}
                      <Link href={`/admin/mentors/${m._id}`} className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors" title="View full details"><Eye className="w-3.5 h-3.5 text-primary-600" /></Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* ── List View ── */
            <div className="h-full overflow-auto space-y-3">
              {mentors.map((m, i) => (
                <Card key={m._id || i} className="!p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${statusColor(m.status)}`}>{m.status}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Star className="w-3 h-3 text-black dark:text-white" /> {m.rating?.toFixed(1) || '0.0'}</span>
                      {m.examsCleared?.length > 0 && <span className="text-[11px] text-slate-400 dark:text-slate-500">{m.examsCleared[0].examName} ({m.examsCleared[0].year})</span>}
                    </div>
                    <Link href={`/admin/mentors/${m._id}`} className="group">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors truncate flex items-center gap-1.5">
                        {m.user?.name || 'Unknown'}
                        {m.isVerified && <Shield className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{m.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusSelect mentor={m} onChange={updateStatus} />
                    {m.status === 'active' && !m.isVerified && (
                      <button onClick={() => verify(m._id)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg lg:rounded-xl transition-colors" title="Verify"><Shield className="w-4 h-4 text-black dark:text-white" /></button>
                    )}
                    <Link href={`/admin/mentors/${m._id}`} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg lg:rounded-xl transition-colors" title="View full details"><Eye className="w-4 h-4 text-primary-600" /></Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
              </div>

              {totalItems > 0 && (
                <div className="shrink-0">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setPage(1); }}
                  />
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminMentors;
