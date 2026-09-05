'use client';
import React, { useState, useEffect } from 'react';
import { Target, Plus, Zap, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const AdminDailyChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genDate, setGenDate] = useState(new Date().toISOString().split('T')[0]);
  const [genCount, setGenCount] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth());
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);

  const fetchData = async () => {
    try { setLoading(true); const res = await API.request(`/api/admin/daily-challenge?page=${page}&limit=20`); if (res?.success) { setChallenges(res.data || []); setTotalPages(res.pagination?.totalPages || 1); } } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);

  const autoGenerate = async () => {
    setGenerating(true);
    try {
      const res = await API.request('/api/admin/daily-challenge/auto-generate', {
        method: 'POST', body: JSON.stringify({ date: genDate, count: genCount })
      });
      if (res?.success) { toast.success('Challenge generated!'); fetchData(); }
      else toast.error(res?.message || 'Failed');
    } catch (e) { toast.error('Failed'); } finally { setGenerating(false); }
  };

  const autoGenerateMonth = async () => {
    setBulkGenerating(true);
    const daysInMonth = new Date(bulkYear, bulkMonth + 1, 0).getDate();
    setBulkProgress({ total: daysInMonth, current: 0, success: 0, skipped: 0, failed: 0, currentDate: 'Checking Database...' });
    
    try {
      let successCount = 0;
      let skippedCount = 0;
      let failedCount = 0;

      // 1. First check which days already exist in the DB
      const checkRes = await API.request(`/api/admin/daily-challenge/check-month?year=${bulkYear}&month=${bulkMonth}`);
      const existingDays = checkRes?.data || [];

      // 2. Loop and generate only for missing days
      for (let day = 1; day <= daysInMonth; day++) {
        const targetDate = new Date(bulkYear, bulkMonth, day);
        const dateString = new Date(targetDate.getTime() - targetDate.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        
        setBulkProgress(prev => ({ ...prev, currentDate: targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }));

        if (existingDays.includes(day)) {
          skippedCount++;
        } else {
          try {
            const res = await API.request('/api/admin/daily-challenge/auto-generate', {
              method: 'POST', body: JSON.stringify({ date: dateString, count: bulkCount })
            });
            if (res?.success) successCount++;
            else failedCount++;
          } catch (e) {
            // Check if the error is our custom already exists error (fallback)
            if (e.message && e.message.includes('already exists')) skippedCount++;
            else failedCount++;
          }
        }
        
        setBulkProgress(prev => ({ 
          ...prev, 
          current: day, 
          success: successCount, 
          skipped: skippedCount, 
          failed: failedCount 
        }));
      }
      toast.success(`Month generated! Added: ${successCount}, Skipped: ${skippedCount}`);
      fetchData();
    } catch (e) {
      toast.error('Bulk generation failed');
    } finally {
      setBulkGenerating(false);
      setTimeout(() => setBulkProgress(null), 8000); // Hide after 8s
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>Daily Challenges - Admin</title></Head>
        <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
          <div className='flex justify-between items-center mb-6'>
            <div className='flex flex-col'>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2"><Target className="w-6 h-6 text-primary-500" /> Daily Challenges</h1>
              <p>Bulk Generate for Whole Month</p>
            </div>
            <div className="p-2 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <select value={bulkYear} onChange={e => setBulkYear(parseInt(e.target.value))} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none">
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
                </select>
                <select value={bulkMonth} onChange={e => setBulkMonth(parseInt(e.target.value))} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
                <select value={bulkCount} onChange={e => setBulkCount(parseInt(e.target.value))} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none">
                  <option value={5}>5 Questions / Day</option>
                  <option value={10}>10 Questions / Day</option>
                  <option value={15}>15 Questions / Day</option>
                  <option value={20}>20 Questions / Day</option>
                </select>
                <button onClick={autoGenerateMonth} disabled={bulkGenerating} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                  <Calendar className="w-3 h-3 inline mr-1" />{bulkGenerating ? 'Generating...' : 'Generate Month'}
                </button>
              </div>

              {bulkProgress && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Generating: <span className="text-primary-600">{bulkProgress.currentDate}</span>
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-3 overflow-hidden">
                    <div className="bg-primary-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}></div>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold">
                    <span className="text-slate-500">Total: {bulkProgress.total}</span>
                    <span className="text-emerald-500">Success: {bulkProgress.success}</span>
                    <span className="text-amber-500">Skipped: {bulkProgress.skipped}</span>
                    <span className="text-red-500">Failed: {bulkProgress.failed}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {challenges.map((c, i) => (
            <Card key={c._id || i} className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500">{new Date(c.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black ${c.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                  {c.isAutoGenerated && <span className="text-[9px] text-blue-500 font-bold">Auto</span>}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h3>
                <span className="text-[10px] text-slate-400">{c.questions?.length || 0}Q | {c.totalAttempts} attempts | Avg: {c.avgScore}</span>
              </div>
            </Card>
          ))}
        </div>

        {challenges.length === 0 && <Card className="p-8 text-center"><p className="text-slate-400 font-bold">No challenges created yet</p></Card>}

        {totalPages > 1 && (
          <div className="flex justify-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
            <span className="text-sm font-bold text-slate-500 py-2">Page {page}/{totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </AdminRoute >
  );
};

export default AdminDailyChallenge;
