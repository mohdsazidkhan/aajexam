'use client';
import Select from '../../common/ui/Select';
import React, { useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import API from "../../../lib/api";
import { toast } from 'react-hot-toast';
import { useSSR } from "../../../hooks/useSSR";
import { Edit3, Trash2, Plus, Search, X, BrainCircuit, Eye, Globe, GlobeLock, Table as TableIcon, LayoutGrid, List } from "lucide-react";
import { AdminTableSkeleton } from '../Skeletons';
import ResponsiveTable from '../../common/ResponsiveTable';
import Pagination from '../../common/Pagination';
import StyledSelect from '../../common/ui/StyledSelect';
import SearchFilter from '../../common/SearchFilter';
import useDebounce from '../../../hooks/useDebounce';
import Sidebar from '../Sidebar';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminQuizQuizzes = () => {
  const { isMounted } = useSSR();
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({ exam: "", subject: "", status: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [form, setForm] = useState({ title: "", description: "", exam: "", subject: "", topic: "", duration: 10, marksPerQuestion: 1, negativeMarking: 0, difficulty: "mixed", type: "topic_practice", tags: "", isFree: true });
  const [qFilters, setQFilters] = useState({ subject: "", topic: "" });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchQuizzes(); }, [page, itemsPerPage, filters.exam, filters.subject, filters.status, debouncedSearch]);

  const fetchDropdowns = async () => {
    try {
      const [exRes, subRes, topRes] = await Promise.all([API.getAllExams(), API.getAdminSubjects(), API.getAdminTopics()]);
      if (exRes?.success) setExams(exRes.data || []);
      if (subRes?.success) setSubjects(subRes.data || []);
      if (topRes?.success) setTopics(topRes.data || []);
    } catch (e) {}
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      if (filters.exam) params.exam = filters.exam;
      if (filters.subject) params.subject = filters.subject;
      if (filters.status) params.status = filters.status;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await API.getAdminQuizzes(params);
      if (res?.success) { setQuizzes(res.data || []); setTotalPages(res.pagination?.totalPages || 1); setTotalItems(res.pagination?.total ?? (res.data || []).length); }
    } catch (e) { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) {
        const res = await API.updateQuiz(editing._id, data);
        if (res?.success) { toast.success("Updated"); fetchQuizzes(); setShowModal(false); setEditing(null); }
        else toast.error(res?.message || "Failed");
      } else {
        const res = await API.createQuiz(data);
        if (res?.success) { toast.success("Created as draft"); fetchQuizzes(); setShowModal(false); }
        else toast.error(res?.message || "Failed");
      }
    } catch (e) { toast.error(e.message || "Error"); }
  };

  const handlePublish = async (id) => {
    try {
      const res = await API.publishQuiz(id);
      if (res?.success) { toast.success(res.data.status === 'published' ? 'Published' : 'Unpublished'); fetchQuizzes(); }
      else toast.error(res?.message || "Failed");
    } catch (e) { toast.error(e.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Archive this quiz?")) return;
    try { await API.deleteQuiz(id); toast.success("Archived"); fetchQuizzes(); } catch (e) { toast.error("Failed"); }
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({ title: q.title, description: q.description || "", exam: q.applicableExams?.[0]?._id || q.applicableExams?.[0] || "", subject: q.subject?._id || q.subject, topic: q.topic?._id || q.topic || "", duration: q.duration, marksPerQuestion: q.marksPerQuestion || 1, negativeMarking: q.negativeMarking || 0, difficulty: q.difficulty || "mixed", type: q.type || "topic_practice", tags: (q.tags || []).join(", "), isFree: q.isFree !== false });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", exam: "", subject: "", topic: "", duration: 10, marksPerQuestion: 1, negativeMarking: 0, difficulty: "mixed", type: "topic_practice", tags: "", isFree: true });
    setShowModal(true);
  };

  const openAddQuestions = async (quiz) => {
    setSelectedQuiz(quiz);
    setSelectedQIds([]);
    setQFilters({ subject: quiz.subject?._id || "", topic: quiz.topic?._id || "" });
    try {
      const params = { limit: 100 };
      if (quiz.applicableExams?.[0]?._id) params.exam = quiz.applicableExams[0]._id;
      if (quiz.subject?._id) params.subject = quiz.subject._id;
      if (quiz.topic?._id) params.topic = quiz.topic._id;
      const res = await API.getAdminQuestions(params);
      if (res?.success) {
        const existingIds = new Set((quiz.questions || []).map(q => typeof q === 'string' ? q : q._id));
        setAvailableQuestions((res.data || []).filter(q => !existingIds.has(q._id)));
      }
    } catch (e) {}
    setShowAddQ(true);
  };

  const handleAddQuestions = async () => {
    if (!selectedQIds.length) return;
    try {
      const res = await API.addQuestionsToQuiz(selectedQuiz._id, selectedQIds);
      if (res?.success) { toast.success(`Added ${res.added} questions`); fetchQuizzes(); setShowAddQ(false); }
      else toast.error(res?.message || "Failed");
    } catch (e) { toast.error("Failed"); }
  };

  const statusColor = (s) => s === 'published' ? 'text-primary-600' : s === 'archived' ? 'bg-background-surface-secondary text-content-primary' : 'bg-background-surface-secondary text-content-primary';

  const columns = [
    {
      key: 'title', header: 'Title', render: (_, q) => (
        <span className="font-bold text-content-primary">{q.title}</span>
      )
    },
    {
      key: 'examSubject', header: 'Exam / Subject', render: (_, q) => (
        <span className="text-content-muted">{q.applicableExams?.map(e => e.name).join(', ') || '—'}{q.subject?.name ? ` · ${q.subject.name}` : ''}{q.topic?.name ? ` · ${q.topic.name}` : ''}</span>
      )
    },
    {
      key: 'duration', header: 'Duration', render: (_, q) => (
        <span className="text-content-muted">{q.duration}min</span>
      )
    },
    {
      key: 'questions', header: 'Questions', render: (_, q) => (
        <span className="text-content-muted">{q.questions?.length || 0}</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, q) => (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ring-1 ${q.status === 'published' ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{q.status}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, q) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openAddQuestions(q)} title="Add Questions" className="p-1.5 text-content-primary hover:bg-background-surface-secondary rounded-lg"><Plus className="w-4 h-4" /></button>
          <button onClick={() => handlePublish(q._id)} title={q.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 text-primary-600 rounded-lg">{q.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}</button>
          <button aria-label="Edit" onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
          <button aria-label="Delete" onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const searchFilterInput = (
    <SearchFilter searchTerm={searchTerm} onSearch={(v) => { setSearchTerm(v); setPage(1); }} placeholder="Search quizzes..." className="w-full xl:w-64" compact />
  );

  const examFilterSelect = (
    <StyledSelect
      value={filters.exam}
      onChange={val => { setFilters({ ...filters, exam: val }); setPage(1); }}
      options={[{ value: '', label: 'All Exams' }, ...exams.map(ex => ({ value: ex._id, label: ex.name }))]}
      className="w-full xl:max-w-[180px]"
    />
  );

  const subjectFilterSelect = (
    <StyledSelect
      value={filters.subject}
      onChange={val => { setFilters({ ...filters, subject: val }); setPage(1); }}
      options={[{ value: '', label: 'All Subjects' }, ...subjects.map(s => ({ value: s._id, label: s.name }))]}
      className="w-full xl:max-w-[180px]"
    />
  );

  const statusFilterSelect = (
    <StyledSelect
      value={filters.status}
      onChange={val => { setFilters({ ...filters, status: val }); setPage(1); }}
      options={[{ value: '', label: 'All Status' }, { value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]}
      className="w-full"
    />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' },
        { icon: List, id: 'list', label: 'List View' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          title={mode.label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const createQuizButton = (
    <button onClick={openCreate} className="w-full col-span-2 xl:col-span-1 flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:bg-primary-600 bg-primary-600"><Plus className="w-4 h-4" /> Create Quiz</button>
  );

  const paginationControl = quizzes.length > 0 && (
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
    title: 'Quizzes',
    count: totalItems,
    filters: (
      <>
        {searchFilterInput}
        {examFilterSelect}
        {subjectFilterSelect}
        {statusFilterSelect}
        {viewToggleButtons}
        {createQuizButton}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

      {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

      <div className="flex-1 min-h-0 overflow-auto flex flex-col">
      {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
        <>
          <div className="flex-1 min-h-0 overflow-auto">
          {viewMode === 'table' ? (
            <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col hover:-translate-y-0.5 transition-all relative">
              <ResponsiveTable data={quizzes} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No quizzes found" fillHeight />
            </div>
          ) : viewMode === 'grid' ? (
            <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
              {quizzes.map((q, idx) => (
                <div key={q._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-all relative">
                  <div className="flex items-start justify-between gap-2">
                    <div className="relative w-10 h-10 rounded-xl text-primary-600 flex items-center justify-center shrink-0 border border-border-primary">
                      <BrainCircuit className="w-5 h-5" />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{(page - 1) * itemsPerPage + idx + 1}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ring-1 ${q.status === 'published' ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{q.status}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-content-primary uppercase text-sm">{q.title}</h3>
                    <p className="text-xs text-content-muted mt-1">{q.subject?.name}{q.topic?.name ? ` · ${q.topic.name}` : ''} · {q.duration}min · {q.questions?.length || 0} Q</p>
                  </div>
                  <div className="flex gap-1 mt-auto pt-2 border-t border-border-primary">
                    <button onClick={() => openAddQuestions(q)} title="Add Questions" className="flex-1 flex items-center justify-center py-2 text-content-primary hover:bg-background-surface-secondary rounded-lg"><Plus className="w-4 h-4" /></button>
                    <button onClick={() => handlePublish(q._id)} title={q.status === 'published' ? 'Unpublish' : 'Publish'} className="flex-1 flex items-center justify-center py-2 text-primary-600 rounded-lg">{q.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}</button>
                    <button aria-label="Edit" onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                    <button aria-label="Delete" onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {quizzes.length === 0 && <div className="col-span-full py-12 text-center text-content-muted">No quizzes found</div>}
            </div>
          ) : (
            <div className="h-full overflow-auto space-y-3">
              {quizzes.map((q, idx) => (
                <section key={q._id} className="bg-background-surface rounded-lg xl:rounded-xl border border-border-primary p-4 hover:-translate-y-0.5 transition-all relative">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-background-surface-secondary text-content-muted text-[9px] font-bold flex items-center justify-center">{(page - 1) * itemsPerPage + idx + 1}</span>
                        <h3 className="text-sm font-bold text-content-primary uppercase">{q.title}</h3>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ring-1 ${q.status === 'published' ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{q.status}</span>
                      </div>
                      <p className="text-xs text-content-muted mb-2">{q.applicableExams?.map(e => e.name).join(', ') || '—'} · {q.subject?.name}{q.topic?.name ? ` · ${q.topic.name}` : ''} · {q.duration}min · {q.totalMarks} marks · {q.questions?.length || 0} Q</p>
                      <div className="flex flex-wrap gap-1">
                        {q.tags?.map((tag, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-background-surface-secondary rounded-full text-content-muted">#{tag}</span>)}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openAddQuestions(q)} title="Add Questions" className="p-1.5 text-content-primary hover:bg-background-surface-secondary rounded-lg"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => handlePublish(q._id)} title={q.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 text-primary-600 rounded-lg">{q.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}</button>
                      <button aria-label="Edit" onClick={() => openEdit(q)} className="p-1.5 rounded-lg text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button aria-label="Delete" onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </section>
              ))}
              {quizzes.length === 0 && <div className="py-12 text-center text-content-muted">No quizzes found</div>}
            </div>
          )}
          </div>
        </>
      )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[999]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-y-0 right-0 w-full bg-background-surface overflow-hidden flex flex-col">
          <div className="w-full h-full flex flex-col">
<section className="shrink-0 flex justify-between items-center px-4 py-2.5 border-b border-border-primary">
              <div className="flex items-center gap-2.5"><span className="w-8 h-8 shrink-0 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 10 }}><Plus className="w-4 h-4" /></span><h2 className="text-base font-bold uppercase tracking-tight text-content-primary">{editing ? 'Edit' : 'Create'} Quiz</h2></div>
              <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
            </section>
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
<div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 xl:p-5 space-y-3">
              <input required placeholder="Quiz Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
              <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <Select required value={form.exam} onChange={e => setForm({ ...form, exam: e.target.value, subject: "", topic: "" })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs"><option value="">Exam</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}</Select>
                <Select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value, topic: "" })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs"><option value="">Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</Select>
                <Select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs"><option value="">Topic (opt)</option>{topics.filter(t => !form.subject || (t.subject?._id || t.subject) === form.subject).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input required type="number" placeholder="Duration (min)" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs" />
                <input type="number" placeholder="Marks/Q" value={form.marksPerQuestion} onChange={e => setForm({ ...form, marksPerQuestion: parseFloat(e.target.value) || 0 })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs" />
                <input type="number" step="0.01" placeholder="Neg marking" value={form.negativeMarking} onChange={e => setForm({ ...form, negativeMarking: parseFloat(e.target.value) || 0 })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="mixed">Mixed</option></Select>
                <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-2 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-xs"><option value="topic_practice">Topic Practice</option><option value="subject_test">Subject Test</option><option value="full_mock">Full Mock</option></Select>
                <label className="flex items-center gap-2 text-xs text-content-secondary"><input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })} className="accent-primary-500" /> Free</label>
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
              </div>
<div className="flex shrink-0 px-4 xl:px-5 py-2.5 border-t border-border-primary bg-background-surface justify-end items-center"><button type="submit" className="px-6 text-on-primary py-2.5 rounded-lg xl:rounded-xl font-bold hover:bg-primary-600 bg-primary-600">{editing ? 'Update' : 'Create as Draft'}</button></div>
            </form>
          </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Add Questions Modal */}
      <AnimatePresence>
      {showAddQ && selectedQuiz && (
        <div className="fixed inset-0 z-[999]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddQ(false)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-y-0 right-0 w-full bg-background-surface overflow-hidden flex flex-col">
          <div className="p-4 w-full h-full flex flex-col">
            <section className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-content-primary">Add Questions to "{selectedQuiz.title}"</h2>
              <button aria-label="Close" onClick={() => setShowAddQ(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
            </section>
            <p className="text-xs text-content-muted mb-3">Current: {selectedQuiz.questions?.length || 0} questions | Selected: {selectedQIds.length}</p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableQuestions.length === 0 ? <p className="text-center text-content-muted py-4">No new questions available for this quiz filters</p> :
                availableQuestions.map(q => (
                  <label key={q._id} className={`flex items-start gap-3 p-3 rounded-lg xl:rounded-xl border cursor-pointer transition-all ${selectedQIds.includes(q._id) ? 'border-primary-400' : 'border-border-primary'}`}>
                    <input type="checkbox" checked={selectedQIds.includes(q._id)} onChange={e => { if (e.target.checked) setSelectedQIds([...selectedQIds, q._id]); else setSelectedQIds(selectedQIds.filter(id => id !== q._id)); }} className="mt-1 accent-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-content-primary">{q.questionText}</p>
                      <div className="flex gap-1 mt-1">{q.options?.map((o, i) => <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${o.isCorrect ? 'text-primary-600 font-bold' : 'bg-background-surface-secondary text-content-muted'}`}>{String.fromCharCode(65 + i)}</span>)}</div>
                    </div>
                  </label>
                ))
              }
            </div>
            <button onClick={handleAddQuestions} disabled={!selectedQIds.length} className="mt-4 w-full text-on-primary py-2.5 rounded-lg xl:rounded-xl font-bold hover:bg-primary-600 disabled:opacity-30 bg-primary-600">Add {selectedQIds.length} Questions</button>
          </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminQuizQuizzes;
