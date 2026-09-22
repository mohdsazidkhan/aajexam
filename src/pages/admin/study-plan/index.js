'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, ListChecks, Sparkles, Table as TableIcon, List, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
import AdminRoute from '../../../components/AdminRoute';

const AdminStudyPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024 ? 'grid' : 'table');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await API.request('/api/admin/study-plan?page=1&limit=20');
        if (res?.success) {
          setPlans(res.data || []);
        } else {
          toast.error(res?.message || 'Unable to load study plans');
        }
      } catch (error) {
        toast.error('Unable to load study plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head>
          <title>Admin Study Planner - AajExam</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>

        <div className="py-4 lg:py-8 space-y-3 lg:space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <CalendarDays className="w-7 h-7 text-black dark:text-white" /> Study Planner
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Admin view for study plan generation and active plan tracking.
              </p>
            </div>
          </div>

          {loading ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : plans.length === 0 ? (
            <Card className="text-center text-slate-500 dark:text-slate-400">
              No study plans available. Study planner admin controls can be added here once backend support is present.
            </Card>
          ) : (
            <>
              {/* View Toggle & Count */}
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{plans.length} plan{plans.length !== 1 ? 's' : ''}</p>
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

              {viewMode === 'table' ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white dark:bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Exam</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Title</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">User</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Daily Hours</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Completion</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Status</th>
                        <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {plans.map((plan) => (
                        <tr key={plan._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-3 text-slate-500">{plan.exam?.name || 'Unknown Exam'}</td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{plan.title || 'Study Plan'}</td>
                          <td className="px-4 py-3 text-slate-500">{plan.user?.name || plan.user?.username || 'Unknown User'}</td>
                          <td className="px-4 py-3 text-slate-500">{plan.dailyHours || '-'}</td>
                          <td className="px-4 py-3 text-slate-500">{plan.completionPercentage ?? 0}%</td>
                          <td className="px-4 py-3 text-slate-500">{plan.status?.toUpperCase() || 'UNKNOWN'} · {plan.weeklySchedule?.length ?? 0}w</td>
                          <td className="px-4 py-3 text-slate-500">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-IN') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <Card key={plan._id} className="flex flex-col gap-2">
                      <div className="text-xs text-slate-400 uppercase tracking-[0.2em]">{plan.exam?.name || 'Unknown Exam'}</div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white">{plan.title || 'Study Plan'}</h2>
                      <div className="text-xs text-slate-500 dark:text-slate-400">By {plan.user?.name || plan.user?.username || 'Unknown User'}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{plan.status?.toUpperCase() || 'UNKNOWN'} · {plan.weeklySchedule?.length ?? 0} weeks</div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div>
                          <div className="font-black text-slate-900 dark:text-white">{plan.dailyHours || '-'}</div>
                          <div>Daily hrs</div>
                        </div>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white">{plan.completionPercentage ?? 0}%</div>
                          <div>Complete</div>
                        </div>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-IN') : '-'}</div>
                          <div>Created</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 lg:space-y-4">
                  {plans.map((plan) => (
                    <Card key={plan._id} className="">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <div className="text-sm text-slate-400 uppercase tracking-[0.2em]">{plan.exam?.name || 'Unknown Exam'}</div>
                          <h2 className="text-xl font-black text-slate-900 dark:text-white">{plan.title || 'Study Plan'}</h2>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            By {plan.user?.name || plan.user?.username || 'Unknown User'}
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {plan.status?.toUpperCase() || 'UNKNOWN'} · {plan.weeklySchedule?.length ?? 0} weeks
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <div className="space-y-1">
                          <div className="font-black text-slate-900 dark:text-white">{plan.dailyHours || '-'}</div>
                          <div>Daily hours</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-slate-900 dark:text-white">{plan.completionPercentage ?? 0}%</div>
                          <div>Completion</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-black text-slate-900 dark:text-white">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-IN') : '-'}</div>
                          <div>Created</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminStudyPlanPage;
