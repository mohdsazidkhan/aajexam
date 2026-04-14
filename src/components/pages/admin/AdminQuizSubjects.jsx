'use client';
import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useSSR } from "../../../hooks/useSSR";
import Loading from "../../Loading";
import { Edit3, Trash2, Plus, Search, X, BookMarked, Database } from "lucide-react";

const AdminQuizSubjects = () => {
  const { isMounted } = useSSR();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", order: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.getAdminSubjects();
      if (res?.success) setSubjects(res.data || []);
    } catch (e) { toast.error("Failed to load"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const res = await API.updateSubject(editing._id, form);
        if (res?.success) { toast.success("Updated"); fetchData(); setShowModal(false); setEditing(null); }
        else toast.error(res?.message || "Failed");
      } else {
        const res = await API.createSubject(form);
        if (res?.success) { toast.success("Created"); fetchData(); setShowModal(false); }
        else toast.error(res?.message || "Failed");
      }
    } catch (e) { toast.error(e.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Deactivate this subject?")) return;
    try { await API.deleteSubject(id); toast.success("Deactivated"); fetchData(); } catch (e) { toast.error("Failed"); }
  };

  const openEdit = (sub) => { setEditing(sub); setForm({ name: sub.name, description: sub.description || "", icon: sub.icon || "", order: sub.order || 0 }); setShowModal(true); };
  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", icon: "", order: 0 }); setShowModal(true); };

  const filtered = subjects.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (!isMounted) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black uppercase text-slate-900 dark:text-white flex items-center gap-2"><BookMarked className="w-6 h-6 text-indigo-500" /> Subjects</h1>
        <div className="flex gap-2">
          <button onClick={async () => { if (!confirm('Seed all subjects & topics? (existing will be kept, no duplicates)')) return; setSeeding(true); try { const res = await API.seedSubjectsTopics(); if (res?.success) { toast.success(`Done! ${res.stats.subjectsCreated} subjects, ${res.stats.topicsCreated} topics`); fetchData(); } else toast.error(res?.message || 'Failed'); } catch (e) { toast.error('Seed failed'); } finally { setSeeding(false); } }} disabled={seeding} className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-amber-600 disabled:opacity-50"><Database className="w-4 h-4" /> {seeding ? 'Seeding...' : 'Seed All Exams'}</button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600"><Plus className="w-4 h-4" /> Add Subject</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
      </div>

      {loading ? <Loading /> : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Name</th><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Order</th><th className="px-4 py-3 text-left font-bold text-slate-500 uppercase text-xs">Status</th><th className="px-4 py-3 text-right font-bold text-slate-500 uppercase text-xs">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map(sub => (
                <tr key={sub._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{sub.name}</td>
                  <td className="px-4 py-3 text-slate-500">{sub.order}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{sub.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(sub)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg mr-1"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(sub._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-400">No subjects found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Subject</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Subject Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <input type="number" placeholder="Order" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm" />
              <button type="submit" className="w-full bg-indigo-500 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-600">{editing ? 'Update' : 'Create'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizSubjects;
