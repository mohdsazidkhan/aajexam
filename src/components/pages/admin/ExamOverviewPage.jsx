import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import {
  Layers,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Hash,
  BrainCircuit,
  FileText,
  Target,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  AlertCircle,
  HelpCircle,
  Newspaper
} from 'lucide-react';
import { useSSR } from '../../../hooks/useSSR';
import API from '../../../lib/api';
import Card from '../../ui/Card';
import Loading from '../../Loading';
import ViewToggle from '../../ViewToggle';

const formatNumber = (num) => (num || 0).toLocaleString('en-IN');

const StatCard = ({ title, count, icon: Icon, color }) => (
  <Card hoverable padded={false} className="border border-slate-200 dark:border-white/5 shadow-lg bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl overflow-hidden group">
    <div className="p-4 flex flex-col relative">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 text-${color}-600 dark:text-${color}-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`text-xl lg:text-2xl font-black tracking-tighter text-${color}-600 dark:text-${color}-400 tabular-nums italic`}>
          {formatNumber(count)}
        </div>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Metric</p>
        <h2 className={`text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-${color}-500 transition-colors leading-none`}>
          {title}
        </h2>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-16 h-16 bg-${color}-500/5 rounded-full blur-xl group-hover:bg-${color}-500/10 transition-all`} />
    </div>
  </Card>
);

const ExamDetails = ({ exam }) => (
  <div className="p-6 flex flex-col gap-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-white/10">

    {/* Patterns */}
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2"><LayoutDashboard className="w-3 h-3" /> Patterns ({exam.counts.patterns})</h4>
      {exam.patterns.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {exam.patterns.map(p => (
            <span key={p._id} className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg">{p.title}</span>
          ))}
        </div>
      ) : <span className="text-xs text-slate-400">None</span>}
    </div>

    {/* Subjects */}
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2"><BookOpen className="w-3 h-3" /> Subjects ({exam.counts.subjects})</h4>
      {exam.subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {exam.subjects.map(s => (
            <div key={s._id} className="text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg flex items-center">
              <span className="truncate" title={s.name}>{s.name}</span>
            </div>
          ))}
        </div>
      ) : <span className="text-xs text-slate-400">None</span>}
    </div>

    {/* Topics */}
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2"><Hash className="w-3 h-3" /> Topics ({exam.counts.topics})</h4>
      {exam.topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-premium">
          {exam.topics.map(t => (
            <div key={t._id} className="text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg flex items-center">
              <span className="truncate" title={t.name}>{t.name}</span>
            </div>
          ))}
        </div>
      ) : <span className="text-xs text-slate-400">None</span>}
    </div>

    {/* Quizzes */}
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2"><BrainCircuit className="w-3 h-3" /> Quizzes ({exam.counts.quizzes})</h4>
      {exam.quizzes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-premium">
          {exam.quizzes.map(q => (
            <div key={q._id} className="text-[11px] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-between">
              <span className="truncate mr-2" title={q.title}>{q.title}</span>
              <span className="text-slate-400 font-medium shrink-0">{q.totalQuestions} Qs</span>
            </div>
          ))}
        </div>
      ) : <span className="text-xs text-slate-400">None</span>}
    </div>

    {/* PYQs */}
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2"><FileText className="w-3 h-3" /> PYQs ({exam.counts.pyqs})</h4>
      {exam.pyqs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-premium">
          {exam.pyqs.map(p => (
            <div key={p._id} className="text-[11px] px-3 py-2 bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 rounded-lg flex items-center justify-between">
              <span className="truncate mr-2 flex items-center gap-1.5" title={p.title}>
                <span className="px-1 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded text-[9px] uppercase font-bold shrink-0">PYQ</span>
                {p.title}
              </span>
              <span className="text-slate-400 font-medium shrink-0">{p.totalQuestions} Qs</span>
            </div>
          ))}
        </div>
      ) : <span className="text-xs text-slate-400">None</span>}
    </div>

    {/* Practice Tests */}
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2"><Target className="w-3 h-3" /> Practice Tests ({exam.counts.practiceTests})</h4>
      {exam.practiceTests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-premium">
          {exam.practiceTests.map(m => (
            <div key={m._id} className="text-[11px] px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg flex items-center justify-between">
              <span className="truncate mr-2" title={m.title}>{m.title}</span>
              <span className="text-slate-400 font-medium shrink-0">{m.totalQuestions} Qs</span>
            </div>
          ))}
        </div>
      ) : <span className="text-xs text-slate-400">None</span>}
    </div>

    {/* Blogs */}
    <div>
      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2"><Newspaper className="w-3 h-3" /> Blogs ({exam.counts.blogs})</h4>
      {exam.blogs?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-premium">
          {exam.blogs.map(b => (
            <div key={b._id} className="text-[11px] px-3 py-2 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg flex flex-col justify-center">
              <span className="truncate font-medium mb-1" title={b.title}>{b.title}</span>
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-bold uppercase ${b.status === 'published' ? 'text-green-600' : 'text-amber-600'}`}>{b.status}</span>
                <span className="text-slate-400 text-[9px]">{b.views || 0} views</span>
              </div>
            </div>
          ))}
        </div>
      ) : <span className="text-xs text-slate-400">None</span>}
    </div>
  </div>
);

const ExamOverviewPage = () => {
  const { router } = useSSR();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ overallStats: {}, examHierarchy: [] });
  const [error, setError] = useState(null);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.getExamsOverview();
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || 'Failed to fetch data');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the exam overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleRow = (examId) => {
    const next = new Set(expandedRows);
    if (next.has(examId)) next.delete(examId);
    else next.add(examId);
    setExpandedRows(next);
  };

  // Filter options
  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    data.examHierarchy.forEach(e => {
      if (e.category?.name) cats.add(e.category.name);
    });
    return Array.from(cats).sort();
  }, [data.examHierarchy]);

  // Apply filters
  const filteredExams = useMemo(() => {
    return data.examHierarchy.filter(exam => {
      // Category filter
      if (categoryFilter !== 'ALL' && exam.category?.name !== categoryFilter) return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (exam.name?.toLowerCase().includes(q) || exam.code?.toLowerCase().includes(q)) return true;
        if (exam.category?.name?.toLowerCase().includes(q)) return true;
        // Search in patterns, subjects
        const inPatterns = exam.patterns?.some(p => p.title?.toLowerCase().includes(q));
        if (inPatterns) return true;
        const inSubjects = exam.subjects?.some(s => s.name?.toLowerCase().includes(q));
        if (inSubjects) return true;
        const inTopics = exam.topics?.some(t => t.name?.toLowerCase().includes(q));
        if (inTopics) return true;
        return false;
      }
      return true;
    });
  }, [data.examHierarchy, categoryFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loading size="lg" message="Loading ecosystem..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Error Loading Overview</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button onClick={fetchData} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold">Try Again</button>
      </div>
    );
  }

  const { overallStats } = data;

  return (
    <div className="w-full text-slate-900 dark:text-white font-outfit px-2 lg:px-0">

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 my-2 lg:my-4">
        <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 lg:mb-0 uppercase leading-none">
          Exam <span className="text-primary-600">Overview</span>
        </h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <StatCard title="Exam Categories" count={overallStats.categories} icon={Layers} color="indigo" />
        <StatCard title="Exams" count={overallStats.exams} icon={GraduationCap} color="blue" />
        <StatCard title="Exam Patterns" count={overallStats.patterns} icon={LayoutDashboard} color="cyan" />
        <StatCard title="Subjects" count={overallStats.subjects} icon={BookOpen} color="emerald" />
        <StatCard title="Topics" count={overallStats.topics} icon={Hash} color="teal" />
        <StatCard title="Quizzes" count={overallStats.quizzes} icon={BrainCircuit} color="purple" />
        <StatCard title="PYQs" count={overallStats.pyqs} icon={FileText} color="rose" />
        <StatCard title="Practice Tests" count={overallStats.practiceTests} icon={Target} color="orange" />
        <StatCard title="Total Questions" count={overallStats.questions} icon={HelpCircle} color="pink" />
        <StatCard title="Total Blogs" count={overallStats.blogs} icon={Newspaper} color="amber" />
      </div>

      {/* Main Content Area */}
      <Card variant="white" padded={false} className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 rounded-xl overflow-hidden shadow-sm">

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search exams, subjects, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-none md:w-48 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="hidden lg:block shrink-0">
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
            <div className="lg:hidden shrink-0">
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Content Render Based on View Mode */}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <th className="p-4 w-12 text-center"></th>
                  <th className="p-4 min-w-[200px]">Exam Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Patterns</th>
                  <th className="p-4 text-center">Subjects</th>
                  <th className="p-4 text-center">Topics</th>
                  <th className="p-4 text-center">Quizzes</th>
                  <th className="p-4 text-center">PYQs</th>
                  <th className="p-4 text-center">Mocks</th>
                  <th className="p-4 text-center">Blogs</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="p-8 text-center text-slate-500">No exams found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => {
                    const isExpanded = expandedRows.has(exam._id);
                    return (
                      <React.Fragment key={exam._id}>
                        <tr className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}>
                          <td className="p-4 text-center">
                            <button onClick={() => toggleRow(exam._id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                              {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                            </button>
                          </td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex flex-col">
                              <span>{exam.name}</span>
                              <span className="text-[10px] font-normal text-slate-500">{exam.code}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                            {exam.category?.name || '-'}
                          </td>
                          <td className="p-4 text-center font-semibold text-cyan-600 dark:text-cyan-400">{exam.counts.patterns}</td>
                          <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">{exam.counts.subjects}</td>
                          <td className="p-4 text-center font-semibold text-teal-600 dark:text-teal-400">{exam.counts.topics}</td>
                          <td className="p-4 text-center font-semibold text-purple-600 dark:text-purple-400">{exam.counts.quizzes}</td>
                          <td className="p-4 text-center font-semibold text-rose-600 dark:text-rose-400">{exam.counts.pyqs}</td>
                          <td className="p-4 text-center font-semibold text-orange-600 dark:text-orange-400">{exam.counts.practiceTests}</td>
                          <td className="p-4 text-center font-semibold text-amber-600 dark:text-amber-400">{exam.counts.blogs}</td>
                          <td className="p-4 text-center">
                            {exam.isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[10px] font-bold uppercase">
                                Inactive
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => router.push(`/admin/govt-exams/patterns?examId=${exam._id}`)}
                              className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors tooltip"
                              data-tip="Manage Patterns"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        <AnimatePresence>
                          {isExpanded && (
                            <tr>
                              <td colSpan="11" className="p-0 border-b border-slate-200 dark:border-white/10">
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                  <ExamDetails exam={exam} />
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="p-4 flex flex-col gap-3">
            {filteredExams.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No exams found matching your criteria.</div>
            ) : (
              filteredExams.map(exam => {
                const isExpanded = expandedRows.has(exam._id);
                return (
                  <div key={exam._id} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900/30">
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {exam.name}
                            {exam.isActive ? (
                              <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-bold uppercase">Active</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[9px] font-bold uppercase">Inactive</span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{exam.code} • {exam.category?.name || 'Uncategorized'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="text-center px-3 border-r border-slate-200 dark:border-white/10 shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pat</div>
                          <div className="text-sm font-bold text-cyan-600">{exam.counts.patterns}</div>
                        </div>
                        <div className="text-center px-3 border-r border-slate-200 dark:border-white/10 shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sub</div>
                          <div className="text-sm font-bold text-emerald-600">{exam.counts.subjects}</div>
                        </div>
                        <div className="text-center px-3 border-r border-slate-200 dark:border-white/10 shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top</div>
                          <div className="text-sm font-bold text-teal-600">{exam.counts.topics}</div>
                        </div>
                        <div className="text-center px-3 border-r border-slate-200 dark:border-white/10 shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blogs</div>
                          <div className="text-sm font-bold text-amber-600">{exam.counts.blogs}</div>
                        </div>
                        <div className="text-center px-3 shrink-0">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items</div>
                          <div className="text-sm font-bold text-purple-600">{exam.counts.quizzes + exam.counts.pyqs + exam.counts.practiceTests}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2 md:mt-0 shrink-0">
                        <button onClick={() => toggleRow(exam._id)} className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-1">
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {isExpanded ? 'Hide' : 'Details'}
                        </button>
                        <button onClick={() => router.push(`/admin/govt-exams/patterns?examId=${exam._id}`)} className="px-3 py-1.5 text-xs font-bold bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 rounded-lg transition-colors flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Manage
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <ExamDetails exam={exam} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="p-0 lg:p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500">No exams found matching your criteria.</div>
            ) : (
              filteredExams.map(exam => {
                const isExpanded = expandedRows.has(exam._id);
                return (
                  <div key={exam._id} className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-slate-900/30 flex flex-col">
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{exam.name}</h3>
                          <p className="text-xs text-slate-500 font-medium">{exam.code} • {exam.category?.name || 'Uncategorized'}</p>
                        </div>
                        {exam.isActive ? (
                          <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase shrink-0">Active</span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 text-[10px] font-bold uppercase shrink-0">Inactive</span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-6 mt-auto">
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Patterns</div>
                          <div className="text-lg font-bold text-cyan-600 leading-none">{exam.counts.patterns}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Subjects</div>
                          <div className="text-lg font-bold text-emerald-600 leading-none">{exam.counts.subjects}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Topics</div>
                          <div className="text-lg font-bold text-teal-600 leading-none">{exam.counts.topics}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Quizzes</div>
                          <div className="text-lg font-bold text-purple-600 leading-none">{exam.counts.quizzes}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">PYQs</div>
                          <div className="text-lg font-bold text-rose-600 leading-none">{exam.counts.pyqs}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mocks</div>
                          <div className="text-lg font-bold text-orange-600 leading-none">{exam.counts.practiceTests}</div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2 text-center border border-slate-100 dark:border-white/5">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Blogs</div>
                          <div className="text-lg font-bold text-amber-600 leading-none">{exam.counts.blogs}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleRow(exam._id)} className="flex-1 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1">
                          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {isExpanded ? 'Hide' : 'Details'}
                        </button>
                        <button onClick={() => router.push(`/admin/govt-exams/patterns?examId=${exam._id}`)} className="flex-1 py-2 text-xs font-bold bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 rounded-lg transition-colors flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" /> Manage
                        </button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <ExamDetails exam={exam} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExamOverviewPage;
