'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Search, MapPin, Target, LayoutGrid, List, Table as TableIcon } from 'lucide-react';
import API from '../../../lib/api';
import { toast } from 'react-toastify';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AllIndiaRankPage = () => {
  const { isMounted } = useSSR();
  const [data, setData] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examId, setExamId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    if (window.innerWidth < 768) setViewMode('grid');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.getAllExams();
        setExams(res?.success ? res.data || [] : (Array.isArray(res) ? res : []));
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    })();
  }, []);

  const fetchAIR = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(examId !== 'all' && { examId }),
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await API.getAdminAIR(params);
      setData(response.data || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching admin AIR:', error);
      toast.error('Unable to load All India Rank. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [examId, currentPage, itemsPerPage, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAIR(), 300);
    return () => clearTimeout(timer);
  }, [fetchAIR]);

  const handleExamChange = (val) => { setExamId(val); setCurrentPage(1); };
  const handleSearch = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };

  const columns = [
    {
      key: 'rank', header: 'AIR', render: (_, row) => (
        <div className={`w-8 lg:w-12 h-8 lg:h-12 rounded-lg lg:rounded-xl flex items-center justify-center font-black italic text-sm ${row.rank <= 3 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
          #{row.rank}
        </div>
      )
    },
    {
      key: 'name', header: 'Student', render: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-black text-xs uppercase shrink-0">
            {row.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900 dark:text-white break-words">{row.name || 'Unknown'}</div>
            <div className="text-[10px] font-bold text-slate-400 break-words">{row.username ? `@${row.username}` : row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'city', header: 'City', render: (_, row) => (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {row.city || '—'}
        </div>
      )
    },
    {
      key: 'totalExams', header: 'Exams', align: 'center', render: (_, row) => (
        <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalExams}</div>
      )
    },
    {
      key: 'totalScore', header: 'Score', align: 'center', render: (_, row) => (
        <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalScore}/{row.totalMarks}</div>
      )
    },
    {
      key: 'avgAccuracy', header: 'Accuracy', align: 'center', render: (_, row) => (
        <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase inline-flex items-center bg-primary-500/10 text-primary-600 border border-primary-500/20">
          {row.avgAccuracy || 0}%
        </div>
      )
    },
    {
      key: 'subscriptionStatus', header: 'Plan', align: 'right', render: (_, row) => (
        <span className={`inline-flex px-2 py-1 text-[10px] font-black rounded-full ${row.subscriptionStatus === 'PRO' ? 'bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
          {row.subscriptionStatus || 'FREE'}
        </span>
      )
    },
  ];

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search by name, username, email or city..."
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  const examSelect = (
    <StyledSelect
      icon={Target}
      value={examId}
      onChange={handleExamChange}
      options={[{ value: 'all', label: 'OVERALL (ALL EXAMS)' }, ...exams.map(e => ({ value: e._id, label: e.name.toUpperCase() }))]}
      className="w-full"
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: List, id: 'list', label: 'List View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          title={mode.label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={currentPage}
      totalPages={pagination.totalPages || 1}
      onPageChange={setCurrentPage}
      totalItems={pagination.total || 0}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
    />
  );

  useAdminMobileHeader({
    title: 'All India Rank',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {examSelect}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-500 uppercase">No Rankings Found</h3>
              <p className="text-sm text-slate-400 mt-2">No completed exam attempts for this filter yet.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={`${examId}-${currentPage}-${viewMode}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex-1 min-h-0 flex flex-col">
                {viewMode === 'table' && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
                    <ResponsiveTable data={data} columns={columns} viewModes={['table']} currentView="table" showPagination={false} showViewToggle={false} fillHeight />
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="flex-1 min-h-0 overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-3">
                    {data.map((row, i) => (
                      <motion.div key={row.userId || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-white dark:bg-slate-800 rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-700 p-2 sm:p-4 flex flex-col gap-1.5 sm:gap-3">
                        <div className="flex items-start gap-1.5">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className={`shrink-0 w-6 h-6 sm:w-9 sm:h-9 rounded-md sm:rounded-xl flex items-center justify-center font-black italic text-[10px] sm:text-sm ${row.rank <= 3 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>#{row.rank}</div>
                            <div className="shrink-0 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-black text-[9px] sm:text-sm uppercase">{row.name?.charAt(0) || 'U'}</div>
                            <div className="min-w-0">
                              <h3 className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white break-words leading-tight">{row.name || 'Unknown'}</h3>
                              <p className="text-[8px] sm:text-[10px] text-slate-400 break-words leading-tight">{row.username ? `@${row.username}` : row.email}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-[7px] sm:text-[10px] font-black rounded-full ${row.subscriptionStatus === 'PRO' ? 'bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>{row.subscriptionStatus || 'FREE'}</span>
                        </div>
                        {row.city && (
                          <div className="flex items-center gap-1 text-[8px] sm:text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" /> <span className="break-words">{row.city}</span>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-1 sm:gap-2 text-center">
                          <div className="p-1 sm:p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                            <div className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalExams}</div>
                            <div className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase">Exams</div>
                          </div>
                          <div className="p-1 sm:p-2 bg-slate-50 dark:bg-white/5 rounded-lg">
                            <div className="text-[11px] sm:text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalScore}/{row.totalMarks}</div>
                            <div className="text-[7px] sm:text-[9px] font-bold text-slate-400 uppercase">Score</div>
                          </div>
                        </div>
                        <div className="px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[7px] sm:text-[10px] font-black uppercase bg-primary-500/10 text-primary-600 border border-primary-500/20 w-fit">{row.avgAccuracy || 0}% Acc</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="flex-1 min-h-0 overflow-auto grid grid-cols-1 gap-3">
                    {data.map((row, i) => (
                      <motion.div key={row.userId || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black italic text-sm shrink-0 ${row.rank <= 3 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>#{row.rank}</div>
                          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-black text-sm uppercase shrink-0">{row.name?.charAt(0) || 'U'}</div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 dark:text-white break-words">{row.name || 'Unknown'}</div>
                            <div className="text-[10px] text-slate-400 break-words">{row.username ? `@${row.username}` : row.email}{row.city ? ` · ${row.city}` : ''}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 pl-[52px] sm:pl-0">
                          <div className="text-center">
                            <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalExams}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Exams</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{row.totalScore}/{row.totalMarks}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Score</div>
                          </div>
                          <div className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-primary-500/10 text-primary-600 border border-primary-500/20">{row.avgAccuracy || 0}%</div>
                          <span className={`inline-flex px-2 py-1 text-[10px] font-black rounded-full ${row.subscriptionStatus === 'PRO' ? 'bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>{row.subscriptionStatus || 'FREE'}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllIndiaRankPage;
