'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity, CheckCircle, Clock, CreditCard, Download, Filter,
  IndianRupee, Layers, LayoutDashboard, LineChart, PieChart,
  TrendingUp, Users, Wallet, Zap, Cpu, Search, Plus, X,
  Eye, EyeOff, ChevronLeft, ChevronRight, Crown, Star, Gem,
  Rocket, Table, Th, List, Calendar, ArrowUp, ArrowDown,
  AlertTriangle, XCircle, Landmark, Smartphone, MoreHorizontal,
  Send, ShieldCheck, ShieldX, CheckCircle2, ChevronDown
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Sidebar from '../../Sidebar';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Pagination from '../../Pagination';
import ResponsiveTable from '../../ResponsiveTable';
import SearchFilter from '../../SearchFilter';
import ViewToggle from '../../ViewToggle';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getCurrentUser } from '../../../utils/authUtils';

const AdminWithdrawRequests = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [viewMode, setViewMode] = useState('table');

  const isOpen = useSelector((state) => state.sidebar.isOpen);
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const user = getCurrentUser();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await API.getAdminWithdrawRequests({ page: 1, limit: 1000 });
      if (res?.success) setAllItems(res.data || []);
    } catch (err) { toast.error(err?.message || 'Failed to load requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (allItems.length === 0) return;
    let filtered = allItems;
    if (status !== 'all') filtered = filtered.filter(item => item.status === status);
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.user?.name?.toLowerCase().includes(s) || 
        item.user?.email?.toLowerCase().includes(s) || 
        item.upi?.toLowerCase().includes(s) || 
        item.bankDetail?.accountNumber?.toLowerCase().includes(s)
      );
    }
    const start = (page - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    setItems(paginated.map((item, i) => ({ ...item, _sno: start + i + 1 })));
    setTotal(filtered.length);
    setPagination({ page, limit: itemsPerPage, total: filtered.length, totalPages: Math.ceil(filtered.length / itemsPerPage) });
  }, [status, page, itemsPerPage, allItems, searchTerm]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.updateWithdrawRequestStatus(id, newStatus);
      toast.success(`Request ${newStatus} successfully!`);
      setAllItems(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
    } catch (err) { toast.error(err?.message || 'Update failed'); }
    finally { setUpdating(null); }
  };

  const statusOptions = [
    { value: 'all', label: 'All Requests', icon: Layers, color: 'indigo' },
    { value: 'pending', label: 'Pending Review', icon: Clock, color: 'amber' },
    { value: 'approved', label: 'Approved', icon: CheckCircle2, color: 'emerald' },
    { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'rose' },
    { value: 'paid', label: 'Paid', icon: CreditCard, color: 'indigo' }
  ];

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt);
  const formatDate = (ds) => {
    const d = new Date(ds);
    return `${d.getDate().toString().padStart(2, '0')} ${['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const columns = [
    { key: 'user', header: 'User', render: (_, req) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-full flex items-center justify-center font-black text-xs uppercase">{req.userId?.name?.[0] || 'U'}</div>
        <div>
          <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-1">{req.userId?.name || 'N/A'}</div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{req.userId?.email || 'N/A'}</div>
        </div>
      </div>
    )},
    { key: 'amount', header: 'Payout Amount', render: (_, req) => (
      <div className="flex flex-col">
        <span className="text-lg font-black text-emerald-600 dark:text-emerald-500 italic tracking-tighter leading-none">{formatCurrency(req.amount)}</span>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 capitalize">{req.requestType} Wallet</span>
      </div>
    )},
    { key: 'payout', header: 'Payout Account', render: (_, req) => (
      <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest space-y-1">
        {req.upi ? (
          <div className="flex items-center gap-2 p-2 bg-indigo-500/5 rounded-lg border border-indigo-500/10">
            <Smartphone className="w-3 h-3 text-indigo-500" />
            <span className="font-mono text-[10px]">{req.upi}</span>
          </div>
        ) : req.bankDetail ? (
          <div className="p-2 bg-blue-500/5 rounded-lg border border-blue-500/10 space-y-0.5">
            <div className="flex items-center gap-2 font-black text-blue-500"><Landmark className="w-3 h-3" /> {req.bankDetail.bankName}</div>
            <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300">{req.bankDetail.accountNumber}</div>
            <div className="font-mono text-[8px] opacity-70">IFSC: {req.bankDetail.ifscCode}</div>
          </div>
        ) : <span className="italic opacity-50">No data found</span>}
      </div>
    )},
    { key: 'status', header: 'Status', render: (_, req) => (
      <div className="space-y-3">
        <div className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase inline-flex items-center gap-2 border-2 ${
          req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
          req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
          req.status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
          'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
        }`}>
          {req.status === 'pending' && <Clock className="w-3 h-3" />}
          {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
          {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
          {req.status === 'paid' && <CreditCard className="w-3 h-3" />}
          {req.status}
        </div>
        {req.status === 'pending' && (
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateStatus(req._id, 'approved')} className="p-2 bg-emerald-500 text-white rounded-lg shadow-lg"><CheckCircle2 className="w-4 h-4" /></motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateStatus(req._id, 'rejected')} className="p-2 bg-rose-500 text-white rounded-lg shadow-lg"><XCircle className="w-4 h-4" /></motion.button>
          </div>
        )}
        {req.status === 'approved' && (
          <motion.button whileHover={{ scale: 1.02 }} onClick={() => updateStatus(req._id, 'paid')} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
            <Send className="w-3 h-3" /> Mark as Paid
          </motion.button>
        )}
      </div>
    )}
  ];

  if (!isMounted) return null;

  return (
    <AdminMobileAppWrapper title="Withdrawal Payouts">
      <div className={`adminPanel ${isOpen ? 'showPanel' : 'hidePanel'}`}>
        {user?.role === 'admin' && isAdminRoute && <Sidebar />}
        <div className="adminContent p-4 lg:p-8 w-full max-w-[1600px] mx-auto overflow-x-hidden pt-12 lg:pt-8 font-outfit">
          
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl shadow-sm">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Treasury // Manage Withdrawals</span>
                </div>
                <h1 className="text-2xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                  Withdrawal Requests
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">
                  Review and authorize user payout requests.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <SearchFilter onSearch={handleSearch} placeholder="Search user..." className="w-full sm:w-64" />
                <div className="flex items-center bg-white dark:bg-white/5 p-2 rounded-[2rem] border-2 border-slate-100 dark:border-white/10 shadow-xl">
                  {[{ icon: Table, id: 'table' }, { icon: List, id: 'list' }].map((mode) => (
                    <button key={mode.id} onClick={() => setViewMode(mode.id)} className={`p-3 rounded-full transition-all ${viewMode === mode.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                      <mode.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
             {statusOptions.map((opt) => (
               <button
                 key={opt.value}
                 onClick={() => { setStatus(opt.value); setPage(1); }}
                 className={`px-8 py-5 rounded-[2.5rem] border-4 transition-all flex items-center gap-4 relative group overflow-hidden ${
                   status === opt.value 
                   ? 'bg-white dark:bg-indigo-600 border-indigo-600 dark:border-indigo-500 shadow-2xl' 
                   : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-indigo-500/30'
                 }`}
               >
                 <opt.icon className={`w-5 h-5 ${status === opt.value ? 'text-indigo-600 dark:text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                 <div className="text-left">
                   <div className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${status === opt.value ? 'text-indigo-600 dark:text-white' : 'text-slate-400'}`}>{opt.label}</div>
                   <div className={`text-xs font-black italic tracking-tighter leading-none ${status === opt.value ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                     {allItems.filter(i => opt.value === 'all' ? true : i.status === opt.value).length} ENTRIES
                   </div>
                 </div>
               </button>
             ))}
          </div>

          {/* Table / List */}
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex items-center justify-center py-32"><Loading size="md" color="yellow" message="Loading requests..." /></div>
            ) : items.length === 0 ? (
               <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
                  <CreditCard className="w-20 h-20 text-slate-300 mx-auto mb-8 opacity-20" />
                  <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">No Requests Found</h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">The withdrawal list is currently empty.</p>
               </div>
            ) : (
                <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {viewMode === 'table' ? (
                    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl overflow-x-auto selection:bg-indigo-500/30">
                       <ResponsiveTable data={items} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {items.map((req, idx) => (
                         <motion.div key={req._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-8 shadow-2xl relative font-outfit overflow-hidden group hover:border-indigo-500/20 transition-all">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500" />
                            <div className="flex justify-between items-start mb-8">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black italic shadow-lg text-xs">{req.userId?.name?.[0] || 'U'}</div>
                                  <div>
                                     <h3 className="text-md font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{req.userId?.name || 'N/A'}</h3>
                                     <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{req.requestType} WALLET</div>
                                  </div>
                               </div>
                               <div className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase border-2 ${req.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>{req.status}</div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 mb-8 border-2 border-slate-100 dark:border-white/5">
                               <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Payout Amount</div>
                               <div className="text-3xl font-black text-emerald-600 dark:text-emerald-500 italic tracking-tighter leading-none mb-4">{formatCurrency(req.amount)}</div>
                               <div className="pt-4 border-t-2 border-slate-100 dark:border-white/5">
                                  {req.upi ? (
                                    <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-indigo-500" /><span className="text-xs font-black font-mono text-slate-600 dark:text-slate-300">{req.upi}</span></div>
                                  ) : req.bankDetail ? (
                                    <div className="space-y-1">
                                       <div className="flex items-center gap-3 text-[10px] font-black text-blue-500"><Landmark className="w-4 h-4" /> {req.bankDetail.bankName}</div>
                                       <div className="text-xs font-black font-mono text-slate-600 dark:text-slate-300 pl-7">{req.bankDetail.accountNumber}</div>
                                    </div>
                                  ) : <span className="text-[10px] italic opacity-40">No payout data</span>}
                               </div>
                            </div>

                            <div className="flex gap-3 mt-auto">
                               {req.status === 'pending' ? (
                                 <>
                                   <motion.button onClick={() => updateStatus(req._id, 'approved')} whileHover={{ scale: 1.02 }} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approve</motion.button>
                                   <motion.button onClick={() => updateStatus(req._id, 'rejected')} whileHover={{ scale: 1.02 }} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"><XCircle className="w-5 h-5" /></motion.button>
                                 </>
                               ) : req.status === 'approved' ? (
                                 <motion.button onClick={() => updateStatus(req._id, 'paid')} whileHover={{ scale: 1.02 }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><CreditCard className="w-4 h-4" /> Mark as Paid</motion.button>
                               ) : (
                                 <div className="w-full py-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-2xl text-[10px] font-black uppercase text-center border-2 border-slate-200/50">Processed</div>
                               )}
                            </div>
                         </motion.div>
                       ))}
                    </div>
                  )}
                </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!loading && pagination.totalPages > 1 && (
             <div className="mt-12 flex justify-center">
                <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} totalItems={total} itemsPerPage={itemsPerPage} />
             </div>
          )}
        </div>
      </div>
    </AdminMobileAppWrapper>
  );
};

export default AdminWithdrawRequests;

