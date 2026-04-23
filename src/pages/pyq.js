'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Clock, Trophy, BookOpen, ChevronRight, Filter } from 'lucide-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';
import { ProBadge } from '../components/ui';
import { hasProSubscription } from '../lib/utils/subscriptionUtils';
import { Lock } from 'lucide-react';

const PYQPage = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 20 });
        if (year) params.set('year', year);
        const res = await API.request(`/api/pyq?${params}`);
        if (res?.success) { setTests(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [year, page]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Head><title>Previous Year Questions (PYQ) - AajExam</title></Head>
      <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6 space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><FileText className="w-6 h-6 text-primary-500" /> Previous Year Papers</h1>
              <p className="text-sm font-bold text-slate-400">Practice with real exam questions</p>
            </div>
            <select value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none">
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {tests.map((test, i) => {
              const isPro = !test.isLastYear;
              const hasAccess = !isPro || hasProSubscription();

              return (
                <Card key={test._id || i} 
                  className="p-5 hover:shadow-xl transition-all cursor-pointer border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500"
                  onClick={() => {
                    if (hasAccess) {
                      router.push(`/govt-exams/test/${test._id}/start`);
                    } else {
                      router.push('/subscription');
                    }
                  }}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-[10px] font-black text-primary-600">{test.pyqYear || 'PYQ'}</span>
                        {test.isLastYear && <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-[10px] font-black text-emerald-600">LATEST</span>}
                      </div>
                      {test.pyqShift && <span className="text-[10px] font-bold text-slate-400">{test.pyqShift}</span>}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">{test.title}</h3>
                    {test.examPattern?.exam?.name && <p className="text-[10px] font-bold text-slate-400">{test.examPattern.exam.name}</p>}
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{test.questionCount || 0} Q</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{test.duration} min</span>
                      <span className="flex items-center gap-1"><Trophy className="w-3 h-3" />{test.totalMarks} marks</span>
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                       {isPro ? (
                         <div className="flex items-center gap-1">
                           <ProBadge size="xs" />
                           {!hasAccess && <Lock className="w-3 h-3 text-slate-400" />}
                         </div>
                       ) : (
                         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">Free Access</span>
                       )}
                       <div className="flex items-center gap-1 text-[10px] font-black text-primary-500">
                         {hasAccess ? 'Practice Now' : 'Unlock with PRO'} <ChevronRight className="w-3 h-3" />
                       </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {tests.length === 0 && <div className="text-center py-12"><p className="text-slate-400 font-bold">No PYQ papers available yet</p></div>}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
              <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
            </div>
          )}
      </div>
    </div>
  );
};

export default PYQPage;
