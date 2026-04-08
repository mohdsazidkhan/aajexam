"use client";

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import ViewToggle from "../../ViewToggle";
import Loading from "../../Loading";
import Button from "../../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
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
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768 ? "grid" : "table";
    }
    return "table";
  });
  const [formData, setFormData] = useState({
    name: "",
    type: "Central",
    description: ""
  });

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  useEffect(() => {
    fetchCategories();
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

  if (!isMounted) return null;

  return (
    <AdminMobileAppWrapper title="Exam Categories">
      <div className="min-h-screen  font-outfit text-slate-900 dark:text-white pb-20">
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'p-4 lg:p-8' : 'p-4 lg:p-8'}`}>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
              <div className="space-y-4">
                
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                   GOVT <span className="text-indigo-500">EXAMS</span> <span className="text-slate-300 dark:text-white ml-2 italic tracking-widest text-2xl lg:text-4xl">CATEGORIES</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Organize government exams by category and jurisdiction.</p>
              </div>

               <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                  <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-4 border-slate-100 dark:border-white/10 shadow-xl">
                    {[
                      { icon: TableIcon, id: 'table', label: 'TAB' },
                      { icon: List, id: 'list', label: 'LIN' },
                      { icon: LayoutGrid, id: 'grid', label: 'SPC' }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setViewMode(mode.id)}
                        className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        <mode.icon className="w-4 h-4" />
                        {viewMode === mode.id && <span className="text-[8px] font-black uppercase tracking-widest pr-1">{mode.label}</span>}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleCreate}
                    className="w-full lg:w-auto px-4 lg:px-8 py-5 bg-primary-600 text-white rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest shadow-duo-primary flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all outline-none"
                  >
                    <Plus className="w-5 h-5" /> ADD CATEGORY
                  </button>
               </div>
            </div>
          </motion.div>

          {/* Results Visuzalization */}
          <AnimatePresence mode="wait">
             {loading && categories.length === 0 ? (
                <div className="flex justify-center py-10 lg:py-20 ">
                   <Loading size="lg" color="blue" message="Loading categories..." />
                </div>
             ) : categories.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-10 lg:py-20  text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
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
                >
                  {/* Table View */}
                  {viewMode === "table" && (
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                            <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">CATEGORY NAME</th>
                            <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">JURISDICTION</th>
                            <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">DESCRIPTION</th>
                            <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ADDED ON</th>
                            <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {categories.map((category, i) => (
                            <motion.tr
                              key={category._id || i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group hover:bg-indigo-500/5 transition-all"
                            >
                              <td className="px-4 lg:px-8 py-3 lg:py-6 font-black text-slate-900 dark:text-white uppercase italic tracking-tight text-lg">
                                 {category.name}
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                 <div className={`px-4 py-1 rounded-full text-[8px] font-black inline-flex items-center gap-2 border ${category.type === "Central" 
                                   ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-indigo-500/10" 
                                   : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10"}`}>
                                    {category.type === "Central" ? <Globe className="w-3 h-3" /> : <Map className="w-3 h-3" />}
                                    {category.type?.toUpperCase()}
                                 </div>
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 line-clamp-1 max-w-xs">{category.description || 'No description'}</p>
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6 font-black text-[10px] text-slate-400 uppercase tracking-tighter tabular-nums">
                                 {formatDate(category.createdAt)}
                              </td>
                              <td className="px-4 lg:px-8 py-3 lg:py-6">
                                 <div className="flex justify-center gap-3">
                                    <button onClick={() => handleEdit(category)} className="p-3 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-100 dark:border-white/10 rounded-xl hover:text-primary-500 hover:border-primary-500/30 transition-all shadow-inner">
                                       <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(category._id)} className="p-3 bg-white dark:bg-white/5 text-slate-400 border-2 border-slate-100 dark:border-white/10 rounded-xl hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-inner">
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* List View */}
                  {viewMode === "list" && (
                    <div className="space-y-3 lg:space-y-6">
                       {categories.map((category, i) => (
                         <motion.div
                           key={category._id || i}
                           initial={{ opacity: 0, x: -20 }}
                           animate={{ opacity: 1, x: 0 }}
                           transition={{ delay: i * 0.05 }}
                           className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-indigo-500/30 transition-all shadow-xl flex flex-col lg:flex-row items-center gap-3 lg:gap-8"
                         >
                            <div className={`w-20 h-20 rounded-lg lg:rounded-[2rem] flex items-center justify-center shrink-0 border-4 shadow-xl transition-all group-hover:scale-110 ${category.type === 'Central' ? 'bg-indigo-500 border-indigo-200 text-white shadow-indigo-500/20' : 'bg-emerald-500 border-emerald-200 text-white shadow-emerald-500/20'}`}>
                               {category.type === 'Central' ? <Globe className="w-10 h-10" /> : <Map className="w-10 h-10" />}
                            </div>

                            <div className="flex-1 text-center lg:text-left space-y-2">
                               <div className="flex flex-col lg:flex-row items-center gap-4">
                                  <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{category.name}</h3>
                                  <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${category.type === 'Central' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 border-indigo-100 dark:border-indigo-800' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 border-emerald-100 dark:border-emerald-800'}`}>
                                     {category.type?.toUpperCase()}
                                  </div>
                               </div>
                               <p className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-2xl">{category.description || 'No description provided for this category.'}</p>
                               <div className="flex items-center justify-center lg:justify-start gap-3 pt-2">
                                  <Clock className="w-3 h-3 text-slate-300" />
                                  <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">{formatDate(category.createdAt)} | ID: {category._id?.slice(-8).toUpperCase()}</span>
                               </div>
                            </div>

                            <div className="flex gap-4">
                               <button onClick={() => handleEdit(category)} className="p-6 bg-white dark:bg-white/5 text-slate-400 border-4 border-slate-50 dark:border-white/10 rounded-lg lg:rounded-[2rem] hover:text-primary-500 hover:border-primary-500/30 hover:scale-105 active:scale-95 transition-all shadow-xl">
                                  <Edit className="w-6 h-6" />
                               </button>
                               <button onClick={() => handleDelete(category._id)} className="p-6 bg-white dark:bg-white/5 text-slate-400 border-4 border-slate-50 dark:border-white/10 rounded-lg lg:rounded-[2rem] hover:text-rose-500 hover:border-rose-500/30 hover:scale-105 active:scale-95 transition-all shadow-xl">
                                  <Trash2 className="w-6 h-6" />
                               </button>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  )}

                  {/* Grid View */}
                  {viewMode === "grid" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
                       {categories.map((category, i) => (
                         <motion.div
                           key={category._id || i}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: i * 0.05 }}
                           className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-primary-500/30 transition-all shadow-xl flex flex-col items-center text-center"
                         >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border-4 shadow-lg group-hover:scale-110 transition-all ${category.type === 'Central' ? 'bg-indigo-500 border-indigo-200 text-white' : 'bg-emerald-500 border-emerald-200 text-white'}`}>
                               {category.type === 'Central' ? <Globe className="w-8 h-8" /> : <Map className="w-8 h-8" />}
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-2 uppercase">{category.name}</h3>
                            <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border mb-4 lg:mb-8 ${category.type === 'Central' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                               {category.type?.toUpperCase()}
                            </div>

                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed mb-4 lg:mb-10 line-clamp-3">{category.description || 'No description'}</p>

                            <div className="w-full flex gap-3 mt-auto">
                               <button onClick={() => handleEdit(category)} className="flex-1 p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl text-[9px] font-black border-2 border-slate-100 dark:border-white/10 hover:text-primary-500 hover:border-primary-500/30 transition-all">EDIT</button>
                               <button onClick={() => handleDelete(category._id)} className="flex-1 p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl text-[9px] font-black border-2 border-slate-100 dark:border-white/10 hover:text-rose-500 hover:border-rose-500/30 transition-all">DELETE</button>
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  )}
                </motion.div>
             )}
          </AnimatePresence>
        </div>
      </div>

      {/* Interface Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4 z-[999]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0f172a] rounded-2xl lg:rounded-[3.5rem] border-8 border-slate-100 dark:border-white/5 max-w-lg w-full max-h-[75vh] overflow-hidden flex flex-col shadow-2xl"
            >
               <div className="p-4 lg:p-10 border-b-4 border-slate-50 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl">
                        <Settings className="w-6 h-6" />
                     </div>
                     <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                       {editingCategory ? "UPDATE CATEGORY" : "NEW CATEGORY"}
                     </h2>
                  </div>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                     <XCircle className="w-8 h-8" />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="p-4 lg:p-10 space-y-4 lg:space-y-8 overflow-y-auto">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">CATEGORY NAME</label>
                     <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 lg:px-8 py-5 bg-slate-50 dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-lg lg:rounded-[2rem] text-sm font-black uppercase tracking-widest outline-none focus:border-primary-500 transition-all font-outfit dark:text-white shadow-inner"
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
                          className="w-full px-4 lg:px-8 py-5 bg-slate-50 dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-lg lg:rounded-[2rem] text-sm font-black uppercase tracking-widest outline-none focus:border-primary-500 transition-all font-outfit dark:text-white shadow-inner appearance-none cursor-pointer"
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
                        className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-500 transition-all font-outfit dark:text-white shadow-inner"
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
                        className="flex-1 p-6 bg-primary-600 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-duo-primary hover:scale-105 active:scale-95 transition-all outline-none"
                     >
                        {editingCategory ? "SAVE CHANGES" : "CREATE CATEGORY"}
                     </button>
                  </div>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExamCategories;

