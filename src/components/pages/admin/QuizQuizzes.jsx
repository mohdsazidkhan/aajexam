'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useSSR } from "../../../hooks/useSSR";
import { Edit3, Trash2, Plus, Search, X, BrainCircuit, Eye, Globe, GlobeLock, Table as TableIcon, LayoutGrid, List } from "lucide-react";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import Sidebar from '../../Sidebar';
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
  const [form, setForm] = useState({ title: "", description: "", exam: "", subject: "", topic: "", duration: 10, marksPerQuestion: 1, negativeMarking: 0, difficulty: "mixed", type: "topic_practice", tags: "", isFree: true });
  const [qFilters, setQFilters] = useState({ subject: "", topic: "" });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQIds, setSelectedQIds] = useState([]);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchQuizzes(); }, [page, itemsPerPage, filters.exam, filters.subject, filters.status]);

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

  const statusColor = (s) => s === 'published' ? 'bg-primary-100 text-primary-600' : s === 'archived' ? 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white';

  const columns = [
    {
      key: 'title', header: 'Title', render: (_, q) => (
        <span className="font-bold text-slate-900 dark:text-white">{q.title}</span>
      )
    },
    {
      key: 'examSubject', header: 'Exam / Subject', render: (_, q) => (
        <span className="text-slate-500">{q.applicableExams?.map(e => e.name).join(', ') || '—'}{q.subject?.name ? ` · ${q.subject.name}` : ''}{q.topic?.name ? ` · ${q.topic.name}` : ''}</span>
      )
    },
    {
      key: 'duration', header: 'Duration', render: (_, q) => (
        <span className="text-slate-500">{q.duration}min</span>
      )
    },
    {
      key: 'questions', header: 'Questions', render: (_, q) => (
        <span className="text-slate-500">{q.questions?.length || 0}</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, q) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(q.status)}`}>{q.status}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, q) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => openAddQuestions(q)} title="Add Questions" className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Plus className="w-4 h-4" /></button>
          <button onClick={() => handlePublish(q._id)} title={q.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg">{q.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}</button>
          <button onClick={() => openEdit(q)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(q._id)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const examFilterSelect = (
    <StyledSelect
      value={filters.exam}
      onChange={val => { setFilters({ ...filters, exam: val }); setPage(1); }}
      options={[{ value: '', label: 'All Exams' }, ...exams.map(ex => ({ value: ex._id, label: ex.name }))]}
      className="w-full lg:max-w-[180px]"
    />
  );

  const subjectFilterSelect = (
    <StyledSelect
      value={filters.subject}
      onChange={val => { setFilters({ ...filters, subject: val }); setPage(1); }}
      options={[{ value: '', label: 'All Subjects' }, ...subjects.map(s => ({ value: s._id, label: s.name }))]}
      className="w-full lg:max-w-[180px]"
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
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const createQuizButton = (
    <button onClick={openCreate} className="w-full col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-600"><Plus className="w-4 h-4" /> Create Quiz</button>
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
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

      {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

      <div className="flex-1 min-h-0 overflow-auto flex flex-col">
      {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
        <>
          <div className="flex-1 min-h-0 overflow-auto">
          {viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
              <ResponsiveTable data={quizzes} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No quizzes found" fillHeight />
            </div>
          ) : viewMode === 'grid' ? (
            <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {quizzes.map((q, idx) => (
                <div key={q._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="relative w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-5 h-5" />
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(q.status)}`}>{q.status}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white uppercase text-sm">{q.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{q.subject?.name}{q.topic?.name ? ` · ${q.topic.name}` : ''} · {q.duration}min · {q.questions?.length || 0} Q</p>
                  </div>
                  <div className="flex gap-1 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={() => openAddQuestions(q)} title="Add Questions" className="flex-1 flex items-center justify-center py-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Plus className="w-4 h-4" /></button>
                    <button onClick={() => handlePublish(q._id)} title={q.status === 'published' ? 'Unpublish' : 'Publish'} className="flex-1 flex items-center justify-center py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg">{q.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}</button>
                    <button onClick={() => openEdit(q)} className="flex-1 flex items-center justify-center py-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(q._id)} className="flex-1 flex items-center justify-center py-2 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {quizzes.length === 0 && <div className="col-span-full py-12 text-center text-slate-400">No quizzes found</div>}
            </div>
          ) : (
            <div className="h-full overflow-auto space-y-3">
              {quizzes.map((q, idx) => (
                <div key={q._id} className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-[9px] font-black flex items-center justify-center">{(page - 1) * itemsPerPage + idx + 1}</span>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">{q.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(q.status)}`}>{q.status}</span>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{q.applicableExams?.map(e => e.name).join(', ') || '—'} · {q.subject?.name}{q.topic?.name ? ` · ${q.topic.name}` : ''} · {q.duration}min · {q.totalMarks} marks · {q.questions?.length || 0} Q</p>
                      <div className="flex flex-wrap gap-1">
                        {q.tags?.map((tag, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500">#{tag}</span>)}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => openAddQuestions(q)} title="Add Questions" className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Plus className="w-4 h-4" /></button>
                      <button onClick={() => handlePublish(q._id)} title={q.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg">{q.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}</button>
                      <button onClick={() => openEdit(q)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(q._id)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
              {quizzes.length === 0 && <div className="py-12 text-center text-slate-400">No quizzes found</div>}
            </div>
          )}
          </div>
        </>
      )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 lg:left-64 lg:top-16 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-0 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 w-full h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Quiz</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Quiz Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <select required value={form.exam} onChange={e => setForm({ ...form, exam: e.target.value, subject: "", topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs"><option value="">Exam</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}</select>
                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value, topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs"><option value="">Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select>
                <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs"><option value="">Topic (opt)</option>{topics.filter(t => !form.subject || (t.subject?._id || t.subject) === form.subject).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input required type="number" placeholder="Duration (min)" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs" />
                <input type="number" placeholder="Marks/Q" value={form.marksPerQuestion} onChange={e => setForm({ ...form, marksPerQuestion: parseFloat(e.target.value) || 0 })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs" />
                <input type="number" step="0.01" placeholder="Neg marking" value={form.negativeMarking} onChange={e => setForm({ ...form, negativeMarking: parseFloat(e.target.value) || 0 })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="mixed">Mixed</option></select>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs"><option value="topic_practice">Topic Practice</option><option value="subject_test">Subject Test</option><option value="full_mock">Full Mock</option></select>
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })} className="accent-primary-500" /> Free</label>
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg lg:rounded-xl font-bold hover:bg-primary-600">{editing ? 'Update' : 'Create as Draft'}</button>
            </form>
          </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Add Questions Modal */}
      <AnimatePresence>
      {showAddQ && selectedQuiz && (
        <div className="fixed inset-0 lg:left-64 lg:top-16 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddQ(false)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-0 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Add Questions to "{selectedQuiz.title}"</h2>
              <button onClick={() => setShowAddQ(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Current: {selectedQuiz.questions?.length || 0} questions | Selected: {selectedQIds.length}</p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableQuestions.length === 0 ? <p className="text-center text-slate-400 py-8">No new questions available for this quiz filters</p> :
                availableQuestions.map(q => (
                  <label key={q._id} className={`flex items-start gap-3 p-3 rounded-lg lg:rounded-xl border cursor-pointer transition-all ${selectedQIds.includes(q._id) ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="checkbox" checked={selectedQIds.includes(q._id)} onChange={e => { if (e.target.checked) setSelectedQIds([...selectedQIds, q._id]); else setSelectedQIds(selectedQIds.filter(id => id !== q._id)); }} className="mt-1 accent-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.questionText}</p>
                      <div className="flex gap-1 mt-1">{q.options?.map((o, i) => <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${o.isCorrect ? 'bg-primary-100 text-primary-600 font-bold' : 'bg-slate-100 text-slate-500'}`}>{String.fromCharCode(65 + i)}</span>)}</div>
                    </div>
                  </label>
                ))
              }
            </div>
            <button onClick={handleAddQuestions} disabled={!selectedQIds.length} className="mt-4 w-full bg-primary-600 text-white py-2.5 rounded-lg lg:rounded-xl font-bold hover:bg-primary-600 disabled:opacity-30">Add {selectedQIds.length} Questions</button>
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
