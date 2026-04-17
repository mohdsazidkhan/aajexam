'use client';

import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const AdminStreakPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.request('/api/admin/streak/leaderboard?limit=20&type=current');
        if (res?.success) {
          setLeaderboard(res.data || []);
        } else {
          toast.error(res?.message || 'Unable to load streak leaderboard');
        }
      } catch (error) {
        toast.error('Unable to load streak leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head>
          <title>Admin Streak Dashboard - AajExam</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Flame className="w-7 h-7 text-orange-500" /> Streak Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Review top streak performers and tuning data for streak-based engagement.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center"><Loading size="lg" /></div>
          ) : (
            <div className="grid gap-4">
              {leaderboard.length === 0 ? (
                <Card className="p-6 text-center text-slate-500 dark:text-slate-400">
                  No streak data available yet.
                </Card>
              ) : (
                leaderboard.map((entry, idx) => (
                  <Card key={entry._id || idx} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">#{idx + 1}</div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">{entry.user?.name || entry.user?.username || 'Unknown'}</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Current streak: <span className="font-bold text-orange-500">{entry.currentStreak}</span></p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
                      <div><span className="font-black text-slate-900 dark:text-white">{entry.totalActiveDays}</span> active days</div>
                      <div><span className="font-black text-slate-900 dark:text-white">{entry.longestStreak}</span> longest streak</div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminStreakPage;
