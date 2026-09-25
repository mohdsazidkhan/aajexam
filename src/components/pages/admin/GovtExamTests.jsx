'use client';

import React, { useState, useEffect } from "react";
import API from "../../../lib/api";
import { toast } from "react-toastify";
import { getCurrentUser } from "../../../utils/authUtils";
import { useSSR } from "../../../hooks/useSSR";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import { AdminTableSkeleton } from '../../admin/Skeletons';
import {
   FileText, Plus, Search, Filter, LayoutGrid, List, Table as TableIcon,
   ChevronRight, Eye, Heart, StickyNote, Star,
   ShieldCheck, Trash2, Edit3, CheckCircle2, Ban, Archive, MoreVertical,
   ArrowRight, Users, TrendingUp, BarChart3, Database, Globe, Info, Clock, Bell, Layers,
   Binary, Activity, Box, Boxes, Zap, Cpu, Settings, Key, Save, AlertCircle, Sparkles,
   Award, Target, Timer, CheckCircle, XCircle, Shield, LucideTable, LayoutList, Lock,
   ChevronLeft, X, IndianRupee, PieChart, Compass, Download, UploadCloud
} from "lucide-react";
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminGovtExamTests = () => {
   const { router } = useSSR();
   const [categories, setCategories] = useState([]);
   const [exams, setExams] = useState([]);
   const [patterns, setPatterns] = useState([]);
   const [tests, setTests] = useState([]);
   const [loading, setLoading] = useState(false);
   const [showModal, setShowModal] = useState(false);
   const [editingTest, setEditingTest] = useState(null);
   const [viewMode, setViewMode] = useState('table');

   useEffect(() => {
      if (window.innerWidth < 768) setViewMode('grid');
   }, []);

   const [selectedCategory, setSelectedCategory] = useState("all");
   const [selectedExam, setSelectedExam] = useState("all");
   const [selectedPattern, setSelectedPattern] = useState("all");
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
   const [uploadMode, setUploadMode] = useState(false);
   const [jsonText, setJsonText] = useState("");

   const [formData, setFormData] = useState({
      examPattern: "",
      title: "",
      totalMarks: 100,
      duration: 60,
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

   const testTotalPages = Math.max(1, Math.ceil(tests.length / itemsPerPage));
   const pagedTests = tests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

   useEffect(() => {
      setCurrentPage(1);
   }, [selectedPattern, itemsPerPage]);

   const testColumns = [
      {
         key: 'title', header: 'Test Title', render: (_, test) => (
            <div className="flex items-center gap-4">
               <div className="p-3 bg-slate-100 dark:bg-white/10 rounded-lg lg:rounded-xl group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors shadow-sm"><FileText className="w-5 h-5" /></div>
               <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-1">{test.title}</div>
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {test._id.slice(-8)}</div>
               </div>
            </div>
         )
      },
      {
         key: 'questions', header: 'Questions', render: (_, test) => (
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">{test.questions?.length || 0} Questions</span>
         )
      },
      {
         key: 'duration', header: 'Duration', render: (_, test) => (
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tabular-nums">{test.duration} Min</span>
         )
      },
      {
         key: 'accessLevel', header: 'Access', render: (_, test) => (
            <div className={`px-4 py-1.5 rounded-lg lg:rounded-xl border-2 text-[9px] font-black uppercase flex items-center gap-2 w-fit ${test.accessLevel === 'FREE' ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20'}`}>
               {test.accessLevel === 'FREE' ? <Zap className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
               {test.accessLevel === 'FREE' ? 'Free' : 'PRO'}
            </div>
         )
      },
      {
         key: 'actions', header: 'Actions', align: 'right', render: (_, test) => (
            <div className="flex justify-end gap-3">
               <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleEdit(test)} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-xl shadow-sm"><Edit3 className="w-4 h-4" /></motion.button>
               <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDelete(test._id)} className="p-3 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-lg lg:rounded-xl border border-black/20 dark:border-white/20"><Trash2 className="w-4 h-4" /></motion.button>
            </div>
         )
      }
   ];

   const categoryFilterSelect = (
      <StyledSelect
         icon={Compass}
         value={selectedCategory}
         onChange={(val) => handleCategoryChange(val)}
         options={[{ value: 'all', label: 'ALL CATEGORIES' }, ...categories.map(cat => ({ value: cat._id, label: cat.name.toUpperCase() }))]}
         className="w-full lg:w-auto lg:min-w-[170px] lg:max-w-[200px]"
      />
   );

   const examFilterSelect = (
      <StyledSelect
         icon={Activity}
         value={selectedExam}
         onChange={(val) => handleExamChange(val)}
         options={[{ value: 'all', label: 'ALL EXAMS' }, ...exams.map(exam => ({ value: exam._id, label: exam.name.toUpperCase() }))]}
         className="w-full lg:w-auto lg:min-w-[170px] lg:max-w-[200px]"
      />
   );

   const patternFilterSelect = (
      <StyledSelect
         icon={Binary}
         value={selectedPattern}
         onChange={(val) => handlePatternChange(val)}
         options={[{ value: 'all', label: 'ALL PATTERNS' }, ...patterns.map(p => ({ value: p._id, label: p.title.toUpperCase() }))]}
         className="w-full lg:w-auto lg:min-w-[170px] lg:max-w-[200px]"
      />
   );

   const viewToggleButtons = (
      <div className="flex items-center gap-1 w-full">
         {[
            { icon: TableIcon, id: 'table', label: 'Table View' },
            { icon: LayoutGrid, id: 'grid', label: 'Grid View' },
            { icon: List, id: 'list', label: 'List View' }
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

   const addTestButton = (
      <motion.button
         whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
         onClick={handleCreate}
         disabled={selectedPattern === 'all'}
         className={`w-full lg:w-auto px-4 lg:px-6 py-2.5 rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2 ${selectedPattern === 'all' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary-600 text-white shadow-sm'}`}
      >
         <Plus className="w-4 h-4" /> ADD TEST
      </motion.button>
   );

   const paginationControl = (
      <Pagination
      compact
         currentPage={currentPage}
         totalPages={testTotalPages}
         onPageChange={setCurrentPage}
         totalItems={tests.length}
         itemsPerPage={itemsPerPage}
         onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
      />
   );

   useAdminMobileHeader({
      title: 'Tests',
      count: tests.length,
      filters: (
         <>
            {categoryFilterSelect}
            {examFilterSelect}
            {patternFilterSelect}
            {viewToggleButtons}
            {addTestButton}
            {paginationControl}
         </>
      )
   });

   return (
      <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
         <Sidebar />
         <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">


            {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

            {/* Content Area */}
            <div className="flex-1 min-h-0 overflow-auto">
            <AnimatePresence mode="wait">
               {loading ? (
                  <AdminTableSkeleton showHeader={false} showFilters={false} />
               ) : tests.length === 0 ? (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-20 text-center">
                     <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                     <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">No Tests Found</h3>
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Select a pattern above to view its tests, or create a new test.</p>
                  </div>
               ) : (
                  <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-auto flex flex-col">
                     {viewMode === 'table' && (
                        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm flex-1 min-h-0 overflow-auto flex flex-col">
                           <ResponsiveTable data={pagedTests} columns={testColumns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                        </div>
                     )}

                     {viewMode === 'grid' && (
                        <div className="h-auto overflow-auto grid content-start items-start grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                           {tests.map((test, idx) => (
                              <motion.div key={test._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.05, 0.3) }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm relative font-outfit group overflow-hidden">
                                 <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600" />
                                 <div className="flex justify-between items-start mb-2 lg:mb-8">
                                    <div className="relative p-2 lg:p-4 bg-slate-100 dark:bg-white/5 rounded-lg lg:rounded-2xl group-hover:scale-110 transition-transform">
                                       <FileText className="w-4 h-4 lg:w-6 lg:h-6 text-slate-400 group-hover:text-primary-600" />
                                       <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{idx + 1}</span>
                                    </div>
                                    <div className={`px-2.5 py-0.5 lg:px-4 lg:py-1 rounded-lg lg:rounded-xl text-[7px] lg:text-[8px] font-black uppercase tracking-widest border-2 ${test.accessLevel === 'FREE' ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20'}`}>
                                       {test.accessLevel === 'FREE' ? 'FREE' : 'PRO'}
                                    </div>
                                 </div>
                                 <h3 className="text-sm lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-1 lg:mb-8 line-clamp-2">{test.title}</h3>
                                 <div className="grid grid-cols-2 gap-2 lg:gap-4 mb-2 lg:mb-8">
                                    <div className="p-2 lg:p-4 bg-slate-50 dark:bg-white/5 rounded-lg lg:rounded-2xl border border-slate-100 dark:border-white/5">
                                       <span className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase mb-0.5 lg:mb-1">Questions</span>
                                       <span className="text-xs lg:text-sm font-black text-slate-900 dark:text-white">{test.questions?.length || 0} Qs</span>
                                    </div>
                                    <div className="p-2 lg:p-4 bg-slate-50 dark:bg-white/5 rounded-lg lg:rounded-2xl border border-slate-100 dark:border-white/5">
                                       <span className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase mb-0.5 lg:mb-1">Duration</span>
                                       <span className="text-xs lg:text-sm font-black text-slate-900 dark:text-white">{test.duration}m</span>
                                    </div>
                                 </div>
                                 <div className="flex gap-2 lg:gap-3 pt-2 lg:pt-6 border-t-2 border-slate-100 dark:border-white/5">
                                    <motion.button onClick={() => handleEdit(test)} className="flex-1 py-2.5 lg:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-1.5"><Edit3 className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Edit</motion.button>
                                    <motion.button onClick={() => handleDelete(test._id)} className="p-2.5 lg:p-4 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-lg lg:rounded-xl hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"><Trash2 className="w-3.5 h-3.5 lg:w-5 lg:h-5" /></motion.button>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                     )}

                     {viewMode === 'list' && (
                        <div className="h-full overflow-auto space-y-3 lg:space-y-6">
                           {tests.map((test, idx) => (
                              <motion.div key={test._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(idx * 0.05, 0.3) }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-2 lg:gap-6 hover:border-primary-500/30 transition-all font-outfit shadow-sm group">
                                 <div className="flex items-center gap-2 lg:gap-6">
                                    <div className="relative w-10 h-10 lg:w-16 lg:h-16 bg-slate-100 dark:bg-white/10 rounded-lg lg:rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary-700 group-hover:text-white transition-all">
                                       <FileText className="w-5 h-5 lg:w-8 lg:h-8" />
                                       <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{idx + 1}</span>
                                    </div>
                                    <div>
                                       <h3 className="text-xs lg:text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-0.5 lg:mb-1">{test.title}</h3>
                                       <div className="flex items-center gap-2 lg:gap-4 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          <span className="flex items-center gap-1"><Timer className="w-3 h-3 text-primary-600" /> {test.duration} Min</span>
                                          <span className="flex items-center gap-1"><Database className="w-3 h-3 text-primary-600" /> {test.questions?.length || 0} Questions</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 lg:gap-4">
                                    <div className={`px-2.5 py-1 lg:px-4 lg:py-2 rounded-lg lg:rounded-xl border-2 text-[8px] lg:text-[9px] font-black uppercase ${test.accessLevel === 'FREE' ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20'}`}>{test.accessLevel === 'FREE' ? 'Free' : 'PRO'}</div>
                                    <motion.button onClick={() => handleEdit(test)} className="p-2 lg:p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg lg:rounded-xl hover:text-primary-600 transition-colors"><Edit3 className="w-3.5 h-3.5 lg:w-5 lg:h-5" /></motion.button>
                                    <motion.button onClick={() => handleDelete(test._id)} className="p-2 lg:p-3 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-lg lg:rounded-xl hover:text-black dark:hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5 lg:w-5 lg:h-5" /></motion.button>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
            </div>


            {/* Modal */}
            <AnimatePresence>
               {showModal && (
                  <div className="fixed inset-0 z-[100]">
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-[#0A0F1E]/80 backdrop-blur-xl" />
                     <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }} className="absolute top-16 right-0 bottom-0 left-0 lg:left-64 bg-white dark:bg-[#0D1225] lg:rounded-l-[3rem] border-l-2 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col font-outfit">

                        <div className="p-3 lg:p-10 border-b-2 border-slate-100 dark:border-white/5 flex items-center justify-between bg-primary-500/5">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-sm"><Settings className="w-6 h-6" /></div>
                              <div>
                                 <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{editingTest ? 'Edit' : 'Add'} <span className="text-primary-600">Test</span></h2>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{editingTest ? `Editing: ${editingTest.title}` : 'Create a new practice test'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4">
                              <button onClick={() => setUploadMode(!uploadMode)} className={`px-3 lg:px-6 py-2 rounded-lg lg:rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${uploadMode ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent hover:border-primary-500/30'}`}>
                                 {uploadMode ? 'Manual Entry' : 'Bulk JSON Upload'}
                              </button>
                              <button onClick={() => setShowModal(false)} className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg lg:rounded-xl transition-colors"><X className="w-6 h-6" /></button>
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 lg:p-10 custom-scrollbar">
                           {uploadMode ? (
                              <div className="max-w-4xl mx-auto space-y-2 lg:space-y-4 lg:space-y-8">
                                 <div className="p-3 lg:p-8 bg-primary-500/5 rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-dashed border-primary-500/20">
                                    <div className="flex items-center gap-4 mb-6">
                                       <div className="p-3 bg-white dark:bg-white/10 rounded-2xl shadow-sm text-primary-600"><Download className="w-6 h-6" /></div>
                                       <div>
                                          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bulk JSON Upload</h3>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paste your questions JSON below to import in bulk</p>
                                       </div>
                                    </div>
                                    <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder='{ "questions": [...] }' rows="15" className="w-full p-3 lg:p-8 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-lg lg:rounded-xl xl:rounded-[2.5rem] font-mono text-xs outline-none shadow-sm resize-none" />
                                    <button onClick={handleBulkUpload} className="w-full mt-4 lg:mt-8 py-5 bg-primary-600 text-white rounded-lg lg:rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-3">
                                       <UploadCloud className="w-5 h-5" /> Import Questions
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 container mx-auto">
                                 <div className="space-y-10">
                                    <section className="space-y-3 lg:space-y-6">
                                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-primary-600 pl-3 block">Test Details</h3>
                                       <div className="space-y-3 lg:space-y-6">
                                          <div className="space-y-2">
                                             <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Test Title</label>
                                             <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Test Name" required className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-sm" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3 lg:gap-6">
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Total Marks</label>
                                                <input type="number" value={formData.totalMarks} onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })} className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black outline-none shadow-sm" />
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Duration (Min)</label>
                                                <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })} className="w-full px-3 lg:px-6 py-5 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black outline-none shadow-sm" />
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5 shadow-sm">
                                             <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0 ${editingTest?.accessLevel === 'FREE' ? 'bg-primary-500/10 text-primary-600' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white'}`}>
                                                {editingTest ? (editingTest.accessLevel === 'FREE' ? 'Free' : 'PRO') : 'Auto'}
                                             </div>
                                             <div>
                                                <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">Access Level</div>
                                                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Auto-managed: the latest-year PYQ test per pattern is Free, the rest are PRO</div>
                                             </div>
                                          </div>
                                       </div>
                                    </section>

                                    <section className="space-y-3 lg:space-y-6 border-t-2 border-slate-50 px-0 py-4 lg:py-8">
                                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-primary-600 pl-3 block mb-4 lg:mb-8 flex justify-between items-center">
                                          Questions ({formData.questions.length})
                                          <span className="text-primary-600 tabular-nums">{formData.questions.length} / 100</span>
                                       </h3>
                                       <div className="space-y-2 lg:space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                          <AnimatePresence mode="popLayout">
                                             {formData.questions.map((q, i) => (
                                                <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="p-5 bg-white dark:bg-white/5 rounded-lg lg:rounded-[1.5rem] border-2 border-slate-50 flex items-start gap-4 group">
                                                   <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shrink-0 font-black text-xs">{i + 1}</div>
                                                   <div className="flex-1">
                                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed">{q.questionText}</p>
                                                      <div className="flex items-center gap-3">
                                                         <span className="text-[8px] font-black text-primary-600 uppercase px-2 py-0.5 bg-primary-500/10 rounded-md border border-primary-500/10">{q.section || 'General'}</span>
                                                         <span className="text-[8px] font-black text-white px-2 py-0.5 bg-slate-900 rounded-md uppercase tracking-tighter">Ans: {q.correctAnswerIndex + 1}</span>
                                                      </div>
                                                   </div>
                                                   <button type="button" onClick={() => handleRemoveQuestion(i)} className="p-3 text-slate-300 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg lg:rounded-xl transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5" /></button>
                                                </motion.div>
                                             ))}
                                          </AnimatePresence>
                                       </div>
                                    </section>
                                 </div>

                                 <div className="space-y-10">
                                    <section className="rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/5 px-0 py-4 lg:py-8">
                                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 lg:mb-8 flex items-center gap-3">
                                          <Activity className="w-4 h-4 text-primary-600" /> Add a Question
                                       </h3>
                                       <div className="space-y-3 lg:space-y-6">
                                          <div className="space-y-2">
                                             <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Question Statement</label>
                                             <textarea value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} placeholder="Enter question text..." rows="3" className="w-full p-6 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-bold outline-none shadow-sm resize-none" />
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             {currentQuestion.options.map((opt, idx) => (
                                                <div key={idx} className="space-y-2">
                                                   <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Option {idx + 1}</label>
                                                   <div className="relative group">
                                                      <div onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswerIndex: idx })} className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all ${currentQuestion.correctAnswerIndex === idx ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white dark:bg-white/10 border-slate-200'}`}>
                                                         {currentQuestion.correctAnswerIndex === idx ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                                      </div>
                                                      <input type="text" value={opt} onChange={(e) => {
                                                         const newOps = [...currentQuestion.options];
                                                         newOps[idx] = e.target.value;
                                                         setCurrentQuestion({ ...currentQuestion, options: newOps });
                                                      }} placeholder={`Choice ${idx + 1}`} className="w-full pl-14 pr-4 py-4 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-[11px] font-bold outline-none transition-all" />
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                          <div className="space-y-2">
                                             <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Explanation (Optional)</label>
                                             <textarea value={currentQuestion.explanation} onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })} placeholder="Optional: Correct answer logic..." rows="2" className="w-full p-6 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-bold outline-none shadow-sm resize-none" />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3 lg:gap-6">
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Section</label>
                                                <input type="text" value={currentQuestion.section} onChange={(e) => setCurrentQuestion({ ...currentQuestion, section: e.target.value })} placeholder="E.G. REASONING" className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-sm" />
                                             </div>
                                             <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Difficulty</label>
                                                <select value={currentQuestion.difficulty} onChange={(e) => setCurrentQuestion({ ...currentQuestion, difficulty: e.target.value })} className="w-full px-3 lg:px-6 py-4 bg-slate-50 dark:bg-black border-2 border-transparent focus:border-primary-500/30 rounded-2xl text-xs font-black uppercase outline-none shadow-sm">
                                                   <option value="easy">Easy</option>
                                                   <option value="medium">Medium</option>
                                                   <option value="hard">Hard</option>
                                                </select>
                                             </div>
                                          </div>
                                          <button type="button" onClick={handleAddQuestion} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm mt-4">
                                             <Plus className="w-5 h-5" /> Add Question
                                          </button>
                                       </div>
                                    </section>

                                    <div className="pt-10 flex gap-3 lg:gap-6">
                                       <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-100 dark:bg-white/10 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm">Cancel</button>
                                       <button type="submit" className="flex-[2] py-5 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-3">
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

