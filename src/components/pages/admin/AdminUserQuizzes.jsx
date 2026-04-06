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
import Loading from "../../Loading";
import Button from "../../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Layers,
  LayoutGrid,
  Filter,
  Search,
  ChevronRight,
  Clock,
  User,
  Eye,
  Zap,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  FileText,
  Plus,
  ArrowLeft,
  Crown,
  Target
} from "lucide-react";

const AdminUserQuizzes = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [activeTab, setActiveTab] = useState("quizzes"); // quizzes, categories, subcategories
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "quizzes") {
        const params = {};
        if (statusFilter !== "all") params.status = statusFilter;
        if (searchQuery && searchQuery.trim())
          params.search = searchQuery.trim();
        const response = await API.adminGetAllUserQuizzes(params);
        if (response?.success) setQuizzes(response.data || []);
        else if (Array.isArray(response)) setQuizzes(response);
      } else if (activeTab === "categories") {
        const params = {};
        if (statusFilter !== "all") params.status = statusFilter;
        if (searchQuery && searchQuery.trim())
          params.search = searchQuery.trim();
        const response =
          statusFilter === "pending" && !searchQuery
            ? await API.adminGetPendingCategories(params)
            : await API.getAdminCategories({
              status: statusFilter !== "all" ? statusFilter : undefined,
              search: searchQuery || undefined,
            });
        if (response?.success) {
          setCategories(response.data || response.items || []);
        } else if (Array.isArray(response)) {
          setCategories(response);
        } else if (response?.categories) {
          setCategories(response.categories || []);
        } else {
          setCategories([]);
        }
      } else if (activeTab === "subcategories") {
        const params = {};
        if (statusFilter !== "all") params.status = statusFilter;
        if (searchQuery && searchQuery.trim())
          params.search = searchQuery.trim();
        const response =
          statusFilter === "pending" && !searchQuery
            ? await API.adminGetPendingSubcategories(params)
            : await API.getAdminSubcategories({
              status: statusFilter !== "all" ? statusFilter : undefined,
              search: searchQuery || undefined,
            });
        if (response?.success) {
          setSubcategories(response.data || response.items || []);
        } else if (Array.isArray(response)) {
          setSubcategories(response);
        } else if (response?.subcategories) {
          setSubcategories(response.subcategories || []);
        } else {
          setSubcategories([]);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = async (quiz) => {
    try {
      if (quiz?.status === 'pending') {
        const response = await API.adminGetPendingQuizDetails(quiz._id);
        if (response?.success) {
          setSelectedQuiz(response.data);
          setShowModal(true);
          return;
        }
      }
      let enriched = { ...quiz };
      try {
        const qres = await API.getAdminQuestions({ quiz: quiz._id, limit: 1000 });
        const questions = qres?.questions?.filter(q => q.quiz?._id === quiz?._id) || qres?.data?.filter(q => q.quiz?._id === quiz?._id) || [];
        if (Array.isArray(questions) && questions.length > 0) {
          enriched = { ...enriched, questions };
        }
      } catch (_) { }
      setSelectedQuiz(enriched);
      setShowModal(true);
    } catch (err) {
      toast.error(err?.message || "Failed to load quiz details");
    }
  };

  const handleApproveQuiz = async (id) => {
    try {
      const response = await API.adminApproveQuiz(id, adminNotes);
      if (response?.success) {
        toast.success(response.message || "Quiz approved successfully");
        if (response.data?.milestoneAchieved) {
          toast.success(
            `Ã°Å¸Å½â€° Milestone achieved! User upgraded to ${response.data.milestoneDetails.tier}`,
            { autoClose: 5000 }
          );
        }
      }
      setShowModal(false);
      setAdminNotes("");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to approve quiz");
    }
  };

  const handleRejectQuiz = async (id) => {
    if (!adminNotes.trim()) {
      toast.error("Please provide rejection reason");
      return;
    }
    try {
      await API.adminRejectQuiz(id, adminNotes);
      toast.success("Quiz rejected");
      setShowModal(false);
      setAdminNotes("");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to reject quiz");
    }
  };

  const handleApproveCategory = async (id) => {
    try {
      await API.adminApproveCategory(id, "");
      toast.success("Category approved");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to approve category");
    }
  };

  const handleRejectCategory = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await API.adminRejectCategory(id, reason);
      toast.success("Category rejected");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to reject category");
    }
  };

  const handleApproveSubcategory = async (id) => {
    try {
      await API.adminApproveSubcategory(id, "");
      toast.success("Subcategory approved");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to approve subcategory");
    }
  };

  const handleRejectSubcategory = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    try {
      await API.adminRejectSubcategory(id, reason);
      toast.success("Subcategory rejected");
      fetchData();
    } catch (err) {
      toast.error(err?.message || "Failed to reject subcategory");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "PENDING_MODERATION" };
      case "approved":
        return { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "PUBLISHED" };
      case "rejected":
        return { color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: XCircle, label: "DENIED" };
      default:
        return { color: "text-slate-500 bg-slate-500/10 border-slate-500/20", icon: MoreVertical, label: "UNKNOWN" };
    }
  };

  if (loading && quizzes.length === 0 && categories.length === 0 && subcategories.length === 0) {
    return (
      <AdminMobileAppWrapper title="User Quizzes">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-3 lg:p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-primary-500/10 border-t-primary-500 rounded-full shadow-2xl"
            />
            <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary-500" />
          </div>
          <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing User Content Stream...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="User Quizzes">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-outfit text-slate-900 dark:text-white pb-20">
        {isMounted && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-80' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 lg:mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4 lg:mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">ADMIN / USER QUIZZES</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  USER <span className="text-primary-500">CURATION</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Review and manage quizzes, categories, and subcategories created by users.</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-4 mb-4 lg:mb-10">
              {[
                { id: "quizzes", label: "Quizzes", icon: Trophy, count: quizzes.length },
                { id: "categories", label: "Categories", icon: Layers, count: categories.length },
                { id: "subcategories", label: "Subcategories", icon: LayoutGrid, count: subcategories.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 lg:px-8 py-5 rounded-xl lg:rounded-[2.5rem] border-4 transition-all flex items-center gap-4 shadow-xl ${activeTab === tab.id
                    ? "bg-primary-600 border-primary-500 text-white translate-y-[-4px] shadow-primary-500/50"
                    : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 text-slate-400 hover:border-primary-500/30 font-black uppercase tracking-widest text-[10px]"
                    }`}
                >
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-primary-500'}`} />
                  {tab.label}
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black ${activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Interface Controller */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-4 lg:mb-12 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8 text-[10px] font-black">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                  <Filter className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-slate-400 uppercase tracking-widest mb-1">DATA_FILTERING</div>
                  <div className="text-sm italic uppercase tracking-tighter">Content Curation Parameters</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-primary-500/30 transition-all font-outfit"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>

                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner w-full lg:w-80 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Visuzalization */}
          <AnimatePresence mode="wait">
             {loading ? (
                <div className="flex justify-center py-40">
                   <Loading size="lg" color="blue" message="" />
                </div>
             ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4 lg:space-y-8"
                >
                  {/* Quizzes Grid */}
                  {activeTab === "quizzes" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8">
                       {quizzes.length === 0 ? (
                          <div className="lg:col-span-2 flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner">
                            <Trophy className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">ZERO_QUIZZES_LOCATED</h3>
                          </div>
                       ) : (
                         quizzes.map((quiz, i) => {
                           const statusCfg = getStatusConfig(quiz.status);
                           return (
                             <motion.div
                               key={quiz._id || i}
                               initial={{ opacity: 0, scale: 0.95 }}
                               animate={{ opacity: 1, scale: 1 }}
                               transition={{ delay: i * 0.05 }}
                               className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-primary-500/30 transition-all shadow-xl flex flex-col"
                             >
                                <div className="flex justify-between items-start mb-4 lg:mb-8 text-[10px] font-black uppercase tracking-widest">
                                   <div className="flex items-center gap-3">
                                      <div className={`w-3 h-3 rounded-full ${quiz.status === 'approved' ? 'bg-emerald-500 animate-pulse' : quiz.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-bounce'}`} />
                                      {quiz.category?.name || "UNCATEGORIZED"} // {quiz.difficulty?.toUpperCase()}
                                   </div>
                                   <div className={`px-4 py-1 rounded-full border ${statusCfg.color} flex items-center gap-2 italic`}>
                                      <statusCfg.icon className="w-3 h-3" />
                                      {statusCfg.label}
                                   </div>
                                </div>

                                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight limit-text-2 group-hover:text-primary-500 transition-colors uppercase mb-4">{quiz.title}</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-4 lg:mb-8 line-clamp-2">{quiz.description}</p>

                                <div className="grid grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-10 text-[9px] font-black uppercase tracking-widest">
                                   <div className="space-y-1">
                                      <div className="text-slate-400">Questions</div>
                                      <div className="text-sm italic">{quiz.questionCount || 0}_UNITS</div>
                                   </div>
                                   <div className="space-y-1">
                                      <div className="text-slate-400">Yield_Potential</div>
                                      <div className="text-sm italic text-emerald-500">₹{quiz.rewardAmount || 0}_INR</div>
                                   </div>
                                   <div className="space-y-1">
                                      <div className="text-slate-400">Engagements</div>
                                      <div className="text-sm italic">{quiz.viewsCount || 0}_VIEWS</div>
                                   </div>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t-2 border-slate-50 dark:border-white/5 mt-auto">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg group-hover:bg-primary-500 transition-all uppercase">
                                        {quiz.createdBy?.name?.[0]?.toUpperCase() || 'U'}
                                      </div>
                                      <div>
                                         <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{quiz.createdBy?.name || 'Unknown'}</div>
                                         <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{formatDate(quiz.createdAt)}</div>
                                      </div>
                                   </div>
                                   <button 
                                      onClick={() => handleViewQuiz(quiz)}
                                      className="p-4 bg-primary-600 text-white rounded-2xl shadow-duo-primary hover:scale-105 active:scale-95 transition-all text-[8px] font-black uppercase tracking-widest flex items-center gap-3"
                                   >
                                      REVIEW_MOD <ArrowRight className="w-4 h-4" />
                                   </button>
                                </div>
                             </motion.div>
                           );
                         })
                       )}
                    </div>
                  )}

                  {/* Categories View */}
                  {activeTab === "categories" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
                       {categories.length === 0 ? (
                         <div className="lg:col-span-3 flex flex-col items-center justify-center py-40">
                            <Layers className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">ZERO_TAXONOMIES_LOCATED</h3>
                         </div>
                       ) : (
                         categories.map((cat, i) => {
                           const statusCfg = getStatusConfig(cat.status);
                           return (
                             <motion.div
                               key={cat._id || i}
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: i * 0.05 }}
                               className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col items-center text-center"
                             >
                                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-lg lg:rounded-[2rem] flex items-center justify-center mb-4 lg:mb-8 border-2 border-emerald-500/20 shadow-inner group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                   <Layers className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-2 uppercase">{cat.name}</h3>
                                <div className={`mb-4 lg:mb-8 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${statusCfg.color}`}>
                                   {statusCfg.label}
                                </div>

                                <div className="grid grid-cols-2 gap-4 w-full mb-4 lg:mb-10 text-[9px] font-black uppercase tracking-widest">
                                   <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                      <div className="text-slate-400 mb-1">Micro_Channels</div>
                                      <div className="text-sm italic tabular-nums">{cat.subcategoryCount || 0}</div>
                                   </div>
                                   <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                      <div className="text-slate-400 mb-1">Identity</div>
                                      <div className="text-sm italic truncate">{cat.createdBy?.email?.split('@')[0] || 'ADMIN'}</div>
                                   </div>
                                </div>

                                {cat.status === 'pending' && (
                                  <div className="flex gap-4 w-full">
                                     <button onClick={() => handleApproveCategory(cat._id)} className="flex-1 p-4 bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-duo-emerald hover:scale-105 active:scale-95 transition-all outline-none">
                                        AUTHORIZE
                                     </button>
                                     <button onClick={() => handleRejectCategory(cat._id)} className="flex-1 p-4 bg-rose-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-duo-rose hover:scale-105 active:scale-95 transition-all outline-none">
                                        DENY
                                     </button>
                                  </div>
                                )}
                             </motion.div>
                           );
                         })
                       )}
                    </div>
                  )}

                  {/* Subcategories View */}
                  {activeTab === "subcategories" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
                       {subcategories.length === 0 ? (
                         <div className="lg:col-span-3 flex flex-col items-center justify-center py-40">
                            <LayoutGrid className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 lg:mb-8" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">ZERO_CHANNELS_LOCATED</h3>
                         </div>
                       ) : (
                         subcategories.map((sub, i) => {
                           const statusCfg = getStatusConfig(sub.status);
                           return (
                             <motion.div
                               key={sub._id || i}
                               initial={{ opacity: 0, y: 20 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: i * 0.05 }}
                               className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 hover:border-amber-500/30 transition-all shadow-xl flex flex-col items-center text-center"
                             >
                                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-6 border-2 border-amber-500/20 shadow-inner group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                   <LayoutGrid className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-2 uppercase">{sub.name}</h3>
                                <div className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-6 italic">{sub.category?.name || 'GENERIC_PHASE'}</div>

                                <div className="grid grid-cols-2 gap-4 w-full mb-4 lg:mb-10 text-[9px] font-black uppercase tracking-widest">
                                   <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                                      <div className="text-slate-400 mb-1">Modules</div>
                                      <div className="text-sm italic tabular-nums">{sub.quizCount || 0}</div>
                                   </div>
                                   <div className={`p-4 rounded-2xl border shadow-inner ${statusCfg.color}`}>
                                      <div className="text-slate-400 mb-1">Protocol</div>
                                      <div className="text-sm italic truncate tracking-tight">{statusCfg.label.split('_')[0]}</div>
                                   </div>
                                </div>

                                {sub.status === 'pending' && (
                                  <div className="flex gap-4 w-full">
                                     <button onClick={() => handleApproveSubcategory(sub._id)} className="flex-1 p-4 bg-emerald-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-duo-emerald hover:scale-105 active:scale-95 transition-all outline-none">
                                        <ShieldCheck className="w-4 h-4 mx-auto" />
                                     </button>
                                     <button onClick={() => handleRejectSubcategory(sub._id)} className="flex-1 p-4 bg-rose-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-duo-rose hover:scale-105 active:scale-95 transition-all outline-none">
                                        <ShieldAlert className="w-4 h-4 mx-auto" />
                                     </button>
                                  </div>
                                )}
                             </motion.div>
                           );
                         })
                       )}
                    </div>
                  )}
                </motion.div>
             )}
          </AnimatePresence>

          {/* Quiz Review Modal */}
          <AnimatePresence>
            {showModal && selectedQuiz && (
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
                  className="bg-white dark:bg-[#0f172a] rounded-2xl lg:rounded-[4rem] border-8 border-slate-100 dark:border-white/5 max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/20"
                >
                  <div className="bg-slate-50 dark:bg-white/5 p-4 lg:p-10 border-b-4 border-slate-100 dark:border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3 lg:gap-6">
                        <div className="p-4 bg-primary-500/10 text-primary-500 rounded-lg lg:rounded-[2rem]">
                           <Crown className="w-8 h-8" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] mb-2">SCHEMATIC_INSPECTION // MOD_09</div>
                           <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{selectedQuiz.title}</h2>
                        </div>
                     </div>
                     <button 
                        onClick={() => setShowModal(false)}
                        className="p-5 bg-white dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full transition-all border-4 border-slate-100 dark:border-white/10"
                     >
                        <XCircle className="w-8 h-8" />
                     </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 lg:p-14 space-y-4 lg:space-y-12">
                     {/* Metadata Grid */}
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-8">
                        {[
                           { icon: Layers, label: "Macros", value: `${selectedQuiz.category?.name} / ${selectedQuiz.subcategory?.name}` },
                           { icon: Target, label: "Intensity", value: selectedQuiz.difficulty?.toUpperCase() },
                           { icon: Zap, label: "Clearance", value: `LEVEL_${selectedQuiz.requiredLevel}` },
                           { icon: Clock, label: "Temporal", value: `${selectedQuiz.timeLimit}_MIN` }
                        ].map(item => (
                           <div key={item.label} className="p-6 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/5">
                              <item.icon className="w-5 h-5 text-primary-500 mb-4" />
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</div>
                              <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">{item.value}</div>
                           </div>
                        ))}
                     </div>

                     {/* Synopsis */}
                     <div className="space-y-4">
                        <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center gap-2">
                           <FileText className="w-4 h-4" /> SYNOPSIS_PAYLOAD
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg border-l-4 border-primary-500/20 pl-8 italic">
                           {selectedQuiz.description || "No metadata synchronization detected for this objective synopsis."}
                        </p>
                     </div>

                     {/* Query Matrix */}
                     <div className="space-y-4 lg:space-y-8">
                        <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest flex items-center justify-between">
                           <div className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> QUERY_MATRIX_DEPLOYMENT</div>
                           <span className="bg-primary-500/10 px-4 py-1 rounded-full">{selectedQuiz.questions?.length || 0}_UNITS</span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 lg:gap-6">
                           {selectedQuiz.questions?.map((q, i) => (
                             <motion.div
                               key={i}
                               initial={{ opacity: 0, scale: 0.98 }}
                               animate={{ opacity: 1, scale: 1 }}
                               transition={{ delay: i * 0.1 }}
                               className="p-3 lg:p-8 bg-slate-50 dark:bg-white/5 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 group hover:border-primary-500/30 transition-all shadow-inner"
                             >
                                <div className="flex items-start gap-3 lg:gap-6 mb-4 lg:mb-8">
                                   <div className="w-12 h-12 bg-primary-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shrink-0 uppercase italic">{i + 1}</div>
                                   <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight uppercase pt-1">{q.questionText}</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-16">
                                  {q.options.map((opt, j) => (
                                    <div
                                      key={j}
                                      className={`p-5 rounded-2xl flex items-center gap-4 border-2 transition-all ${j === q.correctAnswerIndex
                                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500"
                                        : "bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-400"
                                        }`}
                                    >
                                      <span className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-[10px] font-black">{j + 1}</span>
                                      <span className="text-sm font-black uppercase italic tracking-tight">{opt}</span>
                                      {j === q.correctAnswerIndex && <ShieldCheck className="w-5 h-5 ml-auto text-emerald-500" />}
                                    </div>
                                  ))}
                                </div>
                             </motion.div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Action Module */}
                  <div className="bg-slate-50 dark:bg-white/5 p-4 lg:p-14 border-t-4 border-slate-100 dark:border-white/5">
                     <div className="flex flex-col lg:flex-row gap-10">
                        <div className="flex-1 space-y-4">
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" /> MODERATION_REMARKS
                           </div>
                           <textarea
                             value={adminNotes}
                             onChange={(e) => setAdminNotes(e.target.value)}
                             className="w-full p-3 lg:p-8 bg-white dark:bg-white/5 border-4 border-slate-100 dark:border-white/10 rounded-xl lg:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary-500/30 transition-all shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-700"
                             rows={3}
                             placeholder="Inject editorial feedback here (MANDATORY_FOR_REJECTION)..."
                           />
                        </div>
                        <div className="flex flex-col lg:w-80 gap-4">
                           {selectedQuiz?.status === 'pending' ? (
                             <>
                               <button
                                 onClick={() => handleApproveQuiz(selectedQuiz._id)}
                                 className="flex-1 p-3 lg:p-8 bg-emerald-500 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-duo-emerald hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                               >
                                  <ShieldCheck className="w-6 h-6" /> AUTHORIZE_UNIT
                               </button>
                               <button
                                 onClick={() => handleRejectQuiz(selectedQuiz._id)}
                                 className="flex-1 p-3 lg:p-8 bg-rose-500 text-white rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-duo-rose hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                               >
                                  <ShieldAlert className="w-6 h-6" /> REJECT
                               </button>
                             </>
                           ) : (
                             <button
                               onClick={() => setShowModal(false)}
                               className="flex-1 p-3 lg:p-8 bg-slate-900 text-white dark:bg-white/10 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3"
                             >
                                <ArrowLeft className="w-6 h-6" /> EXIT_INSPECTION
                             </button>
                           )}
                        </div>
                     </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminUserQuizzes;

