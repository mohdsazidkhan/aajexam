'use client';
import Select from '../../../components/common/ui/Select';
import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2, Filter, Table as TableIcon, List, LayoutGrid, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/common/ui/Card';
import ResponsiveTable from '../../../components/common/ResponsiveTable';
import Pagination from '../../../components/common/Pagination';
import Sidebar from '../../../components/admin/Sidebar';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
import AdminRoute from '../../../components/admin/Route';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminPYQ = () => {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [maxYearByExam, setMaxYearByExam] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

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
      const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
      if (selectedExamId) params.set('examId', selectedExamId);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const testsRes = await API.request(`/api/admin/pyq?${params.toString()}`);
      if (testsRes?.success) {
        setTests(testsRes.data || []);
        setMaxYearByExam(testsRes.maxYearByExam || {});
        setTotalPages(testsRes.pagination?.totalPages || 1);
        setTotalItems(testsRes.pagination?.total ?? (testsRes.data || []).length);
      }
    } catch (e) { } finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [page, selectedExamId, itemsPerPage, debouncedSearch]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleExamChange = (e) => {
    setSelectedExamId(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this PYQ paper?')) return;
    try { await API.request(`/api/admin/pyq/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { toast.error('Failed'); }
  };

  const getIsFree = (t) => {
    const examId = t.examPattern?.exam?._id ? String(t.examPattern.exam._id) : null;
    const maxYear = examId ? maxYearByExam[examId] : null;
    return maxYear != null && Number(t.pyqYear) === Number(maxYear);
  };

  const columns = [
    {
      key: 'title', header: 'Paper', render: (_, t) => (
        <div>
          <p className="font-bold text-content-primary">{t.title}</p>
          <p className="text-[10px] text-content-muted mt-0.5">{t.pyqYear || 'PYQ'}{t.pyqShift ? ` · ${t.pyqShift}` : ''} · {t.duration} min · {t.totalMarks} marks</p>
        </div>
      )
    },
    {
      key: 'exam', header: 'Exam', render: (_, t) => (
        <span className="text-content-muted">{t.examPattern?.exam?.name || '—'}</span>
      )
    },
    {
      key: 'questions', header: 'Questions', render: (_, t) => (
        <span className="text-content-muted">{t.questions?.length || 0}</span>
      )
    },
    {
      key: 'access', header: 'Access', render: (_, t) => {
        const isFree = getIsFree(t);
        return <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isFree ? 'text-primary-600' : 'bg-background-surface-secondary text-content-primary'}`}>{isFree ? 'FREE' : 'PRO'}</span>;
      }
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, t) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => router.push(`/admin/pyq/edit/${t._id}`)} className="p-2 hover:bg-background-surface-secondary rounded-lg transition" title="Edit">
            <Pencil className="w-4 h-4 text-content-muted" />
          </button>
          <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-background-surface-secondary rounded-lg transition" title="Delete">
            <Trash2 className="w-4 h-4 text-content-primary" />
          </button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full sm:w-56">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input type="text" placeholder="Search paper title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
    </div>
  );

  const examFilterSelect = (
    <div className="relative flex items-center w-full sm:w-auto">
      <Filter className="absolute left-2.5 w-3.5 h-3.5 text-content-muted pointer-events-none" />
      <Select
        value={selectedExamId}
        onChange={handleExamChange}
        className="w-full sm:w-auto pl-8 pr-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm font-bold text-content-secondary appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 transition sm:min-w-[160px]"
      >
        <option value="">All Exams</option>
        {exams.map(exam => (
          <option key={exam._id} value={exam._id}>{exam.name}</option>
        ))}
      </Select>
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
          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}>
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  const newPyqButton = (
    <button onClick={() => router.push('/admin/pyq/create')} className="w-full px-4 py-2 rounded-lg xl:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-on-primary bg-primary-600">
      <Plus className="w-3 h-3" /> New PYQ
    </button>
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
    title: 'PYQ Papers',
    count: totalItems,
    filters: (
      <>
        {searchInput}
        {examFilterSelect}
        {viewToggleButtons}
        {newPyqButton}
        {paginationControl}
      </>
    )
  });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
        <Head><title>Manage PYQ Papers - Admin</title></Head>
        <Sidebar />
        <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0">
            {tests.length === 0 ? (
              <Card as="section" className="p-10 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h2 className="text-lg font-bold text-content-muted">No PYQ papers {selectedExamId ? 'for this exam' : 'yet'}</h2>
                <p className="text-sm text-content-muted">{selectedExamId ? 'Try selecting a different exam or clear the filter.' : 'Click "New PYQ" above to add your first previous-year paper.'}</p>
              </Card>
            ) : viewMode === 'table' ? (
              <Card className="!p-0 overflow-hidden h-auto xl:h-full flex flex-col" padded={false}>
                <ResponsiveTable data={tests} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                {tests.map((t, i) => {
                  const examId = t.examPattern?.exam?._id ? String(t.examPattern.exam._id) : null;
                  const maxYear = examId ? maxYearByExam[examId] : null;
                  const isFree = maxYear != null && Number(t.pyqYear) === Number(maxYear);
                  return (
                    <Card as="section" key={t._id || i} className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-md text-primary-600 flex items-center justify-center shrink-0 border border-primary-600"><FileText className="w-5 h-5" /></div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isFree ? 'text-primary-600' : 'bg-background-surface-secondary text-content-primary'}`}>{isFree ? 'FREE' : 'PRO'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-primary-600">{t.pyqYear || 'PYQ'}</span>
                          {t.pyqShift && <span className="text-[10px] font-bold text-content-muted">{t.pyqShift}</span>}
                        </div>
                        <h3 className="text-sm font-bold text-content-primary truncate">{t.title}</h3>
                        <p className="text-[10px] text-content-muted mt-1">{t.examPattern?.exam?.name ? `${t.examPattern.exam.name} · ` : ''}{t.questions?.length || 0} questions · {t.duration} min</p>
                      </div>
                      <div className="flex gap-2 mt-auto pt-2 border-t border-border-primary">
                        <button onClick={() => router.push(`/admin/pyq/edit/${t._id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-600 rounded-lg"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                        <button onClick={() => handleDelete(t._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-content-primary hover:bg-background-surface-secondary rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="h-full overflow-auto space-y-3">
                {tests.map((t, i) => {
                  const examId = t.examPattern?.exam?._id ? String(t.examPattern.exam._id) : null;
                  const maxYear = examId ? maxYearByExam[examId] : null;
                  const isFree = maxYear != null && Number(t.pyqYear) === Number(maxYear);
                  return (
                  <Card as="section" key={t._id || i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-primary-600">{t.pyqYear || 'PYQ'}</span>
                        {t.pyqShift && <span className="text-[10px] font-bold text-content-muted">{t.pyqShift}</span>}
                        {t.examPattern?.exam?.name && <span className="text-[10px] font-bold text-content-muted">· {t.examPattern.exam.name}</span>}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${isFree ? 'text-primary-600' : 'bg-background-surface-secondary text-content-primary'}`}>{isFree ? 'FREE' : 'PRO'}</span>
                      </div>
                      <h3 className="text-sm font-bold text-content-primary truncate">{t.title}</h3>
                      <p className="text-[10px] text-content-muted">{t.questions?.length || 0} questions · {t.duration} min · {t.totalMarks} marks</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => router.push(`/admin/pyq/edit/${t._id}`)} className="p-2 hover:bg-background-surface-secondary rounded-lg transition" title="Edit">
                        <Pencil className="w-4 h-4 text-content-muted" />
                      </button>
                      <button onClick={() => handleDelete(t._id)} className="p-2 hover:bg-background-surface-secondary rounded-lg transition" title="Delete">
                        <Trash2 className="w-4 h-4 text-content-primary" />
                      </button>
                    </div>
                  </Card>
                  );
                })}
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

export default AdminPYQ;
