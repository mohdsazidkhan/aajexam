'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Clock, CheckCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const AdminRevisionPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head>
          <title>Admin Revision Queue - AajExam</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <RotateCcw className="w-7 h-7 text-primary-500" /> Revision Queue
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Monitor revision queue health and review scheduling metrics.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center"><Loading size="lg" /></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary-600"><Clock className="w-5 h-5" /> <span className="text-xs uppercase tracking-[0.2em] font-black">Due Today</span></div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stats?.dueToday ?? 0}</div>
              </Card>
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-600"><ShieldCheck className="w-5 h-5" /> <span className="text-xs uppercase tracking-[0.2em] font-black">Total Active</span></div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stats?.totalItems ?? 0}</div>
              </Card>
              <Card className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600"><CheckCircle className="w-5 h-5" /> <span className="text-xs uppercase tracking-[0.2em] font-black">Mastered</span></div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{stats?.mastered ?? 0}</div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminRevisionPage;
