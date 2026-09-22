'use client';
import React, { useState, useEffect } from 'react';
import { Users, Shield, Eye, Star, Table2, List, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import Link from 'next/link';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
import AdminRoute from '../../../components/AdminRoute';

const statusColor = (s) => {
  if (s === 'active') return 'bg-primary-50 dark:bg-primary-500/10 text-primary-700';
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
  const [viewMode, setViewMode] = useState('table');

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter) params.set('status', filter);
      const res = await API.request(`/api/admin/mentors?${params}`);
      if (res?.success) { setMentors(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id, status, isVerified) => {
    try {
      const res = await API.request(`/api/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify({ status, isVerified }) });
      if (res?.success) { toast.success('Updated'); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };
  const verify = async (id) => updateStatus(id, 'active', true);

  if (loading) return <AdminTableSkeleton />;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>Manage Mentors - Admin</title></Head>
        <div className="py-0 lg:py-6 space-y-2 lg:space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-primary-700" /> Mentors</h1>
            <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="px-3 py-2 border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs font-bold bg-slate-50 dark:bg-black text-slate-900 dark:text-white outline-none focus:border-primary-700">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* View Toggle & Count */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{mentors.length} mentor{mentors.length !== 1 ? 's' : ''} on this page</p>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl p-1 gap-0.5">
              {[
                { mode: 'table', icon: Table2, label: 'Table' },
                { mode: 'list', icon: List, label: 'List' },
                { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
              ].map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)} title={label}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {mentors.length === 0 ? (
            <Card className="!py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No mentor applications found</p>
            </Card>
          ) : viewMode === 'table' ? (
            /* ── Table View ── */
            <Card className="!p-0 overflow-hidden" padded={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Mentor</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Exam(s)</th>
                      <th className="text-center px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Rating</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                      <th className="text-right px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {mentors.map((m, i) => (
                      <tr key={m._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <Link href={`/admin/mentors/${m._id}`} className="flex items-center gap-2 group">
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary-700 transition-colors truncate flex items-center gap-1.5">
                                {m.user?.name || 'Unknown'}
                                {m.isVerified && <Shield className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{m.user?.email}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {m.examsCleared?.length ? `${m.examsCleared[0].examName} (${m.examsCleared[0].year})${m.examsCleared.length > 1 ? ` +${m.examsCleared.length - 1}` : ''}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1"><Star className="w-3 h-3 text-black dark:text-white" />{m.rating?.toFixed(1) || '0.0'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${statusColor(m.status)}`}>{m.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <StatusSelect mentor={m} onChange={updateStatus} />
                            {m.status === 'active' && !m.isVerified && (
                              <button onClick={() => verify(m._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Verify"><Shield className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                            )}
                            <Link href={`/admin/mentors/${m._id}`} className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors" title="View full details"><Eye className="w-3.5 h-3.5 text-primary-700" /></Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : viewMode === 'grid' ? (
            /* ── Grid View ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mentors.map((m, i) => (
                <Card key={m._id || i} className="!p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${statusColor(m.status)}`}>{m.status}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Star className="w-3 h-3 text-black dark:text-white" /> {m.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <Link href={`/admin/mentors/${m._id}`} className="group">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-700 transition-colors flex items-center gap-1.5">
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
                      <Link href={`/admin/mentors/${m._id}`} className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors" title="View full details"><Eye className="w-3.5 h-3.5 text-primary-700" /></Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* ── List View ── */
            <div className="space-y-3">
              {mentors.map((m, i) => (
                <Card key={m._id || i} className="!p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${statusColor(m.status)}`}>{m.status}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Star className="w-3 h-3 text-black dark:text-white" /> {m.rating?.toFixed(1) || '0.0'}</span>
                      {m.examsCleared?.length > 0 && <span className="text-[11px] text-slate-400 dark:text-slate-500">{m.examsCleared[0].examName} ({m.examsCleared[0].year})</span>}
                    </div>
                    <Link href={`/admin/mentors/${m._id}`} className="group">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-700 transition-colors truncate flex items-center gap-1.5">
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
                    <Link href={`/admin/mentors/${m._id}`} className="p-2 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg lg:rounded-xl transition-colors" title="View full details"><Eye className="w-4 h-4 text-primary-700" /></Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg lg:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="px-1 text-slate-400 text-xs">...</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg lg:rounded-xl text-xs font-bold transition-colors ${page === p ? 'bg-primary-700 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                      {p}
                    </button>
                  )
                )}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg lg:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminMentors;
