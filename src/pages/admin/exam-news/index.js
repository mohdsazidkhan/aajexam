'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Pencil, Trash2, Pin, Eye, Table2, List, LayoutGrid, Calendar, ExternalLink, X, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import ResponsiveTable from '../../../components/ResponsiveTable';
import Pagination from '../../../components/Pagination';
import Sidebar from '../../../components/Sidebar';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
import AdminRoute from '../../../components/AdminRoute';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';

const types = ['notification', 'admit_card', 'result', 'answer_key', 'syllabus', 'vacancy', 'date_change', 'other'];

const AdminExamNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'notification', examName: '', officialLink: '', isPinned: false, tags: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('grid');
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(itemsPerPage) });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await API.request(`/api/admin/exam-news?${params.toString()}`);
      if (res?.success) { setNews(res.data || []); setTotalPages(res.pagination?.totalPages || 1); setTotalItems(res.pagination?.total ?? (res.data || []).length); }
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, itemsPerPage, debouncedSearch]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleSave = async () => {
    const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const url = editId ? `/api/admin/exam-news/${editId}` : '/api/admin/exam-news';
      const res = await API.request(url, { method: editId ? 'PUT' : 'POST', body: JSON.stringify(body) });
      if (res?.success) { toast.success(editId ? 'Updated' : 'Created'); setShowForm(false); setEditId(null); setForm({ title: '', content: '', type: 'notification', examName: '', officialLink: '', isPinned: false, tags: '' }); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };

  const handleEdit = (n) => { setEditId(n._id); setForm({ title: n.title, content: n.content, type: n.type, examName: n.examName || '', officialLink: n.officialLink || '', isPinned: n.isPinned, tags: (n.tags || []).join(', ') }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await API.request(`/api/admin/exam-news/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { } };

  const inputClass = "w-full px-4 py-2.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm bg-slate-50 dark:bg-black text-slate-900 dark:text-white outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

  const typeColor = (t) => {
    if (t === 'result' || t === 'answer_key') return 'bg-primary-50 dark:bg-primary-500/10 text-primary-600';
    if (t === 'admit_card') return 'bg-slate-100 dark:bg-slate-800 dark:bg-white/10 text-black dark:text-white dark:text-white';
    if (t === 'vacancy') return 'bg-primary-50 dark:bg-primary-500/10 text-primary-600';
    if (t === 'date_change') return 'bg-slate-100 dark:bg-slate-800 dark:bg-white/10 text-black dark:text-white dark:text-white';
    return 'bg-primary-50 dark:bg-primary-500/10 text-primary-600';
  };

  const columns = [
    {
      key: 'title', header: 'Title', render: (_, n) => (
        <div className="flex items-center gap-2 max-w-xs">
          {n.isPinned && <Pin className="w-3.5 h-3.5 text-black dark:text-white shrink-0" />}
          <div className="min-w-0">
            <p className="font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
            {n.tags?.length > 0 && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{n.tags.join(', ')}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'type', header: 'Type', render: (_, n) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${typeColor(n.type)}`}>{n.type?.replace('_', ' ')}</span>
      )
    },
    {
      key: 'examName', header: 'Exam', render: (_, n) => (
        <span className="whitespace-nowrap">{n.examName || '—'}</span>
      )
    },
    {
      key: 'createdAt', header: 'Date', render: (_, n) => (
        <span className="whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
      )
    },
    {
      key: 'views', header: 'Views', align: 'center', render: (_, n) => (
        <span className="flex items-center justify-center gap-1"><Eye className="w-3 h-3" />{n.views || 0}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, n) => (
        <div className="flex items-center justify-end gap-1">
          {n.officialLink && <a href={n.officialLink} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors" title="Official Link"><ExternalLink className="w-3.5 h-3.5 text-primary-600" /></a>}
          <button onClick={() => handleEdit(n)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-black dark:text-white" /></button>
          <button onClick={() => handleDelete(n._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-black dark:text-white" /></button>
        </div>
      )
    }
  ];

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <Head><title>Manage Exam News - Admin</title></Head>
        <Sidebar />
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><Megaphone className="w-6 h-6 text-primary-600 shrink-0" /> Exam News <span className="text-slate-400 dark:text-slate-500">({totalItems})</span></h1>
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <div className="relative w-full lg:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" placeholder="Search title or content..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
              </div>
              <div className="flex items-center gap-1">
                {[
                  { mode: 'table', icon: Table2, label: 'Table View' },
                  { mode: 'list', icon: List, label: 'List View' },
                  { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
                ].map(({ mode, icon: Icon, label }) => (
                  <button key={mode} onClick={() => setViewMode(mode)} title={label}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <button onClick={() => { setShowForm(true); setEditId(null); }} className="shrink-0 px-4 py-2 rounded-lg lg:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors bg-primary-600 text-white">
                <Plus className="w-3 h-3" /> Add New
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0 overflow-hidden">
          {news.length === 0 ? (
            <Card className="!py-12 text-center">
              <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No exam news found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click &quot;Add New&quot; to create one</p>
            </Card>
          ) : viewMode === 'table' ? (
            /* ── Table View ── */
            <Card className="!p-0 overflow-hidden h-full flex flex-col" padded={false}>
              <ResponsiveTable data={news} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
            </Card>
          ) : viewMode === 'grid' ? (
            /* ── Grid View ── */
            <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
              {news.map((n, i) => (
                <Card key={n._id || i} className="!p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${typeColor(n.type)}`}>{n.type?.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        {n.isPinned && <Pin className="w-3 h-3 text-black dark:text-white" />}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Eye className="w-3 h-3" /> {n.views || 0}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{n.title}</h3>
                    {n.examName && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{n.examName}</p>}
                    {n.content && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{n.content}</p>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1">
                      {n.officialLink && <a href={n.officialLink} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors" title="Official Link"><ExternalLink className="w-3.5 h-3.5 text-primary-600" /></a>}
                      <button onClick={() => handleEdit(n)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                      <button onClick={() => handleDelete(n._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* ── List View ── */
            <div className="h-full overflow-auto space-y-2">
              {news.map((n, i) => (
                <Card key={n._id || i} className="!p-4 flex items-center gap-4">
                  {n.isPinned && <Pin className="w-4 h-4 text-black dark:text-white flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${typeColor(n.type)}`}>{n.type?.replace('_', ' ')}</span>
                      {n.examName && <span className="text-[11px] text-slate-400 dark:text-slate-500">{n.examName}</span>}
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Eye className="w-3 h-3" /> {n.views || 0}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{n.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {n.officialLink && <a href={n.officialLink} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg lg:rounded-xl transition-colors" title="Official Link"><ExternalLink className="w-4 h-4 text-primary-600" /></a>}
                    <button onClick={() => handleEdit(n)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg lg:rounded-xl transition-colors" title="Edit"><Pencil className="w-4 h-4 text-black dark:text-white" /></button>
                    <button onClick={() => handleDelete(n._id)} className="p-2 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg lg:rounded-xl transition-colors" title="Delete"><Trash2 className="w-4 h-4 text-black dark:text-white" /></button>
                  </div>
                </Card>
              ))}
            </div>
          )}
              </div>

              {totalItems > 0 && (
                <div className="shrink-0">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setPage(1); }}
                  />
                </div>
              )}
            </>
          )}
          </div>

          {/* Add / Edit Drawer */}
          <AnimatePresence>
            {showForm && (
              <div className="fixed inset-0 lg:left-64 lg:top-16 z-50">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowForm(false); setEditId(null); }} className="absolute inset-0 bg-black/50" />
                <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-0 bg-white dark:bg-slate-800 shadow-2xl overflow-hidden flex flex-col">
                  <div className="p-5 border-b-2 border-slate-100 dark:border-slate-700/50 flex items-center justify-between shrink-0">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">{editId ? 'Edit Exam News' : 'Add New Exam News'}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below</p>
                    </div>
                    <button onClick={() => { setShowForm(false); setEditId(null); }} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
                  </div>
                  <div className="p-5 space-y-2 lg:space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Type</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                          {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Exam Name</label>
                        <input placeholder="e.g. SSC CGL" value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Official Link</label>
                        <input placeholder="https://..." value={form.officialLink} onChange={e => setForm({ ...form, officialLink: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Title <span className="text-black dark:text-white">*</span></label>
                      <input placeholder="Enter the headline" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Content <span className="text-black dark:text-white">*</span></label>
                      <textarea placeholder="Write the full content..." rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={`${inputClass} resize-y`} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tags</label>
                      <input placeholder="e.g. ssc, railway" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={inputClass} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 font-bold cursor-pointer"><input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} className="rounded" /> Pin to top</label>
                  </div>
                  <div className="p-5 border-t-2 border-slate-100 dark:border-slate-700/50 flex items-center gap-3 shrink-0">
                    <button onClick={handleSave} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-600 text-white rounded-lg lg:rounded-xl text-sm font-bold transition-colors">{editId ? 'Update' : 'Create'}</button>
                    <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg lg:rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminExamNews;
