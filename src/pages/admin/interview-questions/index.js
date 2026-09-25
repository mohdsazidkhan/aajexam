'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleQuestion, Plus, Pencil, Trash2, Eye, Table2, List, LayoutGrid, X, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import ResponsiveTable from '../../../components/ResponsiveTable';
import Pagination from '../../../components/Pagination';
import Sidebar from '../../../components/Sidebar';
import { AdminTableSkeleton } from '../../../components/admin/Skeletons';
import AdminRoute from '../../../components/admin/Route';
import CustomEditor from '../../../components/CustomEditor';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const emptyForm = { question: '', questionHi: '', answer: '', answerHi: '', tips: '', tipsHi: '', category: '', tags: '' };

const AdminInterviewQuestions = () => {
  const [questions, setQuestions] = useState([]);
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
      const [questionsRes, categoriesRes] = await Promise.all([
        API.request(`/api/admin/interview-questions?${params.toString()}`),
        API.request('/api/admin/interview-categories?limit=200')
      ]);
      if (questionsRes?.success) { setQuestions(questionsRes.data || []); setTotalPages(questionsRes.pagination?.totalPages || 1); setTotalItems(questionsRes.pagination?.total ?? (questionsRes.data || []).length); }
      if (categoriesRes?.success) setCategories(categoriesRes.data || []);
    } catch (e) { } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, itemsPerPage, debouncedSearch]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleSave = async () => {
    const body = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const url = editId ? `/api/admin/interview-questions/${editId}` : '/api/admin/interview-questions';
      const res = await API.request(url, { method: editId ? 'PUT' : 'POST', body: JSON.stringify(body) });
      if (res?.success) { toast.success(editId ? 'Updated' : 'Created'); setShowForm(false); setEditId(null); setForm(emptyForm); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };

  const handleEdit = (q) => { setEditId(q._id); setForm({ question: q.question, questionHi: q.questionHi || '', answer: q.answer || '', answerHi: q.answerHi || '', tips: q.tips || '', tipsHi: q.tipsHi || '', category: q.category?._id || '', tags: (q.tags || []).join(', ') }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await API.request(`/api/admin/interview-questions/${id}`, { method: 'DELETE' }); toast.success('Deleted'); fetchData(); } catch (e) { } };

  const inputClass = "w-full px-4 py-2.5 border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm bg-slate-50 dark:bg-black text-slate-900 dark:text-white outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

  const columns = [
    {
      key: 'question', header: 'Question', render: (_, q) => (
        <div className="max-w-xs">
          <p className="font-bold text-slate-900 dark:text-white truncate">{q.question}</p>
          {q.tags?.length > 0 && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{q.tags.join(', ')}</p>}
        </div>
      )
    },
    {
      key: 'category', header: 'Category', render: (_, q) => (
        <span className="whitespace-nowrap">{q.category?.name || '—'}</span>
      )
    },
    {
      key: 'type', header: 'Type', render: (_, q) => (
        <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-600 uppercase tracking-wide whitespace-nowrap">{q.category?.type || '—'}</span>
      )
    },
    {
      key: 'language', header: 'Lang', render: (_, q) => (
        <div className="flex items-center gap-1">
          <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-600 uppercase tracking-wide whitespace-nowrap">EN</span>
          {(q.questionHi || q.answerHi) && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide whitespace-nowrap">हिं</span>}
        </div>
      )
    },
    {
      key: 'views', header: 'Views', align: 'center', render: (_, q) => (
        <span className="flex items-center justify-center gap-1"><Eye className="w-3 h-3" />{q.views || 0}</span>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, q) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => handleEdit(q)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-black dark:text-white" /></button>
          <button onClick={() => handleDelete(q._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-black dark:text-white" /></button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full lg:w-56">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input type="text" placeholder="Search question or answer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm" />
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
          className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );

  const addQuestionButton = (
    <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="w-full px-4 py-2 rounded-lg lg:rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors bg-primary-600 text-white">
      <Plus className="w-3 h-3" /> Add Question
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
    title: 'Interview Questions',
    count: totalItems,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {addQuestionButton}
        {paginationControl}
      </>
    )
  });

  return (
    <AdminRoute>
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        <Head><title>Manage Interview Questions - Admin</title></Head>
        <Sidebar />
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

          <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          {loading ? <AdminTableSkeleton showHeader={false} showFilters={false} /> : (
            <>
              <div className="flex-1 min-h-0">
          {questions.length === 0 ? (
            <Card className="!py-12 text-center">
              <MessageCircleQuestion className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No questions found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Click &quot;Add Question&quot; to create one</p>
            </Card>
          ) : viewMode === 'table' ? (
            <Card className="!p-0 overflow-hidden h-auto lg:h-full flex flex-col" padded={false}>
              <ResponsiveTable data={questions} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
              {questions.map((q, i) => {
                const serialNumber = (page - 1) * itemsPerPage + i + 1;
                return (
                <Card key={q._id || i} className="!p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shrink-0">{serialNumber}</span>
                        <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-600 uppercase tracking-wide">{q.category?.type || '—'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5"><Eye className="w-3 h-3" /> {q.views || 0}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{q.question}</h3>
                    {q.category?.name && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 truncate">{q.category.name}</p>}
                  </div>
                  <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                    <button onClick={() => handleEdit(q)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                  </div>
                </Card>
                );
              })}
            </div>
          ) : (
            <div className="h-full overflow-auto space-y-1.5">
              {questions.map((q, i) => {
                const serialNumber = (page - 1) * itemsPerPage + i + 1;
                return (
                <Card key={q._id || i} className="!p-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shrink-0">{serialNumber}</span>
                      <span className="shrink-0 px-2 py-0.5 bg-primary-50 dark:bg-primary-500/10 rounded-lg text-[10px] font-black text-primary-600 uppercase tracking-wide whitespace-nowrap">{q.category?.type || '—'}</span>
                      {q.category?.name && (
                        <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap truncate max-w-[120px]">{q.category.name}</span>
                      )}
                      <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-0.5 whitespace-nowrap"><Eye className="w-3 h-3" /> {q.views || 0}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 break-all">{q.question}</h3>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(q)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-white/10 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-black dark:text-white" /></button>
                  </div>
                </Card>
                );
              })}
            </div>
          )}
              </div>
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
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">{editId ? 'Edit Question' : 'Add New Question'}</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below</p>
                    </div>
                    <button onClick={() => { setShowForm(false); setEditId(null); }} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"><X className="w-5 h-5 text-red-600 dark:text-red-400" /></button>
                  </div>
                  <div className="p-5 space-y-2 lg:space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Category <span className="text-black dark:text-white">*</span></label>
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c._id} value={c._id}>{c.name} ({c.type})</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tags</label>
                        <input placeholder="e.g. hr round, freshers" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className={inputClass} />
                      </div>
                    </div>

                    <div className="pt-2 border-t-2 border-slate-100 dark:border-slate-700/50">
                      <p className="text-[11px] font-black text-primary-600 uppercase tracking-wide mb-2">English</p>
                      <div className="space-y-2 lg:space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Question <span className="text-black dark:text-white">*</span></label>
                          <input placeholder="e.g. Tell me about yourself" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Sample Answer <span className="text-black dark:text-white">*</span></label>
                          <CustomEditor
                            value={form.answer}
                            onChange={(answer) => setForm({ ...form, answer })}
                            placeholder="Write the sample answer here..."
                            minHeight="180px"
                            toolbarButtons="all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tips &amp; Expert Advice</label>
                          <CustomEditor
                            value={form.tips}
                            onChange={(tips) => setForm({ ...form, tips })}
                            placeholder="Optional tips on how to answer well..."
                            minHeight="140px"
                            toolbarButtons="all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t-2 border-slate-100 dark:border-slate-700/50">
                      <p className="text-[11px] font-black text-primary-600 uppercase tracking-wide mb-2">Hindi (optional)</p>
                      <div className="space-y-2 lg:space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Question (Hindi)</label>
                          <input placeholder="जैसे: अपने बारे में बताइए" value={form.questionHi} onChange={e => setForm({ ...form, questionHi: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Sample Answer (Hindi)</label>
                          <CustomEditor
                            value={form.answerHi}
                            onChange={(answerHi) => setForm({ ...form, answerHi })}
                            placeholder="यहाँ हिंदी में उत्तर लिखें..."
                            minHeight="180px"
                            toolbarButtons="all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Tips (Hindi)</label>
                          <CustomEditor
                            value={form.tipsHi}
                            onChange={(tipsHi) => setForm({ ...form, tipsHi })}
                            placeholder="वैकल्पिक — इस सवाल का जवाब कैसे देना चाहिए..."
                            minHeight="140px"
                            toolbarButtons="all"
                          />
                        </div>
                      </div>
                    </div>
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

export default AdminInterviewQuestions;
