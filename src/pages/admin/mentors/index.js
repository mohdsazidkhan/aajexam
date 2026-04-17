'use client';
import React, { useState, useEffect } from 'react';
import { Users, Shield, ShieldOff, CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const AdminMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (filter) params.set('status', filter);
      const res = await API.request(`/api/admin/mentors?${params}`);
      if (res?.success) { setMentors(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, filter]);

  const updateStatus = async (id, status, isVerified) => {
    try {
      const res = await API.request(`/api/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify({ status, isVerified }) });
      if (res?.success) { toast.success('Updated'); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>Manage Mentors - Admin</title></Head>
        <div className="container mx-auto py-4 lg:py-8 px-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-primary-500" /> Mentors</h1>
            <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 outline-none">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-3">
            {mentors.map((m, i) => (
              <Card key={m._id || i} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{m.user?.name || 'Unknown'}</h3>
                    <p className="text-[10px] text-slate-400">{m.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${m.status === 'active' ? 'bg-emerald-50 text-emerald-600' : m.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{m.status}</span>
                    {m.isVerified && <Shield className="w-4 h-4 text-blue-500" />}
                  </div>
                </div>

                {m.examsCleared?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {m.examsCleared.map((e, j) => (
                      <span key={j} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-600">{e.examName} ({e.year})</span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-500 line-clamp-2">{m.strategy?.slice(0, 200)}...</p>

                <div className="flex gap-2">
                  {m.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(m._id, 'active', true)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold hover:bg-emerald-100"><CheckCircle className="w-3 h-3 inline mr-1" />Approve & Verify</button>
                      <button onClick={() => updateStatus(m._id, 'rejected', false)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-100"><XCircle className="w-3 h-3 inline mr-1" />Reject</button>
                    </>
                  )}
                  {m.status === 'active' && !m.isVerified && (
                    <button onClick={() => updateStatus(m._id, 'active', true)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold"><Shield className="w-3 h-3 inline mr-1" />Verify</button>
                  )}
                  {m.status === 'active' && (
                    <button onClick={() => updateStatus(m._id, 'suspended', false)} className="px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-bold"><ShieldOff className="w-3 h-3 inline mr-1" />Suspend</button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {mentors.length === 0 && <Card className="p-8 text-center"><p className="text-slate-400 font-bold">No mentor applications</p></Card>}

          {totalPages > 1 && (
            <div className="flex justify-center gap-4">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
              <span className="text-sm font-bold text-slate-500 py-2">Page {page}/{totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminMentors;
