'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock, CreditCard, Layers, Table, List, LayoutGrid,
  XCircle, Landmark, Smartphone, Send, CheckCircle2
} from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import API from '../../../lib/api';
import Pagination from '../../Pagination';
import ResponsiveTable from '../../ResponsiveTable';
import SearchFilter from '../../SearchFilter';
import ViewToggle from '../../ViewToggle';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Sidebar from "../../Sidebar";

import { getCurrentUser } from '../../../utils/authUtils';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import useDebounce from '../../../hooks/useDebounce';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminWithdrawRequests = () => {
  const { isMounted, isRouterReady, router } = useSSR();
  const [items, setItems] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 });
  const [viewMode, setViewMode] = useState('table');
  const user = getCurrentUser();
  const debouncedSearch = useDebounce(searchTerm, 800);

  useEffect(() => {
    if (window.innerWidth < 768) setViewMode('grid');
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: itemsPerPage };
      if (status !== 'all') params.status = status;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await API.getAdminWithdrawRequests(params);
      if (res?.success) {
        const start = (page - 1) * itemsPerPage;
        setItems((res.data || []).map((item, i) => ({ ...item, _sno: start + i + 1 })));
        setTotal(res.pagination?.total || 0);
        setPagination(res.pagination || { page, limit: itemsPerPage, total: 0, totalPages: 1 });
        setStatusCounts(res.statusCounts || {});
      }
    } catch (err) { toast.error(err?.message || 'Failed to load withdrawal requests'); }
    finally { setLoading(false); }
  }, [page, itemsPerPage, status, debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleLimitChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setPage(1);
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await API.updateWithdrawRequestStatus(id, newStatus);
      toast.success(`Request ${newStatus === 'approved' ? 'approved' : newStatus === 'rejected' ? 'rejected' : newStatus === 'paid' ? 'marked as paid' : newStatus} successfully!`);
      setItems(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      fetchItems();
    } catch (err) { toast.error(err?.message || 'Failed to update request status'); }
    finally { setUpdating(null); }
  };

  const statusOptions = [
    { value: 'all', label: 'All Requests', icon: Layers, color: 'primary' },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'primary' },
    { value: 'approved', label: 'Approved', icon: CheckCircle2, color: 'primary' },
    { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'primary' },
    { value: 'paid', label: 'Paid', icon: CreditCard, color: 'primary' }
  ];

  const formatCurrency = (amt) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amt);
  const formatDate = (ds) => {
    const d = new Date(ds);
    return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const columns = [
    {
      key: 'user', header: 'Student', render: (_, req) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center font-black text-xs uppercase">{req.userId?.name?.[0] || 'U'}</div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-1">{req.userId?.name || 'N/A'}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{req.userId?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'amount', header: 'Amount', render: (_, req) => (
        <div className="flex flex-col">
          <span className="text-lg font-black text-primary-600 italic tracking-tighter leading-none">{formatCurrency(req.amount)}</span>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 capitalize">{req.requestType} wallet</span>
        </div>
      )
    },
    {
      key: 'payout', header: 'Payment Details', render: (_, req) => (
        <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest space-y-1">
          {req.upi ? (
            <div className="flex items-center gap-2 p-2 bg-primary-500/5 rounded-lg border border-primary-500/10">
              <Smartphone className="w-3 h-3 text-primary-600" />
              <span className="font-mono text-[10px]">{req.upi}</span>
            </div>
          ) : req.bankDetail ? (
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10 space-y-0.5">
              <div className="flex items-center gap-2 font-black text-black dark:text-white"><Landmark className="w-3 h-3" /> {req.bankDetail.bankName}</div>
              <div className="font-mono text-[10px] text-slate-600 dark:text-slate-300">{req.bankDetail.accountNumber}</div>
              <div className="font-mono text-[8px] opacity-70">IFSC: {req.bankDetail.ifscCode}</div>
            </div>
          ) : <span className="italic opacity-50">No payment details provided</span>}
        </div>
      )
    },
    {
      key: 'status', header: 'Status', render: (_, req) => (
        <div className="space-y-3">
          <div className={`px-4 py-1 rounded-lg lg:rounded-xl text-[9px] font-black uppercase inline-flex items-center gap-2 border-2 ${req.status === 'pending' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' :
              req.status === 'approved' ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' :
                req.status === 'rejected' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' :
                  'bg-primary-500/10 text-primary-600 border-primary-500/20'
            }`}>
            {req.status === 'pending' && <Clock className="w-3 h-3" />}
            {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
            {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
            {req.status === 'paid' && <CreditCard className="w-3 h-3" />}
            {req.status === 'pending' ? 'Pending' : req.status === 'approved' ? 'Approved' : req.status === 'rejected' ? 'Rejected' : req.status === 'paid' ? 'Paid' : req.status}
          </div>
          {req.status === 'pending' && (
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateStatus(req._id, 'approved')} className="p-2 bg-primary-600 text-white rounded-lg shadow-sm"><CheckCircle2 className="w-4 h-4" /></motion.button>
              <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateStatus(req._id,'rejected')} className="p-2 bg-primary-600 text-white rounded-lg shadow-sm"><XCircle className="w-4 h-4"/></motion.button>
            </div>
          )}
          {req.status === 'approved' && (
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => updateStatus(req._id, 'paid')} className="w-full py-2 bg-primary-600 text-white rounded-lg lg:rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
              <Send className="w-3 h-3" /> Mark as Paid
            </motion.button>
          )}
        </div>
      )
    }
  ];

  const statusFilterButtons = (
    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
      {statusOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => { setStatus(opt.value); setPage(1); }}
          className={`px-3 py-2 rounded-lg lg:rounded-xl border-2 transition-all flex items-center gap-2 relative group overflow-hidden shrink-0 ${status === opt.value
              ? 'bg-white dark:bg-primary-600 border-primary-600 dark:border-primary-600 shadow-sm'
              : 'bg-white/50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-primary-500/30'
            }`}
        >
          <opt.icon className={`w-4 h-4 ${status === opt.value ? 'text-primary-600 dark:text-white' : 'text-slate-400 group-hover:text-primary-600'}`} />
          <div className="text-left">
            <div className={`text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 ${status === opt.value ? 'text-primary-600 dark:text-white' : 'text-slate-400'}`}>{opt.label}</div>
            <div className={`text-[10px] font-black italic tracking-tighter leading-none ${status === opt.value ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
              {statusCounts[opt.value] || 0} requests
            </div>
          </div>
        </button>
      ))}
    </div>
  );

  const searchFilterInput = (
    <SearchFilter searchTerm={searchTerm} onSearch={(v) => { setSearchTerm(v); setPage(1); }} placeholder="Search requests..." className="w-full lg:w-64" compact />
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[{ icon: Table, id: 'table', label: 'Table View' }, { icon: LayoutGrid, id: 'grid', label: 'Grid View' }, { icon: List, id: 'list', label: 'List View' }].map((mode) => (
        <button key={mode.id} onClick={() => setViewMode(mode.id)} title={mode.label} className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const paginationControl = (
    <Pagination currentPage={page} totalPages={pagination.totalPages || 1} onPageChange={setPage} totalItems={total} itemsPerPage={itemsPerPage} onItemsPerPageChange={handleLimitChange} compact />
  );

  useAdminMobileHeader({
    title: 'Payouts',
    count: total,
    filters: (
      <>
        {statusFilterButtons}
        {searchFilterInput}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  if (!isMounted) return null;

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col overflow-hidden">


        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        {/* Table / List */}
        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        <AnimatePresence mode="wait">
          {loading ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : items.length === 0 ? (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
              <CreditCard className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">No Withdrawal Requests</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No pending withdrawal requests at this time.</p>
            </div>
          ) : (
            <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-h-0 overflow-auto flex flex-col">
              {viewMode === 'table' ? (
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm selection:bg-primary-500/30 flex-1 min-h-0 overflow-auto flex flex-col">
                  <ResponsiveTable data={items} columns={columns} viewModes={['table']} defaultView={'table'} showPagination={false} showViewToggle={false} fillHeight />
                </div>
              ) : viewMode === 'list' ? (
                <div className="flex-1 min-h-0 overflow-auto space-y-3">
                  {items.map((req, idx) => (
                    <motion.div key={req._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="bg-white dark:bg-white/5 rounded-lg lg:rounded-xl border-2 border-slate-100 dark:border-white/10 p-3 lg:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 hover:border-primary-500/20 transition-all">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-10 h-10 bg-primary-500/10 text-primary-600 rounded-full flex items-center justify-center font-black text-xs uppercase shrink-0">
                          {req.userId?.name?.[0] || 'U'}
                          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{req._sno}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none mb-1 truncate">{req.userId?.name || 'N/A'}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none truncate">{req.userId?.email || 'N/A'}</div>
                        </div>
                      </div>

                      <div className="flex flex-col shrink-0">
                        <span className="text-lg font-black text-primary-600 italic tracking-tighter leading-none">{formatCurrency(req.amount)}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 capitalize">{req.requestType} wallet</span>
                      </div>

                      <div className="shrink-0">
                        {req.upi ? (
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            <Smartphone className="w-3 h-3 text-primary-600" />
                            <span className="font-mono text-[10px]">{req.upi}</span>
                          </div>
                        ) : req.bankDetail ? (
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            <Landmark className="w-3 h-3 text-primary-600" />
                            <span className="font-mono text-[10px]">{req.bankDetail.accountNumber}</span>
                          </div>
                        ) : <span className="text-[9px] italic opacity-50">No payment details</span>}
                      </div>

                      <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase inline-flex items-center gap-2 border-2 shrink-0 ${req.status === 'pending' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' :
                          req.status === 'approved' ? 'bg-primary-500/10 text-primary-600 border-primary-500/20' :
                            req.status === 'rejected' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' :
                              'bg-primary-500/10 text-primary-600 border-primary-500/20'
                        }`}>
                        {req.status === 'pending' && <Clock className="w-3 h-3" />}
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        {req.status === 'paid' && <CreditCard className="w-3 h-3" />}
                        {req.status === 'pending' ? 'Pending' : req.status === 'approved' ? 'Approved' : req.status === 'rejected' ? 'Rejected' : req.status === 'paid' ? 'Paid' : req.status}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateStatus(req._id, 'approved')} className="p-2 bg-primary-600 text-white rounded-lg shadow-sm"><CheckCircle2 className="w-4 h-4" /></motion.button>
                          <motion.button whileHover={{ scale: 1.05 }} onClick={() => updateStatus(req._id, 'rejected')} className="p-2 bg-primary-600 text-white rounded-lg shadow-sm"><XCircle className="w-4 h-4" /></motion.button>
                        </div>
                      )}
                      {req.status === 'approved' && (
                        <motion.button whileHover={{ scale: 1.02 }} onClick={() => updateStatus(req._id, 'paid')} className="shrink-0 px-4 py-2 bg-primary-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2">
                          <Send className="w-3 h-3" /> Mark as Paid
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-auto grid content-start items-start grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-8">
                  {items.map((req, idx) => (
                    <motion.div key={req._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm relative font-outfit overflow-hidden group hover:border-primary-500/20 transition-all">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-primary-600" />
                      <div className="flex justify-between items-start mb-4 lg:mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center font-black italic shadow-sm text-xs">{req.userId?.name?.[0] || 'U'}</div>
                          <div>
                            <h3 className="text-md font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">{req.userId?.name || 'N/A'}</h3>
                            <div className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{req.requestType} wallet</div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg lg:rounded-xl text-[8px] font-black uppercase border-2 ${req.status === 'pending' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' : req.status === 'rejected' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' : 'bg-primary-500/10 text-primary-600 border-primary-500/20'}`}>{req.status === 'pending' ? 'Pending' : req.status === 'approved' ? 'Approved' : req.status === 'rejected' ? 'Rejected' : req.status === 'paid' ? 'Paid' : req.status}</div>
                      </div>

                      <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 mb-4 lg:mb-8 border-2 border-slate-100 dark:border-white/5">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Withdrawal Amount</div>
                        <div className="text-3xl font-black text-primary-600 italic tracking-tighter leading-none mb-4">{formatCurrency(req.amount)}</div>
                        <div className="pt-4 border-t-2 border-slate-100 dark:border-white/5">
                          {req.upi ? (
                            <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-primary-600" /><span className="text-xs font-black font-mono text-slate-600 dark:text-slate-300">{req.upi}</span></div>
                          ) : req.bankDetail ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-3 text-[10px] font-black text-black dark:text-white"><Landmark className="w-4 h-4" /> {req.bankDetail.bankName}</div>
                              <div className="text-xs font-black font-mono text-slate-600 dark:text-slate-300 pl-7">{req.bankDetail.accountNumber}</div>
                            </div>
                          ) : <span className="text-[10px] italic opacity-40">No payment details provided</span>}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-auto">
                        {req.status === 'pending' ? (
                          <>
                            <motion.button onClick={() => updateStatus(req._id, 'approved')} whileHover={{ scale: 1.02 }} className="flex-1 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Approve</motion.button>
                            <motion.button onClick={() => updateStatus(req._id, 'rejected')} whileHover={{ scale: 1.02 }} className="p-4 bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-2xl border border-black/20 dark:border-white/20 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"><XCircle className="w-5 h-5" /></motion.button>
                          </>
                        ) : req.status === 'approved' ? (
                          <motion.button onClick={() => updateStatus(req._id, 'paid')} whileHover={{ scale: 1.02 }} className="w-full py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center justify-center gap-2"><CreditCard className="w-4 h-4" /> Mark as Paid</motion.button>
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
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawRequests;

