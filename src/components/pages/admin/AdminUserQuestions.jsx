"use client";

import React, { useEffect, useState, useCallback } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import Sidebar from '../../Sidebar';
import { useSelector } from "react-redux";
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import { getCurrentUser } from "../../../utils/authUtils";
import Pagination from '../../Pagination';
import SearchFilter from '../../SearchFilter';
import Button from '../../ui/Button';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  LayoutGrid,
  List,
  Table as TableIcon,
  Search,
  ChevronRight,
  User,
  Eye,
  Heart,
  MessageCircle,
  ArrowRight,
  MoreVertical,
  ShieldCheck,
  ShieldAlert,
  Send
} from 'lucide-react';

const AdminUserQuestions = () => {
  const [items, setItems] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryStatus = searchParams?.get("status") || null;
  const initialStatus = ["pending", "approved", "rejected"].includes(
    queryStatus || ""
  )
    ? queryStatus
    : "";
  const [status, setStatus] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(
    typeof window !== "undefined" && window.innerWidth < 768 ? "list" : "table"
  );

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = pathname?.startsWith("/admin") || false;
  const user = getCurrentUser();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        status,
        page,
        limit: itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
      };
      const res = await API.getAdminUserQuestions(params);
      if (res?.success) {
        setItems(res.data || []);
        setTotal(res.pagination?.total || 0);
        setPagination(res.pagination || {});
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [status, page, itemsPerPage, searchTerm]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [status, pathname]);

  useEffect(() => {
    const urlStatus = searchParams?.get("status");
    if (
      urlStatus &&
      ["pending", "approved", "rejected"].includes(urlStatus) &&
      urlStatus !== status
    ) {
      setPage(1);
      setStatus(urlStatus);
    }
  }, [searchParams]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.updateUserQuestionStatus(id, newStatus);
      toast.success(`Question ${newStatus} successfully.`);
      load();
    } catch (err) {
      toast.error(err?.message || "Failed to update question status.");
    } finally {
      setUpdating(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return { color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: Clock, label: "Pending" };
      case "approved":
        return { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2, label: "Approved" };
      case "rejected":
        return { color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: XCircle, label: "Rejected" };
      default:
        return { color: "text-slate-500 bg-slate-500/10 border-slate-500/20", icon: MoreVertical, label: "Unknown" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setPage(1);
  };

  const handleSearch = (search) => {
    setSearchTerm(search);
    setPage(1);
  };

  if (loading && items.length === 0) {
    return (
      <AdminMobileAppWrapper title="User Questions">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-3 lg:p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-primary-500/10 border-t-primary-500 rounded-full shadow-2xl"
            />
            <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary-500" />
          </div>
          <div className="mt-4 lg:mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Loading user questions...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="User Questions">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-outfit text-slate-900 dark:text-white pb-20">
        {isAdminRoute && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'p-4 lg:p-8' : 'p-4 lg:p-8'}`}>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8 mb-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">User Questions</span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  User <span className="text-primary-500">Questions</span> <span className="text-slate-300 dark:text-white/10 ml-2 italic tracking-widest text-2xl lg:text-4xl">({total})</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Review and approve questions submitted by students.</p>
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-3 lg:gap-8 text-[10px] font-black">
              <div className="flex flex-wrap items-center gap-3 lg:gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase tracking-widest mb-1">Filter</div>
                      <div className="text-sm italic uppercase tracking-tighter italic">Question Review</div>
                    </div>
                 </div>

                 <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner">
                  {[
                    { icon: TableIcon, id: 'table', label: 'Table' },
                    { icon: List, id: 'list', label: 'List' },
                    { icon: LayoutGrid, id: 'grid', label: 'Grid' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`p-4 rounded-full transition-all flex items-center gap-2 ${viewMode === mode.id ? 'bg-white dark:bg-primary-600 text-primary-600 dark:text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <mode.icon className="w-4 h-4" />
                      {viewMode === mode.id && <span className="uppercase tracking-widest pr-2">{mode.label}</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group">
                   <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <select
                    value={status}
                    onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                    className="pl-14 pr-10 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer hover:border-primary-500/30 transition-all font-outfit"
                   >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                   </select>
                   <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>

                <div className="flex items-center gap-3">
                   <span className="text-slate-400">Show:</span>
                   <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="px-3 lg:px-6 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                   >
                     {[10, 20, 50, 100, 500].map(v => <option key={v} value={v}>{v}</option>)}
                   </select>
                </div>

                <SearchFilter
                  onSearch={handleSearch}
                  placeholder="Search questions..."
                  className="bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl py-2"
                />
              </div>
            </div>
          </motion.div>

          {/* Results Grid/Table/List */}
          <AnimatePresence mode="wait">
            {items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 lg:py-20  text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
              >
                 <div className="p-4 lg:p-10 bg-slate-100/50 dark:bg-white/5 rounded-xl lg:rounded-[3rem] mb-4 lg:mb-8 shadow-xl">
                   <MessageSquare className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">No User Questions</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No questions match your current filters. Try adjusting the status or search term.</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">#</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted By</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stats</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                          <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {items.map((q, i) => {
                          const statusCfg = getStatusConfig(q.status);
                          return (
                            <motion.tr
                              key={q._id || i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group hover:bg-primary-500/5 transition-all"
                            >
                              <td className="px-4 lg:px-8 py-4 lg:py-8 text-center">
                                <span className="text-[10px] font-black text-slate-400 tabular-nums">#{((page - 1) * itemsPerPage) + i + 1}</span>
                              </td>
                              <td className="px-4 lg:px-8 py-4 lg:py-8">
                                <div className="max-w-md">
                                   <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-4 group-hover:text-primary-500 transition-colors uppercase">{q.questionText}</div>
                                   <div className="flex flex-wrap gap-2">
                                     {(q.options || []).map((opt, idx) => (
                                       <div key={idx} className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border ${idx === q.correctOptionIndex ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>
                                          <span className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">{String.fromCharCode(65 + idx)}</span>
                                          {opt}
                                          {idx === q.correctOptionIndex && <CheckCircle2 className="w-3 h-3" />}
                                       </div>
                                     ))}
                                   </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-8 py-4 lg:py-8">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl flex items-center justify-center font-black text-xs shadow-inner group-hover:bg-primary-500 group-hover:text-white group-hover:scale-110 transition-all uppercase">
                                     {q.userId?.name?.[0].toUpperCase() || 'U'}
                                   </div>
                                   <div>
                                      <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{q.userId?.name || 'Unknown'}</div>
                                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{q.userId?.email || 'No email'}</div>
                                   </div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-8 py-4 lg:py-8 text-center text-[10px] font-black">
                                 <div className="flex justify-center gap-4">
                                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-primary-500 transition-colors">
                                       <Eye className="w-3 h-3" />
                                       <span className="tabular-nums">{q.viewsCount || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-rose-500 transition-colors">
                                       <Heart className="w-3 h-3" />
                                       <span className="tabular-nums">{q.likesCount || 0}</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                       <MessageCircle className="w-3 h-3" />
                                       <span className="tabular-nums">{(q.answers || []).length}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 lg:px-8 py-4 lg:py-8 text-right">
                                <div className="flex flex-col items-end">
                                  <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums">{formatDate(q.createdAt)}</div>
                                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(q.createdAt)}</div>
                                </div>
                              </td>
                              <td className="px-4 lg:px-8 py-4 lg:py-8">
                                 <div className="flex flex-col items-center gap-4">
                                    <div className={`px-4 py-1 rounded-lg lg:rounded-[2rem] text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 ${statusCfg.color}`}>
                                       <statusCfg.icon className="w-3 h-3" />
                                       {statusCfg.label}
                                    </div>
                                    {q.status === 'pending' && (
                                      <div className="flex gap-2">
                                         <button onClick={() => updateStatus(q._id, 'approved')} className="p-2 bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">
                                            <ShieldCheck className="w-4 h-4" />
                                         </button>
                                         <button onClick={() => updateStatus(q._id, 'rejected')} className="p-2 bg-rose-500/10 text-rose-500 border-2 border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95">
                                            <ShieldAlert className="w-4 h-4" />
                                         </button>
                                      </div>
                                    )}
                                 </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="space-y-3 lg:space-y-6">
                    {items.map((q, i) => {
                      const statusCfg = getStatusConfig(q.status);
                      return (
                        <motion.div
                          key={q._id || i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-primary-500/30 transition-all shadow-xl flex flex-col lg:flex-row gap-3 lg:gap-8 items-start relative"
                        >
                           <div className="absolute top-8 right-10 flex flex-col items-end">
                              <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 mb-2 ${statusCfg.color}`}>
                                 <statusCfg.icon className="w-3 h-3" />
                                 {statusCfg.label}
                              </div>
                              <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 italic">#{((page - 1) * itemsPerPage) + i + 1}</div>
                           </div>

                           <div className="w-16 h-16 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-[1.5rem] flex items-center justify-center font-black text-xl shrink-0 shadow-lg group-hover:scale-110 group-hover:bg-primary-500 transition-all uppercase">
                             {q.userId?.name?.[0].toUpperCase() || 'U'}
                           </div>

                           <div className="flex-1 space-y-3 lg:space-y-6">
                              <div className="space-y-2">
                                 <div className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{q.userId?.name || 'Unknown'} / {q.userId?.email || 'N/A'}</div>
                                 <h3 className="text-md lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary-500 transition-colors uppercase">{q.questionText}</h3>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                {(q.options || []).map((opt, idx) => (
                                  <div key={idx} className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border shadow-inner ${idx === q.correctOptionIndex ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>
                                     <span className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-xs">{String.fromCharCode(65 + idx)}</span>
                                     {opt}
                                     {idx === q.correctOptionIndex && <ShieldCheck className="w-4 h-4" />}
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-4">
                                 <div className="flex items-center gap-3 text-slate-400">
                                    <Eye className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">{q.viewsCount || 0} Views</span>
                                 </div>
                                 <div className="flex items-center gap-3 text-slate-400">
                                    <Heart className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">{q.likesCount || 0} Likes</span>
                                 </div>
                                 <div className="flex items-center gap-3 text-slate-400">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">{(q.answers || []).length} Answers</span>
                                 </div>
                                 <div className="flex items-center gap-3 text-slate-400 pl-4 border-l-2 border-slate-100 dark:border-white/5">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">{formatDate(q.createdAt)} @ {formatTime(q.createdAt)}</span>
                                 </div>
                              </div>
                           </div>

                           {q.status === 'pending' && (
                             <div className="flex lg:flex-col gap-4 pt-6 lg:pt-0">
                                <button
                                  onClick={() => updateStatus(q._id, 'approved')}
                                  className="flex items-center justify-center gap-3 px-4 lg:px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-duo-emerald hover:scale-105 active:scale-95 transition-all"
                                >
                                   <ShieldCheck className="w-5 h-5" /> Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(q._id, 'rejected')}
                                  className="flex items-center justify-center gap-3 px-4 lg:px-8 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-duo-rose hover:scale-105 active:scale-95 transition-all"
                                >
                                   <ShieldAlert className="w-5 h-5" /> Reject
                                </button>
                             </div>
                           )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-8">
                    {items.map((q, i) => {
                      const statusCfg = getStatusConfig(q.status);
                      return (
                        <motion.div
                          key={q._id || i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-10 hover:border-primary-500/30 transition-all shadow-xl flex flex-col"
                        >
                           <div className="flex justify-between items-start mb-4 lg:mb-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 text-slate-400 rounded-2xl flex items-center justify-center font-black text-md shadow-inner group-hover:bg-primary-500 group-hover:text-white transition-all">
                                   {q.userId?.name?.[0].toUpperCase() || 'U'}
                                </div>
                                <div>
                                   <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{q.userId?.name || 'Unknown'}</div>
                                   <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{formatDate(q.createdAt)}</div>
                                </div>
                              </div>
                              <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border flex items-center gap-2 ${statusCfg.color}`}>
                                 <statusCfg.icon className="w-3 h-3" />
                                 {statusCfg.label}
                              </div>
                           </div>

                           <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight limit-text-3 mb-4 lg:mb-8 group-hover:text-primary-500 transition-colors uppercase">{q.questionText}</h3>

                           <div className="grid grid-cols-2 gap-3 mb-4 lg:mb-10 mt-auto">
                              {(q.options || []).map((opt, idx) => (
                                <div key={idx} className={`p-4 rounded-2xl text-[8px] font-black uppercase tracking-widest flex items-center gap-3 border shadow-inner ${idx === q.correctOptionIndex ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'}`}>
                                   <span className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">{String.fromCharCode(65 + idx)}</span>
                                   <span className="truncate">{opt}</span>
                                </div>
                              ))}
                           </div>

                           <div className="flex items-center justify-between pt-8 border-t-2 border-slate-50 dark:border-white/5 mt-auto">
                              <div className="flex items-center gap-3 lg:gap-6">
                                 <div className="flex flex-col items-center text-slate-400 group-hover:text-primary-500">
                                    <Eye className="w-4 h-4 mb-2" />
                                    <span className="text-[9px] font-black tabular-nums">{q.viewsCount || 0}</span>
                                 </div>
                                 <div className="flex flex-col items-center text-slate-400 group-hover:text-rose-500">
                                    <Heart className="w-4 h-4 mb-2" />
                                    <span className="text-[9px] font-black tabular-nums">{q.likesCount || 0}</span>
                                 </div>
                                 <div className="flex flex-col items-center text-slate-400 group-hover:text-indigo-500">
                                    <MessageCircle className="w-4 h-4 mb-2" />
                                    <span className="text-[9px] font-black tabular-nums">{(q.answers || []).length}</span>
                                 </div>
                              </div>

                              {q.status === 'pending' ? (
                                <div className="flex gap-3">
                                   <button onClick={() => updateStatus(q._id, 'approved')} className="p-4 bg-emerald-500 text-white rounded-2xl shadow-duo-emerald hover:scale-105 active:scale-95 transition-all">
                                      <ShieldCheck className="w-5 h-5" />
                                   </button>
                                   <button onClick={() => updateStatus(q._id, 'rejected')} className="p-4 bg-rose-500 text-white rounded-2xl shadow-duo-rose hover:scale-105 active:scale-95 transition-all">
                                      <ShieldAlert className="w-5 h-5" />
                                   </button>
                                </div>
                              ) : (
                                <div className="p-4 bg-slate-100 dark:bg-white/10 text-slate-400 rounded-2xl shadow-inner cursor-pointer hover:bg-primary-500 hover:text-white transition-all">
                                   <ArrowRight className="w-5 h-5" />
                                </div>
                              )}
                           </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-16">
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                      totalItems={pagination.total}
                      itemsPerPage={itemsPerPage}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminUserQuestions;

