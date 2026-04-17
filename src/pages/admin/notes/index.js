'use client';
import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Pencil, Trash2, Eye, Table2, List, LayoutGrid, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import Loading from '../../../components/Loading';
import AdminRoute from '../../../components/AdminRoute';

const noteTypes = ['notes', 'formulas', 'shortcuts', 'important_points', 'tables', 'mnemonics'];

const AdminNotes = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', subject: '', noteType: 'notes', difficulty: 'intermediate', tags: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('table');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, subjectsRes] = await Promise.all([
        API.request(`/api/admin/notes?page=${page}&limit=20`),
        API.request('/api/quiz/subjects/all')
      ]);
      if (notesRes?.success) { setNotes(notesRes.data || []); setTotalPages(notesRes.pagination?.totalPages || 1); }
      if (subjectsRes?.success) setSubjects(subjectsRes.data || []);
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);

  const handleSave = async () => {
    const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const url = editId ? `/api/admin/notes/${editId}` : '/api/admin/notes';
      const res = await API.request(url, { method: editId ? 'PUT' : 'POST', body: JSON.stringify(body) });
      if (res?.success) { toast.success(editId ? 'Updated' : 'Created'); setShowForm(false); setEditId(null); setForm({ title: '', content: '', subject: '', noteType: 'notes', difficulty: 'intermediate', tags: '' }); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };

  const handleEdit = (n) => { setEditId(n._id); setForm({ title: n.title, content: n.content || '', subject: n.subject?._id || '', noteType: n.noteType, difficulty: n.difficulty, tags: (n.tags || []).join(', ') }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await API.request(`/api/admin/notes/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { } };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  const inputClass = "w-full px-4 py-2.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

  const difficultyColor = (d) => d === 'advanced' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : d === 'intermediate' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>Manage Notes - Admin</title></Head>
        <div className="container mx-auto px-0 lg:px-4 py-0 lg:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2"><StickyNote className="w-6 h-6 text-primary-500" /> Notes & Formulas</h1>
            <button onClick={() => { setShowForm(!showForm); if (showForm) setEditId(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${showForm ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-primary-500 text-white'}`}>
              {showForm ? <><Trash2 className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Note</>}
            </button>
          </div>

          {showForm && (
            <Card className="!p-0" padded={false}>
              <div className="p-5 border-b-2 border-slate-100 dark:border-slate-700/50">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{editId ? 'Edit Note' : 'Add New Note'}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below</p>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Subject <span className="text-red-400">*</span></label>
                    <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className={inputClass}>
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Note Type</label>
                    <select value={form.noteType} onChange={e => setForm({ ...form, noteType: e.target.value })} className={inputClass}>
                      {noteTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Difficulty</label>
                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className={inputClass}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Title <span className="text-red-400">*</span></label>
                  <input placeholder="Enter note title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Content <span className="text-red-400">*</span></label>
                  <textarea placeholder="HTML/Markdown supported..." rows={10} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={`${inputClass} resize-y font-mono`} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tags</label>
                  <input placeholder="e.g. physics, formula" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div className="p-5 border-t-2 border-slate-100 dark:border-slate-700/50 flex items-center gap-3">
                <button onClick={handleSave} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold transition-colors">{editId ? 'Update' : 'Create'}</button>
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              </div>
            </Card>
          )}

          {/* View Toggle & Count */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{notes.length} item{notes.length !== 1 ? 's' : ''} on this page</p>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5">
              {[
                { mode: 'table', icon: Table2, label: 'Table' },
                { mode: 'list', icon: List, label: 'List' },
                { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
              ].map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)} title={label}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === mode ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {notes.length === 0 ? (
            <Card className="!py-12 text-center">
              <StickyNote className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No notes found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click &quot;Add Note&quot; to create one</p>
            </Card>
          ) : viewMode === 'table' ? (
            /* ── Table View ── */
            <Card className="!p-0 overflow-hidden" padded={false}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Title</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Type</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Subject</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Difficulty</th>
                      <th className="text-center px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Views</th>
                      <th className="text-right px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {notes.map((n, i) => (
                      <tr key={n._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                          {n.tags?.length > 0 && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{n.tags.join(', ')}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-wide whitespace-nowrap">{n.noteType?.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{n.subject?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${difficultyColor(n.difficulty)}`}>{n.difficulty}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1"><Eye className="w-3 h-3" />{n.views || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(n)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-blue-500" /></button>
                            <button onClick={() => handleDelete(n._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : viewMode === 'grid' ? (
            /* ── Grid View ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {notes.map((n, i) => (
                <Card key={n._id || i} className="!p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-wide">{n.noteType?.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Eye className="w-3 h-3" /> {n.views || 0}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{n.title}</h3>
                    {n.subject?.name && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{n.subject.name}</p>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${difficultyColor(n.difficulty)}`}>{n.difficulty}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(n)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-blue-500" /></button>
                      <button onClick={() => handleDelete(n._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* ── List View ── */
            <div className="space-y-2">
              {notes.map((n, i) => (
                <Card key={n._id || i} className="!p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-wide">{n.noteType?.replace('_', ' ')}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{n.subject?.name}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${difficultyColor(n.difficulty)}`}>{n.difficulty}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Eye className="w-3 h-3" /> {n.views || 0}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(n)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-colors" title="Edit"><Pencil className="w-4 h-4 text-blue-500" /></button>
                    <button onClick={() => handleDelete(n._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`dot-${i}`} className="px-1 text-slate-400 text-xs">...</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${page === p ? 'bg-primary-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                      {p}
                    </button>
                  )
                )}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminNotes;
