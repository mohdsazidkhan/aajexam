'use client';

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import Link from "next/link";
import {
  Edit3,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
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
import { AdminTableSkeleton } from '../../skeletons/AdminSkeletons';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';

const AdminGovtExams = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [formData, setFormData] = useState({
    category: "",
    name: "",
    code: "",
    description: "",
    logo: "",
    isActive: true
  });
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

  const examTotalPages = Math.max(1, Math.ceil(filteredExams.length / itemsPerPage));
  const pagedExams = filteredExams.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, itemsPerPage]);

  const examColumns = [
    {
      key: 'code', header: 'Exam Code', render: (_, exam) => (
        <span className="px-3 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black">{exam.code}</span>
      )
    },
    {
      key: 'name', header: 'Exam Name', render: (_, exam) => (
        <span className="font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{exam.name}</span>
      )
    },
    {
      key: 'category', header: 'Category', render: (_, exam) => (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.category?.name || 'Uncategorized'}</span>
      )
    },
    {
      key: 'isActive', header: 'Status', align: 'center', render: (_, exam) => (
        <div className="flex justify-center">
          <div className={`px-4 py-1.5 rounded-lg lg:rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 ${exam.isActive ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${exam.isActive ? 'bg-primary-600 animate-pulse' : 'bg-primary-600'}`} />
            {exam.isActive ? 'Online' : 'Offline'}
          </div>
        </div>
      )
    },
    {
      key: 'actions', header: 'Actions', align: 'right', render: (_, exam) => (
        <div className="flex justify-end gap-3">
          <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`}>
            <motion.button whileHover={{ scale: 1.1 }} className="p-3 bg-primary-500/10 text-primary-600 rounded-lg lg:rounded-xl border border-primary-500/20">
              <Zap className="w-4 h-4" />
            </motion.button>
          </Link>
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(exam)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-xl">
            <Edit3 className="w-4 h-4" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(exam._id)} className="p-3 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-lg lg:rounded-xl border border-black/20 dark:border-white/20">
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      )
    }
  ];

  if (!isMounted) return null;

  return (<div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

    {/* Header */}
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
            <span className="text-primary-600">EXAMS</span> <span className="text-slate-400 dark:text-slate-500">({exams.length})</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 w-full lg:w-auto">
          <div className="relative group w-full lg:w-56">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
            <input
              type="text"
              placeholder="Search exam name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 px-3 lg:px-4 py-2.5 bg-slate-100 dark:bg-white/5 rounded-lg lg:rounded-xl shadow-sm w-full lg:w-auto lg:min-w-[170px]">
            <Layers className="w-4 h-4 text-primary-600 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none cursor-pointer w-full outline-none"
            >
              <option value="all">ALL CATEGORIES</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1">
            {[
              { icon: TableIcon, id: 'table', label: 'Table View' },
              { icon: LayoutGrid, id: 'grid', label: 'Grid View' },
              { icon: List, id: 'list', label: 'List View' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                title={mode.label}
                className={`p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
              >
                <mode.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="w-full lg:w-auto px-4 lg:px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> ADD EXAM
          </motion.button>
        </div>
      </div>
    </motion.div>

    {/* Content */}
    <AnimatePresence mode="wait">
      {loading ? (
        <AdminTableSkeleton showHeader={false} showFilters={false} />
      ) : filteredExams.length === 0 ? (
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
          <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-outfit">No Records Found</h3>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No exams match your filters. Try adjusting your search or category.</p>
        </div>
      ) : (
        <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {viewMode === 'table' && (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm">
              <ResponsiveTable data={pagedExams} columns={examColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} />
              <Pagination
                currentPage={currentPage}
                totalPages={examTotalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredExams.length}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
              />
            </div>
          )}

          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
              {filteredExams.map((exam, idx) => (
                <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm relative font-outfit">
                  <div className="absolute top-6 right-6">
                    <div className={`px-4 py-1.5 rounded-lg lg:rounded-xl border-2 text-[8px] font-black uppercase tracking-widest ${exam.isActive ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20'}`}>
                      {exam.isActive ? 'LIVE' : 'INACTIVE'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 lg:gap-6 mb-4 lg:mb-8 group">
                    <div className="p-3 lg:p-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-2xl shadow-sm transition-transform group-hover:rotate-6 shrink-0">
                      <Building2 className="w-4 h-4 lg:w-8 lg:h-8" />
                    </div>
                    <div className="min-w-0 pr-16 lg:pr-0">
                      <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">{exam.code}</div>
                      <h3 className="text-base lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight">{exam.name}</h3>
                    </div>
                  </div>
                  <div className="space-y-2 lg:space-y-4 mb-4 lg:mb-8">
                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/10 flex justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{exam.category?.name}</span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 line-clamp-2 uppercase tracking-widest leading-none mb-2">{exam.description || 'No description provided.'}</p>
                  </div>
                  <div className="flex gap-3 pt-6 border-t-2 border-slate-100 dark:border-white/5">
                    <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`} className="flex-1">
                      <motion.button whileHover={{ scale: 1.02 }} className="w-full py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">Patterns</motion.button>
                    </Link>
                    <motion.button onClick={() => handleEdit(exam)} className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg lg:rounded-xl hover:text-primary-600 transition-colors"><Edit3 className="w-5 h-5" /></motion.button>
                    <motion.button onClick={() => handleDelete(exam._id)} className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg lg:rounded-xl hover:text-black dark:hover:text-white transition-colors"><Trash2 className="w-5 h-5" /></motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-3 lg:space-y-6">
              {filteredExams.map((exam, idx) => (
                <motion.div key={exam._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-sm">
                  <div className="flex items-center gap-3 lg:gap-6">
                    <div className="min-w-[4.5rem] h-16 px-2 shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center text-center font-black italic shadow-sm group-hover:-rotate-3 transition-transform text-[10px] leading-tight break-words">{exam.code}</div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{exam.name}</h3>
                      <div className="flex items-center gap-4">
                        <div className="text-[10px] font-black text-primary-600 uppercase tracking-widest">{exam.category?.name}</div>
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${exam.isActive ?'bg-primary-600 animate-pulse':'bg-primary-600'}`} />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.isActive ? 'Active' : 'Offline'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/govt-exams/patterns?examId=${exam._id}`}>
                      <motion.button whileHover={{ scale: 1.05 }} className="px-4 lg:px-8 py-3 bg-primary-600 text-white rounded-lg lg:rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm">Manage Patterns</motion.button>
                    </Link>
                    <div className="w-px h-10 bg-slate-100 dark:bg-white/10 mx-2" />
                    <motion.button onClick={() => handleEdit(exam)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg lg:rounded-xl hover:text-primary-600"><Edit3 className="w-5 h-5" /></motion.button>
                    <motion.button onClick={() => handleDelete(exam._id)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg lg:rounded-xl hover:text-black dark:hover:text-white"><Trash2 className="w-5 h-5" /></motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>


    <AnimatePresence>
      {showModal && (
        <div className="fixed inset-0 z-[100]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute top-16 right-0 bottom-0 left-0 lg:left-64 bg-white dark:bg-[#0A0F1E] lg:rounded-l-[3rem] border-l-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3 lg:p-8 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-primary-500/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-sm">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{editingExam ? 'Edit' : 'Add'} <span className="text-primary-600">Exam</span></h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editingExam ? `Editing: ${editingExam.name}` : 'Create a new exam'}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg lg:rounded-xl transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 p-3 lg:p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-2 lg:space-y-4 lg:space-y-8">
                <div className="space-y-2 lg:space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-600 pl-3">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase tracking-widest outline-none appearance-none cursor-pointer">
                    <option value="">Select Category...</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:gap-6">
                  <div className="space-y-2 lg:space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-600 pl-3">Exam Code</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="E.G. SSC" required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-sm" />
                  </div>
                  <div className="space-y-2 lg:space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-600 pl-3">Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Exam Name" required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-sm" />
                  </div>
                </div>
                <div className="space-y-2 lg:space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-600 pl-3">Overview (Description)</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Exam Details" rows="4" className="w-full px-4 lg:px-8 py-3 lg:py-6 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase outline-none shadow-sm resize-none" />
                </div>
                <div className="space-y-2 lg:space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 block border-l-4 border-primary-600 pl-3">Logo URL</label>
                  <input type="text" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="https://..." className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black outline-none shadow-sm" />
                </div>
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-between border-2 border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg lg:rounded-xl ${formData.isActive ? 'bg-primary-500/10 text-primary-600' : 'bg-slate-200'}`}><Zap className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Status</p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{formData.isActive ? 'Published & Active' : 'Hidden from Students'}</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-6 h-6 rounded-lg text-primary-600 border-2 border-slate-300 cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-4 pt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Cancel</button>
                <button type="submit" className="flex-[2] py-5 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-5 h-5" /> {editingExam ? 'Save Changes' : 'Register Exam'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
};

export default AdminGovtExams;

