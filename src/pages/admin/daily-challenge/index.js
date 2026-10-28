'use client';
import Select from '../../../components/common/ui/Select';
import React, { useState, useEffect } from 'react';
import { Target, Plus, Zap, Trash2, Calendar, Table as TableIcon, List, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/common/ui/Card';
import ResponsiveTable from '../../../components/common/ResponsiveTable';
import Pagination from '../../../components/common/Pagination';
import Sidebar from '../../../components/admin/Sidebar';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
import AdminRoute from '../../../components/admin/Route';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import SearchFilter from '../../../components/common/SearchFilter';
import StyledSelect from '../../../components/common/ui/StyledSelect';
import useDebounce from '../../../hooks/useDebounce';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminDailyChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genDate, setGenDate] = useState(new Date().toISOString().split('T')[0]);
  const [genCount, setGenCount] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth());
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  const fetchData = async () => {
    try { setLoading(true); const res = await API.request(`/api/admin/daily-challenge?page=${page}&limit=${itemsPerPage}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}`); if (res?.success) { setChallenges(res.data || []); setTotalPages(res.pagination?.totalPages || 1); setTotalItems(res.pagination?.total ?? (res.data || []).length); } } catch (e) { } finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [page, itemsPerPage, debouncedSearch, statusFilter]);

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

  const columns = [
    {
      key: 'date', header: 'Date', render: (_, c) => (
        <span className="text-content-muted">{new Date(c.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
      )
    },
    {
      key: 'title', header: 'Title', render: (_, c) => (
        <span className="font-bold text-content-primary">{c.title}</span>
      )
    },
    {
      key: 'questions', header: 'Questions', render: (_, c) => (
        <span className="text-content-muted">{c.questions?.length || 0}</span>
      )
    },
    {
      key: 'totalAttempts', header: 'Attempts', render: (_, c) => (
        <span className="text-content-muted">{c.totalAttempts}</span>
      )
    },
    {
      key: 'avgScore', header: 'Avg Score', render: (_, c) => (
        <span className="text-content-muted">{c.avgScore}</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, c) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.status === 'published' ? 'text-primary-600' : 'bg-background-surface-secondary text-content-muted'}`}>{c.status}</span>
          {c.isAutoGenerated && <span className="text-[9px] text-content-primary font-bold">Auto</span>}
        </div>
      )
    }
  ];

  const bulkYearSelect = (
    <Select value={bulkYear} onChange={e => setBulkYear(parseInt(e.target.value))} className="w-full xl:w-auto px-3 py-2 border border-border-primary rounded-lg xl:rounded-xl text-sm bg-background-surface outline-none">
      <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
      <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
    </Select>
  );

  const bulkMonthSelect = (
    <Select value={bulkMonth} onChange={e => setBulkMonth(parseInt(e.target.value))} className="w-full xl:w-auto px-3 py-2 border border-border-primary rounded-lg xl:rounded-xl text-sm bg-background-surface outline-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <option key={i} value={i}>{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}</option>
      ))}
    </Select>
  );

  const bulkCountSelect = (
    <Select value={bulkCount} onChange={e => setBulkCount(parseInt(e.target.value))} className="w-full xl:w-auto px-3 py-2 border border-border-primary rounded-lg xl:rounded-xl text-sm bg-background-surface outline-none">
      <option value={5}>5 Questions / Day</option>
      <option value={10}>10 Questions / Day</option>
      <option value={15}>15 Questions / Day</option>
      <option value={20}>20 Questions / Day</option>
    </Select>
  );

  const generateMonthButton = (
    <button onClick={autoGenerateMonth} disabled={bulkGenerating} className="w-full xl:w-auto px-4 py-2 text-on-primary rounded-lg xl:rounded-xl text-xs font-bold disabled:opacity-50 flex items-center justify-center bg-primary-600">
      <Calendar className="w-3 h-3 inline mr-1" />{bulkGenerating ? 'Generating...' : 'Generate Month'}
    </button>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { mode: 'table', icon: TableIcon, label: 'Table View' },
        { mode: 'list', icon: List, label: 'List View' },
        { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
      ].map(({ mode, icon: Icon, label }) => (
        <button key={mode} onClick={() => setViewMode(mode)} title={label}
          className={`border border-primary-600 flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}>
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

  const searchFilterInput = (
    <SearchFilter searchTerm={searchTerm} onSearch={(v) => { setSearchTerm(v); setPage(1); }} placeholder="Search challenges..." className="w-full xl:w-64" compact />
  );
  const statusFilterSelect = (
    <StyledSelect
      value={statusFilter}
      onChange={(val) => { setStatusFilter(val); setPage(1); }}
      options={[{ value: '', label: 'All Status' }, { value: 'published', label: 'Published' }, { value: 'draft', label: 'Draft' }]}
      className="w-full xl:max-w-[160px]"
    />
  );

  useAdminMobileHeader({
    title: 'Daily Challenge',
    count: totalItems,
    filters: (
      <>
        {searchFilterInput}
        {statusFilterSelect}
        {bulkYearSelect}
        {bulkMonthSelect}
        {bulkCountSelect}
        {generateMonthButton}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
        <Head><title>Daily Challenges - Admin</title></Head>
        <Sidebar />
        <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          {bulkProgress && (
            <Card className="shrink-0 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-content-secondary">
                  Generating: <span className="text-primary-600">{bulkProgress.currentDate}</span>
                </span>
                <span className="text-xs font-bold text-content-primary">
                  {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-background-surface-secondary rounded-full h-2 mb-3 overflow-hidden">
                <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}></div>
              </div>
              <div className="flex gap-3 text-[10px] font-bold">
                <span className="text-content-muted">Total: {bulkProgress.total}</span>
                <span className="text-primary-600">Success: {bulkProgress.success}</span>
                <span className="text-content-primary">Skipped: {bulkProgress.skipped}</span>
                <span className="text-content-primary">Failed: {bulkProgress.failed}</span>
              </div>
            </Card>
          )}

        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        <div className="flex-1 min-h-0">
        {challenges.length === 0 ? (
          <Card className="text-center"><p className="text-content-muted font-bold">No challenges created yet</p></Card>
        ) : viewMode === 'table' ? (
          <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto xl:h-full flex flex-col relative">
            <ResponsiveTable data={challenges} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
            {challenges.map((c, i) => (
              <Card as="article" key={c._id || i} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-content-muted shrink-0" />
                  <span className="text-[10px] font-bold text-content-muted truncate">{new Date(c.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h3 className="text-sm font-bold text-content-primary">{c.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.status === 'published' ? 'text-primary-600' : 'bg-background-surface-secondary text-content-muted'}`}>{c.status}</span>
                  {c.isAutoGenerated && <span className="text-[9px] text-content-primary font-bold">Auto</span>}
                </div>
                <span className="text-[10px] text-content-muted">{c.questions?.length || 0}Q | {c.totalAttempts} attempts | Avg: {c.avgScore}</span>
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-full overflow-auto space-y-2">
            {challenges.map((c, i) => (
              <Card as="article" key={c._id || i} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3 h-3 text-content-muted" />
                    <span className="text-[10px] font-bold text-content-muted">{new Date(c.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.status === 'published' ? 'text-primary-600' : 'bg-background-surface-secondary text-content-muted'}`}>{c.status}</span>
                    {c.isAutoGenerated && <span className="text-[9px] text-content-primary font-bold">Auto</span>}
                  </div>
                  <h3 className="text-sm font-bold text-content-primary">{c.title}</h3>
                  <span className="text-[10px] text-content-muted">{c.questions?.length || 0}Q | {c.totalAttempts} attempts | Avg: {c.avgScore}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
        </div>
        </div>
        </div>
      </div>
    </AdminRoute >
  );
};

export default AdminDailyChallenge;
