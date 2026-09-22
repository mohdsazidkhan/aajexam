'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2, Filter, Table as TableIcon, List, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
import AdminRoute from '../../../components/AdminRoute';

const AdminPYQ = () => {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [maxYearByExam, setMaxYearByExam] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024 ? 'grid' : 'table');

  // Fetch all exams for the filter dropdown
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.request('/api/real-exams/all-exams');
        if (res?.success) setExams(res.data || []);
      } catch (e) {}
    };
    fetchExams();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const examParam = selectedExamId ? `&examId=${selectedExamId}` : '';
      const testsRes = await API.request(`/api/admin/pyq?page=${page}&limit=20${examParam}`);
      if (testsRes?.success) {
        setTests(testsRes.data || []);
        setMaxYearByExam(testsRes.maxYearByExam || {});
        setTotalPages(testsRes.pagination?.totalPages || 1);
      }
    } catch (e) { } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, selectedExamId]);

  const handleExamChange = (e) => {
    setSelectedExamId(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this PYQ paper?')) return;
    try { await API.request(`/api/admin/pyq/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <AdminTableSkeleton />;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>Manage PYQ Papers - Admin</title></Head>
        <div className="py-4 lg:py-6 space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-6 h-6 text-primary-700" /> PYQ Papers</h1>
              <p className="text-xs text-slate-400 font-bold mt-0.5">Manage previous-year question papers across all exams</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              {/* Exam Filter Dropdown */}
              <div className="relative flex items-center w-full sm:w-auto">
                <Filter className="absolute left-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={selectedExamId}
                  onChange={handleExamChange}
                  className="w-full sm:w-auto pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition sm:min-w-[160px]"
                >
                  <option value="">All Exams</option>
                  {exams.map(exam => (
                    <option key={exam._id} value={exam._id}>{exam.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => router.push('/admin/pyq/create')} className="w-full sm:w-auto px-4 py-2.5 bg-primary-700 text-white rounded-lg lg:rounded-xl text-sm font-bold hover:bg-primary-600 transition flex items-center justify-center gap-2 shrink-0">
                <Plus className="w-4 h-4" /> New PYQ
              </button>
            </div>
          </div>

          {/* View Toggle & Count */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{tests.length} paper{tests.length !== 1 ? 's' : ''} on this page</p>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg lg:rounded-xl p-1 gap-0.5">
              {[
                { mode: 'table', icon: TableIcon, label: 'Table' },
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

          {tests.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h2 className="text-lg font-black text-slate-500">No PYQ papers {selectedExamId ? 'for this exam' : 'yet'}</h2>
              <p className="text-sm text-slate-400">{selectedExamId ? 'Try selecting a different exam or clear the filter.' : 'Click "New PYQ" above to add your first previous-year paper.'}</p>
            </Card>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white dark:bg-slate-900">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Paper</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Exam</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Questions</th>
                    <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Access</th>
                    <th className="px-4 py-3 text-right font-bold text-slate-500 uppercase text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {tests.map((t, i) => {
                    const examId = t.examPattern?.exam?._id ? String(t.examPattern.exam._id) : null;
                    const maxYear = examId ? maxYearByExam[examId] : null;
                    const isFree = maxYear != null && Number(t.pyqYear) === Number(maxYear);
                    return (
                      <tr key={t._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{t.pyqYear || 'PYQ'}{t.pyqShift ? ` · ${t.pyqShift}` : ''} · {t.duration} min · {t.totalMarks} marks</p>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{t.examPattern?.exam?.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-500">{t.questions?.length || 0}</td>
                        <td className="px-4 py-3"><span className={`text-[9px] font-black px-2 py-0.5 rounded ${isFree ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/20'}`}>{isFree ? 'FREE' : 'PRO'}</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => router.push(`/admin/pyq/edit/${t._id}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition" title="Edit">
                              <Pencil className="w-4 h-4 text-slate-500" />
                            </button>
                            <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/20 rounded-lg transition" title="Delete">
                              <Trash2 className="w-4 h-4 text-black dark:text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((t, i) => {
                const examId = t.examPattern?.exam?._id ? String(t.examPattern.exam._id) : null;
                const maxYear = examId ? maxYearByExam[examId] : null;
                const isFree = maxYear != null && Number(t.pyqYear) === Number(maxYear);
                return (
                  <Card key={t._id || i} className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${isFree ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/20'}`}>{isFree ? 'FREE' : 'PRO'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[10px] font-black text-primary-700 dark:text-primary-300">{t.pyqYear || 'PYQ'}</span>
                        {t.pyqShift && <span className="text-[10px] font-bold text-slate-400">{t.pyqShift}</span>}
                      </div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{t.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1">{t.examPattern?.exam?.name ? `${t.examPattern.exam.name} · ` : ''}{t.questions?.length || 0} questions · {t.duration} min</p>
                    </div>
                    <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                      <button onClick={() => router.push(`/admin/pyq/edit/${t._id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                      <button onClick={() => handleDelete(t._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map((t, i) => {
                const examId = t.examPattern?.exam?._id ? String(t.examPattern.exam._id) : null;
                const maxYear = examId ? maxYearByExam[examId] : null;
                const isFree = maxYear != null && Number(t.pyqYear) === Number(maxYear);
                return (
                <Card key={t._id || i} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[10px] font-black text-primary-700 dark:text-primary-300">{t.pyqYear || 'PYQ'}</span>
                      {t.pyqShift && <span className="text-[10px] font-bold text-slate-400">{t.pyqShift}</span>}
                      {t.examPattern?.exam?.name && <span className="text-[10px] font-bold text-slate-400">· {t.examPattern.exam.name}</span>}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${isFree ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white dark:bg-white/20'}`}>{isFree ? 'FREE' : 'PRO'}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{t.title}</h3>
                    <p className="text-[10px] text-slate-400">{t.questions?.length || 0} questions · {t.duration} min · {t.totalMarks} marks</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => router.push(`/admin/pyq/edit/${t._id}`)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition" title="Edit">
                      <Pencil className="w-4 h-4 text-slate-500" />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/20 rounded-lg transition" title="Delete">
                      <Trash2 className="w-4 h-4 text-black dark:text-white" />
                    </button>
                  </div>
                </Card>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 pt-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg lg:rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
              <span className="text-sm font-bold text-slate-500">Page {page}/{totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg lg:rounded-xl text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPYQ;
