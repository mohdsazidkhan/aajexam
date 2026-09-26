'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import API from "../../../lib/api";
import { toast } from 'react-hot-toast';
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import { motion, AnimatePresence } from "framer-motion";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import {
  BarChart3,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Award,
  Target,
  Trophy,
  Users,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List,
  Table as TableIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Activity,
  Compass,
  PieChart,
  FileText,
  Binary
} from "lucide-react";
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const getAttemptTestId = (attempt) => {
  return (
    attempt?.practiceTest?._id ||
    attempt?.practiceTest ||
    attempt?.test?._id ||
    attempt?.test ||
    'unknown'
  );
};

const AdminGovtExamResults = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [tests, setTests] = useState([]);
  const [allAttempts, setAllAttempts] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState("all");
  const [selectedTest, setSelectedTest] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (window.innerWidth < 768) setViewMode('grid');
  }, []);

  const requestCache = useRef({
    exams: new Map(),
    patterns: new Map(),
    tests: new Map(),
  });

  const computeRankedAttempts = useCallback((attemptList = []) => {
    if (!Array.isArray(attemptList) || attemptList.length === 0) return [];
    const rankMap = new Map();
    const groupedByTest = new Map();

    attemptList.forEach((attempt) => {
      const testKey = getAttemptTestId(attempt);
      if (!groupedByTest.has(testKey)) groupedByTest.set(testKey, []);
      groupedByTest.get(testKey).push(attempt);
    });

    groupedByTest.forEach((group) => {
      const sortedGroup = [...group].sort((a, b) => {
        const scoreDiff = (b?.score ?? 0) - (a?.score ?? 0);
        if (scoreDiff !== 0) return scoreDiff;
        const accuracyDiff = (b?.accuracy ?? 0) - (a?.accuracy ?? 0);
        if (accuracyDiff !== 0) return accuracyDiff;
        const timeA = a?.totalTime ?? Number.POSITIVE_INFINITY;
        const timeB = b?.totalTime ?? Number.POSITIVE_INFINITY;
        if (timeA !== timeB) return timeA - timeB;
        return (a?.submittedAt ? new Date(a.submittedAt).getTime() : Infinity) - (b?.submittedAt ? new Date(b.submittedAt).getTime() : Infinity);
      });

      let previous = null;
      sortedGroup.forEach((attempt, index) => {
        let rank = index + 1;
        if (previous) {
          const sameScore = (attempt?.score ?? 0) === (previous?.score ?? 0);
          const sameAccuracy = (attempt?.accuracy ?? 0) === (previous?.accuracy ?? 0);
          const sameTime = (attempt?.totalTime ?? Infinity) === (previous?.totalTime ?? Infinity);
          if (sameScore && sameAccuracy && sameTime) {
            const prevRank = previous?._id ? rankMap.get(previous._id) : null;
            if (prevRank != null) rank = prevRank;
          }
        }
        if (attempt?._id) rankMap.set(attempt._id, rank);
        previous = attempt;
      });
    });

    return attemptList.map((attempt) => ({
      ...attempt,
      rank: attempt?._id ? rankMap.get(attempt._id) : (attempt?.rank ?? null),
    }));
  }, []);
  const user = getCurrentUser();

  const getExamsForCategory = useCallback(async (categoryId) => {
    if (!categoryId || categoryId === 'all') return [];
    if (requestCache.current.exams.has(categoryId)) return requestCache.current.exams.get(categoryId);
    try {
      const res = await API.getExamsByCategory(categoryId);
      const data = res?.success ? res.data || [] : (Array.isArray(res) ? res : []);
      requestCache.current.exams.set(categoryId, data);
      return data;
    } catch (e) { return []; }
  }, []);

  const getPatternsForExam = useCallback(async (examId) => {
    if (!examId || examId === 'all') return [];
    if (requestCache.current.patterns.has(examId)) return requestCache.current.patterns.get(examId);
    try {
      const res = await API.getPatternsByExam(examId);
      const data = res?.success ? res.data || [] : (Array.isArray(res) ? res : []);
      requestCache.current.patterns.set(examId, data);
      return data;
    } catch (e) { return []; }
  }, []);

  const getTestsForPattern = useCallback(async (patternId) => {
    if (!patternId || patternId === 'all') return [];
    if (requestCache.current.tests.has(patternId)) return requestCache.current.tests.get(patternId);
    try {
      const res = await API.getTestsByPattern(patternId);
      const data = res?.success ? res.data || [] : (Array.isArray(res) ? res : []);
      requestCache.current.tests.set(patternId, data);
      return data;
    } catch (e) { return []; }
  }, []);

  useEffect(() => {
    let filtered = selectedTest === "all"
      ? allAttempts
      : allAttempts.filter((a) => getAttemptTestId(a) === selectedTest);

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter((a) =>
        a.user?.name?.toLowerCase().includes(term) ||
        a.user?.email?.toLowerCase().includes(term) ||
        a.practiceTest?.title?.toLowerCase().includes(term)
      );
    }

    if (selectedTest !== "all") {
      filtered = [...filtered].sort((a, b) => (a?.rank ?? Infinity) - (b?.rank ?? Infinity));
    }

    setAttempts(filtered);
  }, [selectedTest, allAttempts, searchTerm]);

  useEffect(() => {
    fetchCategories();
    fetchAllAttempts();
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.getRealExamCategories();
      setCategories(res?.success ? res.data || [] : []);
    } catch (e) { toast.error("Failed to load categories"); }
    finally { setLoading(false); }
  }, []);

  const fetchAllAttempts = useCallback(async () => {
    try {
      const res = await API.getAdminAllAttempts({ limit: 200 });
      const data = res?.success ? res.data || [] : (Array.isArray(res) ? res : []);
      const ranked = computeRankedAttempts(data);
      setAllAttempts(ranked);
    } catch (e) { toast.error("Failed to load attempts"); }
  }, [computeRankedAttempts]);

  const handleCategoryChange = async (cid) => {
    setSelectedCategory(cid);
    setExams([]); setPatterns([]); setTests([]);
    setSelectedExam("all"); setSelectedPattern("all"); setSelectedTest("all");
    if (!cid || cid === 'all') return;
    setLoading(true);
    const data = await getExamsForCategory(cid);
    setExams(data || []);
    setLoading(false);
  };

  const handleExamChange = async (eid) => {
    setSelectedExam(eid);
    setPatterns([]); setTests([]);
    setSelectedPattern("all"); setSelectedTest("all");
    if (!eid || eid === 'all') return;
    setLoading(true);
    const data = await getPatternsForExam(eid);
    setPatterns(data || []);
    setLoading(false);
  };

  const handlePatternChange = async (pid) => {
    setSelectedPattern(pid);
    setTests([]);
    setSelectedTest("all");
    if (!pid || pid === 'all') return;
    setLoading(true);
    const data = await getTestsForPattern(pid);
    setTests(data || []);
    setLoading(false);
  };

  const handleViewDetails = async (aid) => {
    try {
      const res = await API.getAdminAttemptDetails(aid);
      if (res?.success) { setSelectedAttempt(res.data); setShowDetails(true); }
    } catch (e) { toast.error("Failed to fetch details"); }
  };

  const handleExportCSV = () => {
    if (attempts.length === 0) { toast.error("No data to export"); return; }
    const headers = ["User", "Email", "Test", "Score", "Accuracy", "Rank", "Time", "Date"];
    const rows = attempts.map(a => [
      a.user?.name || "N/A", a.user?.email || "N/A", a.practiceTest?.title || "N/A",
      `${a.score || 0}/${a.practiceTest?.totalMarks || a.totalMarks || 0}`,
      `${a.accuracy?.toFixed(1) || 0}%`, a.rank || "-",
      `${Math.round(a.totalTime / 60000)}m`, a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "N/A"
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `results-${Date.now()}.csv`; link.click();
    toast.success("CSV Exported");
  };

  const formatTime = (ms) => {
    if (!ms) return "0m";
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const attemptTotalPages = Math.max(1, Math.ceil(attempts.length / itemsPerPage));
  const pagedAttempts = attempts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTest, itemsPerPage, searchTerm]);

  const resultColumns = [
    {
      key: 'rank', header: 'Rank', render: (_, a) => (
        <div className={`w-6 lg:w-12 h-6 lg:h-12 rounded-lg lg:rounded-xl text-white flex items-center justify-center font-black italic text-sm ${a.rank <= 3 ? 'bg-primary-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
          #{a.rank || '-'}
        </div>
      )
    },
    {
      key: 'user', header: 'Student', render: (_, a) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center font-black text-xs uppercase shadow-sm">{a.user?.name?.[0] || 'U'}</div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{a.user?.name || 'N/A'}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{a.user?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'score', header: 'Score', render: (_, a) => (
        <>
          <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{a.score || 0} / {a.practiceTest?.totalMarks || a.totalMarks || 0}</div>
          <div className="text-[9px] font-black text-primary-600 uppercase tracking-widest leading-none mt-1">{a.practiceTest?.title || 'Test'}</div>
        </>
      )
    },
    {
      key: 'accuracy', header: 'Performance', render: (_, a) => (
        <>
          <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase inline-flex items-center gap-2 ${a.accuracy >= 80 ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20' : a.accuracy >= 60 ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20'}`}>
            {a.accuracy?.toFixed(1) || 0}% Acc
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase mt-1 ml-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(a.totalTime)}</div>
        </>
      )
    },
    {
      key: 'submittedAt', header: 'Date', render: (_, a) => (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
          {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: 'actions', header: 'Details', align: 'right', render: (_, a) => (
        <div className="flex justify-end">
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleViewDetails(a._id)} className="p-3 bg-white dark:bg-white/5 text-primary-600 rounded-lg lg:rounded-xl border border-slate-100 shadow-sm hover:bg-primary-600 hover:text-white transition-all"><Eye className="w-4 h-4" /></motion.button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative group w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search name, email, exam..."
        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-sm"
      />
    </div>
  );

  const categoryFilterSelect = (
    <StyledSelect
      icon={Compass}
      value={selectedCategory}
      onChange={(val) => handleCategoryChange(val)}
      options={[{ value: 'all', label: 'ALL CATEGORIES' }, ...categories.map(c => ({ value: c._id, label: c.name.toUpperCase() }))]}
      className="w-full lg:w-auto lg:min-w-[150px] lg:max-w-[190px]"
    />
  );

  const examFilterSelect = (
    <StyledSelect
      icon={Activity}
      value={selectedExam}
      onChange={(val) => handleExamChange(val)}
      options={[{ value: 'all', label: 'ALL EXAMS' }, ...exams.map(e => ({ value: e._id, label: e.name.toUpperCase() }))]}
      disabled={selectedCategory === 'all'}
      className="w-full lg:w-auto lg:min-w-[150px] lg:max-w-[190px]"
    />
  );

  const patternFilterSelect = (
    <StyledSelect
      icon={Binary}
      value={selectedPattern}
      onChange={(val) => handlePatternChange(val)}
      options={[{ value: 'all', label: 'ALL PATTERNS' }, ...patterns.map(p => ({ value: p._id, label: p.title.toUpperCase() }))]}
      disabled={selectedExam === 'all'}
      className="w-full lg:w-auto lg:min-w-[150px] lg:max-w-[190px]"
    />
  );

  const testFilterSelect = (
    <StyledSelect
      icon={FileText}
      value={selectedTest}
      onChange={(val) => setSelectedTest(val)}
      options={[{ value: 'all', label: 'ALL TESTS' }, ...tests.map(t => ({ value: t._id, label: t.title.toUpperCase() }))]}
      disabled={selectedPattern === 'all'}
      className="w-full lg:w-auto lg:min-w-[150px] lg:max-w-[190px]"
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[{ icon: TableIcon, id: 'table', label: 'Table View' }, { icon: LayoutGrid, id: 'grid', label: 'Grid View' }, { icon: List, id: 'list', label: 'List View' }].map((mode) => (
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

  const exportButton = (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={handleExportCSV}
      className="w-full px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-xl shadow-sm flex items-center justify-center gap-2 font-bold text-sm"
    >
      <Download className="w-4 h-4" /> Export to CSV
    </motion.button>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={currentPage}
      totalPages={attemptTotalPages}
      onPageChange={setCurrentPage}
      totalItems={attempts.length}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
    />
  );

  useAdminMobileHeader({
    title: 'Results',
    count: attempts.length,
    filters: (
      <>
        {searchInput}
        {categoryFilterSelect}
        {examFilterSelect}
        {patternFilterSelect}
        {testFilterSelect}
        {viewToggleButtons}
        {exportButton}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (<div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          {/* Results Display */}
          <div className="flex-1 min-h-0 overflow-auto">
          <AnimatePresence mode="wait">
            {loading ? (
              <AdminTableSkeleton showHeader={false} showFilters={false} />
            ) : attempts.length === 0 ? (
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
                <PieChart className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">No Results Found</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">No student attempts yet. Use the filters above to narrow down results by category, exam, or test.</p>
              </div>
            ) : (
              <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-auto flex flex-col">
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm flex-1 min-h-0 overflow-auto flex flex-col">
                    <ResponsiveTable data={pagedAttempts} columns={resultColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="h-auto overflow-auto grid content-start grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8 items-start">
                    {attempts.map((a, idx) => {
                      const serialNumber = idx + 1;
                      return (
                      <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm font-outfit group">
                        <div className="h-1.5 -mt-3 lg:-mt-8 -mx-3 lg:-mx-8 mb-4 lg:mb-8 bg-primary-600 rounded-t-lg lg:rounded-t-xl xl:rounded-t-[3rem]" />
                        <div className="flex justify-between items-start mb-4 lg:mb-8">
                          <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-black italic shadow-sm ${a.rank <= 3 ? 'bg-primary-600 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`}>
                            #{a.rank || '-'}
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{serialNumber}</span>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 ${a.accuracy >= 75 ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20'}`}>{a.accuracy?.toFixed(1)}% ACC</div>
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 truncate">{a.user?.name || 'User'}</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 lg:mb-8 truncate">{a.practiceTest?.title || 'Practice Test'}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4 lg:mb-8">
                          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Score</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{a.score || 0}/{a.practiceTest?.totalMarks || 0}</span>
                          </div>
                          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                            <span className="block text-[8px] font-black text-slate-400 uppercase mb-1">Time</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{formatTime(a.totalTime)}</span>
                          </div>
                        </div>
                        <motion.button onClick={() => handleViewDetails(a._id)} whileHover={{ scale: 1.02 }} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">View Details</motion.button>
                      </motion.div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="h-full overflow-auto space-y-3 lg:space-y-6">
                    {attempts.map((a, idx) => {
                      const serialNumber = idx + 1;
                      return (
                      <motion.div key={a._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-sm group">
                        <div className="flex items-center gap-3 lg:gap-6">
                          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center font-black italic shadow-sm ${a.rank <= 3 ?'bg-primary-600 text-white':'bg-slate-900 text-white dark:bg-white'}`}>
                            #{a.rank ||'-'}
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{serialNumber}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{a.user?.name || 'User'}</h3>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${a.accuracy >= 75 ? 'bg-primary-600 text-white' : 'bg-primary-600 text-white shadow-sm'}`}>{a.accuracy?.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <span>{a.practiceTest?.title || 'Practice Test'}</span>
                              <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-black dark:text-white" /> {a.score}/{a.practiceTest?.totalMarks || 0} pts</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                          <div className="flex flex-col text-right">
                            <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{formatTime(a.totalTime)}</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'N/A'}</div>
                          </div>
                          <motion.button onClick={() => handleViewDetails(a._id)} whileHover={{ scale: 1.05 }} className="px-3 lg:px-6 py-3 bg-primary-600 text-white rounded-lg lg:rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm">View Details</motion.button>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          </div>

          {/* Details Modal */}
          <AnimatePresence>
            {showDetails && selectedAttempt && (
              <div className="fixed inset-0 z-[110]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetails(false)} className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-xl" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute top-16 right-0 bottom-0 left-0 lg:left-64 bg-white dark:bg-[#0D1225] lg:rounded-l-[3rem] border-l-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">

                  <div className="p-3 lg:p-5 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-primary-500/5">
                    <div className="flex items-center gap-2 lg:gap-4">
                      <div className="w-10 h-10 lg:w-11 lg:h-11 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0"><Award className="w-5 h-5" /></div>
                      <div>
                        <h2 className="text-base lg:text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Attempt <span className="text-primary-600">Details</span></h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 leading-none italic">{selectedAttempt.user?.name} // {selectedAttempt.practiceTest?.title}</p>
                      </div>
                    </div>
                    <button onClick={() => setShowDetails(false)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400 transition-colors shadow-sm shrink-0"><X className="w-5 h-5" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 lg:p-5 custom-scrollbar space-y-3 lg:space-y-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-3">
                      {[
                        { label: 'Score', val: selectedAttempt.score, icon: Target, color: 'primary' },
                        { label: 'Accuracy', val: `${selectedAttempt.accuracy?.toFixed(1)}%`, icon: TrendingUp, color: 'primary' },
                        { label: 'Time Spent', val: formatTime(selectedAttempt.totalTime), icon: Clock, color: 'primary' },
                        { label: 'Rank', val: `#${selectedAttempt.rank || '-'}`, icon: Trophy, color: 'primary' }
                      ].map((s, i) => (
                        <div key={i} className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border-2 border-slate-100 dark:border-white/5">
                          <div className={`p-2 bg-${s.color}-500/10 text-${s.color}-500 rounded-lg w-fit mb-2`}><s.icon className="w-3.5 h-3.5" /></div>
                          <div className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase italic">{s.val}</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 lg:space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Binary className="w-4 h-4 text-primary-600" />
                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Questions & Answers</h3>
                      </div>
                      <div className="space-y-2 lg:space-y-3">
                        {selectedAttempt.answers?.map((ans, i) => {
                          const q = selectedAttempt.practiceTest?.questions?.find(
                            (qq) => String(qq._id) === String(ans.questionId)
                          );
                          const hasSelection = ans.selectedIndex !== undefined && ans.selectedIndex !== null && ans.selectedIndex >= 0;
                          return (
                            <div key={i} className="p-3 lg:p-4 bg-white dark:bg-white/5 rounded-lg lg:rounded-xl border-2 border-slate-100 dark:border-white/5 group">
                              <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 lg:gap-4 mb-2 lg:mb-3">
                                <div className="flex items-start gap-2 lg:gap-3">
                                  <div className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center font-black text-xs italic shadow-sm bg-primary-600 text-white">{i + 1}</div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-snug mb-1.5">{q?.questionText || 'Question not available'}</p>
                                    <div className="flex gap-3">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-300 pl-2">Section: {q?.section || 'General'}</span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-300 pl-2">Difficulty: {q?.difficulty || 'Medium'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 shadow-sm shrink-0 ${ans.isCorrect ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/20 dark:border-white/20'}`}>
                                  {ans.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                  {ans.isCorrect ? 'Correct' : (hasSelection ? 'Incorrect' : 'Not Answered')}
                                </div>
                              </div>
                              {q?.options?.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                                  {q.options.map((opt, oi) => {
                                    const isCorrectOpt = oi === q.correctAnswerIndex;
                                    const isSelectedOpt = oi === ans.selectedIndex;
                                    return (
                                      <div key={oi} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border-2 ${
                                        isCorrectOpt ? 'bg-primary-500/10 border-primary-500/30 text-primary-600'
                                          : isSelectedOpt ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                                          : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 dark:text-slate-400'
                                      }`}>
                                        <span className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-black bg-white/60 dark:bg-black/30">{String.fromCharCode(65 + oi)}</span>
                                        <span className="flex-1 leading-snug">{opt}</span>
                                        {isCorrectOpt && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                                        {isSelectedOpt && !isCorrectOpt && <AlertCircle className="w-4 h-4 shrink-0" />}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
        </div>
  );
};

export default AdminGovtExamResults;

