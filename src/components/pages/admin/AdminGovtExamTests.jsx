'use client';

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import Loading from "../../Loading";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import {
   FileText, Plus, Search, Filter, LayoutGrid, List, Table as TableIcon,
   ChevronRight, Eye, Heart, StickyNote, Star,
   ShieldCheck, Trash2, Edit3, CheckCircle2, Ban, Archive, MoreVertical,
   ArrowRight, Users, TrendingUp, BarChart3, Database, Globe, Info, Clock, Bell, Layers,
   Binary, Activity, Box, Boxes, Zap, Cpu, Settings, Key, Save, AlertCircle, Sparkles,
   Award, Target, Timer, CheckCircle, XCircle, Shield, LucideTable, LayoutList, Lock,
   ChevronLeft, X, IndianRupee, PieChart, Compass, Download, UploadCloud
} from "lucide-react";

const AdminGovtExamTests = () => {
   const { router } = useSSR();
   const [categories, setCategories] = useState([]);
   const [exams, setExams] = useState([]);
   const [patterns, setPatterns] = useState([]);
   const [tests, setTests] = useState([]);
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [editingTest, setEditingTest] = useState(null);
   const [viewMode, setViewMode] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'grid' : 'table');
   const [selectedCategory, setSelectedCategory] = useState("all");
   const [selectedExam, setSelectedExam] = useState("all");
   const [selectedPattern, setSelectedPattern] = useState("all");
   const [uploadMode, setUploadMode] = useState(false);
   const [jsonText, setJsonText] = useState("");

   const [formData, setFormData] = useState({
      examPattern: "",
      title: "",
      totalMarks: 100,
      duration: 60,
      isFree: false,
      questions: []
   });

   const [currentQuestion, setCurrentQuestion] = useState({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      explanation: "",
      section: "",
      tags: [],
      difficulty: "medium"
   });
   const user = getCurrentUser();

   const testStats = {
      total: tests.length,
      free: tests.filter(t => t.isFree).length,
      paid: tests.filter(t => !t.isFree).length,
      avgDuration: tests.length ? Math.round(tests.reduce((acc, curr) => acc + (curr.duration || 0), 0) / tests.length) : 0
   };

   useEffect(() => {
      fetchCategories();
      // Check for patternId in URL
      const urlParams = new URLSearchParams(window.location.search);
      const patternId = urlParams.get('patternId');
      if (patternId) {
         setSelectedPattern(patternId);
         handlePatternChange(patternId);
      }
   }, []);

   const fetchCategories = async () => {
      try {
         setLoading(true);
         const res = await API.getRealExamCategories();
         if (res?.success) setCategories(res.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
   };

   const handleCategoryChange = async (categoryId) => {
      setSelectedCategory(categoryId);
      setSelectedExam("all");
      setSelectedPattern("all");
      setExams([]);
      setPatterns([]);
      setTests([]);
      if (!categoryId || categoryId === 'all') return;
      try {
         setLoading(true);
         const res = await API.getExamsByCategory(categoryId);
         if (res?.success) setExams(res.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
   };

   const handleExamChange = async (examId) => {
      setSelectedExam(examId);
      setSelectedPattern("all");
      setPatterns([]);
      setTests([]);
      if (!examId || examId === 'all') return;
      try {
         setLoading(true);
         const res = await API.getPatternsByExam(examId);
         if (res?.success) setPatterns(res.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
   };

   const handlePatternChange = async (patternId) => {
      setSelectedPattern(patternId);
      setTests([]);
      if (!patternId || patternId === "all") return;
      try {
         setLoading(true);
         const res = await API.getTestsByPattern(patternId);
         if (res?.success) setTests(res.data || []);
         else if (Array.isArray(res)) setTests(res);
      } catch (e) { console.error(e); } finally { setLoading(false); }
   };

   const handleCreate = () => {
      if (selectedPattern === "all") {
         toast.warning("Please select an exam pattern first");
         return;
      }
      setEditingTest(null);
      setUploadMode(false);
      setJsonText("");
      setFormData({
         examPattern: selectedPattern,
         title: "",
         totalMarks: 100,
         duration: 60,
         isFree: false,
         questions: []
      });
      setShowModal(true);
   };

   const handleEdit = (test) => {
      setEditingTest(test);
      setUploadMode(false);
      setJsonText("");
      setFormData({
         examPattern: test.examPattern?._id || test.examPattern,
         title: test.title,
         totalMarks: test.totalMarks,
         duration: test.duration,
         isFree: test.isFree,
         questions: test.questions || []
      });
      setShowModal(true);
   };

   const handleDelete = async (testId) => {
      if (!confirm("Are you sure?")) return;
      try {
         await API.deletePracticeTest(testId);
         toast.success("Test deleted");
         handlePatternChange(selectedPattern);
      } catch (e) { toast.error("Failed to delete"); }
   };

   const handleAddQuestion = () => {
      if (!currentQuestion.questionText || currentQuestion.options.some(o => !o)) {
         toast.error("Fill all fields");
         return;
      }
      setFormData(prev => ({ ...prev, questions: [...prev.questions, { ...currentQuestion }] }));
      setCurrentQuestion({ questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0, explanation: "", section: "", tags: [], difficulty: "medium" });
   };

   const handleRemoveQuestion = (i) => setFormData(prev => ({ ...prev, questions: prev.questions.filter((_, idx) => idx !== i) }));

   const handleBulkUpload = () => {
      try {
         const data = JSON.parse(jsonText);
         if (!Array.isArray(data.questions)) { toast.error("Invalid JSON format"); return; }
         setFormData(prev => ({ ...prev, questions: data.questions }));
         toast.success(`${data.questions.length} questions loaded`);
         setJsonText("");
      } catch (e) { toast.error("Invalid JSON"); }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (formData.questions.length === 0) { toast.error("Add at least 1 question"); return; }
      try {
         if (editingTest) await API.updatePracticeTest(editingTest._id, formData);
         else await API.createPracticeTest(formData);
         toast.success(`Test ${editingTest ? 'updated' : 'created'}`);
         setShowModal(false);
         handlePatternChange(selectedPattern);
      } catch (e) { toast.error("Failed to save"); }
   };

   return (
      <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
         <Sidebar />
         <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">


            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
                  <div className="space-y-4">

                     <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                        PRACTICE <span className="text-indigo-600">TESTS</span>
                     </h1>
                     <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                        Create and manage practice tests for exam patterns.
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
                        disabled={selectedPattern === 'all'}
                        className={`w-full lg:w-auto px-4 lg:px-8 py-4 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 ${selectedPattern === 'all' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-indigo-600/20'}`}
                     >
                        <Plus className="w-4 h-4" /> ADD TEST
                     </motion.button>
                  </div>
               </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 font-outfit">
               {[
                  { label: 'TOTAL TESTS', val: testStats.total, icon: FileText, color: 'indigo' },
                  { label: 'FREE TESTS', val: testStats.free, icon: Zap, color: 'emerald' },
                  { label: 'PAID TESTS', val: testStats.paid, icon: Lock, color: 'amber' },
                  { label: 'AVG DURATION', val: `${testStats.avgDuration}m`, icon: Timer, color: 'rose' }
               ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl p-3 lg:p-8 rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl group transition-all">
                     <div className={`p-4 bg-${stat.color}-500/10 text-${stat.color}-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform shadow-inner`}><stat.icon className="w-6 h-6" /></div>
                     <div className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">{stat.val}</div>
                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
                  </motion.div>
               ))}
            </div>

            {/* Hierarchical Filters */}
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-8 mb-4 shadow-2xl">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6 font-outfit text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-4 px-3 lg:px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                     <Compass className="w-4 h-4 text-indigo-600" />
                     <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="bg-transparent w-full outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer">
                        <option value="all">ALL CATEGORIES</option>
                        {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>)}
                     </select>
                  </div>
                  <div className="flex items-center gap-4 px-3 lg:px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                     <Activity className="w-4 h-4 text-indigo-600" />
                     <select value={selectedExam} onChange={(e) => handleExamChange(e.target.value)} className="bg-transparent w-full outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer">
                        <option value="all">ALL EXAMS</option>
                        {exams.map(exam => <option key={exam._id} value={exam._id}>{exam.name.toUpperCase()}</option>)}
                     </select>
                  </div>
                  <div className="flex items-center gap-4 px-3 lg:px-6 py-4 bg-white dark:bg-white/10 rounded-2xl shadow-inner border-2 border-slate-200/50 dark:border-white/5">
                     <Binary className="w-4 h-4 text-indigo-600" />
                     <select value={selectedPattern} onChange={(e) => handlePatternChange(e.target.value)} className="bg-transparent w-full outline-none text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer">
                        <option value="all">ALL PATTERNS</option>
                        {patterns.map(p => <option key={p._id} value={p._id}>{p.title.toUpperCase()}</option>)}
                     </select>
                  </div>
               </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
               {loading ? (
                  <div className="flex items-center justify-center py-24"><Loading size="md" color="yellow" message="Loading tests..." /></div>
               ) : tests.length === 0 ? (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
                     <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                     <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">No Tests Found</h3>
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Select a pattern above to view its tests, or create a new test.</p>
                  </div>
               ) : (
                  <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     {viewMode === 'table' && (
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                           <table className="w-full border-collapse">
                              <thead>
                                 <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Title</th>
                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</th>
                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access</th>
                                    <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-outfit">
                                 {tests.map((test, idx) => (
                                    <motion.tr key={test._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} className="group hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all">
                                       <td className="px-4 lg:px-8 py-3 lg:py-6">
                                          <div className="flex items-center gap-4">
                                             <div className="p-3 bg-slate-100 dark:bg-white/10 rounded-xl group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors shadow-inner"><FileText className="w-5 h-5" /></div>
                                             <div>
                                                <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-1">{test.title}</div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {test._id.slice(-8)}</div>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-4 lg:px-8 py-3 lg:py-6 text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">{test.questions?.length || 0} Questions</td>
                                       <td className="px-4 lg:px-8 py-3 lg:py-6 text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">{test.duration} Min</td>
                                       <td className="px-4 lg:px-8 py-3 lg:py-6">
                                          <div className={`px-4 py-1.5 rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 w-fit ${test.isFree ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}`}>
                                             {test.isFree ? <Zap className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                             {test.isFree ? 'Public' : 'Premium'}
                                          </div>
                                       </td>
                                       <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                          <div className="flex justify-end gap-3">
                                             <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(test)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-lg"><Edit3 className="w-4 h-4" /></motion.button>
                                             <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(test._id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20"><Trash2 className="w-4 h-4" /></motion.button>
                                          </div>
                                       </td>
                                    </motion.tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     )}

                     {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                           {tests.map((test, idx) => (
                              <motion.div key={test._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl relative font-outfit group overflow-hidden">
                                 <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-500" />
                                 <div className="flex justify-between items-start mb-4 lg:mb-8">
                                    <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl group-hover:scale-110 transition-transform"><FileText className="w-6 h-6 text-slate-400 group-hover:text-primary-500" /></div>
                                    <div className={`px-4 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border-2 ${test.isFree ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'}`}>
                                       {test.isFree ? 'FREE' : 'PREMIUM'}
                                    </div>
                                 </div>
                                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-4 lg:mb-8 line-clamp-2 min-h-[3rem]">{test.title}</h3>
                                 <div className="grid grid-cols-2 gap-4 mb-4 lg:mb-8">
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                       <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Questions</span>
                                       <span className="text-sm font-black text-slate-900 dark:text-white">{test.questions?.length || 0} Qs</span>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                       <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Duration</span>
                                       <span className="text-sm font-black text-slate-900 dark:text-white">{test.duration}m</span>
                                    </div>
                                 </div>
                                 <div className="flex gap-3 pt-6 border-t-2 border-slate-100 dark:border-white/5">
                                    <motion.button onClick={() => handleEdit(test)} className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Edit Test</motion.button>
                                    <motion.button onClick={() => handleDelete(test._id)} className="p-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></motion.button>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                     )}

                     {viewMode === 'list' && (
                        <div className="space-y-3 lg:space-y-6">
                           {tests.map((test, idx) => (
                              <motion.div key={test._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-xl group">
                                 <div className="flex items-center gap-3 lg:gap-6">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all"><FileText className="w-8 h-8" /></div>
                                    <div>
                                       <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{test.title}</h3>
                                       <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-primary-500" /> {test.duration} Min</span>
                                          <span className="flex items-center gap-1"><Database className="w-3 h-3 text-primary-500" /> {test.questions?.length || 0} Questions</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <div className={`px-4 py-2 rounded-xl border-2 text-[9px] font-black uppercase ${test.isFree ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary-500/10 text-primary-500 border-primary-500/20'}`}>{test.isFree ? 'Free' : 'Premium'}</div>
                                    <motion.button onClick={() => handleEdit(test)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-primary-500 transition-colors"><Edit3 className="w-5 h-5" /></motion.button>
                                    <motion.button onClick={() => handleDelete(test._id)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></motion.button>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>


            {/* Modal */}
            <AnimatePresence>
               {showModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-xl" />
                     <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-h-[75vh] bg-white dark:bg-[#0D1225] rounded-2xl lg:rounded-[4rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col font-outfit">

                        <div className="p-3 lg:p-10 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-primary-500/5">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20"><Settings className="w-6 h-6" /></div>
                              <div>
                                 <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{editingTest ? 'Edit' : 'Add'} <span className="text-indigo-600">Test</span></h2>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{editingTest ? `Editing: ${editingTest.title}` : 'Create a new practice test'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <button onClick={() => setUploadMode(!uploadMode)} className={`px-3 lg:px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${uploadMode ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent hover:border-primary-500/30'}`}>
                                 {uploadMode ? 'Manual Entry' : 'Bulk JSON Upload'}
                              </button>
                              <button onClick={() => setShowModal(false)} className="p-3 bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 lg:p-10 custom-scrollbar">
                           {uploadMode ? (
                              <div className="max-w-4xl mx-auto space-y-4 lg:space-y-8">
                                 <div className="p-3 lg:p-8 bg-primary-500/5 rounded-xl lg:rounded-[3rem] border-4 border-dashed border-primary-500/20">
                                    <div className="flex items-center gap-4 mb-6">
                                       <div className="p-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm text-primary-500"><Download className="w-6 h-6" /></div>
                                       <div>
                                          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bulk JSON Upload</h3>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paste your questions JSON below to import in bulk</p>
                                       </div>
                                    </div>
                                    <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder='{ "questions": [...] }' rows="15" className="w-full p-3 lg:p-8 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-xl lg:rounded-[2.5rem] font-mono text-xs outline-none shadow-inner resize-none" />
                                    <button onClick={handleBulkUpload} className="w-full mt-4 lg:mt-8 py-5 bg-primary-500 text-white rounded-lg lg:rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
                                       <UploadCloud className="w-5 h-5" /> Import Questions
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 container mx-auto">
                                 <div className="space-y-10">
                                    <section className="space-y-3 lg:space-y-6">
                                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-primary-500 pl-3 block">Test Details</h3>
                                       <div className="space-y-3 lg:space-y-6">
                                          <div className="space-y-2">
                                             <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Test Title</label>
                                             <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Test Name" required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-inner" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3 lg:gap-6">
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Total Marks</label>
                                                <input type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })} className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black outline-none shadow-inner" />
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Duration (Min)</label>
                                                <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black outline-none shadow-inner" />
                                             </div>
                                          </div>
                                          <label className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5 cursor-pointer transition-all hover:bg-white dark:hover:bg-white/10 group shadow-inner">
                                             <input type="checkbox" checked={formData.isFree} onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })} className="w-6 h-6 rounded-lg text-indigo-600 border-2 border-slate-300 transition-all cursor-pointer" />
                                             <div>
                                                <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest group-hover:text-indigo-600 transition-colors leading-none mb-1">Free Access</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">{formData.isFree ? 'This test is free for all students' : 'Students need a subscription to access'}</div>
                                             </div>
                                          </label>
                                       </div>
                                    </section>

                                    <section className="space-y-3 lg:space-y-6 pt-10 border-t-2 border-slate-50">
                                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-primary-500 pl-3 block mb-4 lg:mb-8 flex justify-between items-center">
                                          Questions ({formData.questions.length})
                                          <span className="text-primary-500 tabular-nums">{formData.questions.length} / 100</span>
                                       </h3>
                                       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                          <AnimatePresence mode="popLayout">
                                             {formData.questions.map((q, i) => (
                                                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="p-5 bg-white dark:bg-white/5 rounded-lg lg:rounded-[1.5rem] border-2 border-slate-50 flex items-start gap-4 group">
                                                   <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0 font-black text-xs">{i + 1}</div>
                                                   <div className="flex-1">
                                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed">{q.questionText}</p>
                                                      <div className="flex items-center gap-3">
                                                         <span className="text-[8px] font-black text-primary-500 uppercase px-2 py-0.5 bg-primary-500/10 rounded-md border border-primary-500/10">{q.section || 'General'}</span>
                                                         <span className="text-[8px] font-black text-white px-2 py-0.5 bg-slate-900 rounded-md uppercase tracking-tighter">Ans: {q.correctAnswerIndex + 1}</span>
                                                      </div>
                                                   </div>
                                                   <button type="button" onClick={() => handleRemoveQuestion(i)} className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                                                </motion.div>
                                             ))}
                                          </AnimatePresence>
                                       </div>
                                    </section>
                                 </div>

                                 <div className="space-y-10">
                                    <section className="p-3 lg:p-8 bg-slate-50/50 dark:bg-white/5 rounded-xl lg:rounded-[3rem] border-2 border-slate-100 dark:border-white/5">
                                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 lg:mb-8 flex items-center gap-3">
                                          <Activity className="w-4 h-4 text-indigo-600" /> Add a Question
                                       </h3>
                                       <div className="space-y-3 lg:space-y-6">
                                          <div className="space-y-2">
                                             <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Question Statement</label>
                                             <textarea value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} placeholder="Enter question text..." rows="3" className="w-full p-6 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-bold outline-none shadow-inner resize-none" />
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {currentQuestion.options.map((opt, idx) => (
                                                <div key={idx} className="space-y-2">
                                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Option {idx + 1}</label>
                                                   <div className="relative group">
                                                      <div onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswerIndex: idx })} className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${currentQuestion.correctAnswerIndex === idx ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white dark:bg-white/10 border-slate-200'}`}>
                                                         {currentQuestion.correctAnswerIndex === idx ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                                      </div>
                                                      <input type="text" value={opt} onChange={(e) => {
                                                         const newOps = [...currentQuestion.options];
                                                         newOps[idx] = e.target.value;
                                                         setCurrentQuestion({ ...currentQuestion, options: newOps });
                                                      }} placeholder={`Choice ${idx + 1}`} className="w-full pl-14 pr-4 py-4 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-[11px] font-bold outline-none transition-all" />
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                          <div className="space-y-2">
                                             <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Explanation (Optional)</label>
                                             <textarea value={currentQuestion.explanation} onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })} placeholder="Optional: Correct answer logic..." rows="2" className="w-full p-6 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-bold outline-none shadow-inner resize-none" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3 lg:gap-6">
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Section</label>
                                                <input type="text" value={currentQuestion.section} onChange={(e) => setCurrentQuestion({ ...currentQuestion, section: e.target.value })} placeholder="E.G. REASONING" className="w-full px-3 lg:px-6 py-4 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-inner" />
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Difficulty</label>
                                                <select value={currentQuestion.difficulty} onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value })} className="w-full px-3 lg:px-6 py-4 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-inner">
                                                   <option value="easy">Easy</option>
                                                   <option value="medium">Medium</option>
                                                   <option value="hard">Hard</option>
                                                </select>
                                             </div>
                                          </div>
                                          <button type="button" onClick={handleAddQuestion} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl mt-4">
                                             <Plus className="w-5 h-5" /> Add Question
                                          </button>
                                       </div>
                                    </section>

                                    <div className="pt-10 flex gap-3 lg:gap-6">
                                       <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-100 dark:bg-white/10 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-inner">Cancel</button>
                                       <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3">
                                          <CheckCircle2 className="w-5 h-5" /> {editingTest ? 'Save Changes' : 'Create Test'}
                                       </button>
                                    </div>
                                 </div>
                              </form>
                           )}
                        </div>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
   );
};

export default AdminGovtExamTests;

