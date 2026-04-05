'use client';

import { useState, useEffect, useCallback } from 'react';
import API from '../../../lib/api';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import SearchFilter from '../../SearchFilter';
import {
  Plus,
  Edit3,
  Trash2,
  FolderPlus,
  Info,
  Save,
  X,
  Search,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
  ChevronRight,
  Layers,
  Activity,
  Target,
  FileText,
  Fingerprint,
  Hash,
  Clock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import useDebounce from '../../../hooks/useDebounce';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import { useDarkMode } from '../../../hooks/useDarkMode';

const CategoryPage = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
  const [showForm, setShowForm] = useState(false);

  const { darkMode } = useDarkMode();
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchCategories = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: itemsPerPage,
        ...(search && { search })
      };
      const response = await API.getAdminCategories(params);
      setCategories(response.categories || response);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  const debouncedSearch = useDebounce(searchTerm, 1000); // Debounce search term

  useEffect(() => {
    fetchCategories(currentPage, debouncedSearch, itemsPerPage);
  }, [currentPage, debouncedSearch, itemsPerPage, fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.updateCategory(editingId, { name, description });
        toast.success('Category updated successfully!');
        setEditingId(null);
      } else {
        await API.createCategory({ name, description });
        toast.success('Category created successfully!');
      }
      setName('');
      setDescription('');
      setShowForm(false);
      fetchCategories(currentPage, searchTerm);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description || '');
    setShowForm(!showForm);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await API.deleteCategory(id);
        toast.success('Category deleted successfully!');
        fetchCategories(currentPage, searchTerm);
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setShowForm(false);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const TableView = () => (
    <div className="overflow-x-auto rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
      <table className="w-full border-collapse bg-white dark:bg-[#0A0F1E]/60 backdrop-blur-3xl">
        <thead className="bg-slate-50 dark:bg-white/5 border-b-2 border-slate-100 dark:border-white/5">
          <tr>
            {[
              { label: 'S.No.', icon: Hash },
              { label: 'Category Name', icon: Layers },
              { label: 'Sub-Categories', icon: Target },
              { label: 'Description', icon: Info },
              { label: 'Created At', icon: Clock },
              { label: 'Actions', icon: Zap }
            ].map((head, i) => (
              <th key={i} className="px-6 py-5 text-left">
                <div className="flex items-center gap-2">
                  {head.icon && <head.icon className="w-3 h-3 text-primary-500" />}
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{head.label}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-slate-50 dark:divide-white/5">
          {categories.map((cat, index) => (
            <motion.tr
              key={cat._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors group"
            >
              <td className="px-6 py-5">
                <span className="text-xs font-black text-slate-400">#{((currentPage - 1) * itemsPerPage) + index + 1}</span>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-sm">
                    {cat.name[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{cat.name}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cat.description || 'NO_DESCRIPTION'}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-transparent">
                  <Layers className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{cat.subcategoryCount || 0} ITEMS</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 max-w-[200px] truncate uppercase tracking-wide">
                  {cat.description || 'No description available'}
                </p>
              </td>
              <td className="px-6 py-5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {new Date(cat.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">
                    {new Date(cat.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(cat)}
                    className="p-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(cat._id)}
                    className="p-2 rounded-xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map((category, index) => (
        <motion.div
          key={category._id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -5 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-[2.5rem] border-4 border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
        >
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-20 lg:w-32 h-20 lg:h-32 bg-primary-500/5 rounded-bl-[4rem] group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-black text-lg shadow-inner group-hover:rotate-6 transition-transform">
                {category.name[0].toUpperCase()}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(category)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary-500 shadow-sm transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(category._id)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-primary-500 shadow-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors">
                {category.name}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 line-clamp-2 leading-relaxed">
                {category.description || 'No description available'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-6 border-t-2 border-slate-50 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                  {category.subcategoryCount || 0} ITEMS
                </span>
              </div>
              <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">ACTIVE</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {categories.map((category, index) => (
        <motion.div
          key={category._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white dark:bg-[#0A0F1E]/60 backdrop-blur-3xl rounded-[2rem] border-4 border-slate-100 dark:border-white/5 p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-500 p-0.5 shadow-lg group-hover:rotate-3 transition-transform">
                <div className="w-full h-full bg-slate-900 rounded-[0.9rem] flex items-center justify-center text-white font-black text-2xl italic">
                  {category.name[0].toUpperCase()}
                </div>
              </div>
              <div>
                <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {category.name}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {category.description || 'NO DESCRIPTION PROVIDED'}
                  </p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Clock className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">
                      {new Date(category.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-8 pt-4 lg:pt-0 border-t-2 lg:border-t-0 border-slate-50 dark:border-white/5">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">TOTAL</p>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{category.subcategoryCount || 0} ITEMS</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(category)}
                  className="p-4 rounded-2xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                >
                  <Edit3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(category._id)}
                  className="p-4 rounded-2xl bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <AdminMobileAppWrapper title="Categories">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 lg:p-8 w-full text-slate-900 dark:text-white font-outfit mt-12 lg:mt-0">

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-1 bg-indigo-500 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500/80">CATEGORY MANAGEMENT</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none font-outfit uppercase mb-4">
                  MANAGE <span className="text-indigo-500">CATEGORIES</span>
                </h1>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-xl leading-relaxed">
                  Organize your exam content within a professional hierarchical structure.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-100 dark:border-white/5 flex items-center gap-5 shadow-sm">
                  <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TOTAL CATEGORIES</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">{pagination.total || 0}</p>
                  </div>
                </div>

                <div className="px-6 py-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-100 dark:border-white/5 flex items-center gap-5 shadow-sm">
                  <div className="p-3 rounded-2xl bg-primary-500/10 text-primary-500">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SUB-CATEGORIES</p>
                    <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-none uppercase tracking-tighter">
                      {categories.reduce((acc, cat) => acc + (cat.subcategoryCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm">
              <div className="flex-1 w-full lg:w-auto relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-sm font-bold placeholder:text-slate-400 transition-all outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                <ViewToggle
                  currentView={viewMode}
                  onViewChange={setViewMode}
                  views={['table', 'list', 'grid']}
                />

                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-5 py-4 bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer focus:border-primary-500/30 transition-all"
                >
                  {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v} CATEGORIES</option>)}
                </select>

                <Button
                  variant="admin"
                  onClick={() => setShowForm(!showForm)}
                  className="!px-6 !py-4 rounded-2xl shadow-lg shadow-indigo-500/20 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5 mr-3" /> Create Category
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                className="mb-12 overflow-hidden"
              >
                <div className="p-8 lg:p-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                          {editingId ? <Edit3 className="w-6 h-6" /> : <FolderPlus className="w-6 h-6" />}
                        </div>
                        <h2 className="text-xl lg:text-2xl font-black italic tracking-tighter text-white uppercase">
                          {editingId ? 'Edit Category' : 'Create Category'}
                        </h2>
                      </div>
                      <button
                        onClick={handleCancel}
                        className="p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-2">Category Name</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 focus:border-white/50 rounded-2xl text-white placeholder:text-white/40 transition-all outline-none font-bold"
                          placeholder="e.g. Mathematics"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-2">Description</label>
                        <input
                          type="text"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 focus:border-white/50 rounded-2xl text-white placeholder:text-white/40 transition-all outline-none font-bold"
                          placeholder="Enter description..."
                        />
                      </div>
                      <div className="lg:col-span-2 flex justify-end gap-4 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-8 py-4 rounded-2xl text-white font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-10 py-4 bg-white text-primary-600 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                        >
                          <Save className="w-4 h-4" />
                          {editingId ? 'Update Category' : 'Create Category'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="relative min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <Loading size="lg" color="indigo" message="Loading Categories..." />
              </div>
            ) : categories.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 bg-slate-50/50 dark:bg-slate-900/10 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-white/5"
              >
                <div className="p-10 bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border-b-8 border-slate-100 dark:border-slate-700 mb-8">
                  <Fingerprint className="w-16 h-16 text-slate-200 dark:border-slate-700" />
                </div>
                <h3 className="text-md lg:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                  No Categories Found
                </h3>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {searchTerm ? 'Zero matches found in existing data' : 'Add your first category to get started.'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {viewMode === 'table' && <TableView />}
                    {viewMode === 'grid' && <CardView />}
                    {viewMode === 'list' && <ListView />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={itemsPerPage}
              />
            </motion.div>
          )}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default CategoryPage;






