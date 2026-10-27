'use client';
import Select from '../../../components/common/ui/Select';
import React, { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { FolderTree, Plus, Pencil, Trash2, X, Search, Table2, List, LayoutGrid } from 'lucide-react';
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

const emptyForm = { name: '', type: 'government', description: '', order: 0, isActive: true };

const AdminInterviewCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
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
      const res = await API.request(`/api/admin/interview-categories?${params.toString()}`);
      if (res?.success) { setCategories(res.data || []); setTotalPages(res.pagination?.totalPages || 1); setTotalItems(res.pagination?.total ?? (res.data || []).length); }
    } catch (e) { } finally { setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [page, itemsPerPage, debouncedSearch]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleSave = async () => {
    try {
      const url = editId ? `/api/admin/interview-categories/${editId}` : '/api/admin/interview-categories';
      const res = await API.request(url, { method: editId ? 'PUT' : 'POST', body: JSON.stringify(form) });
      if (res?.success) { toast.success(editId ? 'Updated' : 'Created'); setShowForm(false); setEditId(null); setForm(emptyForm); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };

  const handleEdit = (c) => { setEditId(c._id); setForm({ name: c.name, type: c.type, description: c.description || '', order: c.order || 0, isActive: c.isActive }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await API.request(`/api/admin/interview-categories/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { } };

  const inputClass = "w-full px-4 py-2.5 border border-border-primary rounded-lg xl:rounded-xl text-sm bg-background-surface text-content-primary outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-content-muted";

  const columns = [
    {
      key: 'name', header: 'Name', render: (_, c) => (
        <p className="font-bold text-content-primary">{c.name}</p>
      )
    },
    {
      key: 'type', header: 'Type', render: (_, c) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ring-1 text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15 whitespace-nowrap">{c.type}</span>
      )
    },
    {
      key: 'order', header: 'Order', align: 'center', render: (_, c) => (<span>{c.order}</span>)
    },
    {
      key: 'isActive', header: 'Status', render: (_, c) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ring-1 whitespace-nowrap ${c.isActive ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, c) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg text-primary-600 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full xl:w-56">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input type="text" placeholder="Search categories..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm" />
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

  const addButton = (
    <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="w-full px-4 py-2 rounded-lg xl:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-on-primary bg-primary-600">
      <Plus className="w-3 h-3" /> Add Category
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
    title: 'Interview Categories',
    count: totalItems,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {addButton}
        {paginationControl}
      </>
    )
  });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
        <Head><title>Manage Interview Categories - Admin</title></Head>
        <Sidebar />
        <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
            {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
              <div className="flex-1 min-h-0">
                {categories.length === 0 ? (
                  <Card className="!py-12 text-center">
                    <FolderTree className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-bold text-content-muted">No categories found</p>
                    <p className="text-xs text-content-muted mt-1">Click &quot;Add Category&quot; to create one</p>
                  </Card>
                ) : viewMode === 'table' ? (
                  <Card className="!p-0 overflow-hidden h-auto xl:h-full flex flex-col" padded={false}>
                    <ResponsiveTable data={categories} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                  </Card>
                ) : viewMode === 'grid' ? (
                  <div className="overflow-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
                    {categories.map((c, i) => (
                      <Card as="article" key={c._id || i} className="!p-4 flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-all">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center shrink-0 bg-primary-600">{(page - 1) * itemsPerPage + i + 1}</span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ring-1 text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15">{c.type}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ring-1 ${c.isActive ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                          <h3 className="text-sm font-bold text-content-primary truncate">{c.name}</h3>
                          <p className="text-xs text-content-muted mt-1.5">Order: {c.order}</p>
                        </div>
                        <div className="flex items-center justify-end gap-1 pt-2 border-t border-border-primary">
                          <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg text-primary-600 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="h-full overflow-auto space-y-1.5">
                    {categories.map((c, i) => (
                      <Card as="article" key={c._id || i} className="!p-3 flex items-start justify-between gap-2 hover:-translate-y-0.5 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                            <span className="w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center shrink-0 bg-primary-600">{(page - 1) * itemsPerPage + i + 1}</span>
                            <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ring-1 text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15 whitespace-nowrap">{c.type}</span>
                            <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] ring-1 whitespace-nowrap ${c.isActive ? 'text-primary-600 ring-primary-200 dark:text-primary-600 dark:ring-white/15' : 'bg-background-surface-secondary text-content-secondary ring-slate-200 dark:bg-white/10 dark:ring-white/10'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                            <span className="shrink-0 text-[11px] text-content-muted whitespace-nowrap">Order: {c.order}</span>
                          </div>
                          <h3 className="text-sm font-bold text-content-primary leading-snug line-clamp-1 break-all">{c.name}</h3>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg text-primary-600 transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add / Edit Drawer */}
          <AnimatePresence>
            {showForm && (
              <div className="fixed inset-0 z-[999]">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowForm(false); setEditId(null); }} className="absolute inset-0 bg-black/50" />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute inset-y-0 right-0 w-full bg-background-surface overflow-hidden flex flex-col">
                  <div className="px-4 py-2.5 border-b-2 border-border-primary flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5"><span className="w-8 h-8 shrink-0 flex items-center justify-center text-on-primary bg-primary-600" style={{ borderRadius: 10 }}><Plus className="w-4 h-4" /></span><section>
                      <h2 className="text-base font-bold text-content-primary">{editId ? 'Edit Category' : 'Add New Category'}</h2>
                      <p className="text-xs text-content-muted mt-0.5">Fill in the details below</p>
                    </section></div>
                    <button aria-label="Close" onClick={() => { setShowForm(false); setEditId(null); }} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
                  </div>
                  <div className="p-4 space-y-2 xl:space-y-3 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-content-secondary mb-1.5">Name <span className="text-content-primary">*</span></label>
                        <input placeholder="e.g. Banking, HR Round" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-content-secondary mb-1.5">Job Type</label>
                        <Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                          <option value="government">Government</option>
                          <option value="private">Private</option>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-content-secondary mb-1.5">Description</label>
                      <input placeholder="Optional short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-content-secondary mb-1.5">Order</label>
                        <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} className={inputClass} />
                      </div>
                      <div className="flex items-end pb-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-content-secondary">
                          <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                          Active
                        </label>
                      </div>
                    </div>
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

export default AdminInterviewCategories;
