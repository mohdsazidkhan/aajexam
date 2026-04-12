'use client';

import { useEffect, useState } from "react";

import Pagination from "../../Pagination";
import ViewToggle from "../../ViewToggle";
import SearchFilter from "../../SearchFilter";
import { isMobile } from "react-device-detect";
import API from '../../../lib/api';
import {
  User, Mail, Calendar, University, Phone, CreditCard,
  Building, Key, Crown, UserCheck, Search, Filter,
  Table as TableIcon, LayoutGrid, List, ChevronRight,
  TrendingUp, Activity, Hash, Info, Zap, Settings, ArrowRight
} from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";
import Loading from "../../Loading";
import { motion, AnimatePresence } from 'framer-motion';
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../../Sidebar";


const PAGE_LIMIT = 10;

export default function AdminBankDetails() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [bankDetails, setBankDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  // const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(isMobile ? "grid" : "table");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const debouncedSearch = useDebounce(searchTerm, 1000); // 1s delay

  useEffect(() => {
    fetchBankDetails(page, limit, debouncedSearch);
  }, [debouncedSearch, page, limit]);

  const fetchBankDetails = async (page = 1, limit = 10, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      };

      const data = await API.getAdminBankDetails(params);
      if (data?.success || data?.bankDetails) {
        setBankDetails(data.bankDetails || []);
        // setTotal(data.pagination?.total || 0);
        setLimit(data.pagination?.limit || limit);
        setPagination({
          currentPage: data.pagination?.currentPage || data.pagination?.page || page,
          totalPages: data.pagination?.totalPages || 0,
          total: data.pagination?.total || 0,
          hasNextPage: data.pagination?.hasNextPage || data.pagination?.hasNext || false,
          hasPrevPage: data.pagination?.hasPrevPage || data.pagination?.hasPrev || false,
        });
      } else {
        setError(data.message || "Failed to fetch bank details");
      }
    } catch (err) {
      console.error('Error fetching bank details:', err);
      if (err.response) {
        setError(`Failed to fetch bank details: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.message) {
        setError(`Failed to fetch bank details: ${err.message}`);
      } else {
        setError("Failed to fetch bank details");
      }
    }
    setLoading(false);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSubscriptionBadge = (status) => {
    const configs = {
      free: "text-slate-500 bg-slate-500/10 border-slate-500/20",
      basic: "text-primary-500 bg-primary-500/10 border-primary-500/20",
      premium: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      pro: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 ${configs[status?.toLowerCase()] || configs.free}`}>
        {status || 'FREE'}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    return (
      <span className="px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500 border-2 border-primary-500/20">
        Level {level}
      </span>
    );
  };

  const TableView = () => (
    <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 shadow-2xl overflow-hidden">
      <div className="overflow-x-auto selection:bg-primary-500/30">
        <table className="w-full border-separate border-spacing-y-4 px-4 lg:px-8 py-4">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left">
              <th className="px-3 lg:px-6 py-4">USER</th>
              <th className="px-3 lg:px-6 py-4">ACCOUNT DETAILS</th>
              <th className="px-3 lg:px-6 py-4">BANK INFORMATION</th>
              <th className="px-3 lg:px-6 py-4">PLAN</th>
              <th className="px-3 lg:px-6 py-4">ADDED ON</th>
            </tr>
          </thead>
          <tbody>
            {bankDetails.map((detail, index) => (
              <tr
                key={detail._id}
                className="group bg-slate-50/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm hover:shadow-xl rounded-3xl"
              >
                <td className="px-3 lg:px-6 py-3 lg:py-6 first:rounded-l-[2rem]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 p-[2px] shadow-lg group-hover:rotate-6 transition-transform">
                      <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-primary-500">
                        {detail.user?.name?.charAt(0) || <User className="w-4 h-4" />}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors">
                        {detail.user?.name || "N/A"}
                      </div>
                      <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {detail.user?.email || "N/A"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-3 lg:py-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      <User className="w-3.5 h-3.5 mr-2 text-primary-500" />
                      {detail.accountHolderName}
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-slate-400 tabular-nums">
                      <CreditCard className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      {detail.accountNumber}
                    </div>
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-3 lg:py-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">
                      <University className="w-3.5 h-3.5 mr-2 text-primary-500" />
                      {detail.bankName}
                    </div>
                    <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <Key className="w-3.5 h-3.5 mr-2 text-slate-400" />
                      {detail.ifscCode}
                    </div>
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-3 lg:py-6">
                  <div className="flex flex-wrap gap-2">
                    {detail.user?.subscriptionStatus && (
                      <div className="flex items-center">
                        <Crown className="w-3 h-3 mr-1.5 text-amber-500" />
                        {getSubscriptionBadge(detail.user.subscriptionStatus)}
                      </div>
                    )}
                    {detail.user?.currentLevel !== undefined && (
                      <div className="flex items-center">
                        <UserCheck className="w-3 h-3 mr-1.5 text-primary-500" />
                        {getLevelBadge(detail.user.currentLevel)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 lg:px-6 py-3 lg:py-6 last:rounded-r-[2rem]">
                  <div className="text-[10px] font-black text-slate-400 tabular-nums uppercase">
                    {formatDate(detail.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-8">
      {bankDetails.map((detail, i) => (
        <motion.div
          key={detail._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-2xl hover:border-primary-500/30 transition-all overflow-hidden cursor-default"
        >
          <div className="flex items-center justify-between mb-4 lg:mb-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 p-[2px] shadow-xl group-hover:rotate-6 transition-transform">
                <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xl text-primary-500">
                  {detail.user?.name?.charAt(0) || <User className="w-6 h-6" />}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors">
                  {detail.user?.name || "N/A"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">
                  {detail.user?.email || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {detail.user?.subscriptionStatus && getSubscriptionBadge(detail.user.subscriptionStatus)}
              {detail.user?.currentLevel !== undefined && getLevelBadge(detail.user.currentLevel)}
            </div>
          </div>

          <div className="space-y-3 lg:space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-slate-100 dark:border-white/5 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ACCOUNT HOLDER</span>
                <div className="flex items-center text-xs font-black text-slate-900 dark:text-white uppercase">
                  {detail.accountHolderName}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ACCOUNT NUMBER</span>
                <div className="flex items-center text-xs font-black text-slate-900 dark:text-white tabular-nums">
                  {detail.accountNumber}
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary-500/5 rounded-3xl border-2 border-primary-500/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <University className="w-4 h-4 text-primary-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BANK NAME</span>
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase text-right">
                  {detail.bankName}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-primary-500/10">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IFSC CODE</span>
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase tabular-nums">
                  {detail.ifscCode}
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-primary-500/10">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary-500" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">BRANCH</span>
                </div>
                <div className="text-xs font-black text-slate-900 dark:text-white uppercase text-right">
                  {detail.branchName}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                ADDED: {formatDate(detail.createdAt)}
              </div>
              <div className="text-[8px] font-black text-primary-500/50 uppercase tracking-widest">
                ID: {detail._id?.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl group-hover:bg-primary-500/10 transition-colors" />
        </motion.div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="space-y-3 lg:space-y-6">
      {bankDetails.map((detail, i) => (
        <motion.div
          key={detail._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group relative bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-xl lg:rounded-[2.5rem] border-4 border-slate-100 dark:border-white/10 p-6 shadow-xl hover:border-primary-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-8"
        >
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500 to-indigo-500 p-[2px] shadow-lg group-hover:rotate-6 transition-transform">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xl text-primary-500">
                {detail.user?.name?.charAt(0) || <User className="w-6 h-6" />}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-500 transition-colors">
                {detail.user?.name || "N/A"}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest line-clamp-1">
                {detail.user?.email || "N/A"}
              </p>
              <div className="flex gap-2 mt-2">
                {detail.user?.subscriptionStatus && getSubscriptionBadge(detail.user.subscriptionStatus)}
                {detail.user?.currentLevel !== undefined && getLevelBadge(detail.user.currentLevel)}
              </div>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 lg:mx-8">
            <div className="px-3 lg:px-6 py-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-white/5 flex gap-4 items-center">
              <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ACCOUNT DETAIL</span>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase line-clamp-1">{detail.accountHolderName}</span>
                <span className="text-[10px] font-bold text-slate-500 tabular-nums">{detail.accountNumber}</span>
              </div>
            </div>

            <div className="px-3 lg:px-6 py-4 bg-primary-500/5 rounded-2xl border-2 border-primary-500/10 flex gap-4 items-center">
              <div className="p-2.5 bg-primary-500/10 text-primary-500 rounded-xl">
                <University className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">BANK</span>
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase line-clamp-1">{detail.bankName}</span>
                <span className="text-[10px] font-bold text-slate-500 tabular-nums uppercase">{detail.ifscCode}</span>
              </div>
            </div>
          </div>

          <div className="lg:w-32 text-right">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ADDED ON</div>
            <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums uppercase">{formatDate(detail.createdAt)}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen font-outfit text-slate-900 dark:text-white pb-20">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit">

    <div className="mx-auto">
      {/* Header section with Stats & Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-4 lg:p-12 mb-4 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 lg:p-12 opacity-5 translate-x-12 translate-y-[-12] group-hover:rotate-12 transition-transform">
          <University className="w-64 h-64 text-primary-500" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-500/20 text-primary-500 rounded-2xl">
                <University className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">ADMIN / BANK DETAILS</span>
            </div>

            <h1 className="text-3xl lg:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none font-outfit">
              BANK <span className="text-primary-500">DETAILS</span>
            </h1>

            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-xl leading-relaxed">
              View bank account details submitted by students for processing withdrawals.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL ENTRIES</span>
            <div className="flex items-center gap-3 text-2xl lg:text-5xl lg:text-7xl font-black text-primary-500 tabular-nums italic tracking-tighter">
              <Hash className="w-10 h-10 lg:w-16 lg:h-16 stroke-[3]" />
              {pagination.total || 0}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-6 rounded-xl lg:rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 shadow-xl">
        <div className="lg:col-span-2">
          <div className="relative group/search">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, or bank details..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-14 pr-8 py-4 bg-slate-100 dark:bg-white/5 border-2 border-transparent focus:border-primary-500/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-white/5 p-2 rounded-2xl border-2 border-slate-200/50 dark:border-white/5 w-full lg:w-auto">
          {[
            { mode: 'table', icon: TableIcon },
            { mode: 'grid', icon: LayoutGrid },
            { mode: 'list', icon: List }
          ].map(({ mode, icon: Icon }) => (
            <motion.button
              key={mode}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(mode)}
              className={`flex-1 p-3 rounded-xl transition-all flex items-center justify-center ${viewMode === mode ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Icon className="w-4 h-4" />
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-white/5 px-3 lg:px-6 py-2 rounded-2xl border-2 border-slate-200/50 dark:border-white/5 w-full lg:w-auto">
          <Settings className="w-4 h-4 text-slate-400" />
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = Number(e.target.value);
              setItemsPerPage(newItemsPerPage);
              setLimit(newItemsPerPage);
              setPage(1);
            }}
            className="w-full lg:w-auto bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 outline-none cursor-pointer flex-1"
          >
            {[5, 10, 20, 50, 100, 250, 500].map(v => <option key={v} value={v}>Show {v} items</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loading size="lg" color="yellow" message="Loading bank details..." />
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border-4 border-rose-500/20 rounded-2xl lg:rounded-[3.5rem] p-4 lg:p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-4 lg:mb-8 shadow-lg shadow-rose-500/30">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Error Loading Bank Details</h3>
          <p className="text-rose-500 font-bold uppercase text-sm tracking-widest">{error}</p>
        </div>
      ) : bankDetails.length === 0 ? (
        <div className="bg-slate-100 dark:bg-white/5 border-4 border-slate-200 dark:border-white/5 rounded-2xl lg:rounded-[3.5rem] p-24 text-center shadow-2xl">
          <University className="w-24 h-24 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
          <h3 className="text-xl lg:text-2xl font-black text-slate-400 uppercase tracking-tighter">No Bank Details Found</h3>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-4">
            {searchTerm
              ? "No bank details match your search."
              : "No students have submitted their bank details yet."}
          </p>
        </div>
      ) : (
        <>
          {viewMode === "table" && <TableView />}
          {viewMode === "grid" && <CardView />}
          {viewMode === "list" && <ListView />}
        </>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          totalItems={pagination.total}
          itemsPerPage={itemsPerPage}
        />
      )}
      </div>
    </div>
  </div>
  );
}



