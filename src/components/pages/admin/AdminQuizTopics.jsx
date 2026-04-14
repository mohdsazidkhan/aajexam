'use client';
import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useSSR } from "../../../hooks/useSSR";
import Loading from "../../Loading";
import { Edit3, Trash2, Plus, Search, X, Layers } from "lucide-react";

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

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2"><Layers className="w-6 h-6 text-cyan-500" /> Topics</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-cyan-600"><Plus className="w-4 h-4" /> Add Topic</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
        </div>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Name</th><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Subject</th><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Order</th><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Status</th><th className="px-4 py-3 text-right font-bold text-slate-500 uppercase text-xs">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(t => (
                <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{t.name}</td>
                  <td className="px-4 py-3 text-slate-500">{t.subject?.name || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{t.order}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(t)} className="p-1.5 text-cyan-500 hover:bg-cyan-50 rounded-lg mr-1"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(t._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">No topics found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Topic</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input required placeholder="Topic Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <input type="number" placeholder="Order" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <button type="submit" className="w-full bg-cyan-500 text-white py-2.5 rounded-xl font-bold hover:bg-cyan-600">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizTopics;
