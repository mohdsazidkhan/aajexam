'use client';
import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useSSR } from "../../../hooks/useSSR";
import Loading from "../../Loading";
import { Edit3, Trash2, Plus, Search, X, BrainCircuit, Eye, Globe, GlobeLock, ChevronLeft, ChevronRight, Database } from "lucide-react";

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
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ exam: "", subject: "", status: "" });
  const [form, setForm] = useState({ title: "", description: "", exam: "", subject: "", topic: "", duration: 10, marksPerQuestion: 1, negativeMarking: 0, difficulty: "mixed", type: "topic_practice", tags: "", isFree: true });
  const [qFilters, setQFilters] = useState({ subject: "", topic: "" });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQIds, setSelectedQIds] = useState([]);

  useEffect(() => { fetchDropdowns(); }, []);
  useEffect(() => { fetchQuizzes(); }, [page, filters.exam, filters.subject, filters.status]);

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
      const params = { page, limit: 20 };
      if (filters.exam) params.exam = filters.exam;
      if (filters.subject) params.subject = filters.subject;
      if (filters.status) params.status = filters.status;
      const res = await API.getAdminQuizzes(params);
      if (res?.success) { setQuizzes(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
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
    setForm({ title: q.title, description: q.description || "", exam: q.exam?._id || q.exam, subject: q.subject?._id || q.subject, topic: q.topic?._id || q.topic || "", duration: q.duration, marksPerQuestion: q.marksPerQuestion || 1, negativeMarking: q.negativeMarking || 0, difficulty: q.difficulty || "mixed", type: q.type || "topic_practice", tags: (q.tags || []).join(", "), isFree: q.isFree !== false });
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
      if (quiz.exam?._id) params.exam = quiz.exam._id;
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

  const statusColor = (s) => s === 'published' ? 'bg-green-100 text-green-700' : s === 'archived' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-emerald-500" /> Quizzes</h1>
        <div className="flex gap-2">
          <button onClick={async () => { if (!confirm('Generate 1 quiz (5 questions) for every topic? This may take a minute.')) return; setLoading(true); try { const res = await API.seedQuizzes(); if (res?.success) { toast.success(`${res.stats.quizzesCreated} quizzes, ${res.stats.questionsCreated} questions created!`); fetchQuizzes(); } else toast.error(res?.message || 'Failed'); } catch (e) { toast.error('Failed'); } finally { setLoading(false); } }} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-600"><Database className="w-4 h-4" /> Seed Quizzes</button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600"><Plus className="w-4 h-4" /> Create Quiz</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={filters.exam} onChange={e => { setFilters({ ...filters, exam: e.target.value }); setPage(1); }} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="">All Exams</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}
        </select>
        <select value={filters.subject} onChange={e => { setFilters({ ...filters, subject: e.target.value }); setPage(1); }} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="">All Subjects</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select value={filters.status} onChange={e => { setFilters({ ...filters, status: e.target.value }); setPage(1); }} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="">All Status</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
        </select>
      </div>

      {loading ? <Loading /> : (
        <div className="space-y-3">
          {quizzes.map(q => (
            <div key={q._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">{q.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor(q.status)}`}>{q.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{q.exam?.name} · {q.subject?.name}{q.topic?.name ? ` · ${q.topic.name}` : ''} · {q.duration}min · {q.totalMarks} marks · {q.questions?.length || 0} Q</p>
                  <div className="flex flex-wrap gap-1">
                    {q.tags?.map((tag, i) => <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500">#{tag}</span>)}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openAddQuestions(q)} title="Add Questions" className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => handlePublish(q._id)} title={q.status === 'published' ? 'Unpublish' : 'Publish'} className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg">{q.status === 'published' ? <GlobeLock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}</button>
                  <button onClick={() => openEdit(q)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(q._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {quizzes.length === 0 && <div className="py-12 text-center text-slate-400">No quizzes found</div>}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-xl my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Quiz</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Quiz Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <div className="grid grid-cols-3 gap-2">
                <select required value={form.exam} onChange={e => setForm({ ...form, exam: e.target.value, subject: "", topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"><option value="">Exam</option>{exams.map(ex => <option key={ex._id} value={ex._id}>{ex.name}</option>)}</select>
                <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value, topic: "" })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"><option value="">Subject</option>{subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select>
                <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"><option value="">Topic (opt)</option>{topics.filter(t => !form.subject || (t.subject?._id || t.subject) === form.subject).map(t => <option key={t._id} value={t._id}>{t.name}</option>)}</select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input required type="number" placeholder="Duration (min)" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs" />
                <input type="number" placeholder="Marks/Q" value={form.marksPerQuestion} onChange={e => setForm({ ...form, marksPerQuestion: parseFloat(e.target.value) || 0 })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs" />
                <input type="number" step="0.01" placeholder="Neg marking" value={form.negativeMarking} onChange={e => setForm({ ...form, negativeMarking: parseFloat(e.target.value) || 0 })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option><option value="mixed">Mixed</option></select>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-2 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs"><option value="topic_practice">Topic Practice</option><option value="subject_test">Subject Test</option><option value="full_mock">Full Mock</option></select>
                <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"><input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })} className="accent-emerald-500" /> Free</label>
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <button type="submit" className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-600">{editing ? 'Update' : 'Create as Draft'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Add Questions Modal */}
      {showAddQ && selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-xl my-8 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Add Questions to "{selectedQuiz.title}"</h2>
              <button onClick={() => setShowAddQ(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Current: {selectedQuiz.questions?.length || 0} questions | Selected: {selectedQIds.length}</p>
            <div className="flex-1 overflow-y-auto space-y-2">
              {availableQuestions.length === 0 ? <p className="text-center text-slate-400 py-8">No new questions available for this quiz filters</p> :
                availableQuestions.map(q => (
                  <label key={q._id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedQIds.includes(q._id) ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                    <input type="checkbox" checked={selectedQIds.includes(q._id)} onChange={e => { if (e.target.checked) setSelectedQIds([...selectedQIds, q._id]); else setSelectedQIds(selectedQIds.filter(id => id !== q._id)); }} className="mt-1 accent-emerald-500" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{q.questionText}</p>
                      <div className="flex gap-1 mt-1">{q.options?.map((o, i) => <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded ${o.isCorrect ? 'bg-green-100 text-green-700 font-bold' : 'bg-slate-100 text-slate-500'}`}>{String.fromCharCode(65 + i)}</span>)}</div>
                    </div>
                  </label>
                ))
              }
            </div>
            <button onClick={handleAddQuestions} disabled={!selectedQIds.length} className="mt-4 w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-30">Add {selectedQIds.length} Questions</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizQuizzes;
