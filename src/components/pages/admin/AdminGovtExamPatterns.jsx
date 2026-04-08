'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import { useSelector } from "react-redux";
import Sidebar from "../../Sidebar";
import { getCurrentUser } from "../../../utils/authUtils";
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
  Clock,
  Binary,
  Boxes,
  Compass,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminGovtExamPatterns = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table');

  const [formData, setFormData] = useState({
    title: "",
    duration: 60,
    negativeMarking: 0,
    sections: []
  });

  const [newSection, setNewSection] = useState({
    name: "",
    totalQuestions: 1,
    marksPerQuestion: 1,
    negativePerQuestion: 0,
    sectionDuration: ""
  });

  const user = getCurrentUser();
  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = typeof window !== "undefined" ? window.location.pathname.startsWith("/admin") : false;

  useEffect(() => {
    loadCategories();
    // Check for examId in URL params
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('examId');
    if (examId) {
      setSelectedExam(examId);
      handleExamChange(examId);
    }
  }, []);

  const loadCategories = async () => {
    try {
      const res = await API.getRealExamCategories();
      if (res?.success) setCategories(res.data || []);
      else if (Array.isArray(res)) setCategories(res);
    } catch (err) {
      console.error("Category fetch error", err);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedExam("all");
    setExams([]);
    setPatterns([]);
    if (!categoryId || categoryId === 'all') return;
    setLoading(true);
    try {
      const res = await API.getExamsByCategory(categoryId);
      if (res?.success) setExams(res.data || []);
    } catch (err) {
      console.error("Exams fetch error", err);
    }
    setLoading(false);
  };

  const handleExamChange = async (examId) => {
    setSelectedExam(examId);
    setPatterns([]);
    if (!examId || examId === "all") return;
    setLoading(true);
    try {
      const res = await API.getPatternsByExam(examId);
      if (res?.success) setPatterns(res.data || []);
      else if (Array.isArray(res)) setPatterns(res);
    } catch (err) {
      console.error("Patterns fetch error", err);
      toast.error("Failed to load patterns");
    }
    setLoading(false);
  };

  const handleCreate = () => {
    if (selectedExam === "all") {
      toast.warning("Please select an exam first");
      return;
    }
    setEditingPattern(null);
    setFormData({
      exam: selectedExam,
      title: "",
      duration: 60,
      negativeMarking: 0,
      sections: []
    });
    setShowModal(true);
  };

  const handleEdit = (pattern) => {
    setEditingPattern(pattern);
    setFormData({
      exam: pattern.exam?._id || pattern.exam || selectedExam,
      title: pattern.title,
      duration: pattern.duration,
      negativeMarking: pattern.negativeMarking,
      sections: pattern.sections || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete pattern?")) return;
    try {
      await API.deleteExamPattern(id);
      toast.success("Pattern deleted!");
      handleExamChange(selectedExam);
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleAddSection = () => {
    if (!newSection.name || newSection.totalQuestions <= 0) {
      toast.error("Please fill section name and questions");
      return;
    }
    setFormData({ ...formData, sections: [...formData.sections, { ...newSection }] });
    setNewSection({ name: "", totalQuestions: 1, marksPerQuestion: 1, negativePerQuestion: 0, sectionDuration: "" });
  };

  const handleRemoveSection = (index) => {
    setFormData({ ...formData, sections: formData.sections.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.sections.length === 0) {
      toast.error("Add at least one section");
      return;
    }
    try {
      if (editingPattern) await API.updateExamPattern(editingPattern._id, formData);
      else await API.createExamPattern(formData);
      toast.success(`Pattern ${editingPattern ? 'updated' : 'created'}`);
      setShowModal(false);
      handleExamChange(selectedExam);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
  };

  const calculateTotalMarks = () => formData.sections.reduce((sum, sec) => sum + (sec.totalQuestions * sec.marksPerQuestion), 0);

  return (
    <AdminMobileAppWrapper title="Exam Patterns">
      <div className={`adminPanel ${isOpen ? "showPanel" : "hidePanel"}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/20 text-primary-500 rounded-2xl">
                    <Binary className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">ADMIN / EXAM PATTERNS</span>
                </div>
                <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
                  Exam Patterns
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                  Set up exam patterns with sections and marking schemes.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:flex lg:items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner w-full lg:w-auto">
                  {[
                    { icon: TableIcon, id: 'table', label: 'Table' },
                    { icon: LayoutGrid, id: 'grid', label: 'Nodes' },
                    { icon: List, id: 'list', label: 'List' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`p-4 rounded-full transition-all flex items-center gap-2 flex-1 lg:flex-none justify-center ${viewMode === mode.id ? 'bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <mode.icon className="w-4 h-4" />
                      {viewMode === mode.id && <span className="text-[10px] font-black uppercase tracking-widest leading-none pr-1">{mode.label}</span>}
                    </button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleCreate}
                  disabled={selectedExam === 'all'}
                  className={`w-full lg:w-auto px-4 lg:px-8 py-4 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 ${selectedExam === 'all' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary-500 text-white'}`}
                >
                  <Plus className="w-4 h-4" /> New Pattern
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-8 mb-4 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-8 font-outfit">
              <div className="w-full lg:w-1/2 flex items-center gap-3 px-3 lg:px-6 py-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm border-2 border-slate-200/50 dark:border-white/5">
                <Compass className="w-4 h-4 text-primary-500" />
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="bg-transparent text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest focus:outline-none cursor-pointer w-full"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
              </div>

              <div className="w-full lg:w-1/2 flex items-center gap-3 px-3 lg:px-6 py-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm border-2 border-slate-200/50 dark:border-white/5 text-[10px] uppercase font-black">
                <LayoutGrid className="w-4 h-4 text-primary-500" />
                <select
                  value={selectedExam}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-white tracking-widest focus:outline-none cursor-pointer w-full"
                >
                  <option value="all">All Exams</option>
                  {exams.map(exam => <option key={exam._id} value={exam._id}>{exam.code} - {exam.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex items-center justify-center py-24"><Loading size="md" color="yellow" message="Loading patterns..." /></div>
            ) : patterns.length === 0 ? (
              <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
                <Boxes className="w-16 h-16 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-outfit">No Patterns Found</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Select an exam above or create a new pattern to get started.</p>
              </div>
            ) : (
              <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pattern Name</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Negative Marks</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sections</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {patterns.map((p, idx) => (
                          <motion.tr key={p._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                            <td className="px-4 lg:px-8 py-3 lg:py-6 font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{p.title}</td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <Clock className="w-4 h-4 text-primary-500" /> {p.duration} Min
                              </div>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-rose-500 font-bold text-xs uppercase tracking-widest">-{p.negativeMarking} per wrong answer</td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-center">
                              <span className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-lg text-[10px] font-black border border-primary-500/20">{p.sections?.length || 0} Sections</span>
                            </td>
                            <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                              <div className="flex justify-end gap-3">
                                <Link href={`/admin/govt-exams/tests?patternId=${p._id}`}>
                                  <motion.button whileHover={{ scale: 1.1 }} className="p-3 bg-primary-500/10 text-primary-500 rounded-xl border border-primary-500/20"><Settings className="w-4 h-4" /></motion.button>
                                </Link>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(p)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl"><Edit3 className="w-4 h-4" /></motion.button>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(p._id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20"><Trash2 className="w-4 h-4" /></motion.button>
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
                      {patterns.map((p, idx) => (
                        <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative font-outfit">
                           <div className="absolute top-6 right-6 p-3 bg-primary-500/10 text-primary-500 rounded-2xl border border-primary-500/20"><Boxes className="w-5 h-5" /></div>
                           <div className="mb-4 lg:mb-8">
                             <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Exam Pattern</div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter truncate max-w-[180px]">{p.title}</h3>
                           </div>
                           <div className="grid grid-cols-2 gap-4 mb-4 lg:mb-8">
                              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Duration</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{p.duration} MIN</p>
                              </div>
                              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100">
                                <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Sections</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{p.sections?.length || 0}</p>
                              </div>
                           </div>
                           <div className="flex gap-3 pt-6 border-t-2 border-slate-100 dark:border-white/5">
                              <Link href={`/admin/govt-exams/tests?patternId=${p._id}`} className="flex-1">
                                <motion.button whileHover={{ scale: 1.02 }} className="w-full py-4 bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">Manage Tests</motion.button>
                              </Link>
                              <motion.button onClick={() => handleEdit(p)} className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-primary-500"><Edit3 className="w-5 h-5" /></motion.button>
                              <motion.button onClick={() => handleDelete(p._id)} className="p-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-rose-500"><Trash2 className="w-5 h-5" /></motion.button>
                           </div>
                        </motion.div>
                      ))}
                   </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-3 lg:space-y-6">
                    {patterns.map((p, idx) => (
                      <motion.div key={p._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-xl">
                         <div className="flex items-center gap-3 lg:gap-6">
                            <div className="w-16 h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black italic shadow-2xl text-xs">{p.title.substring(0,3).toUpperCase()}</div>
                            <div>
                               <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{p.title}</h3>
                               <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <span>{p.duration} MIN DURATION</span>
                                  <span>{p.sections?.length || 0} SECTIONS</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <Link href={`/admin/govt-exams/tests?patternId=${p._id}`}>
                              <motion.button whileHover={{ scale: 1.05 }} className="px-4 lg:px-8 py-3 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">View Tests</motion.button>
                            </Link>
                            <motion.button onClick={() => handleEdit(p)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-primary-500"><Edit3 className="w-5 h-5" /></motion.button>
                            <motion.button onClick={() => handleDelete(p._id)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-rose-500"><Trash2 className="w-5 h-5" /></motion.button>
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
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-5xl bg-white dark:bg-[#0A0F1E] rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
               <div className="p-3 lg:p-8 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-primary-500/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500 text-white rounded-2xl shadow-lg"><Binary className="w-6 h-6" /></div>
                    <div>
                       <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{editingPattern ? 'Edit' : 'Add'} <span className="text-primary-500">Pattern</span></h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{editingPattern ? `Editing: ${editingPattern.title}` : 'Create a new exam pattern'}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-colors"><X className="w-6 h-6" /></button>
               </div>
               <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                  <div className="w-full lg:w-2/5 p-3 lg:p-8 border-r border-slate-100 dark:border-white/5 overflow-y-auto custom-scrollbar">
                     <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary-500 pl-3 block ml-2">Pattern Title</label>
                           <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="E.G. TIER 1 CLASSIC" required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-inner" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:gap-6">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-primary-500 pl-3 block ml-2">Duration (Min)</label>
                              <input type="number" value={formData.duration} onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 0})} required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black outline-none" />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-rose-500 pl-3 block ml-2">Negative Marking</label>
                              <input type="number" step="0.01" value={formData.negativeMarking} onChange={(e) => setFormData({...formData, negativeMarking: parseFloat(e.target.value) || 0})} className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-rose-500/30 rounded-2xl text-xs font-black outline-none" />
                           </div>
                        </div>
                        <div className="pt-8 border-t-2 border-slate-100 dark:border-white/5 space-y-4">
                           <div className="p-6 bg-emerald-500/5 rounded-3xl border-2 border-emerald-500/10 flex justify-between items-center font-outfit">
                              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Marks</span>
                              <span className="text-2xl font-black text-emerald-600 italic tracking-tighter">{calculateTotalMarks()} PTS</span>
                           </div>
                           <button type="submit" className="w-full py-5 bg-primary-500 text-white rounded-lg lg:rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                              <CheckCircle2 className="w-5 h-5" /> {editingPattern ? 'Update Pattern' : 'Create Pattern'}
                           </button>
                        </div>
                     </form>
                  </div>
                  <div className="flex-1 p-3 lg:p-8 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-black/20">
                     <div className="max-w-2xl mx-auto space-y-10">
                        <div className="space-y-4">
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3"><Layers className="w-4 h-4 text-primary-500" /> Sections ({formData.sections.length})</h3>
                           {formData.sections.map((sec, i) => (
                              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-white dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 flex items-center justify-between group">
                                 <div className="flex items-center gap-3 lg:gap-6">
                                    <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black text-xs font-outfit">{i + 1}</div>
                                    <div>
                                       <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight">{sec.name}</h4>
                                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{sec.totalQuestions} Qs x {sec.marksPerQuestion} pts | Neg: -{sec.negativePerQuestion}</p>
                                    </div>
                                 </div>
                                 <button onClick={() => handleRemoveSection(i)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                              </motion.div>
                           ))}
                        </div>
                        <div className="p-3 lg:p-8 bg-white dark:bg-white/5 rounded-xl lg:rounded-[3rem] border-4 border-dashed border-primary-500/20 relative font-outfit">
                           <div className="absolute -top-4 left-8 px-4 py-1 bg-primary-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Add Section</div>
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6 mt-4">
                              <div className="lg:col-span-2 space-y-2">
                                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Section Name</label>
                                 <input type="text" value={newSection.name} onChange={(e) => setNewSection({...newSection, name: e.target.value})} placeholder="E.G. QUANTITATIVE APTITUDE" className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 rounded-2xl text-[11px] font-black uppercase outline-none focus:border-primary-500/30" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Total Questions</label>
                                 <input type="number" value={newSection.totalQuestions} onChange={(e) => setNewSection({...newSection, totalQuestions: parseInt(e.target.value) || 0})} className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 rounded-2xl text-[11px] font-black outline-none" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Marks / Question</label>
                                 <input type="number" value={newSection.marksPerQuestion} onChange={(e) => setNewSection({...newSection, marksPerQuestion: parseFloat(e.target.value) || 0})} className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 rounded-2xl text-[11px] font-black outline-none" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Negative / Question</label>
                                 <input type="number" step="0.01" value={newSection.negativePerQuestion} onChange={(e) => setNewSection({...newSection, negativePerQuestion: parseFloat(e.target.value) || 0})} className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 rounded-2xl text-[11px] font-black outline-none" />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-slate-400 uppercase ml-2">Time (Optional Min)</label>
                                 <input type="text" value={newSection.sectionDuration} onChange={(e) => setNewSection({...newSection, sectionDuration: e.target.value})} placeholder="30" className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 rounded-2xl text-[11px] font-black outline-none" />
                              </div>
                           </div>
                           <button type="button" onClick={handleAddSection} className="w-full mt-4 lg:mt-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                              <Plus className="w-5 h-5" /> Add Section
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminMobileAppWrapper>
  );
};

export default AdminGovtExamPatterns;

