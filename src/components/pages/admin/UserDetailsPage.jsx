'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Phone, AtSign, Crown, Tag, Instagram, Facebook, Twitter,
  Youtube, Link, Search, Filter, LayoutGrid, List, Table as TableIcon, Info,
  ExternalLink, Activity, Award, Trophy, Zap, RefreshCcw, MoreVertical, X, Check,
  Share2, Globe, Cpu, Hash, TrendingUp, ShieldCheck, MailWarning, Box, ChevronRight,
  UserCheck, Users, Download, DownloadCloud
} from "lucide-react";

import Sidebar from "../../Sidebar";
import { useSelector } from "react-redux";
import Pagination from "../../Pagination";
import ViewToggle from "../../ViewToggle";
import SearchFilter from "../../SearchFilter";
import { isMobile } from "react-device-detect";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import AdminMobileAppWrapper from "../../AdminMobileAppWrapper";
import Loading from "../../Loading";
import { useSSR } from '../../../hooks/useSSR';

const PAGE_LIMIT = 10;

export default function UserDetailsPage() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [userDetails, setUserDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState('table');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith("/admin") || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchUserDetails(page, limit, debouncedSearch);
  }, [debouncedSearch, page, limit]);

  const fetchUserDetails = async (p = 1, l = 10, s = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = { page: p.toString(), limit: l.toString(), ...(s && { search: s }) };
      let res;
      try { res = await API.getAdminUserDetails(params); } 
      catch (e) { res = await API.getAdminStudents(params); }

      if (res?.success || res?.students) {
        const u = res.data?.users || res.users || res.userDetails || res.students || [];
        setUserDetails(Array.isArray(u) ? u : []);
        const pag = res.data?.pagination || res.pagination || {};
        setPagination({
          currentPage: pag.page || pag.currentPage || p,
          totalPages: pag.totalPages || 1,
          total: pag.total || 0,
          hasNextPage: pag.hasNext || false,
          hasPrevPage: pag.hasPrev || false,
        });
      } else {
        setError(res?.message || "Failed to fetch users");
      }
    } catch (e) { setError("Failed to load student data. Please try again."); }
    finally { setLoading(false); }
  };

  const handleSearch = (v) => { setSearchTerm(v); setPage(1); };
  const handlePageChange = (np) => setPage(np);

  if (!isMounted) return null;

  return (
    <AdminMobileAppWrapper title="User Management">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === "admin" && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden pt-12 lg:pt-8 font-outfit">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-4 lg:mb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 lg:gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/20 text-primary-500 rounded-2xl shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Student Directory</span>
                </div>
                <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                  All Students
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                  View complete student profiles and activity. Search and manage all registered students.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-lg lg:rounded-[2rem] border-2 border-slate-100 dark:border-white/10 shadow-xl">
                  {[{ icon: TableIcon, id: 'table' }, { icon: List, id: 'list' }, { icon: LayoutGrid, id: 'grid' }].map((mode) => (
                    <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`p-3 rounded-full transition-all ${viewMode === mode.id ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400'}`}>
                      <mode.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
                <motion.button whileHover={{ scale: 1.05 }} className="px-4 lg:px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-3">
                  <DownloadCloud className="w-4 h-4" /> Export Students
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-12">
            {[
              { label: 'Total Users', val: pagination.total || 0, icon: Users, color: 'blue' },
              { label: 'Pro Members', val: userDetails.filter(u => u.subscriptionStatus === 'pro').length, icon: Crown, color: 'amber' },
              { label: 'Avg. Activity', val: '84%', icon: Activity, color: 'emerald' },
              { label: 'Verified Users', val: '92%', icon: UserCheck, color: 'indigo' }
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 shadow-lg group hover:border-primary-500/30 transition-all">
                <div className={`p-4 bg-${s.color}-500/10 text-${s.color}-500 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}><s.icon className="w-5 h-5" /></div>
                <div className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none mb-1">{s.val}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-8 mb-4 lg:mb-12 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8">
             <div className="flex-1 relative group w-full lg:max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name, email, or username..."
                  className="w-full pl-14 pr-6 py-5 bg-white dark:bg-white/5 border-2 border-transparent focus:border-primary-500/30 rounded-lg lg:rounded-[2rem] text-xs font-black uppercase outline-none transition-all shadow-xl"
                />
             </div>
             <div className="flex items-center gap-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:block">Records per page:</div>
                <select value={itemsPerPage} onChange={(e) => { 
                   const l = Number(e.target.value); 
                   setItemsPerPage(l); setLimit(l); setPage(1); 
                }} className="px-3 lg:px-6 py-4 bg-white dark:bg-white/5 border-2 border-slate-100 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer hover:border-primary-500/30 transition-all">
                   {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} rows</option>)}
                </select>
             </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {loading ? (
               <div className="flex items-center justify-center py-32"><Loading size="md" color="blue" message="Loading students..." /></div>
            ) : error ? (
               <div className="text-center py-32">
                 <div className="p-3 lg:p-8 bg-rose-500/10 rounded-xl lg:rounded-[3rem] mb-6 border-4 border-dashed border-rose-500/20 inline-block"><MailWarning className="w-16 h-16 text-rose-500" /></div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Connection Problem</h3>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                 <button onClick={() => fetchUserDetails(page, limit, searchTerm)} className="mt-4 lg:mt-8 px-4 lg:px-10 py-4 bg-primary-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Try Again</button>
               </div>
            ) : userDetails.length === 0 ? (
               <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
                 <Users className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tighter">No Users Found</h3>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Try adjusting your search to find students.</p>
               </div>
            ) : (
                <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {viewMode === 'table' && (
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto">
                       <table className="w-full border-collapse">
                          <thead>
                             <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-left">
                                <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Social Links</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wins (Daily/Weekly/Monthly)</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Plan</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                             {userDetails.map((u, i) => (
                               <motion.tr key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="group hover:bg-primary-500/5 transition-all">
                                  <td className="px-4 lg:px-8 py-3 lg:py-6">
                                     <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-lg animate-in">{u.name?.[0] || 'U'}</div>
                                        <div>
                                           <div className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1 group-hover:text-primary-500 transition-colors tracking-tight">{u.name || 'Anonymous'}</div>
                                           <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{u.username || '@unknown'}</div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-4 lg:px-8 py-3 lg:py-6">
                                     <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-2"><Mail className="w-3" /> {u.email || 'N/A'}</div>
                                        <div className="text-[9px] font-black text-slate-400 flex items-center gap-2"><Phone className="w-3" /> {u.phone || 'No phone'}</div>
                                     </div>
                                  </td>
                                  <td className="px-4 lg:px-8 py-3 lg:py-6">
                                     <div className="flex gap-2">
                                        {[
                                          { icon: Instagram, link: u.socialLinks?.instagram, color: 'text-pink-500' },
                                          { icon: Facebook, link: u.socialLinks?.facebook, color: 'text-blue-600' },
                                          { icon: Youtube, link: u.socialLinks?.youtube, color: 'text-red-500' }
                                        ].map((s, idx) => (
                                          s.link ? (
                                            <a key={idx} href={s.link} target="_blank" className={`p-2 bg-slate-50 dark:bg-white/5 rounded-lg hover:scale-110 transition-all ${s.color}`}><s.icon className="w-4 h-4" /></a>
                                          ) : null
                                        ))}
                                        {!u.socialLinks && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">None linked</span>}
                                     </div>
                                  </td>
                                  <td className="px-4 lg:px-8 py-3 lg:py-6">
                                     <div className="flex gap-3 lg:gap-6">
                                        {[u.dailyProgress?.highScoreWins, u.weeklyProgress?.highScoreWins, u.monthlyProgress?.highScoreWins].map((v, idx) => (
                                          <div key={idx} className="text-center">
                                             <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{v || 0}</div>
                                             <div className="text-[8px] font-black text-slate-400 uppercase">{['D','W','M'][idx]}</div>
                                          </div>
                                        ))}
                                     </div>
                                  </td>
                                  <td className="px-4 lg:px-8 py-3 lg:py-6 text-right">
                                     <div className="flex flex-col items-end gap-1">
                                        <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${u.subscriptionStatus === 'pro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>{u.subscriptionStatus || 'Free'}</div>
                                        <div className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Level {u.level?.currentLevel || 1}</div>
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
                       {userDetails.map((u, i) => (
                         <motion.div key={u._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl text-center group relative overflow-hidden flex flex-col font-outfit">
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${u.subscriptionStatus === 'pro' ? 'bg-amber-400' : 'bg-primary-500'}`} />
                            <div className="mb-6 mx-auto relative">
                               <div className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-2xl group-hover:rotate-6 transition-all">{u.name?.[0] || 'U'}</div>
                               {u.subscriptionStatus === 'pro' && <div className="absolute -bottom-2 -right-2 p-1.5 bg-white dark:bg-[#0D1225] rounded-xl border-2 border-amber-400 shadow-xl"><Crown className="w-4 h-4 text-amber-500" /></div>}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 truncate">{u.name || 'Anonymous'}</h3>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 lg:mb-8">{u.username || '@unknown'}</div>
                            
                            <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 mb-4 lg:mb-8 border border-slate-100 dark:border-white/10">
                               <div className="flex justify-between items-end gap-3 text-center">
                                  {[
                                    { l: 'Daily', v: u.dailyProgress?.highScoreWins, c: 'bg-rose-500' },
                                    { l: 'Weekly', v: u.weeklyProgress?.highScoreWins, c: 'bg-blue-500' },
                                    { l: 'Monthly', v: u.monthlyProgress?.highScoreWins, c: 'bg-emerald-500' }
                                  ].map((s) => (
                                    <div key={s.l} className="flex-1">
                                       <div className="text-sm font-black text-slate-900 dark:text-white">{s.v || 0}</div>
                                       <div className={`h-1 w-full rounded-full ${s.c} my-1 opacity-50`} />
                                       <div className="text-[8px] font-black text-slate-400 uppercase">{s.l}</div>
                                    </div>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-4 mb-4 lg:mb-8">
                               <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase truncate bg-slate-50/50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5"><Mail className="w-4 text-blue-500/50" /> {u.email || 'N/A'}</div>
                               <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase bg-slate-50/50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5"><Phone className="w-4 text-emerald-500/50" /> {u.phone || 'N/A'}</div>
                            </div>

                            <button className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl group-hover:bg-primary-500 group-hover:text-white transition-all">View Full Profile</button>
                         </motion.div>
                       ))}
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="space-y-3 lg:space-y-6">
                       {userDetails.map((u, i) => (
                         <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl flex flex-col md:flex-row md:items-center gap-3 lg:gap-8 group hover:border-primary-500/30 transition-all font-outfit">
                            <div className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl lg:rounded-[2.5rem] flex items-center justify-center font-black text-4xl shadow-xl shrink-0">{u.name?.[0] || 'U'}</div>
                            <div className="flex-1">
                               <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                  <div>
                                     <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{u.name || 'Anonymous'}</h3>
                                     <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">@{u.username || 'unknown'}</span>
                                        <span className={`px-3 py-0.5 rounded-lg text-[8px] font-black uppercase border border-primary-500/20 text-primary-500`}>Level {u.level?.currentLevel || 1}</span>
                                     </div>
                                  </div>
                                  <div className="flex gap-3 lg:gap-8">
                                     {['Daily', 'Weekly', 'Monthly'].map((l, idx) => (
                                       <div key={l} className="text-center">
                                          <div className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{[u.dailyProgress?.highScoreWins, u.weeklyProgress?.highScoreWins, u.monthlyProgress?.highScoreWins][idx] || 0}</div>
                                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{l} Wins</div>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                               <div className="flex flex-wrap items-center gap-10 pt-4 border-t border-slate-100 dark:border-white/5">
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Mail className="w-4 text-blue-500/50" /> {u.email || 'No email'}</div>
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Calendar className="w-4 text-primary-500/50" /> Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                                  <div className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${u.subscriptionStatus === 'pro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{u.subscriptionStatus || 'Free'} Member</div>
                               </div>
                            </div>
                            <button className="p-6 bg-slate-100 dark:bg-white/5 text-primary-500 rounded-3xl hover:bg-primary-500 hover:text-white transition-all shadow-md"><ChevronRight className="w-6 h-6" /></button>
                         </motion.div>
                       ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center pt-12">
                      <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} onPageChange={handlePageChange} totalItems={pagination.total} itemsPerPage={itemsPerPage} />
                    </div>
                  )}
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
}

