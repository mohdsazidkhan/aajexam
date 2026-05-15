'use client';
import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useSSR } from "../../../hooks/useSSR";
import Loading from "../../Loading";
import { Edit3, Trash2, Plus, Search, X, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ exam: "", subject: "", topic: "", difficulty: "", search: "" });
  const [form, setForm] = useState({ exam: "", subject: "", topic: "", questionText: "", options: [{ text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }], explanation: "", difficulty: "medium", tags: "", language: "hi" });
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchQuestions(); }, [page, filters.exam, filters.subject, filters.topic, filters.difficulty]);

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
      const params = { page, limit: 20 };
      if (filters.exam) params.exam = filters.exam;
      if (filters.subject) params.subject = filters.subject;
      if (filters.topic) params.topic = filters.topic;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.search) params.search = filters.search;
      const res = await API.getAdminQuestions(params);
      if (res?.success) { setQuestions(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
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

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2"><HelpCircle className="w-6 h-6 text-amber-500" /> Questions</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-600"><Plus className="w-4 h-4" /> Add Question</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={filters.exam} onChange={e => { setFilters({ ...filters, exam: e.target.value, subject: "", topic: "" }); setPage(1); }} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="">All Exams</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
        </select>
        <select value={filters.subject} onChange={e => { setFilters({ ...filters, subject: e.target.value, topic: "" }); setPage(1); }} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="">All Subjects</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select value={filters.topic} onChange={e => { setFilters({ ...filters, topic: e.target.value }); setPage(1); }} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="">All Topics</option>{topics.filter(t => !filters.subject || (t.subject?._id || t.subject) === filters.subject).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <select value={filters.difficulty} onChange={e => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1); }} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="">All Difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search question text..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleSearch()} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">{q.questionText}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {q.options?.map((opt, i) => (
                      <div key={i} className={`text-xs px-2 py-1.5 rounded-lg border ${opt.isCorrect ? 'bg-green-50 border-green-300 text-green-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {String.fromCharCode(65 + i)}. {opt.text}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{q.exam?.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">{q.subject?.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-600">{q.topic?.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${q.difficulty === 'easy' ? 'bg-green-100 text-green-600' : q.difficulty === 'hard' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>{q.difficulty}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(q)} className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {questions.length === 0 && <div className="py-12 text-center text-slate-400">No questions found</div>}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Question</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <select required value={form.exam} onChange={e => setForm({ ...form, exam: e.target.value, subject: "", topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs">
                  <option value="">Exam</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
                </select>
                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value, topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs">
                  <option value="">Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <select required value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs">
                  <option value="">Topic</option>{filteredTopics.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <textarea required placeholder="Question Text" rows={3} value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500">Options (select correct answer):</p>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => updateOption(i, "isCorrect", true)} className="accent-green-500" />
                    <span className="text-xs font-bold text-slate-500 w-4">{String.fromCharCode(65 + i)}</span>
                    <input required placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt.text} onChange={e => updateOption(i, "text", e.target.value)} className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
                  </div>
                ))}
              </div>
              <textarea placeholder="Explanation (optional)" rows={2} value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs">
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs">
                  <option value="hi">Hindi</option><option value="en">English</option>
                </select>
                <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs" />
              </div>
              <button type="submit" className="w-full bg-amber-500 text-white py-2.5 rounded-xl font-bold hover:bg-amber-600">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizQuestions;
