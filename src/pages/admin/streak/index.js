'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Search, Table as TableIcon, List, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import ResponsiveTable from '../../../components/ResponsiveTable';
import Pagination from '../../../components/Pagination';
import Sidebar from '../../../components/Sidebar';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
import AdminRoute from '../../../components/admin/Route';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminStreakPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage), type: 'current' });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await API.request(`/api/admin/streak/leaderboard?${params.toString()}`);
      if (res?.success) {
        setLeaderboard(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalItems(res.pagination?.total ?? (res.data || []).length);
      } else {
        toast.error(res?.message || 'Unable to load streak leaderboard');
      }
    } catch (error) {
      toast.error('Unable to load streak leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaderboard(); }, [page, itemsPerPage, debouncedSearch]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const rankedLeaderboard = leaderboard.map((entry, idx) => ({ ...entry, rank: (page - 1) * itemsPerPage + idx + 1 }));

  const columns = [
    { key: 'rank', header: '#', align: 'center', render: (v) => <span className="text-xs font-black text-slate-400">#{v}</span> },
    {
      key: 'user', header: 'User', render: (_, e) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{e.user?.name || e.user?.username || 'Unknown'}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{e.user?.email || e.user?.username || ''}</p>
        </div>
      )
    },
    { key: 'currentStreak', header: 'Current Streak', align: 'center', render: (v) => <span className="font-black text-black dark:text-white">{v}</span> },
    { key: 'longestStreak', header: 'Longest Streak', align: 'center', render: (v) => <span className="font-bold text-slate-600 dark:text-slate-300">{v}</span> },
    { key: 'totalActiveDays', header: 'Active Days', align: 'center', render: (v) => <span className="font-bold text-slate-600 dark:text-slate-300">{v}</span> },
  ];

  const searchInput = (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        placeholder="Search by name, email, username..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { mode: 'table', icon: TableIcon, label: 'Table View' },
        { mode: 'list', icon: List, label: 'List View' },
        { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
      ].map(({ mode, icon: Icon, label }) => (
        <button key={mode} onClick={() => setViewMode(mode)} title={label}
          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  const paginationControl = totalItems > 0 && (
    <Pagination
      compact
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setPage(1); }}
    />
  );

  useAdminMobileHeader({
    title: 'Streaks',
    count: totalItems,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <Head>
          <title>Admin Streak Dashboard - AajExam</title>
          <meta name="robots" content="noindex,nofollow" />
        </Head>
        <Sidebar />
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          <div className="flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">
            {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
              <>
                <div className="flex-1 min-h-0 overflow-auto lg:overflow-hidden">
                  {rankedLeaderboard.length === 0 ? (
                    <Card className="p-10 text-center space-y-3">
                      <Flame className="w-12 h-12 text-slate-300 mx-auto" />
                      <h2 className="text-lg font-black text-slate-500">No streak data {searchTerm ? 'found' : 'available yet'}</h2>
                      {searchTerm && <p className="text-sm text-slate-400">Try a different name, email, or username.</p>}
                    </Card>
                  ) : viewMode === 'table' ? (
                    <Card className="!p-0 overflow-hidden h-auto lg:h-full flex flex-col" padded={false}>
                      <ResponsiveTable data={rankedLeaderboard} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                    </Card>
                  ) : viewMode === 'grid' ? (
                    <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                      {rankedLeaderboard.map((entry, i) => (
                        <Card key={entry._id || i} className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0"><Flame className="w-5 h-5" /></div>
                            <span className="text-[10px] font-black text-slate-400">#{entry.rank}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{entry.user?.name || entry.user?.username || 'Unknown'}</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{entry.user?.email || entry.user?.username || ''}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-700">
                            <div><span className="font-black text-black dark:text-white">{entry.currentStreak}</span> <span className="text-slate-400">current</span></div>
                            <div><span className="font-black text-slate-600 dark:text-slate-300">{entry.longestStreak}</span> <span className="text-slate-400">longest</span></div>
                            <div><span className="font-black text-slate-600 dark:text-slate-300">{entry.totalActiveDays}</span> <span className="text-slate-400">days</span></div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full overflow-auto space-y-3">
                      {rankedLeaderboard.map((entry, i) => (
                        <Card key={entry._id || i} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">#{entry.rank}</div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">{entry.user?.name || entry.user?.username || 'Unknown'}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Current streak: <span className="font-bold text-black dark:text-white">{entry.currentStreak}</span></p>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
                            <div><span className="font-black text-slate-900 dark:text-white">{entry.totalActiveDays}</span> active days</div>
                            <div><span className="font-black text-slate-900 dark:text-white">{entry.longestStreak}</span> longest streak</div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminStreakPage;
