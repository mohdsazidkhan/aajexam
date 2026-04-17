'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, ListChecks, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const AdminStudyPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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

        <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <CalendarDays className="w-7 h-7 text-sky-500" /> Study Planner
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Admin view for study plan generation and active plan tracking.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="min-h-[40vh] flex items-center justify-center"><Loading size="lg" /></div>
          ) : (
            <div className="space-y-4">
              {plans.length === 0 ? (
                <Card className="p-6 text-center text-slate-500 dark:text-slate-400">
                  No study plans available. Study planner admin controls can be added here once backend support is present.
                </Card>
              ) : (
                plans.map((plan) => (
                  <Card key={plan._id} className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-400 uppercase tracking-[0.2em]">{plan.exam?.name || 'Unknown Exam'}</div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{plan.title || 'Study Plan'}</h2>
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
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminStudyPlanPage;
