'use client';
import Select from '../../../components/common/ui/Select';
import React, { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Pencil, Trash2, Pin, Eye, Table2, List, LayoutGrid, Calendar, ExternalLink, X, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/common/ui/Card';
import ResponsiveTable from '../../../components/common/ResponsiveTable';
import Pagination from '../../../components/common/Pagination';
import Sidebar from '../../../components/admin/Sidebar';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
import AdminRoute from '../../../components/admin/Route';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const inputClass = "w-full px-4 py-2.5 border border-border-primary rounded-lg xl:rounded-xl text-sm bg-background-surface text-content-primary outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-content-muted";

  const typeColor = (t) => {
    const on = 'text-primary-600 ring-1 ring-primary-200 dark:text-primary-600 dark:ring-white/15';
    const off = 'bg-background-surface-secondary text-content-secondary ring-1 ring-slate-200 dark:ring-white/10';
    if (t === 'admit_card' || t === 'date_change') return off;
    return on;
  };


  const columns = [
    {
      key: 'title', header: 'Title', render: (_, n) => (
        <div className="flex items-center gap-2 max-w-xs">
          {n.isPinned && <Pin className="w-3.5 h-3.5 text-content-primary shrink-0" />}
          <div className="min-w-0">
            <p className="font-bold text-content-primary truncate">{n.title}</p>
            {n.tags?.length > 0 && <p className="text-[10px] text-content-muted mt-0.5 truncate">{n.tags.join(', ')}</p>}
          </div>
        </div>
      )
    },
    {
      key: 'type', header: 'Type', render: (_, n) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap ${typeColor(n.type)}`}>{n.type?.replace('_', ' ')}</span>
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
          {n.officialLink && <a href={n.officialLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-background-surface-secondary text-content-secondary hover:text-primary-700 transition-colors" title="Official Link"><ExternalLink className="w-3.5 h-3.5 text-primary-600" /></a>}
          <button onClick={() => handleEdit(n)} className="p-1.5 rounded-lg text-primary-600 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(n._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full xl:w-56">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input type="text" placeholder="Search title or content..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
    </div>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { mode: 'table', icon: Table2, label: 'Table View' },
        { mode: 'list', icon: List, label: 'List View' },
        { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
      ].map(({ mode, icon: Icon, label }) => (
        <button key={mode} onClick={() => setViewMode(mode)} title={label}
          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}>
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  const addNewButton = (
    <button onClick={() => { setShowForm(true); setEditId(null); }} className="w-full px-4 py-2 rounded-lg xl:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-on-primary bg-primary-600">
      <Plus className="w-3 h-3" /> Add New
    </button>
  );

  const paginationControl = totalItems > 0 && (
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
    title: 'Exam News',
    count: totalItems,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {addNewButton}
        {paginationControl}
      </>
    )
  });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
        <Head><title>Manage Exam News - Admin</title></Head>
        <Sidebar />
        <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0">
          {news.length === 0 ? (
            <Card className="!py-12 text-center">
              <Megaphone className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-content-muted">No exam news found</p>
              <p className="text-xs text-content-muted mt-1">Click &quot;Add New&quot; to create one</p>
            </Card>
          ) : viewMode === 'table' ? (
            /* ── Table View ── */
            <Card className="!p-0 overflow-hidden h-auto xl:h-full flex flex-col" padded={false}>
              <ResponsiveTable data={news} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
            </Card>
          ) : viewMode === 'grid' ? (
            /* ── Grid View ── */
            <div className="overflow-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
              {news.map((n, i) => (
                <Card as="article" key={n._id || i} className="!p-4 flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${typeColor(n.type)}`}>{n.type?.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        {n.isPinned && <Pin className="w-3.5 h-3.5 text-primary-600 fill-current" />}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background-surface-secondary text-content-secondary flex items-center gap-1"><Eye className="w-3 h-3" /> {n.views || 0}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-content-primary line-clamp-2 leading-snug">{n.title}</h3>
                    {n.examName && <p className="text-xs text-content-muted mt-1.5">{n.examName}</p>}
                    {n.content && <p className="text-xs text-content-muted mt-1 line-clamp-2 leading-relaxed">{n.content}</p>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                    <div className="flex items-center gap-1.5 text-[11px] text-content-muted">
                      <Calendar className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleDateString('en-IN')}
                    </div>
                    <div className="flex items-center gap-1">
                      {n.officialLink && <a href={n.officialLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-background-surface-secondary text-content-secondary hover:text-primary-700 transition-colors" title="Official Link"><ExternalLink className="w-3.5 h-3.5 text-primary-600" /></a>}
                      <button onClick={() => handleEdit(n)} className="p-1.5 rounded-lg text-primary-600 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(n._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* ── List View ── */
            <div className="h-full overflow-auto space-y-2">
              {news.map((n, i) => (
                <Card as="article" key={n._id || i} className="!p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all">
                  {n.isPinned && <Pin className="w-4 h-4 text-primary-600 fill-current flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ${typeColor(n.type)}`}>{n.type?.replace('_', ' ')}</span>
                      {n.examName && <span className="text-[11px] text-content-muted">{n.examName}</span>}
                      <span className="text-[11px] text-content-muted">{new Date(n.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="text-[11px] text-content-muted flex items-center gap-0.5"><Eye className="w-3 h-3" /> {n.views || 0}</span>
                    </div>
                    <h3 className="text-sm font-bold text-content-primary truncate">{n.title}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {n.officialLink && <a href={n.officialLink} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-background-surface-secondary text-content-secondary hover:text-primary-700 transition-colors" title="Official Link"><ExternalLink className="w-4 h-4 text-primary-600" /></a>}
                    <button onClick={() => handleEdit(n)} className="p-1.5 rounded-lg text-primary-600 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(n._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </Card>
              ))}
            </div>
          )}
              </div>
            </>
          )}
          </div>

          {/* Add / Edit Drawer */}
          <AnimatePresence>
            {showForm && (
              <div className="fixed inset-0 z-[999]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowForm(false); setEditId(null); }} className="absolute inset-0 bg-black/50" />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-y-0 right-0 w-full bg-background-surface overflow-hidden flex flex-col">
                  <div className="px-4 py-2.5 border-b-2 border-border-primary flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5"><span className="w-8 h-8 shrink-0 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 10 }}><Plus className="w-4 h-4" /></span><section>
                      <h2 className="text-base font-bold text-content-primary">{editId ? 'Edit Exam News' : 'Add New Exam News'}</h2>
                      <p className="text-xs text-content-muted mt-0.5">Fill in the details below</p>
                    </section></div>
                    <button aria-label="Close" onClick={() => { setShowForm(false); setEditId(null); }} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
                  </div>
                  <div className="p-4 space-y-2 xl:space-y-3 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-content-secondary mb-1.5">Type</label>
                        <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                          {types.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-content-secondary mb-1.5">Exam Name</label>
                        <input placeholder="e.g. SSC CGL" value={form.examName} onChange={e => setForm({ ...form, examName: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-content-secondary mb-1.5">Official Link</label>
                        <input placeholder="https://..." value={form.officialLink} onChange={e => setForm({ ...form, officialLink: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-content-secondary mb-1.5">Title <span className="text-content-primary">*</span></label>
                      <input placeholder="Enter the headline" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-content-secondary mb-1.5">Content <span className="text-content-primary">*</span></label>
                      <textarea placeholder="Write the full content..." rows={4} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className={`resize-y border border-border-primary ${inputClass}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-content-secondary mb-1.5">Tags</label>
                      <input placeholder="e.g. ssc, railway" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={inputClass} />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-content-secondary font-bold cursor-pointer"><input type="checkbox" checked={form.isPinned} onChange={e => setForm({ ...form, isPinned: e.target.checked })} className="rounded" /> Pin to top</label>
                  </div>
                  <div className="px-4 py-2.5 border-t border-border-primary flex items-center gap-3 shrink-0 justify-end items-center">
 <button onClick={handleSave} className="px-6 px-4 py-2.5 hover:bg-primary-600 text-on-primary rounded-lg xl:rounded-xl text-sm font-bold transition-colors bg-primary-600">{editId ? 'Update' : 'Create'}</button>
 <button onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2.5 bg-background-surface-secondary text-content-secondary rounded-lg xl:rounded-xl text-sm font-bold hover:bg-background-surface-secondary dark:hover:bg-slate-600 transition-colors">Cancel</button>
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
