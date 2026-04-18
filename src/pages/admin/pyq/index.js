'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const AdminPYQ = () => {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const testsRes = await API.request(`/api/admin/pyq?page=${page}&limit=20`);
      if (testsRes?.success) { setTests(testsRes.data || []); setTotalPages(testsRes.pagination?.totalPages || 1); }
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this PYQ paper?')) return;
    try { await API.request(`/api/admin/pyq/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>Manage PYQ Papers - Admin</title></Head>
        <div className="container mx-auto px-4 py-4 lg:px-4 lg:py-6 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-6 h-6 text-primary-500" /> PYQ Papers</h1>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Manage previous-year question papers across all exams</p>
            </div>
            <button onClick={() => router.push('/admin/pyq/create')} className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition flex items-center gap-2 flex-shrink-0">
              <Plus className="w-4 h-4" /> New PYQ
            </button>
          </div>

          {tests.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-lg font-black text-slate-500">No PYQ papers yet</h2>
              <p className="text-sm text-slate-400">Click "New PYQ" above to add your first previous-year paper.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tests.map((t, i) => (
                <Card key={t._id || i} className="p-4 lg:p-5 flex items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[10px] font-black text-primary-600 dark:text-primary-300">{t.pyqYear || 'PYQ'}</span>
                      {t.pyqShift && <span className="text-[10px] font-bold text-slate-400">{t.pyqShift}</span>}
                      {t.examPattern?.exam?.name && <span className="text-[10px] font-bold text-slate-400">· {t.examPattern.exam.name}</span>}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${t.isFree ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>{t.isFree ? 'FREE' : 'PRO'}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{t.title}</h3>
                    <p className="text-[10px] text-slate-400">{t.questions?.length || 0} questions · {t.duration} min · {t.totalMarks} marks</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => router.push(`/admin/pyq/edit/${t._id}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition" title="Edit">
                      <Pencil className="w-4 h-4 text-slate-500" />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Delete">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
              <span className="text-sm font-bold text-slate-500">Page {page}/{totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPYQ;
