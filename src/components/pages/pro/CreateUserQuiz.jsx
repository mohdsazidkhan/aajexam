'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
   Plus,
   Trash2,
   ChevronRight,
   ChevronLeft,
   Check,
   Layout,
   FileText,
   HelpCircle,
   Zap,
   Target,
   Layers,
   Clock,
   BarChart3,
   ShieldCheck,
   ArrowRight,
   Sparkles,
   Search,
   PlusCircle,
   X,
   CircleAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import UnifiedFooter from '../../UnifiedFooter';
import { useRouter } from 'next/navigation';
import API from '../../../lib/api';
import { getCurrentUser } from '../../../utils/authUtils';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

const CreateUserQuiz = () => {
   const router = useRouter();
   const user = getCurrentUser();

   // Form states
   const [step, setStep] = useState(1); // 1: Categories, 2: Quiz Details, 3: Questions
   const [loading, setLoading] = useState(false);

   // Stats
   const [monthlyStats, setMonthlyStats] = useState(null);
   const [creationStats, setCreationStats] = useState(null);

   // Category/Subcategory
   const [showCategoryForm, setShowCategoryForm] = useState(false);
   const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
   const [newCategoryName, setNewCategoryName] = useState('');
   const [newCategoryDesc, setNewCategoryDesc] = useState('');
   const [newSubcategoryName, setNewSubcategoryName] = useState('');
   const [newSubcategoryDesc, setNewSubcategoryDesc] = useState('');
   const [categories, setCategories] = useState([]);
   const [subcategories, setSubcategories] = useState([]);

   // Quiz data
   const [quizData, setQuizData] = useState({
      title: '',
      description: '',
      categoryId: '',
      subcategoryId: '',
      difficulty: 'beginner',
      requiredLevel: 1,
      timeLimit: 3, // minutes
      questions: [
         { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 30 }
      ]
   });

   const fetchStats = useCallback(async () => {
      try {
         const [monthly, creation] = await Promise.all([
            API.getMonthlyQuizCount(),
            API.getQuizCreationStats()
         ]);
         if (monthly?.success) setMonthlyStats(monthly.data);
         if (creation?.success) setCreationStats(creation.data);
      } catch (err) { console.error('Stats offline:', err); }
   }, []);

   const fetchCategories = useCallback(async () => {
      try {
         const response = await API.getApprovedCategories();
         if (response?.success) setCategories(response.data.allCategories || []);
      } catch (err) { console.error('Categories offline:', err); }
   }, []);

   const fetchSubcategories = useCallback(async (categoryId) => {
      if (!categoryId) { setSubcategories([]); return; }
      try {
         const response = await API.getApprovedSubcategories(categoryId);
         if (response?.success) setSubcategories(response.data.allSubcategories || []);
      } catch (err) { console.error('Subcategories offline:', err); }
   }, []);

   useEffect(() => {
      fetchStats();
      fetchCategories();
   }, [fetchStats, fetchCategories]);

   useEffect(() => {
      if (quizData.categoryId) fetchSubcategories(quizData.categoryId);
   }, [quizData.categoryId, fetchSubcategories]);

   const handleCreateCategory = async () => {
      if (!newCategoryName.trim() || newCategoryName.length < 3) return toast.error('Min 3 chars required');
      setLoading(true);
      try {
         await API.createCategory({ name: newCategoryName, description: newCategoryDesc });
         toast.success('Sector Creation request transmitted');
         setNewCategoryName(''); setNewCategoryDesc(''); setShowCategoryForm(false);
         fetchCategories();
      } catch (err) { toast.error('Creation failed'); }
      finally { setLoading(true); setLoading(false); }
   };

   const handleCreateSubcategory = async () => {
      if (!quizData.categoryId) return toast.error('Select primary sector first');
      if (!newSubcategoryName.trim() || newSubcategoryName.length < 3) return toast.error('Min 3 chars required');
      setLoading(true);
      try {
         await API.createSubcategory({ name: newSubcategoryName, description: newSubcategoryDesc, categoryId: quizData.categoryId });
         toast.success('Sub-domain Creation request transmitted');
         setNewSubcategoryName(''); setNewSubcategoryDesc(''); setShowSubcategoryForm(false);
         fetchSubcategories(quizData.categoryId);
      } catch (err) { toast.error('Creation failed'); }
      finally { setLoading(false); }
   };

   const handleQuestionChange = (index, field, value) => {
      const updated = [...quizData.questions];
      updated[index] = { ...updated[index], [field]: value };
      setQuizData({ ...quizData, questions: updated });
   };

   const handleOptionChange = (qIndex, optIndex, value) => {
      const updated = [...quizData.questions];
      updated[qIndex].options[optIndex] = value;
      setQuizData({ ...quizData, questions: updated });
   };

   const addQuestion = () => {
      if (quizData.questions.length >= 10) return toast.error('Max capacity reached (10 Questions)');
      setQuizData({
         ...quizData,
         questions: [...quizData.questions, { questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0, timeLimit: 30 }]
      });
   };

   const removeQuestion = (index) => {
      if (quizData.questions.length <= 1) return toast.error('Min 1 Question required');
      const updated = quizData.questions.filter((_, i) => i !== index);
      setQuizData({ ...quizData, questions: updated });
   };

   const validateStep1 = () => {
      if (!quizData.categoryId || !quizData.subcategoryId) { toast.error('Domain Authentication Incomplete'); return false; }
      return true;
   };

   const validateStep2 = () => {
      if (!quizData.title.trim() || quizData.title.length < 10) { toast.error('Blueprint title too short (min 10)'); return false; }
      return true;
   };

   const validateStep3 = () => {
      if (quizData.questions.length < 5) { toast.error('Min 5 Questions required'); return false; }
      for (let q of quizData.questions) {
         if (!q.questionText.trim() || q.options.some(opt => !opt.trim())) {
            toast.error('All Intel fields must be synthesized');
            return false;
         }
      }
      return true;
   };

   const handleSubmit = async () => {
      if (!validateStep3()) return;
      if (monthlyStats && monthlyStats.currentCount >= monthlyStats.limit) return toast.error('Monthly quota exceeded');

      setLoading(true);
      try {
         await API.createUserQuiz(quizData);
         toast.success('Architecture Transmitted! Awaiting Admin Decryption');
         router.push('/pro/quizzes/mine');
      } catch (err) { toast.error('Transmission failed'); }
      finally { setLoading(false); }
   };

   const steps = [
      { id: 1, label: 'DOMAIN SECTOR', icon: Layers },
      { id: 2, label: 'BLUEPRINT DETAILS', icon: FileText },
      { id: 3, label: 'INTEL Creation', icon: Zap }
   ];

   return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">

         <div className="container mx-auto px-2 lg:px-6 py-4 space-y-12">

            {/* --- Studio Hero --- */}
            <section className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Layout className="w-10 h-10" />
               </motion.div>
               <div className="space-y-4">
                  <h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Architect <span className="text-primary-700 dark:text-primary-500">Studio</span></h1>
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Knowledge Creation and custom quiz architecture</p>
               </div>

               {/* Quota Progress */}
               {monthlyStats && (
                  <div className="max-w-md mx-auto pt-8">
                     <div className="flex justify-between items-end mb-2">
                        <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">MONTHLY ARCHIVE QUOTA</p>
                        <p className="text-xs font-black text-primary-700 dark:text-primary-500">{monthlyStats.currentCount} / {monthlyStats.limit}</p>
                     </div>
                     <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(monthlyStats.currentCount / monthlyStats.limit) * 100}%` }} className="h-full bg-primary-500 shadow-duo-secondary" />
                     </div>
                  </div>
               )}
            </section>

            {/* --- Mission Progress Tracker --- */}
            <section className="max-w-4xl mx-auto">
               <div className="flex items-center justify-between relative px-10">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
                  <div className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }} />

                  {steps.map((s, i) => (
                     <div key={s.id} className="relative z-10 flex flex-col items-center gap-4">
                        <motion.div
                           animate={{
                              scale: step === s.id ? 1.2 : 1,
                              backgroundColor: step >= s.id ? 'var(--primary-500)' : 'var(--bg-slate-200)'
                           }}
                           className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-colors ${step >= s.id ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                           <s.icon className={`w-5 h-5 ${step >= s.id ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                        </motion.div>
                        <span className={`text-[8px] font-black uppercase tracking-widest text-center ${step >= s.id ? 'text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400'}`}>{s.label}</span>
                     </div>
                  ))}
               </div>
            </section>

            {/* --- FORM PHASES --- */}
            <div className="max-w-5xl mx-auto">
               <AnimatePresence mode="wait">
                  {/* --- PHASE 1: DOMAIN SECTOR --- */}
                  {step === 1 && (
                     <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                        <Card className="p-10 space-y-10">
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                              {/* Category Selection */}
                              <div className="space-y-6">
                                 <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 underline underline-offset-4 decoration-primary-500/50">
                                    <Layers className="w-3 h-3 text-primary-700 dark:text-primary-500" /> SELECT PRIMARY SECTOR
                                 </label>
                                 <div className="space-y-4">
                                    <select
                                       value={quizData.categoryId}
                                       onChange={(e) => setQuizData({ ...quizData, categoryId: e.target.value, subcategoryId: '' })}
                                       className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold uppercase tracking-widest outline-none focus:border-primary-500 transition-all"
                                    >
                                       <option value="">-- ACCES ARC SECTORS --</option>
                                       {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                    </select>
                                    <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="flex items-center gap-2 text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest hover:opacity-70 transition-opacity">
                                       <PlusCircle className="w-4 h-4" /> {showCategoryForm ? 'ABORT SECTOR Creation' : 'SYNTHESIZE NEW SECTOR'}
                                    </button>

                                    {showCategoryForm && (
                                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-6 bg-primary-50 dark:bg-primary-900/10 border-2 border-primary-500/20 rounded-2xl space-y-4">
                                          <input type="text" placeholder="SECTOR NAME (MIN 3 CHARS)" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/20 text-xs font-bold uppercase" />
                                          <textarea placeholder="SECTOR OVERVIEW (OPTIONAL)" value={newCategoryDesc} onChange={e => setNewCategoryDesc(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/20 text-xs font-bold uppercase" rows={2} />
                                          <Button variant="secondary" fullWidth onClick={handleCreateCategory} disabled={loading} className="py-4 text-[10px] font-black">INITIATE Creation</Button>
                                       </motion.div>
                                    )}
                                 </div>
                              </div>

                              {/* Subcategory Selection */}
                              <div className="space-y-6">
                                 <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 underline underline-offset-4 decoration-primary-500/50">
                                    <Target className="w-3 h-3 text-primary-700 dark:text-primary-500" /> DEFINE SUB-DOMAIN
                                 </label>
                                 <div className={`space-y-4 transition-opacity ${!quizData.categoryId && 'opacity-30 pointer-events-none'}`}>
                                    <select
                                       value={quizData.subcategoryId}
                                       onChange={(e) => setQuizData({ ...quizData, subcategoryId: e.target.value })}
                                       className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 text-sm font-bold uppercase tracking-widest outline-none focus:border-primary-500 transition-all"
                                    >
                                       <option value="">-- SELECT SUB-DOMAIN --</option>
                                       {subcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                    </select>
                                    <button onClick={() => setShowSubcategoryForm(!showSubcategoryForm)} className="flex items-center gap-2 text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest hover:opacity-70 transition-opacity">
                                       <PlusCircle className="w-4 h-4" /> {showSubcategoryForm ? 'ABORT DOMAIN Creation' : 'SYNTHESIZE NEW DOMAIN'}
                                    </button>

                                    {showSubcategoryForm && (
                                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-6 bg-primary-50 dark:bg-primary-900/10 border-2 border-primary-500/20 rounded-2xl space-y-4">
                                          <input type="text" placeholder="DOMAIN NAME (MIN 3 CHARS)" value={newSubcategoryName} onChange={e => setNewSubcategoryName(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/20 text-xs font-bold uppercase" />
                                          <textarea placeholder="DOMAIN OVERVIEW (OPTIONAL)" value={newSubcategoryDesc} onChange={e => setNewSubcategoryDesc(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-primary-500/20 text-xs font-bold uppercase" rows={2} />
                                          <Button variant="primary" fullWidth onClick={handleCreateSubcategory} disabled={loading} className="py-4 text-[10px] font-black">INITIATE Creation</Button>
                                       </motion.div>
                                    )}
                                 </div>
                              </div>
                           </div>

                           <Button variant="secondary" fullWidth size="lg" onClick={() => validateStep1() && setStep(2)} className="py-6 rounded-3xl text-sm font-black shadow-duo-secondary">
                              PROCEED TO BLUEPRINT <ChevronRight className="ml-2 w-5 h-5" />
                           </Button>
                        </Card>
                     </motion.div>
                  )}

                  {/* --- PHASE 2: BLUEPRINT DETAILS --- */}
                  {step === 2 && (
                     <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                        <Card className="p-10 space-y-10">
                           <div className="space-y-8">
                              <div className="space-y-6">
                                 <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 underline underline-offset-4 decoration-primary-500/50">
                                    <FileText className="w-3 h-3 text-primary-700 dark:text-primary-500" /> ARCHIVE IDENTITY
                                 </label>
                                 <input
                                    type="text"
                                    value={quizData.title}
                                    onChange={e => setQuizData({ ...quizData, title: e.target.value })}
                                    placeholder="QUIZ TITLE (E.G. QUANTUM PHYSICS BASICS)"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-xl font-black font-outfit uppercase outline-none focus:border-primary-500 transition-all placeholder:text-slate-300"
                                 />
                              </div>

                              <div className="space-y-6">
                                 <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 underline underline-offset-4 decoration-primary-500/50">
                                    <ShieldCheck className="w-3 h-3 text-primary-700 dark:text-primary-500" /> KNOWLEDGE OVERVIEW
                                 </label>
                                 <textarea
                                    value={quizData.description}
                                    onChange={e => setQuizData({ ...quizData, description: e.target.value })}
                                    placeholder="DEFINE THE PARAMETERS AND OBJECTIVES OF THIS ARCHIVE..."
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-sm font-bold uppercase tracking-widest outline-none focus:border-primary-500 transition-all placeholder:text-slate-300"
                                 />
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">DIFFICULTY TIER</label>
                                    <select value={quizData.difficulty} onChange={e => setQuizData({ ...quizData, difficulty: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs font-black uppercase tracking-widest outline-none border-none">
                                       <option value="beginner">BEGINNER (L1)</option>
                                       <option value="intermediate">INTERMEDIATE (L3)</option>
                                       <option value="advanced">ADVANCED (L5)</option>
                                       <option value="expert">EXPERT (L8+)</option>
                                    </select>
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">ACCESS LEVEL</label>
                                    <input type="number" value={quizData.requiredLevel} onChange={e => setQuizData({ ...quizData, requiredLevel: Math.max(1, parseInt(e.target.value)) })} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs font-black outline-none border-none" min={1} max={10} />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em]">MISSION TIME (MINS)</label>
                                    <input type="number" value={quizData.timeLimit} onChange={e => setQuizData({ ...quizData, timeLimit: Math.max(2, parseInt(e.target.value)) })} className="w-full bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-xs font-black outline-none border-none" min={2} max={5} />
                                 </div>
                              </div>
                           </div>

                           <div className="flex gap-6">
                              <Button variant="ghost" fullWidth size="lg" onClick={() => setStep(1)} className="py-6 rounded-3xl text-[10px] font-black bg-white dark:bg-slate-800">
                                 <ChevronLeft className="mr-2 w-4 h-4" /> BACK TO SECTORS
                              </Button>
                              <Button variant="secondary" fullWidth size="lg" onClick={() => validateStep2() && setStep(3)} className="py-6 rounded-3xl text-sm font-black shadow-duo-secondary">
                                 NEXT: INTEL Creation <ChevronRight className="ml-2 w-5 h-5" />
                              </Button>
                           </div>
                        </Card>
                     </motion.div>
                  )}

                  {/* --- PHASE 3: INTEL Creation --- */}
                  {step === 3 && (
                     <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                        <div className="grid grid-cols-1 gap-8">
                           {quizData.questions.map((q, idx) => (
                              <Card key={idx} className="p-10 space-y-8 border-2 border-slate-100 dark:border-slate-800 relative group overflow-hidden">
                                 <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-black text-xl shadow-duo-secondary">
                                          {idx + 1}
                                       </div>
                                       <h3 className="text-xl font-black font-outfit uppercase">Question #{idx + 1}</h3>
                                    </div>
                                    {quizData.questions.length > 1 && (
                                       <button onClick={() => removeQuestion(idx)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                          <Trash2 className="w-5 h-5" />
                                       </button>
                                    )}
                                 </div>

                                 <div className="space-y-6 relative z-10">
                                    <div className="space-y-4">
                                       <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.2em] ml-2">INTEL TEXT (MIN 5 CHARS)</label>
                                       <textarea
                                          value={q.questionText}
                                          onChange={e => handleQuestionChange(idx, 'questionText', e.target.value)}
                                          placeholder="ENTER THE INTEL QUERY..."
                                          rows={3}
                                          className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-base font-black font-outfit uppercase outline-none focus:border-primary-500 transition-all"
                                       />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                       {q.options.map((opt, oIdx) => (
                                          <div key={oIdx} className="space-y-2">
                                             <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-2 flex justify-between">
                                                OPTION {String.fromCharCode(65 + oIdx)}
                                                {q.correctAnswerIndex === oIdx && <span className="text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3" /> VERIFIED CORRECT</span>}
                                             </label>
                                             <input
                                                type="text"
                                                value={opt}
                                                onChange={e => handleOptionChange(idx, oIdx, e.target.value)}
                                                placeholder={`ENTER OPTION ${String.fromCharCode(65 + oIdx)}...`}
                                                className={`w-full p-4 rounded-xl text-xs font-bold uppercase tracking-widest outline-none border-2 transition-all ${q.correctAnswerIndex === oIdx ? 'bg-emerald-500/5 border-emerald-500/50' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 focus:border-primary-500'}`}
                                             />
                                          </div>
                                       ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                                       <div className="space-y-4">
                                          <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-2">CORRECT RESPONSE SELECTION</label>
                                          <div className="flex gap-2">
                                             {[0, 1, 2, 3].map(o => (
                                                <button key={o} onClick={() => handleQuestionChange(idx, 'correctAnswerIndex', o)} className={`flex-1 p-3 rounded-xl font-black text-xs transition-all ${q.correctAnswerIndex === o ? 'bg-emerald-500 text-white shadow-duo-secondary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                                                   {String.fromCharCode(65 + o)}
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                       <div className="space-y-4">
                                          <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-2">EXTRACTION TIME (SEC)</label>
                                          <div className="flex items-center gap-4">
                                             <Clock className="w-5 h-5 text-slate-300" />
                                             <input type="number" value={q.timeLimit} onChange={e => handleQuestionChange(idx, 'timeLimit', Math.max(15, parseInt(e.target.value)))} className="flex-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-xs font-black outline-none" min={15} max={60} />
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                                 <Sparkles className="absolute -bottom-8 -left-8 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
                              </Card>
                           ))}

                           {/* Add Intellectual Unit Button */}
                           <button
                              onClick={addQuestion}
                              disabled={quizData.questions.length >= 10}
                              className="w-full py-12 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-slate-600 dark:text-slate-400 hover:border-primary-500/50 hover:text-primary-700 dark:text-primary-500 transition-all flex flex-col items-center justify-center gap-4 group"
                           >
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm">
                                 <Plus className="w-8 h-8" />
                              </div>
                              <div className="text-center">
                                 <p className="text-lg font-black font-outfit uppercase tracking-tight">SYNTHESIZE NEW Question</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-50">CAPACITY: {quizData.questions.length} / 10 UNITS</p>
                              </div>
                           </button>

                           {/* Final Navigation */}
                           <Card className="p-8 sticky bottom-8 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-[3rem] border-t-8 border-primary-500">
                              <div className="flex gap-6">
                                 <Button variant="ghost" fullWidth size="lg" onClick={() => setStep(2)} className="py-6 rounded-2xl text-[10px] font-black bg-white dark:bg-slate-900">
                                    <ChevronLeft className="mr-2 w-4 h-4" /> BACK TO BLUEPRINTS
                                 </Button>
                                 <Button variant="secondary" fullWidth size="lg" onClick={handleSubmit} disabled={loading || quizData.questions.length < 5} className="py-6 rounded-2xl text-sm font-black shadow-duo-secondary">
                                    {loading ? 'TRANSMITTING...' : 'Ã¢Å“â€œ TRANSMIT ARCHIVE TO ACADEMY'}
                                 </Button>
                              </div>
                           </Card>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

         </div>
         <UnifiedFooter />
      </div>
   );
};

export default CreateUserQuiz;


