'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, ListChecks, Sparkles, Table as TableIcon, List, LayoutGrid, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import ResponsiveTable from '../../../components/ResponsiveTable';
import Pagination from '../../../components/Pagination';
import Sidebar from '../../../components/Sidebar';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
import AdminRoute from '../../../components/AdminRoute';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';

const AdminStudyPlanPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
        if (debouncedSearch) params.set('search', debouncedSearch);
        const res = await API.request(`/api/admin/study-plan?${params.toString()}`);
        if (res?.success) {
          setPlans(res.data || []);
          setTotalPages(res.pagination?.totalPages || 1);
          setTotalItems(res.pagination?.total ?? (res.data || []).length);
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
  }, [page, itemsPerPage, debouncedSearch]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleDelete = async (plan) => {
    if (!confirm(`Delete study plan "${plan.title || 'Study Plan'}"?`)) return;
    try {
      const res = await API.request(`/api/admin/study-plan/${plan._id}`, { method: 'DELETE' });
      if (res?.success) {
        toast.success('Study plan deleted');
        setPlans(prev => prev.filter(p => p._id !== plan._id));
        setTotalItems(prev => Math.max(0, prev - 1));
      } else {
        toast.error(res?.message || 'Failed to delete study plan');
      }
    } catch (error) {
      toast.error('Failed to delete study plan');
    }
  };

  const columns = [
    {
      key: 'exam', header: 'Exam', render: (_, plan) => (
        <span className="text-slate-500">{plan.exam?.name || 'Unknown Exam'}</span>
      )
    },
    {
      key: 'title', header: 'Title', render: (_, plan) => (
        <span className="font-bold text-slate-900 dark:text-white">{plan.title || 'Study Plan'}</span>
      )
    },
    {
      key: 'user', header: 'User', render: (_, plan) => (
        <span className="text-slate-500">{plan.user?.name || plan.user?.username || 'Unknown User'}</span>
      )
    },
    {
      key: 'dailyHours', header: 'Daily Hours', render: (_, plan) => (
        <span className="text-slate-500">{plan.dailyHours || '-'}</span>
      )
    },
    {
      key: 'completionPercentage', header: 'Completion', render: (_, plan) => (
        <span className="text-slate-500">{plan.completionPercentage ?? 0}%</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, plan) => (
        <span className="text-slate-500">{plan.status?.toUpperCase() || 'UNKNOWN'} · {plan.weeklySchedule?.length ?? 0}w</span>
      )
    },
    {
      key: 'createdAt', header: 'Created', render: (_, plan) => (
        <span className="text-slate-500">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString('en-IN') : '-'}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, plan) => (
        <button
          onClick={() => handleDelete(plan)}
          title="Delete"
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  return (
    <AdminRoute>
      <div className="h-[calc(100vh-64px)] max-md:h-[calc(100vh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <Head>
          <title>Admin Study Planner - AajExam</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <Sidebar />
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><CalendarDays className="w-6 h-6 text-primary-600 shrink-0" /> Study Planner <span className="text-slate-400 dark:text-slate-500">({totalItems})</span></h1>
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end flex-wrap">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by username, name, email, exam..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
                />
              </div>
              <div className="flex items-center gap-1">
                {[
                  { mode: 'table', icon: TableIcon, label: 'Table View' },
                  { mode: 'list', icon: List, label: 'List View' },
                  { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button key={mode} onClick={() => setViewMode(mode)} title={label}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0 overflow-hidden">
              {plans.length === 0 ? (
                <Card className="text-center text-slate-500 dark:text-slate-400">
                  No study plans available. Study planner admin controls can be added here once backend support is present.
                </Card>
              ) : viewMode === 'table' ? (
                <Card className="!p-0 overflow-hidden h-full flex flex-col" padded={false}>
                  <ResponsiveTable data={plans} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                </Card>
              ) : viewMode === 'grid' ? (
                <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  {plans.map((plan) => (
                    <Card key={plan._id} className="flex flex-col gap-2 relative">
                      <button
                        onClick={() => handleDelete(plan)}
                        title="Delete"
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="text-xs text-slate-400 uppercase tracking-[0.2em]">{plan.exam?.name || 'Unknown Exam'}</div>
                      <h2 className="text-base font-black text-slate-900 dark:text-white pr-8">{plan.title || 'Study Plan'}</h2>
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
                <div className="h-full overflow-auto space-y-2 lg:space-y-4">
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
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {plan.status?.toUpperCase() || 'UNKNOWN'} · {plan.weeklySchedule?.length ?? 0} weeks
                          </div>
                          <button
                            onClick={() => handleDelete(plan)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
              </div>

              {totalItems > 0 && (
                <div className="shrink-0">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setPage(1); }}
                  />
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminStudyPlanPage;
