'use client';

import { useEffect, useState } from "react";

import Pagination from "../../Pagination";
import { isMobile } from "react-device-detect";
import API from '../../../lib/api';
import ResponsiveTable from '../../ResponsiveTable';
import {
  User, Mail, University, CreditCard,
  Key, Crown, Search,
  Table as TableIcon, LayoutGrid, List,
  Zap
} from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../../Sidebar";
import { AdminTableSkeleton } from '../../skeletons/AdminSkeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';


const PAGE_LIMIT = DEFAULT_PAGE_SIZE;

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
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({});

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("userInfo") || 'null') : null;
  const debouncedSearch = useDebounce(searchTerm, 1000); // 1s delay

  useEffect(() => {
    fetchBankDetails(page, limit, debouncedSearch);
  }, [debouncedSearch, page, limit]);

  const fetchBankDetails = async (page = 1, limit = DEFAULT_PAGE_SIZE, search = "") => {
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

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setLimit(newItemsPerPage);
    setPage(1);
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
      basic: "text-primary-600 bg-primary-500/10 border-primary-500/20",
      premium: "text-black dark:text-white bg-black/10 dark:bg-white/10 border-black/20 dark:border-white/20",
      pro: "text-primary-600 bg-primary-500/10 border-primary-500/20",
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 ${configs[status?.toLowerCase()] || configs.free}`}>
        {status || 'FREE'}
      </span>
    );
  };

  const bankDetailsColumns = [
    {
      key: 'user', header: 'USER', render: (_, detail) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-600 p-[2px] shadow-sm group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-xs text-primary-600">
              {detail.user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors">
              {detail.user?.name || "N/A"}
            </div>
            <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              <Mail className="w-3 h-3 mr-1" />
              {detail.user?.email || "N/A"}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'account', header: 'ACCOUNT DETAILS', render: (_, detail) => (
        <div className="space-y-1">
          <div className="flex items-center text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            <User className="w-3.5 h-3.5 mr-2 text-primary-600" />
            {detail.accountHolderName}
          </div>
          <div className="flex items-center text-[10px] font-bold text-slate-400 tabular-nums">
            <CreditCard className="w-3.5 h-3.5 mr-2 text-slate-400" />
            {detail.accountNumber}
          </div>
        </div>
      )
    },
    {
      key: 'bank', header: 'BANK INFORMATION', render: (_, detail) => (
        <div className="space-y-1">
          <div className="flex items-center text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">
            <University className="w-3.5 h-3.5 mr-2 text-primary-600" />
            {detail.bankName}
          </div>
          <div className="flex items-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <Key className="w-3.5 h-3.5 mr-2 text-slate-400" />
            {detail.ifscCode}
          </div>
        </div>
      )
    },
    {
      key: 'plan', header: 'PLAN', render: (_, detail) => (
        <div className="flex flex-wrap gap-2">
          {detail.user?.subscriptionStatus && (
            <div className="flex items-center">
              <Crown className="w-3 h-3 mr-1.5 text-black dark:text-white" />
              {getSubscriptionBadge(detail.user.subscriptionStatus)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt', header: 'ADDED ON', render: (_, detail) => (
        <div className="text-[10px] font-black text-slate-400 tabular-nums uppercase">
          {formatDate(detail.createdAt)}
        </div>
      )
    }
  ];

  const TableView = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      <ResponsiveTable
        data={bankDetails}
        columns={bankDetailsColumns}
        viewModes={['table']}
        defaultView="table"
        showPagination={false}
        showViewToggle={false}
        fillHeight
      />
    </div>
  );

  const CardView = () => (
    <div className="h-full overflow-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
      {bankDetails.map((detail) => (
        <div key={detail._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-black text-sm text-white shrink-0">
                {detail.user?.name?.charAt(0) || <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{detail.user?.name || "N/A"}</h3>
                <p className="text-[10px] text-slate-400 truncate">{detail.user?.email || "N/A"}</p>
              </div>
            </div>
            {detail.user?.subscriptionStatus && getSubscriptionBadge(detail.user.subscriptionStatus)}
          </div>

          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-400 uppercase">Account Holder</span>
              <span className="font-black text-slate-900 dark:text-white">{detail.accountHolderName}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200 dark:border-white/5">
              <span className="font-bold text-slate-400 uppercase">Account No.</span>
              <span className="font-black text-slate-900 dark:text-white tabular-nums">{detail.accountNumber}</span>
            </div>
          </div>

          <div className="p-3 bg-primary-500/5 rounded-xl border border-primary-500/10 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-slate-400 uppercase">Bank</span>
              <span className="font-black text-slate-900 dark:text-white">{detail.bankName}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-primary-500/10">
              <span className="font-bold text-slate-400 uppercase">IFSC</span>
              <span className="font-black text-slate-900 dark:text-white tabular-nums">{detail.ifscCode}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-primary-500/10">
              <span className="font-bold text-slate-400 uppercase">Branch</span>
              <span className="font-black text-slate-900 dark:text-white">{detail.branchName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
            <span>Added {formatDate(detail.createdAt)}</span>
            <span className="text-primary-600">#{detail._id?.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="h-full overflow-auto space-y-3">
      {bankDetails.map((detail) => (
        <div key={detail._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-black text-sm text-white shrink-0">
              {detail.user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{detail.user?.name || "N/A"}</h3>
              <p className="text-[10px] text-slate-400">{detail.user?.email || "N/A"}</p>
              {detail.user?.subscriptionStatus && <div className="mt-1">{getSubscriptionBadge(detail.user.subscriptionStatus)}</div>}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 lg:mx-4">
            <div className="px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 flex gap-2 items-center">
              <CreditCard className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-white truncate">{detail.accountHolderName}</div>
                <div className="text-[10px] text-slate-400 tabular-nums">{detail.accountNumber}</div>
              </div>
            </div>

            <div className="px-3 py-2 bg-primary-500/5 rounded-lg border border-primary-500/10 flex gap-2 items-center">
              <University className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-black text-slate-900 dark:text-white truncate">{detail.bankName}</div>
                <div className="text-[10px] text-slate-400 tabular-nums">{detail.ifscCode}</div>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[9px] font-bold text-slate-400 uppercase">Added</div>
            <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{formatDate(detail.createdAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] max-md:h-[calc(100vh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><University className="w-6 h-6 text-primary-600 shrink-0" /> Bank Details <span className="text-slate-400 dark:text-slate-500">({pagination.total || 0})</span></h1>

          <div className="grid grid-cols-2 lg:flex lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
            <div className="relative col-span-2 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or bank details..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              {[
                { mode: 'table', icon: TableIcon, label: 'Table View' },
                { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
                { mode: 'list', icon: List, label: 'List View' }
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={label}
                  className={`p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : error ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-2">Error Loading Bank Details</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
          </div>
        ) : bankDetails.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
            <University className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-500 uppercase">No Bank Details Found</h3>
            <p className="text-sm text-slate-400 mt-2">
              {searchTerm
                ? "No bank details match your search."
                : "No students have submitted their bank details yet."}
            </p>
          </div>
        ) : (
          <>
          <div className="flex-1 min-h-0 overflow-hidden">
            {viewMode === "table" && <TableView />}
            {viewMode === "grid" && <CardView />}
            {viewMode === "list" && <ListView />}
          </div>

          {pagination.total > 0 && (
            <div className="shrink-0">
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages || 1}
                onPageChange={handlePageChange}
                totalItems={pagination.total || 0}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}



