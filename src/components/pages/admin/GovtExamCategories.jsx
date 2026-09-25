"use client";

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import ViewToggle from "../../ViewToggle";
import Button from "../../ui/Button";
import ResponsiveTable from "../../ResponsiveTable";
import Pagination from "../../Pagination";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

import {
  Shield,
  Map,
  Plus,
  Edit,
  Trash2,
  Filter,
  ArrowRight,
  Clock,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Table as TableIcon,
  XCircle,
  FileText,
  Globe,
  Star,
  Zap,
  CheckCircle2,
  Settings
} from "lucide-react";

const AdminGovtExamCategories = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [formData, setFormData] = useState({
    name: "",
    type: "Central",
    description: ""
  });
  const user = getCurrentUser();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) setViewMode("list");
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "table") {
        setViewMode("list");
      } else if (window.innerWidth >= 768 && viewMode === "list") {
        setViewMode("table");
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await API.getRealExamCategories();
      if (response?.success) {
        setCategories(response.data || []);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", type: "Central", description: "" });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await API.deleteExamCategory(categoryId);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(error?.response?.data?.message || "Failed to delete category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await API.updateExamCategory(editingCategory._id, formData);
        toast.success("Category updated successfully");
      } else {
        await API.createExamCategory(formData);
        toast.success("Category created successfully");
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(error?.response?.data?.message || "Failed to save category");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return `${d.getDate()} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const categoryTotalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));
  const pagedCategories = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const categoryTableColumns = [
    {
      key: 'name', header: 'CATEGORY NAME', render: (_, category) => (
        <span className="font-black text-slate-900 dark:text-white uppercase italic tracking-tight text-lg">
          {category.name}
        </span>
      )
    },
    {
      key: 'jurisdiction', header: 'JURISDICTION', render: (_, category) => (
        <div className={`px-4 py-1 rounded-full text-[8px] font-black inline-flex items-center gap-2 border ${category.type === "Central"
          ? "bg-primary-500/10 text-primary-600 border-primary-500/20 shadow-sm"
          : "bg-primary-500/10 text-primary-600 border-primary-500/20 shadow-sm"}`}>
          {category.type === "Central" ? <Globe className="w-3 h-3" /> : <Map className="w-3 h-3" />}
          {category.type?.toUpperCase()}
        </div>
      )
    },
    {
      key: 'description', header: 'DESCRIPTION', render: (_, category) => (
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 line-clamp-1 max-w-xs">{category.description || 'No description'}</p>
      )
    },
    {
      key: 'addedOn', header: 'ADDED ON', render: (_, category) => (
        <span className="font-black text-[10px] text-slate-400 uppercase tracking-tighter tabular-nums">
          {formatDate(category.createdAt)}
        </span>
      )
    },
    {
      key: 'actions', header: 'ACTIONS', align: 'center', render: (_, category) => (
        <div className="flex justify-center gap-3">
          <button onClick={() => handleEdit(category)} className="p-3 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-100 dark:border-white/10 rounded-lg lg:rounded-xl hover:text-primary-600 hover:border-primary-500/30 transition-all shadow-sm">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(category._id)} className="p-3 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-100 dark:border-white/10 rounded-lg lg:rounded-xl hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all shadow-sm">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: List, id: 'list', label: 'List View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
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

  const addCategoryButton = (
    <button
      onClick={handleCreate}
      className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all outline-none"
    >
      <Plus className="w-5 h-5" /> ADD CATEGORY
    </button>
  );

  const paginationControl = (
    <Pagination
      currentPage={currentPage}
      totalPages={categoryTotalPages}
      onPageChange={setCurrentPage}
      totalItems={categories.length}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      compact
    />
  );

  useAdminMobileHeader({
    title: 'Categories',
    count: categories.length,
    filters: (
      <>
        {viewToggleButtons}
        {addCategoryButton}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">
        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        {/* Results Visuzalization */}
        <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {loading && categories.length === 0 ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : categories.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 lg:py-20 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm"
            >
              <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">NO CATEGORIES FOUND</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Add categories to start managing government exams.</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-auto flex flex-col"
            >
              {/* Table View */}
              {viewMode === "table" && (
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm flex-1 min-h-0 overflow-auto flex flex-col">
                  <ResponsiveTable
                    data={pagedCategories}
                    columns={categoryTableColumns}
                    viewModes={['table']}
                    defaultView="table"
                    showPagination={false}
                    showViewToggle={false}
                    fillHeight
                  />
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="h-full overflow-auto space-y-3 lg:space-y-6">
                  {categories.map((category, i) => (
                    <motion.div
                      key={category._id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-primary-500/30 transition-all shadow-sm flex flex-col lg:flex-row items-center gap-2 lg:gap-8"
                    >
                      <div className={`relative w-11 h-11 lg:w-20 lg:h-20 rounded-lg lg:rounded-[2rem] flex items-center justify-center shrink-0 border-2 shadow-sm transition-all group-hover:scale-110 ${category.type === 'Central' ? 'bg-primary-600 border-primary-200 text-white shadow-sm' : 'bg-primary-600 border-primary-200 text-white shadow-sm'}`}>
                        {category.type === 'Central' ? <Globe className="w-5 h-5 lg:w-10 lg:h-10" /> : <Map className="w-5 h-5 lg:w-10 lg:h-10" />}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] lg:text-[10px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{i + 1}</span>
                      </div>

                      <div className="flex-1 text-center lg:text-left space-y-1 lg:space-y-2">
                        <div className="flex flex-col lg:flex-row items-center gap-1.5 lg:gap-4">
                          <h3 className="text-sm lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{category.name}</h3>
                          <div className={`px-2.5 py-0.5 lg:px-4 lg:py-1 rounded-full text-[7px] lg:text-[8px] font-black uppercase tracking-widest border ${category.type === 'Central' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-primary-100 dark:border-primary-600' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border-primary-100 dark:border-primary-600'}`}>
                            {category.type?.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-[9px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-2xl">{category.description || 'No description provided for this category.'}</p>
                        <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3 pt-1 lg:pt-2">
                          <Clock className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-slate-300" />
                          <span className="text-[8px] lg:text-[9px] font-black text-slate-300 uppercase italic tracking-widest">{formatDate(category.createdAt)} | ID: {category._id?.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 lg:gap-4">
                        <button onClick={() => handleEdit(category)} className="p-2 lg:p-6 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-50 dark:border-white/10 rounded-lg lg:rounded-[2rem] hover:text-primary-600 hover:border-primary-500/30 hover:scale-105 active:scale-95 transition-all shadow-sm">
                          <Edit className="w-3.5 h-3.5 lg:w-6 lg:h-6" />
                        </button>
                        <button onClick={() => handleDelete(category._id)} className="p-2 lg:p-6 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-50 dark:border-white/10 rounded-lg lg:rounded-[2rem] hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 hover:scale-105 active:scale-95 transition-all shadow-sm">
                          <Trash2 className="w-3.5 h-3.5 lg:w-6 lg:h-6" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="h-auto overflow-auto grid content-start items-start grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
                  {categories.map((category, i) => (
                    <motion.div
                      key={category._id || i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-primary-500/30 transition-all shadow-sm flex flex-col items-center text-center"
                    >
                      <div className={`relative w-10 h-10 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center mb-2 lg:mb-6 border-2 shadow-sm group-hover:scale-110 transition-all ${category.type === 'Central' ? 'bg-primary-600 border-primary-200 text-white' : 'bg-primary-600 border-primary-200 text-white'}`}>
                        {category.type === 'Central' ? <Globe className="w-5 h-5 lg:w-8 lg:h-8" /> : <Map className="w-5 h-5 lg:w-8 lg:h-8" />}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] lg:text-[10px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{i + 1}</span>
                      </div>

                      <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-1 lg:mb-2">{category.name}</h3>
                      <div className={`px-2.5 py-0.5 lg:px-4 lg:py-1 rounded-full text-[7px] lg:text-[8px] font-black uppercase tracking-widest border mb-2 lg:mb-8 ${category.type === 'Central' ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' : 'bg-primary-500/10 text-primary-600 border-primary-500/20'}`}>
                        {category.type?.toUpperCase()}
                      </div>

                      <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed mb-2 lg:mb-10 line-clamp-3">{category.description || 'No description'}</p>

                      <div className="w-full flex justify-center gap-2 lg:gap-3 mt-auto">
                        <button onClick={() => handleEdit(category)} title="Edit" className="p-2 lg:p-3 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-100 dark:border-white/10 rounded-lg lg:rounded-xl hover:text-primary-600 hover:border-primary-500/30 transition-all shadow-sm">
                          <Edit className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                        <button onClick={() => handleDelete(category._id)} title="Delete" className="p-2 lg:p-3 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-100 dark:border-white/10 rounded-lg lg:rounded-xl hover:text-black dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all shadow-sm">
                          <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Interface Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[999]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="absolute top-16 right-0 bottom-0 left-0 lg:left-64 bg-white dark:bg-[#0f172a] lg:rounded-l-[2rem] border-l-2 border-slate-100 dark:border-white/5 overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="p-4 lg:p-10 border-b-2 border-slate-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 text-primary-600 rounded-2xl">
                      <Settings className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                      {editingCategory ? "UPDATE CATEGORY" : "NEW CATEGORY"}
                    </h2>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-4 lg:p-10 space-y-2 lg:space-y-4 lg:space-y-8 overflow-y-auto">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">CATEGORY NAME</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 lg:px-8 py-5 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-[2rem] text-sm font-black uppercase tracking-widest outline-none focus:border-primary-700 transition-all font-outfit dark:text-white shadow-sm"
                      placeholder="Category name..."
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">JURISDICTION TYPE</label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 lg:px-8 py-5 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-[2rem] text-sm font-black uppercase tracking-widest outline-none focus:border-primary-700 transition-all font-outfit dark:text-white shadow-sm appearance-none cursor-pointer"
                        required
                      >
                        <option value="Central">CENTRAL</option>
                        <option value="State">STATE</option>
                      </select>
                      <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">DESCRIPTION</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-black border-2 border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl xl:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-700 transition-all font-outfit dark:text-white shadow-sm"
                      placeholder="Enter description..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 p-6 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="flex-1 p-6 bg-primary-600 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-all outline-none"
                    >
                      {editingCategory ? "SAVE CHANGES" : "CREATE CATEGORY"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminGovtExamCategories;

