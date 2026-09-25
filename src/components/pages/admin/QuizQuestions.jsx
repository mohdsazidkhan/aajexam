'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useSSR } from "../../../hooks/useSSR";
import { Edit3, Trash2, Plus, Search, X, HelpCircle } from "lucide-react";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import Pagination from '../../Pagination';
import Sidebar from '../../Sidebar';
import StyledSelect from '../../ui/StyledSelect';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminQuizQuestions = () => {
  const { isMounted } = useSSR();
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({ exam: "", subject: "", topic: "", difficulty: "", search: "" });
  const [form, setForm] = useState({ exam: "", subject: "", topic: "", questionText: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }], explanation: "", difficulty: "medium", tags: "", language: "hi" });
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchQuestions(); }, [page, itemsPerPage, filters.exam, filters.subject, filters.topic, filters.difficulty]);

  const fetchDropdowns = async () => {
    try {
      const [exRes, subRes, topRes] = await Promise.all([API.getAllExams(), API.getAdminSubjects(), API.getAdminTopics()]);
      if (exRes?.success) setExams(exRes.data || []);
      if (subRes?.success) setSubjects(subRes.data || []);
      if (topRes?.success) setTopics(topRes.data || []);
    } catch (e) {}
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      if (filters.exam) params.exam = filters.exam;
      if (filters.subject) params.subject = filters.subject;
      if (filters.topic) params.topic = filters.topic;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;
      const res = await API.getAdminQuestions(params);
      if (res?.success) { setQuestions(res.data || []); setTotalPages(res.pagination?.totalPages || 1); setTotalItems(res.pagination?.total ?? (res.data || []).length); }
    } catch (e) { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchQuestions(); };

  // Update filtered topics when subject changes in form
  useEffect(() => {
    if (form.subject) setFilteredTopics(topics.filter(t => (t.subject?._id || t.subject) === form.subject));
    else setFilteredTopics(topics);
  }, [form.subject, topics]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    try {
      if (editing) {
        const res = await API.updateQuestion(editing._id, data);
        if (res?.success) { toast.success("Updated"); fetchQuestions(); setShowModal(false); setEditing(null); }
        else toast.error(res?.message || "Failed");
      } else {
        const res = await API.createQuestion(data);
        if (res?.success) { toast.success("Created"); fetchQuestions(); setShowModal(false); }
        else toast.error(res?.message || "Failed");
      }
    } catch (e) { toast.error(e.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this question?")) return;
    try { await API.deleteQuestion(id); toast.success("Deactivated"); fetchQuestions(); } catch (e) { toast.error("Failed"); }
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      exam: q.exam?._id || q.exam, subject: q.subject?._id || q.subject, topic: q.topic?._id || q.topic,
      questionText: q.questionText, options: q.options || [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }],
      explanation: q.explanation || "", difficulty: q.difficulty || "medium", tags: (q.tags || []).join(", "), language: q.language || "hi"
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ exam: "", subject: "", topic: "", questionText: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }], explanation: "", difficulty: "medium", tags: "", language: "hi" });
    setShowModal(true);
  };

  const updateOption = (idx, field, value) => {
    const opts = [...form.options];
    if (field === "isCorrect") { opts.forEach((o, i) => o.isCorrect = i === idx); }
    else opts[idx] = { ...opts[idx], [field]: value };
    setForm({ ...form, options: opts });
  };

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type="text" placeholder="Search question text..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
    </div>
  );

  const examFilterSelect = (
    <StyledSelect
      value={filters.exam}
      onChange={val => { setFilters({ ...filters, exam: val, subject: "", topic: "" }); setPage(1); }}
      options={[{ value: '', label: 'All Exams' }, ...exams.map(ex => ({ value: ex._id, label: ex.name }))]}
      className="w-full lg:max-w-[160px]"
    />
  );

  const subjectFilterSelect = (
    <StyledSelect
      value={filters.subject}
      onChange={val => { setFilters({ ...filters, subject: val, topic: "" }); setPage(1); }}
      options={[{ value: '', label: 'All Subjects' }, ...subjects.map(s => ({ value: s._id, label: s.name }))]}
      className="w-full lg:max-w-[160px]"
    />
  );

  const topicFilterSelect = (
    <StyledSelect
      value={filters.topic}
      onChange={val => { setFilters({ ...filters, topic: val }); setPage(1); }}
      options={[{ value: '', label: 'All Topics' }, ...topics.filter(t => !filters.subject || (t.subject?._id || t.subject) === filters.subject).map(t => ({ value: t._id, label: t.name }))]}
      className="w-full lg:max-w-[160px]"
    />
  );

  const difficultyFilterSelect = (
    <StyledSelect
      value={filters.difficulty}
      onChange={val => { setFilters({ ...filters, difficulty: val }); setPage(1); }}
      options={[
        { value: '', label: 'All Difficulty' },
        { value: 'easy', label: 'Easy' },
        { value: 'medium', label: 'Medium' },
        { value: 'hard', label: 'Hard' }
      ]}
      className="w-full"
    />
  );

  const addQuestionButton = (
    <button onClick={openCreate} title="Add New Question" className="flex items-center justify-center bg-primary-600 text-white p-2.5 rounded-lg lg:rounded-xl hover:bg-primary-800 shrink-0"><Plus className="w-4 h-4"/></button>
  );

  const paginationControl = questions.length > 0 && (
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
    title: 'Questions',
    count: totalItems,
    filters: (
      <>
        {searchInput}
        {examFilterSelect}
        {subjectFilterSelect}
        {topicFilterSelect}
        {difficultyFilterSelect}
        {addQuestionButton}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">

      {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

      {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
        <div className="flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto space-y-3">
          {questions.map((q, idx) => (
            <div key={q._id} className="bg-white dark:bg-slate-800 rounded-lg lg:rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center text-xs font-bold">{(page - 1) * itemsPerPage + idx + 1}</div>
                  <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{q.questionText}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {q.options?.map((opt, i) => (
                      <div key={i} className={`text-xs px-2 py-1.5 rounded-lg border ${opt.isCorrect ? 'bg-primary-50 border-primary-300 text-primary-600 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}. {opt.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{q.exam?.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">{q.subject?.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-black dark:text-white">{q.topic?.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.difficulty === 'easy' ? 'bg-primary-100 text-primary-600' : q.difficulty === 'hard' ? 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>{q.difficulty}</span>
                  </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(q)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q._id)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && <div className="py-12 text-center text-slate-400">No questions found</div>}
        </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 lg:left-64 lg:top-16 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-0 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 w-full h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Question</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <select required value={form.exam} onChange={e => setForm({ ...form, exam: e.target.value, subject: "", topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs">
                  <option value="">Exam</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
                </select>
                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value, topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs">
                  <option value="">Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <select required value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs">
                  <option value="">Topic</option>{filteredTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <textarea required placeholder="Question Text" rows={3} value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">Options (select correct answer):</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => updateOption(i, "isCorrect", true)} className="accent-primary-500" />
                      <span className="text-xs font-bold text-slate-500 w-4">{String.fromCharCode(65 + i)}</span>
                      <input required placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt.text} onChange={e => updateOption(i, "text", e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
                    </div>
                  ))}
                </div>
              </div>
              <textarea placeholder="Explanation (optional)" rows={2} value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs">
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs">
                  <option value="hi">Hindi</option><option value="en">English</option>
                </select>
                <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-xs" />
              </div>
              <button type="submit"className="w-full bg-primary-600 text-white py-2.5 rounded-lg lg:rounded-xl font-bold hover:bg-primary-800">{editing ?'Update':'Create'}</button>
            </form>
          </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminQuizQuestions;
