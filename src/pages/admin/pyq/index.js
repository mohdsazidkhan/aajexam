'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const AdminPYQ = () => {
  const [tests, setTests] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsRes, patternsRes] = await Promise.all([
        API.request(`/api/admin/pyq?page=${page}&limit=20`),
        API.request('/api/real-exams/all-exams').catch(() => ({ success: false }))
      ]);
      if (testsRes?.success) { setTests(testsRes.data || []); setTotalPages(testsRes.pagination?.totalPages || 1); }
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this PYQ?')) return;
    try { await API.request(`/api/admin/pyq/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>Manage PYQ Papers - Admin</title></Head>
        <div className="container mx-auto py-4 lg:py-8 px-4 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-6 h-6 text-primary-500" /> PYQ Papers</h1>
            <p className="text-xs text-slate-400 font-bold">Create PYQ via Govt Exams &gt; Tests (mark as PYQ)</p>
          </div>

          <div className="space-y-2">
            {tests.map((t, i) => (
              <Card key={t._id || i} className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary-50 rounded text-[9px] font-black text-primary-600">{t.pyqYear || 'PYQ'}</span>
                    {t.pyqShift && <span className="text-[10px] text-slate-400">{t.pyqShift}</span>}
                    <span className="text-[10px] text-slate-400">{t.examPattern?.exam?.name}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.title}</h3>
                  <span className="text-[10px] text-slate-400">{t.questions?.length || 0} questions | {t.duration} min | {t.totalMarks} marks</span>
                </div>
                <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </Card>
            ))}
          </div>

          {tests.length === 0 && <Card className="p-8 text-center"><p className="text-slate-400 font-bold">No PYQ papers yet. Create them via Admin &gt; Govt Exams &gt; Tests and mark isPYQ: true</p></Card>}

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

export default AdminPYQ;
