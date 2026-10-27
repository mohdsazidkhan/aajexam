"use client";

import Select from '../../common/ui/Select';
import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from 'react-hot-toast';
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import ViewToggle from "../../common/ViewToggle";
import Button from "../../common/ui/Button";
import ResponsiveTable from "../../common/ResponsiveTable";
import Pagination from "../../common/Pagination";
import { m as motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Sidebar";
import { AdminTableSkeleton } from '../Skeletons';
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
        <span className="font-bold text-content-primary italic tracking-tight text-lg">
          {category.name}
        </span>
      )
    },
    {
      key: 'jurisdiction', header: 'JURISDICTION', render: (_, category) => (
        <div className={`px-4 py-1 rounded-full text-[8px] font-bold inline-flex items-center gap-2 border ${category.type === "Central"
          ? "text-primary-600 border-primary-500/20"
          : "text-primary-600 border-primary-500/20"}`}>
          {category.type === "Central" ? <Globe className="w-3 h-3" /> : <Map className="w-3 h-3" />}
          {category.type?.toUpperCase()}
        </div>
      )
    },
    {
      key: 'description', header: 'DESCRIPTION', render: (_, category) => (
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted line-clamp-1 max-w-xs">{category.description || 'No description'}</p>
      )
    },
    {
      key: 'addedOn', header: 'ADDED ON', render: (_, category) => (
        <span className="font-bold text-[10px] text-content-muted uppercase tracking-tight tabular-nums">
          {formatDate(category.createdAt)}
        </span>
      )
    },
    {
      key: 'actions', header: 'ACTIONS', align: 'center', render: (_, category) => (
        <div className="flex justify-center gap-3">
          <button aria-label="Edit" onClick={() => handleEdit(category)} className="p-3 bg-background-surface dark:bg-white/5 text-content-muted border border-border-primary rounded-lg xl:rounded-xl hover:text-primary-600 hover:border-primary-500/30 transition-all">
            <Edit className="w-4 h-4" />
          </button>
          <button aria-label="Delete" onClick={() => handleDelete(category._id)} className="p-3 bg-background-surface dark:bg-white/5 text-content-muted border border-border-primary rounded-lg xl:rounded-xl hover:text-content-primary dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all">
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
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const addCategoryButton = (
    <button
      onClick={handleCreate}
      className="w-full px-4 py-2.5 text-on-primary rounded-lg xl:rounded-xl text-[10px] font-bold uppercase tracking-[0.08em] flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all outline-none bg-primary-600"
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
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col">
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
              className="flex flex-col items-center justify-center py-10 xl:py-20 text-center rounded-2xl xl:rounded-3xl border border-dashed border-border-primary"
            >
              <Shield className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 xl:mb-4" />
              <h3 className="text-xl xl:text-3xl font-bold text-content-primary italic tracking-tight mb-3">NO CATEGORIES FOUND</h3>
              <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">Add categories to start managing government exams.</p>
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
                <div className="rounded-2xl xl:rounded-3xl border border-border-primary overflow-hidden flex-1 min-h-0 overflow-auto flex flex-col">
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
                <div className="h-full overflow-auto space-y-3 xl:space-y-3">
                  {categories.map((category, i) => (
                    <motion.div
                      key={category._id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary p-3 xl:p-10 hover:border-primary-500/30 transition-all flex flex-col xl:flex-row items-center gap-2 xl:gap-4"
                    >
                      <div className={`relative w-11 h-11 xl:w-20 xl:h-20 rounded-lg xl:rounded-3xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110 ${category.type === 'Central' ? 'bg-primary-600 border-primary-200 text-on-primary' : 'bg-primary-600 border-primary-200 text-on-primary'}`}>
                        {category.type === 'Central' ? <Globe className="w-5 h-5 xl:w-10 xl:h-10" /> : <Map className="w-5 h-5 xl:w-10 xl:h-10" />}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 xl:w-6 xl:h-6 rounded-full text-on-primary text-[9px] xl:text-[10px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#0D1225] bg-primary-600">{i + 1}</span>
                      </div>

                      <div className="flex-1 text-center xl:text-left space-y-1 xl:space-y-2">
                        <div className="flex flex-col xl:flex-row items-center gap-1.5 xl:gap-3">
                          <h3 className="text-sm xl:text-3xl font-bold text-content-primary italic tracking-tight leading-none">{category.name}</h3>
                          <div className={`px-2.5 py-0.5 xl:px-4 xl:py-1 rounded-full text-[7px] xl:text-[8px] font-bold uppercase tracking-[0.08em] border ${category.type === 'Central' ? 'text-primary-600 border-primary-100 dark:border-primary-600' : 'text-primary-600 border-primary-100 dark:border-primary-600'}`}>
                            {category.type?.toUpperCase()}
                          </div>
                        </div>
                        <p className="text-[9px] xl:text-[11px] font-bold text-content-muted uppercase tracking-[0.08em] leading-relaxed max-w-2xl">{category.description || 'No description provided for this category.'}</p>
                        <div className="flex items-center justify-center xl:justify-start gap-2 xl:gap-3 pt-1 xl:pt-2">
                          <Clock className="w-2.5 h-2.5 xl:w-3 xl:h-3 text-slate-300" />
                          <span className="text-[8px] xl:text-[9px] font-bold text-slate-300 uppercase italic tracking-[0.08em]">{formatDate(category.createdAt)} | ID: {category._id?.slice(-8).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 xl:gap-3">
                        <button aria-label="Edit" onClick={() => handleEdit(category)} className="p-2 xl:p-4 bg-background-surface dark:bg-white/5 text-content-muted border border-border-primary dark:border-white/10 rounded-lg xl:rounded-3xl hover:text-primary-600 hover:border-primary-500/30 hover:scale-105 active:scale-95 transition-all">
                          <Edit className="w-3.5 h-3.5 xl:w-6 xl:h-6" />
                        </button>
                        <button aria-label="Delete" onClick={() => handleDelete(category._id)} className="p-2 xl:p-4 bg-background-surface dark:bg-white/5 text-content-muted border border-border-primary dark:border-white/10 rounded-lg xl:rounded-3xl hover:text-content-primary dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 hover:scale-105 active:scale-95 transition-all">
                          <Trash2 className="w-3.5 h-3.5 xl:w-6 xl:h-6" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="h-auto overflow-auto grid content-start items-start grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-4">
                  {categories.map((category, i) => (
                    <motion.div
                      key={category._id || i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group rounded-lg xl:rounded-xl xl:rounded-3xl border border-border-primary p-3 xl:p-10 hover:border-primary-500/30 transition-all flex flex-col items-center text-center"
                    >
                      <div className={`relative w-10 h-10 xl:w-16 xl:h-16 rounded-xl xl:rounded-2xl flex items-center justify-center mb-2 xl:mb-4 border group-hover:scale-110 transition-all ${category.type === 'Central' ? 'bg-primary-600 border-primary-200 text-on-primary' : 'bg-primary-600 border-primary-200 text-on-primary'}`}>
                        {category.type === 'Central' ? <Globe className="w-5 h-5 xl:w-8 xl:h-8" /> : <Map className="w-5 h-5 xl:w-8 xl:h-8" />}
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 xl:w-6 xl:h-6 rounded-full text-on-primary text-[9px] xl:text-[10px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-[#0D1225] bg-primary-600">{i + 1}</span>
                      </div>

                      <h3 className="text-sm xl:text-xl font-bold text-content-primary italic tracking-tight leading-tight mb-1 xl:mb-2">{category.name}</h3>
                      <div className={`px-2.5 py-0.5 xl:px-4 xl:py-1 rounded-full text-[7px] xl:text-[8px] font-bold uppercase tracking-[0.08em] border mb-2 xl:mb-4 ${category.type === 'Central' ? 'text-primary-600 border-primary-500/20' : 'text-primary-600 border-primary-500/20'}`}>
                        {category.type?.toUpperCase()}
                      </div>

                      <p className="text-[9px] xl:text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted leading-relaxed mb-2 xl:mb-10 line-clamp-3">{category.description || 'No description'}</p>

                      <div className="w-full flex justify-center gap-2 xl:gap-3 mt-auto">
                        <button onClick={() => handleEdit(category)} title="Edit" className="p-2 xl:p-3 bg-background-surface dark:bg-white/5 text-content-muted border border-border-primary rounded-lg xl:rounded-xl hover:text-primary-600 hover:border-primary-500/30 transition-all">
                          <Edit className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                        <button onClick={() => handleDelete(category._id)} title="Delete" className="p-2 xl:p-3 bg-background-surface dark:bg-white/5 text-content-muted border border-border-primary rounded-lg xl:rounded-xl hover:text-content-primary dark:hover:text-white hover:border-black/30 dark:hover:border-white/30 transition-all">
                          <Trash2 className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
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
                className="absolute inset-0 bg-slate-900/60"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
                className="absolute inset-y-0 right-0 left-0 w-full bg-background-surface dark:bg-[#0f172a] xl:rounded-l-2xl border-l-2 border-border-primary overflow-hidden flex flex-col"
              >
                <div className="px-4 py-2.5 border-b-2 border-border-primary dark:border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 text-on-primary rounded-2xl bg-primary-600">
                      <Settings className="w-5 h-5" />
                    </div>
                    <h2 className="text-base xl:text-base font-bold text-content-primary uppercase italic tracking-tight">
                      {editingCategory ? "UPDATE CATEGORY" : "NEW CATEGORY"}
                    </h2>
                  </div>
                  <button aria-label="Close" onClick={() => setShowModal(false)} className="text-content-muted hover:text-content-primary dark:hover:text-white transition-colors">
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
<div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 xl:p-5 space-y-3">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] pl-2">CATEGORY NAME</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 xl:px-5 py-3 bg-background-surface border border-border-primary rounded-lg xl:rounded-3xl text-sm font-bold uppercase tracking-[0.08em] outline-none focus:border-primary-600 transition-all font-outfit dark:text-white"
                      placeholder="Category name..."
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] pl-2">JURISDICTION TYPE</label>
                    <div className="relative">
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 xl:px-5 py-3 bg-background-surface border border-border-primary rounded-lg xl:rounded-3xl text-sm font-bold uppercase tracking-[0.08em] outline-none focus:border-primary-600 transition-all font-outfit dark:text-white appearance-none cursor-pointer"
                        required
                      >
                        <option value="Central">CENTRAL</option>
                        <option value="State">STATE</option>
                      </Select>
                      <ChevronRight className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] pl-2">DESCRIPTION</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="4"
                      className="w-full px-4 xl:px-5 py-2 xl:py-3 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl xl:rounded-3xl text-[10px] font-bold uppercase tracking-[0.08em] outline-none focus:border-primary-600 transition-all font-outfit dark:text-white"
                      placeholder="Enter description..."
                    />
                  </div>

                  </div>
<div className="flex gap-3 shrink-0 px-4 xl:px-5 py-2.5 border-t border-border-primary bg-background-surface justify-end items-center">
 <button
 type="button"
 onClick={() => setShowModal(false)}
 className="px-6 p-4 bg-background-surface-secondary text-content-muted rounded-lg xl:rounded-3xl text-[10px] font-bold uppercase tracking-[0.08em] hover:bg-background-surface-secondary transition-all"
 >
 CANCEL
 </button>
 <button
 type="submit"
 className="px-6 p-4 text-on-primary rounded-lg xl:rounded-3xl text-[10px] font-bold uppercase tracking-[0.08em] hover:scale-105 active:scale-95 transition-all outline-none bg-primary-600"
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

