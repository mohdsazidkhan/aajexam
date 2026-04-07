'use client';

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import Link from "next/link";
import Loading from "../../Loading";
import {
  Edit3,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  Activity,
  X,
  Settings,
  Building2,
  Globe2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Table as TableIcon,
  Zap,
  Calendar,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminGovtExams = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    code: "",
    description: "",
    logo: "",
    isActive: true
  });

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  useEffect(() => {
    fetchCategories();
    fetchAllExams();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.getRealExamCategories();
      if (response?.success) setCategories(response.data || []);
      else if (Array.isArray(response)) setCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllExams = async () => {
    setLoading(true);
    try {
      const response = await API.getAdminExams();
      if (response?.success) setExams(response.data || []);
      else if (Array.isArray(response)) setExams(response);
    } catch (error) {
      console.error("Error fetching all exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExam(null);
    setFormData({
      category: selectedCategory !== "all" ? selectedCategory : "",
      name: "",
      code: "",
      description: "",
      logo: "",
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      category: exam.category?._id || exam.category || "",
      name: exam.name || "",
      code: exam.code || "",
      description: exam.description || "",
      logo: exam.logo || "",
      isActive: exam.isActive !== undefined ? exam.isActive : true
    });
    setShowModal(true);
  };

  const handleDelete = async (examId) => {
    if (!confirm("Are you sure? This delete all patterns and tests associated with it.")) return;
    try {
      await API.deleteExam(examId);
      toast.success("Exam deleted");
      fetchAllExams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExam) await API.updateExam(editingExam._id, formData);
      else await API.createExam(formData);
      toast.success(`Exam ${editingExam ? 'updated' : 'created'}`);
      setShowModal(false);
      fetchAllExams();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save");
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesCategory = selectedCategory === "all" || exam.category?._id === selectedCategory || exam.category === selectedCategory;
    const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) || exam.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isMounted) return null;

  return (
    <AdminMobileAppWrapper title="Exam Management">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-2xl shadow-inner">
                     <Building2 className="w-6 h-6" />
                   </div>
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">ADMIN / GOVT EXAMS</span>
                 </div>
                 <h1 className="text-3xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                   GOVT <span className="text-indigo-600">EXAMS</span>
                 </h1>
                 <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                   Create and manage government exam content.
                 </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner">
                  {[
                    { icon: TableIcon, id: 'table', label: 'Table' },
                    { icon: LayoutGrid, id: 'grid', label: 'Nodes' },
                    { icon: List, id: 'list', label: 'List' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <mode.icon className="w-4 h-4" />
                      {viewMode === mode.id && <span className="text-[10px] font-black uppercase tracking-widest leading-none pr-1">{mode.label}</span>}
                    </button>
                  ))}
                </div>
                 <motion.button
                   whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                   onClick={handleCreate}
                   className="px-4 lg:px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 flex items-center gap-3"
                 >
                   <Plus className="w-4 h-4" /> ADD EXAM
                 </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-12">
             {[
               { label: 'TOTAL EXAMS', val: exams.length, icon: Building2, color: 'indigo' },
               { label: 'ACTIVE EXAMS', val: exams.filter(e => e.isActive).length, icon: Zap, color: 'emerald' },
               { label: 'CATEGORIES', val: categories.length, icon: Layers, color: 'amber' },
               { label: 'COMPLETION RATE', val: 'OPTIMAL', icon: Activity, color: 'rose' }
             ].map((stat, i) => (
               <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-3 lg:p-8 rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl group transition-all">
                 <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                   <stat.icon className="w-6 h-6" />
                 </div>
                 <div className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter leading-none">{stat.val}</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
               </motion.div>
             ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-8 mb-4 lg:mb-12 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-8">
               <div className="flex-1 relative group w-full">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                 <input
                   type="text"
                   placeholder="Search by exam name or code..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-14 pr-8 py-5 bg-white dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/30 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-lg"
                 />
               </div>
 
               <div className="flex items-center gap-4 px-3 lg:px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5 min-w-[280px]">
                 <Layers className="w-4 h-4 text-indigo-600" />
                 <select
                   value={selectedCategory}
                   onChange={(e) => setSelectedCategory(e.target.value)}
                   className="bg-transparent text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none cursor-pointer w-full outline-none"
                 >
                   <option value="all">ALL CATEGORIES</option>
                   {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
                 </select>
               </div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex items-center justify-center py-24"><Loading size="md" color="yellow" message="Loading exams..." /></div>
            ) : filteredExams.length === 0 ? (
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-outfit">No Records Found</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No exams match your filters. Try adjusting your search or category.</p>
              </div>
            ) : (
              <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                    <table className="w-full border-collapse">
                       <thead>
                         <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exam Name</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                           <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                         </tr>
                       </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredExams.map((exam, idx) => (
                          <motion.tr key={exam._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                              <span className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black">{exam.code}</span>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{exam.name}</td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.category?.name || 'Uncategorized'}</td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                              <div className="flex justify-center">
                                <div className={`px-4 py-1.5 rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 ${exam.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${exam.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                  {exam.isActive ? 'Online' : 'Offline'}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                              <div className="flex justify-end gap-3">
                                 <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`}>
                                   <motion.button whileHover={{ scale: 1.1 }} className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-500/20">
                                     <Zap className="w-4 h-4" />
                                   </motion.button>
                                 </Link>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(exam)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl">
                                  <Edit3 className="w-4 h-4" />
                                </motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(exam._id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
                    {filteredExams.map((exam, idx) => (
                      <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative font-outfit">
                         <div className="absolute top-6 right-6">
                             <div className={`px-4 py-1.5 rounded-xl border-2 text-[8px] font-black uppercase tracking-widest ${exam.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                               {exam.isActive ? 'LIVE STATUS' : 'INACTIVE'}
                             </div>
                         </div>
                        <div className="flex items-center gap-3 lg:gap-6 mb-4 lg:mb-8 group">
                           <div className="p-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-xl transition-transform group-hover:rotate-6">
                             <Building2 className="w-8 h-8" />
                           </div>
                           <div>
                             <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{exam.code}</div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate max-w-[180px]">{exam.name}</h3>
                           </div>
                        </div>
                        <div className="space-y-4 mb-4 lg:mb-8">
                           <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 flex justify-between">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                             <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{exam.category?.name}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-500 line-clamp-2 uppercase tracking-widest leading-none mb-2">{exam.description || 'No description provided.'}</p>
                        </div>
                        <div className="flex gap-3 pt-6 border-t-2 border-slate-100 dark:border-white/5">
                            <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`} className="flex-1">
                               <motion.button whileHover={{ scale: 1.02 }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10">Patterns</motion.button>
                            </Link>
                           <motion.button onClick={() => handleEdit(exam)} className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-primary-500 transition-colors"><Edit3 className="w-5 h-5" /></motion.button>
                           <motion.button onClick={() => handleDelete(exam._id)} className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-3 lg:space-y-6">
                    {filteredExams.map((exam, idx) => (
                      <motion.div key={exam._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-xl">
                        <div className="flex items-center gap-3 lg:gap-6">
                          <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black italic shadow-2xl group-hover:-rotate-3 transition-transform text-sm">{exam.code}</div>
                          <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{exam.name}</h3>
                            <div className="flex items-center gap-4">
                              <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{exam.category?.name}</div>
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${exam.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.isActive ? 'Active' : 'Offline'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`}>
                              <motion.button whileHover={{ scale: 1.05 }} className="px-4 lg:px-8 py-3 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Manage Patterns</motion.button>
                           </Link>
                           <div className="w-px h-10 bg-slate-100 dark:bg-white/10 mx-2" />
                           <motion.button onClick={() => handleEdit(exam)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-primary-500"><Edit3 className="w-5 h-5" /></motion.button>
                           <motion.button onClick={() => handleDelete(exam._id)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-rose-500"><Trash2 className="w-5 h-5" /></motion.button>
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

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1E] rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-3 lg:p-8 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-primary-500/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-lg">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{editingExam ? 'Edit' : 'Add'} <span className="text-primary-500">Exam</span></h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editingExam ? `Editing: ${editingExam.name}` : 'Create a new exam'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-3 lg:p-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-4 lg:space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-500 pl-3">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                      <option value="">Select Category...</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-500 pl-3">Exam Code</label>
                      <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="E.G. SSC" required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-inner" />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-500 pl-3">Full Name</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Exam Name" required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-inner" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-500 pl-3">Overview (Description)</label>
                    <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Exam Details" rows="4" className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase outline-none shadow-inner resize-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-500 pl-3">Logo URL</label>
                    <input type="text" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="https://..." className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black outline-none shadow-inner" />
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-between border-2 border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-xl ${formData.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200'}`}><Zap className="w-5 h-5" /></div>
                       <div>
                         <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Status</p>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{formData.isActive ? 'Published & Active' : 'Hidden from Students'}</p>
                       </div>
                    </div>
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-6 h-6 rounded-lg text-primary-500 border-2 border-slate-300 cursor-pointer" />
                  </div>
                </div>
                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-[2] py-5 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5" /> {editingExam ? 'Save Changes' : 'Register Exam'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExams;

