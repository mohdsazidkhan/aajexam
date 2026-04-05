'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import Loading from "../../Loading";
import { motion, AnimatePresence } from "framer-motion";
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
  const [viewMode, setViewMode] = useState('table');
  
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

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
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
    if (selectedTest === "all") {
      setAttempts(allAttempts);
    } else {
      const filtered = allAttempts.filter((a) => getAttemptTestId(a) === selectedTest);
      setAttempts(filtered.sort((a, b) => (a?.rank ?? Infinity) - (b?.rank ?? Infinity)));
    }
  }, [selectedTest, allAttempts]);

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

  if (!isMounted) return null;

  return (
    <AdminMobileAppWrapper title="Exam Results Dashboard">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden pt-12 lg:pt-8 font-outfit">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl shadow-inner">
                     <BarChart3 className="w-6 h-6" />
                   </div>
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">ADMIN // PERFORMANCE ANALYTICS</span>
                 </div>
                 <h1 className="text-3xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                   ASSESSMENT <span className="text-indigo-600">METRICS</span>
                 </h1>
                 <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                   Track candidate outcomes and assessment milestones.
                 </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 shadow-xl shadow-slate-100/50">
                  {[{ icon: TableIcon, id: 'table' }, { icon: List, id: 'list' }].map((mode) => (
                     <button
                       key={mode.id}
                       onClick={() => setViewMode(mode.id)}
                       className={`p-3 rounded-full transition-all ${viewMode === mode.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                     >
                       <mode.icon className="w-5 h-5" />
                     </button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleExportCSV}
                  className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3"
                >
                  <Download className="w-4 h-4" /> Export Analytics
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Filters */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-8 mb-12 shadow-2xl">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-[10px] uppercase font-black tracking-widest">
                 <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="bg-transparent w-full outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer">
                       <option value="all">MAJOR CATEGORY</option>
                       {categories.map(c => <option key={c._id} value={c._id}>{c.name.toUpperCase()}</option>)}
                    </select>
                 </div>
                 <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    <select value={selectedExam} onChange={(e) => handleExamChange(e.target.value)} disabled={selectedCategory === 'all'} className={`bg-transparent w-full outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer ${selectedCategory === 'all' ? 'opacity-30' : ''}`}>
                       <option value="all">LIVE ASSESSMENT</option>
                       {exams.map(e => <option key={e._id} value={e._id}>{e.name.toUpperCase()}</option>)}
                    </select>
                 </div>
                 <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                    <Binary className="w-4 h-4 text-indigo-600" />
                    <select value={selectedPattern} onChange={(e) => handlePatternChange(e.target.value)} disabled={selectedExam === 'all'} className={`bg-transparent w-full outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer ${selectedExam === 'all' ? 'opacity-30' : ''}`}>
                       <option value="all">SYLLABUS FRAMEWORK</option>
                       {patterns.map(p => <option key={p._id} value={p._id}>{p.title.toUpperCase()}</option>)}
                    </select>
                 </div>
                 <div className="flex items-center gap-4 px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} disabled={selectedPattern === 'all'} className={`bg-transparent w-full outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer ${selectedPattern === 'all' ? 'opacity-30' : ''}`}>
                       <option value="all">SPECIFIC MODULE</option>
                       {tests.map(t => <option key={t._id} value={t._id}>{t.title.toUpperCase()}</option>)}
                    </select>
                 </div>
             </div>
          </div>

          {/* Results Display */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex items-center justify-center py-32"><Loading size="md" color="yellow" message="Compiling performance data..." /></div>
            ) : attempts.length === 0 ? (
               <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
                  <PieChart className="w-20 h-20 text-slate-300 mx-auto mb-8 opacity-20" />
                   <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">No Performance Data</h3>
                   <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Select relevant categories to filter user attempt metrics</p>
               </div>
            ) : (
                <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {viewMode === 'table' && (
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                       <table className="w-full border-collapse">
                          <thead>
                             <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                                 <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</th>
                                 <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Details</th>
                                 <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Points Earned</th>
                                 <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy & Time</th>
                                 <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submission Date</th>
                                 <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Details</th>
                               </tr>
                            </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-outfit">
                             {attempts.map((a, idx) => (
                                <motion.tr key={a._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="group hover:bg-indigo-500/5 transition-all">
                                  <td className="px-8 py-6">
                                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-sm ${a.rank <= 3 ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>
                                        #{a.rank || '-'}
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center font-black text-xs uppercase shadow-lg">{a.user?.name?.[0] || 'U'}</div>
                                        <div>
                                           <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1">{a.user?.name || 'N/A'}</div>
                                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{a.user?.email || 'N/A'}</div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <div className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{a.score || 0} / {a.practiceTest?.totalMarks || a.totalMarks || 0}</div>
                                      <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest leading-none mt-1">{a.practiceTest?.title?.substring(0, 20) || 'Test'}...</div>
                                  </td>
                                  <td className="px-8 py-6">
                                      <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase inline-flex items-center gap-2 ${a.accuracy >= 80 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : a.accuracy >= 60 ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                         {a.accuracy?.toFixed(1) || 0}% Acc
                                      </div>
                                     <div className="text-[9px] font-black text-slate-400 uppercase mt-1 ml-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(a.totalTime)}</div>
                                  </td>
                                  <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
                                     {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                   <td className="px-8 py-6 text-right">
                                      <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleViewDetails(a._id)} className="p-3 bg-white dark:bg-white/5 text-indigo-600 rounded-xl border border-slate-100 shadow-md hover:bg-indigo-600 hover:text-white transition-all"><Eye className="w-4 h-4" /></motion.button>
                                   </td>
                               </motion.tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                  )}

                  {viewMode === 'list' && (
                     <div className="space-y-6">
                        {attempts.map((a, idx) => (
                           <motion.div key={a._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-xl group">
                              <div className="flex items-center gap-6">
                                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black italic shadow-2xl ${a.rank <= 3 ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'}`}>#{a.rank || '-'}</div>
                                 <div>
                                    <div className="flex items-center gap-3 mb-1">
                                       <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{a.user?.name || 'User'}</h3>
                                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${a.accuracy >= 75 ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white shadow-inner'}`}>{a.accuracy?.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                       <span>{a.practiceTest?.title || 'Practice Test'}</span>
                                       <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-500" /> {a.score}/{a.practiceTest?.totalMarks || 0} pts</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0">
                                 <div className="flex flex-col text-right">
                                     <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{formatTime(a.totalTime)} ELAPSED</div>
                                     <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'N/A'}</div>
                                  </div>
                                  <motion.button onClick={() => handleViewDetails(a._id)} whileHover={{ scale: 1.05 }} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20">View Performance</motion.button>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  )}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Details Modal */}
          <AnimatePresence>
             {showDetails && selectedAttempt && (
               <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetails(false)} className="absolute inset-0 bg-[#0A0F1E]/90 backdrop-blur-xl" />
                  <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-5xl bg-white dark:bg-[#0D1225] rounded-[4rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                     
                     <div className="p-10 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-primary-500/5">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20"><Award className="w-8 h-8" /></div>
                            <div>
                               <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none animate-pulse">Session <span className="text-indigo-600 text-2xl">Breakdown</span></h2>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 leading-none italic">{selectedAttempt.user?.name} // {selectedAttempt.practiceTest?.title}</p>
                            </div>
                         </div>
                        <button onClick={() => setShowDetails(false)} className="p-4 bg-white dark:bg-white/5 rounded-2xl text-slate-400 hover:text-rose-500 transition-colors shadow-sm"><X className="w-6 h-6" /></button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                           {[
                             { label: 'Final Score', val: selectedAttempt.score, icon: Target, color: 'primary' },
                             { label: 'Accuracy', val: `${selectedAttempt.accuracy?.toFixed(1)}%`, icon: TrendingUp, color: 'emerald' },
                             { label: 'Time Spent', val: formatTime(selectedAttempt.totalTime), icon: Clock, color: 'blue' },
                             { label: 'Global Rank', val: `#${selectedAttempt.rank || '-'}`, icon: Trophy, color: 'amber' }
                           ].map((s, i) => (
                             <div key={i} className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border-2 border-slate-100 dark:border-white/5">
                                <div className={`p-3 bg-${s.color}-500/10 text-${s.color}-500 rounded-xl w-fit mb-3`}><s.icon className="w-4 h-4" /></div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">{s.val}</div>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
                             </div>
                           ))}
                        </div>

                        <div className="space-y-8">
                           <div className="flex items-center gap-4 mb-4">
                              <Binary className="w-5 h-5 text-primary-500" />
                              <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Question Breakdown</h3>
                           </div>
                           <div className="space-y-6">
                              {selectedAttempt.answers?.map((ans, i) => (
                                <div key={i} className="p-8 bg-white dark:bg-white/5 rounded-[2.5rem] border-2 border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                                   <div className="flex items-start gap-8">
                                      <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm italic shadow-md ${ans.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{i + 1}</div>
                                      <div>
                                         <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed mb-3">{ans.question?.questionText || 'Question metadata unavailable'}</p>
                                         <div className="flex gap-4">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-300 pl-2">Section: {ans.question?.section || 'General'}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-slate-300 pl-2">Difficulty: {ans.question?.difficulty || 'Medium'}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="flex flex-col items-end gap-2 shrink-0">
                                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-inner ${ans.isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                         {ans.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                         {ans.isCorrect ? 'Correct Answer' : 'Incorrect Entry'}
                                      </div>
                                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Selection: OPTION {ans.selectedOption + 1}</div>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                        
                        <button onClick={() => setShowDetails(false)} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all hover:translate-y-[-4px]">Return to List</button>
                     </div>
                  </motion.div>
               </div>
             )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExamResults;

