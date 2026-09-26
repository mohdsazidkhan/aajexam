'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../lib/api";
import { toast } from 'react-hot-toast';
import { useSSR } from "../../../hooks/useSSR";
import { Edit3, Trash2, Plus, Search, X, Layers, Table as TableIcon, LayoutGrid, List } from "lucide-react";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import Sidebar from '../../Sidebar';
import StyledSelect from '../../ui/StyledSelect';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

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
  const [viewMode, setViewMode] = useState('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

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
  const topicTotalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pagedTopics = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSubject, itemsPerPage]);

  const columns = [
    {
      key: 'name', header: 'Name', render: (_, t) => (
        <span className="font-bold text-slate-900 dark:text-white">{t.name}</span>
      )
    },
    {
      key: 'subject', header: 'Subject', render: (_, t) => (
        <span className="text-slate-500">{t.subject?.name || '-'}</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, t) => (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, t) => (
        <div className="text-right">
          <button onClick={() => openEdit(t)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg mr-1"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => handleDelete(t._id)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-800 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
    </div>
  );

  const subjectFilterSelect = (
    <StyledSelect
      value={filterSubject}
      onChange={val => setFilterSubject(val)}
      options={[{ value: 'all', label: 'All Subjects' }, ...subjects.map(s => ({ value: s._id, label: s.name }))]}
      className="w-full lg:w-auto"
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

  const addTopicButton = (
    <button onClick={openCreate} className="w-full lg:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-800"><Plus className="w-4 h-4"/> Add Topic</button>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={currentPage}
      totalPages={topicTotalPages}
      onPageChange={setCurrentPage}
      totalItems={filtered.length}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
    />
  );

  useAdminMobileHeader({
    title: 'Topics',
    count: filtered.length,
    filters: (
      <>
        {searchInput}
        {subjectFilterSelect}
        {viewToggleButtons}
        {addTopicButton}
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

      <div className="flex-1 min-h-0 overflow-auto">
      {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
          <ResponsiveTable data={pagedTopics} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No topics found" fillHeight />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {filtered.map((t, idx) => (
            <div key={t._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="relative w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{idx + 1}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t.name}</h3>
                <p className="text-xs text-slate-400">{t.subject?.name || 'No subject'}</p>
              </div>
              <div className="flex gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => handleDelete(t._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full py-8 text-center text-slate-400">No topics found</div>}
        </div>
      ) : (
        <div className="h-full overflow-auto space-y-2">
          {filtered.map((t, idx) => (
            <div key={t._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{t.name}</h3>
                <p className="text-xs text-slate-400 truncate">{t.subject?.name || 'No subject'}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${t.isActive ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white'}`}>{t.isActive ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(t)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-700 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t._id)} className="p-1.5 text-black dark:text-white hover:bg-slate-100 dark:bg-slate-700 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="py-8 text-center text-slate-400">No topics found</div>}
        </div>
      )}
      </div>

      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 lg:left-64 lg:top-16 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-0 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-6 w-full h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{editing ? 'Edit' : 'Create'} Topic</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-4">
              <select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input required placeholder="Topic Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              <input type="number" placeholder="Order" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
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

export default AdminQuizTopics;
