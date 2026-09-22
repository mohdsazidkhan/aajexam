'use client';
import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useSSR } from "../../../hooks/useSSR";
import { Edit3, Trash2, Plus, Search, X, Layers, Table as TableIcon, LayoutGrid, List } from "lucide-react";
import { AdminTableSkeleton } from '../../skeletons/AdminSkeletons';

const AdminQuizTopics = () => {
  const { isMounted } = useSSR();
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [form, setForm] = useState({ subject: "", name: "", description: "", order: 0 });
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024 ? 'grid' : 'table');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [topicRes, subRes] = await Promise.all([API.getAdminTopics(), API.getAdminSubjects()]);
      if (topicRes?.success) setTopics(topicRes.data || []);
      if (subRes?.success) setSubjects(subRes.data || []);
    } catch (e) { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await API.updateTopic(editing._id, form);
        if (res?.success) { toast.success("Updated"); fetchData(); setShowModal(false); setEditing(null); }
        else toast.error(res?.message || "Failed");
      } else {
        const res = await API.createTopic(form);
        if (res?.success) { toast.success("Created"); fetchData(); setShowModal(false); }
        else toast.error(res?.message || "Failed");
      }
    } catch (e) { toast.error(e.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this topic?")) return;
    try { await API.deleteTopic(id); toast.success("Deactivated"); fetchData(); } catch (e) { toast.error("Failed"); }
  };

  const openEdit = (t) => { setEditing(t); setForm({ subject: t.subject?._id || t.subject, name: t.name, description: t.description || "", order: t.order || 0 }); setShowModal(true); };
  const openCreate = () => { setEditing(null); setForm({ subject: "", name: "", description: "", order: 0 }); setShowModal(true); };

  const filtered = topics.filter(t => {
    if (filterSubject !== "all" && (t.subject?._id || t.subject) !== filterSubject) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const showOrderColumn = filtered.some(t => t.order);

  if (!isMounted) return null;

  return (
    <div className="space-y-6 pt-4 lg:pt-6">
      <div className="flex justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2"><Layers className="w-6 h-6 text-black dark:text-white" /> Topics</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-700 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-800"><Plus className="w-4 h-4"/> Add Topic</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
        </div>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm">
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <div className="flex items-center bg-slate-100 dark:bg-white/5 p-1 rounded-lg lg:rounded-xl border border-slate-200 dark:border-white/10">
          {[
            { icon: TableIcon, id: 'table', label: 'Table' },
            { icon: LayoutGrid, id: 'grid', label: 'Grid' },
            { icon: List, id: 'list', label: 'List' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`p-2 rounded-lg transition-all flex items-center gap-2 flex-1 lg:flex-none justify-center ${viewMode === mode.id ? 'bg-white dark:bg-primary-600 text-primary-700 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <mode.icon className="w-4 h-4" />
              {viewMode === mode.id && <span className="text-[10px] font-black uppercase tracking-widest leading-none pr-1">{mode.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? <AdminTableSkeleton /> : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white dark:bg-slate-900">
              <tr><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Name</th><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Subject</th>{showOrderColumn && <th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Order</th>}<th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Status</th><th className="px-4 py-3 text-right font-bold text-slate-500 uppercase text-xs">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(t => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{t.name}</td>
                  <td className="px-4 py-3 text-slate-500">{t.subject?.name || '-'}</td>
                  {showOrderColumn && <td className="px-4 py-3 text-slate-500">{t.order}</td>}
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>{t.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(t)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg mr-1"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t._id)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={showOrderColumn ? 5 : 4} className="px-4 py-8 text-center text-slate-400">No topics found</td></tr>}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 flex items-center justify-center shrink-0"><Layers className="w-5 h-5" /></div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3>
                <p className="text-xs text-slate-400">{t.subject?.name || 'No subject'}</p>
              </div>
              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => handleDelete(t._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full py-8 text-center text-slate-400">No topics found</div>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 flex items-center justify-center shrink-0"><Layers className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{t.name}</h3>
                <p className="text-xs text-slate-400 truncate">{t.subject?.name || 'No subject'}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${t.isActive ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(t)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-700 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t._id)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-8 text-center text-slate-400">No topics found</div>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Topic</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-4">
              <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input required placeholder="Topic Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <input type="number" placeholder="Order" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <button type="submit"className="w-full bg-primary-700 text-white py-2.5 rounded-lg lg:rounded-xl font-bold hover:bg-primary-800">{editing ?'Update':'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizTopics;
