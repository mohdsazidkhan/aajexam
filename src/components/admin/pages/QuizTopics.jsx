'use client';
import Select from '../../common/ui/Select';
import React, { useState, useEffect } from "react";
import { m as motion, AnimatePresence } from "framer-motion";
import API from "../../../lib/api";
import { toast } from 'react-hot-toast';
import { useSSR } from "../../../hooks/useSSR";
import { Edit3, Trash2, Plus, Search, X, Layers, Table as TableIcon, LayoutGrid, List } from "lucide-react";
import { AdminTableSkeleton } from '../Skeletons';
import ResponsiveTable from '../../common/ResponsiveTable';
import Pagination from '../../common/Pagination';
import Sidebar from '../Sidebar';
import StyledSelect from '../../common/ui/StyledSelect';
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
        <span className="font-bold text-content-primary">{t.name}</span>
      )
    },
    {
      key: 'subject', header: 'Subject', render: (_, t) => (
        <span className="text-content-muted">{t.subject?.name || '-'}</span>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, t) => (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ring-1 ${t.isActive ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{t.isActive ? 'Active' : 'Inactive'}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, t) => (
        <div className="text-right">
          <button aria-label="Edit" onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
          <button aria-label="Delete" onClick={() => handleDelete(t._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
    </div>
  );

  const subjectFilterSelect = (
    <StyledSelect
      value={filterSubject}
      onChange={val => setFilterSubject(val)}
      options={[{ value: 'all', label: 'All Subjects' }, ...subjects.map(s => ({ value: s._id, label: s.name }))]}
      className="w-full xl:w-auto"
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

  const addTopicButton = (
    <button onClick={openCreate} className="w-full xl:w-auto flex items-center justify-center gap-2 text-on-primary px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:brightness-110 bg-primary-600"><Plus className="w-4 h-4"/> Add Topic</button>
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
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

      {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

      <div className="flex-1 min-h-0 overflow-auto">
      {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : viewMode === 'table' ? (
        <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col hover:-translate-y-0.5 transition-all relative">
          <ResponsiveTable data={pagedTopics} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} emptyMessage="No topics found" fillHeight />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
          {filtered.map((t, idx) => (
            <div key={t._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-all relative">
              <div className="flex items-start justify-between gap-2">
                <div className="relative w-10 h-10 rounded-md text-primary-600 flex items-center justify-center shrink-0 border border-primary-600">
                  <Layers className="w-5 h-5" />
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{idx + 1}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ring-1 ${t.isActive ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{t.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div>
                <h3 className="font-bold text-content-primary">{t.name}</h3>
                <p className="text-xs text-content-muted">{t.subject?.name || 'No subject'}</p>
              </div>
              <div className="flex gap-2 mt-auto pt-2 border-t border-border-primary">
                <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-primary-600 rounded-lg"><Edit3 className="w-3.5 h-3.5" /> Edit</button>
                <button onClick={() => handleDelete(t._id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-content-primary hover:bg-background-surface-secondary rounded-lg"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="col-span-full py-4 text-center text-content-muted">No topics found</div>}
        </div>
      ) : (
        <div className="h-full overflow-auto space-y-2">
          {filtered.map((t, idx) => (
            <section key={t._id} className="bg-background-surface rounded-xl border border-border-primary p-3 flex items-center gap-3 hover:-translate-y-0.5 transition-all relative">
              <div className="relative w-10 h-10 rounded-md text-primary-600 flex items-center justify-center shrink-0 border border-primary-600">
                <Layers className="w-5 h-5" />
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{idx + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-content-primary truncate">{t.name}</h3>
                <p className="text-xs text-content-muted truncate">{t.subject?.name || 'No subject'}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full ring-1 shrink-0 ${t.isActive ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}><span className="w-1.5 h-1.5 rounded-full bg-current" />{t.isActive ? 'Active' : 'Inactive'}</span>
              <div className="flex gap-1 shrink-0">
                <button aria-label="Edit" onClick={() => openEdit(t)} className="p-1.5 rounded-lg text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                <button aria-label="Delete" onClick={() => handleDelete(t._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </section>
          ))}
          {filtered.length === 0 && <div className="py-4 text-center text-content-muted">No topics found</div>}
        </div>
      )}
      </div>

      <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[999]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/50" />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-y-0 right-0 w-full bg-background-surface overflow-hidden flex flex-col">
          <div className="w-full h-full flex flex-col">
<section className="shrink-0 flex justify-between items-center px-4 py-2.5 border-b border-border-primary">
              <div className="flex items-center gap-2.5"><span className="w-8 h-8 shrink-0 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><Plus className="w-4 h-4" /></span><h2 className="text-base font-bold uppercase tracking-tight text-content-primary">{editing ? 'Edit' : 'Create'} Topic</h2></div>
              <button aria-label="Close" onClick={() => setShowModal(false)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
            </section>
            <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
<div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 xl:p-5 space-y-3">
              <Select required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm">
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </Select>
              <input required placeholder="Topic Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
              <input type="number" placeholder="Order" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
              </div>
<div className="flex shrink-0 px-4 xl:px-5 py-2.5 border-t border-border-primary bg-background-surface justify-end items-center"><button type="submit"className="px-6 text-on-primary py-2.5 rounded-lg xl:rounded-xl font-bold hover:brightness-110 bg-primary-600">{editing ?'Update':'Create'}</button></div>
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
