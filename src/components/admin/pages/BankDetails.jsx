'use client';

import { useEffect, useState } from "react";

import Pagination from "../../common/Pagination";
import { isMobile } from "react-device-detect";
import API from '../../../lib/api';
import ResponsiveTable from '../../common/ResponsiveTable';
import {
  User, Mail, University, CreditCard,
  Key, Crown, Search,
  Table as TableIcon, LayoutGrid, List,
  Zap
} from "lucide-react";
import useDebounce from "../../../hooks/useDebounce";
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../Sidebar";
import { AdminTableSkeleton } from '../Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


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
      free: "text-content-muted bg-slate-500/10 border-slate-500/20",
      basic: "text-primary-600 border-primary-500/20",
      premium: "text-content-primary bg-black/10 dark:bg-white/10 border-border-primary",
      pro: "text-primary-600 border-primary-500/20",
    };

    return (
      <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-[0.08em] border ${configs[status?.toLowerCase()] || configs.free}`}>
        {status || 'FREE'}
      </span>
    );
  };

  const bankDetailsColumns = [
    {
      key: 'user', header: 'USER', render: (_, detail) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary-600 p-[2px] group-hover:rotate-6 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-background-surface flex items-center justify-center font-bold text-xs text-primary-600">
              {detail.user?.name?.charAt(0) || <User className="w-4 h-4" />}
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-content-primary uppercase tracking-tight group-hover:text-primary-600 transition-colors">
              {detail.user?.name || "N/A"}
            </div>
            <div className="flex items-center text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mt-1">
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
          <div className="flex items-center text-xs font-bold text-content-primary uppercase tracking-tight">
            <User className="w-3.5 h-3.5 mr-2 text-primary-600" />
            {detail.accountHolderName}
          </div>
          <div className="flex items-center text-[10px] font-bold text-content-muted tabular-nums">
            <CreditCard className="w-3.5 h-3.5 mr-2 text-content-muted" />
            {detail.accountNumber}
          </div>
        </div>
      )
    },
    {
      key: 'bank', header: 'BANK INFORMATION', render: (_, detail) => (
        <div className="space-y-1">
          <div className="flex items-center text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] leading-none mb-1">
            <University className="w-3.5 h-3.5 mr-2 text-primary-600" />
            {detail.bankName}
          </div>
          <div className="flex items-center text-[9px] font-bold text-content-muted uppercase tracking-[0.08em]">
            <Key className="w-3.5 h-3.5 mr-2 text-content-muted" />
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
              <Crown className="w-3 h-3 mr-1.5 text-content-primary" />
              {getSubscriptionBadge(detail.user.subscriptionStatus)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'createdAt', header: 'ADDED ON', render: (_, detail) => (
        <div className="text-[10px] font-bold text-content-muted tabular-nums uppercase">
          {formatDate(detail.createdAt)}
        </div>
      )
    }
  ];

  const TableView = () => (
    <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden h-auto flex flex-col relative">
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
    <div className="grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
      {bankDetails.map((detail, idx) => (
        <section key={detail._id} className="bg-background-surface rounded-2xl border border-border-primary p-4 flex flex-col gap-3 relative">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-sm text-on-primary shrink-0">
                {detail.user?.name?.charAt(0) || <User className="w-4 h-4" />}
                <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{(page - 1) * limit + idx + 1}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-content-primary truncate">{detail.user?.name || "N/A"}</h3>
                <p className="text-[10px] text-content-muted truncate">{detail.user?.email || "N/A"}</p>
              </div>
            </div>
            {detail.user?.subscriptionStatus && getSubscriptionBadge(detail.user.subscriptionStatus)}
          </div>

          <div className="p-3 rounded-xl border border-border-primary space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-content-muted uppercase">Account Holder</span>
              <span className="font-bold text-content-primary">{detail.accountHolderName}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-border-primary">
              <span className="font-bold text-content-muted uppercase">Account No.</span>
              <span className="font-bold text-content-primary tabular-nums">{detail.accountNumber}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-primary-500/10 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold text-content-muted uppercase">Bank</span>
              <span className="font-bold text-content-primary">{detail.bankName}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-primary-500/10">
              <span className="font-bold text-content-muted uppercase">IFSC</span>
              <span className="font-bold text-content-primary tabular-nums">{detail.ifscCode}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-primary-500/10">
              <span className="font-bold text-content-muted uppercase">Branch</span>
              <span className="font-bold text-content-primary">{detail.branchName}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] font-bold text-content-muted">
            <span>Added {formatDate(detail.createdAt)}</span>
            <span className="text-primary-600">#{detail._id?.slice(-8).toUpperCase()}</span>
          </div>
        </section>
      ))}
    </div>
  );

  const ListView = () => (
    <div className="h-full overflow-auto space-y-3">
      {bankDetails.map((detail, idx) => (
        <section key={detail._id} className="bg-background-surface rounded-xl border border-border-primary p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3 xl:gap-3 relative">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-sm text-on-primary shrink-0">
              {detail.user?.name?.charAt(0) || <User className="w-4 h-4" />}
              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-on-primary text-[9px] font-bold flex items-center justify-center z-10 ring-2 ring-white dark:ring-slate-800 bg-primary-600">{(page - 1) * limit + idx + 1}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-content-primary">{detail.user?.name || "N/A"}</h3>
              <p className="text-[10px] text-content-muted">{detail.user?.email || "N/A"}</p>
              {detail.user?.subscriptionStatus && <div className="mt-1">{getSubscriptionBadge(detail.user.subscriptionStatus)}</div>}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 xl:mx-4">
            <div className="px-3 py-2 rounded-lg border border-border-primary flex gap-2 items-center">
              <CreditCard className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-content-primary truncate">{detail.accountHolderName}</div>
                <div className="text-[10px] text-content-muted tabular-nums">{detail.accountNumber}</div>
              </div>
            </div>

            <div className="px-3 py-2 rounded-lg border border-primary-500/10 flex gap-2 items-center">
              <University className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-content-primary truncate">{detail.bankName}</div>
                <div className="text-[10px] text-content-muted tabular-nums">{detail.ifscCode}</div>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[9px] font-bold text-content-muted uppercase">Added</div>
            <div className="text-xs font-bold text-content-primary tabular-nums">{formatDate(detail.createdAt)}</div>
          </div>
        </section>
      ))}
    </div>
  );

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
      <input
        type="text"
        placeholder="Search by name, email, or bank details..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-9 pr-4 py-2 bg-background-surface border border-border-primary rounded-lg xl:rounded-xl text-sm"
      />
    </div>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { mode: 'table', icon: TableIcon, label: 'Table View' },
        { mode: 'grid', icon: LayoutGrid, label: 'Grid View' },
        { mode: 'list', icon: List, label: 'List View' }
      ].map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          title={label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode ? 'bg-primary-600 text-on-primary' : 'text-content-muted hover:text-content-primary hover:bg-background-surface-secondary'}`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-[0.08em]">{label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const paginationControl = pagination.total > 0 && (
    <Pagination
      compact
      currentPage={page}
      totalPages={pagination.totalPages || 1}
      onPageChange={handlePageChange}
      totalItems={pagination.total || 0}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );

  useAdminMobileHeader({
    title: 'Bank Details',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

        {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
        {loading ? (
          <AdminTableSkeleton showHeader={false} showFilters={false} />
        ) : error ? (
          <section className="bg-background-surface border border-border-primary rounded-2xl p-12 text-center">
            <Zap className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-content-primary mb-2">Error Loading Bank Details</h3>
            <p className="text-sm text-content-muted">{error}</p>
          </section>
        ) : bankDetails.length === 0 ? (
          <section className="bg-background-surface border border-border-primary rounded-2xl p-12 text-center">
            <University className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-content-muted">No Bank Details Found</h3>
            <p className="text-sm text-content-muted mt-2">
              {searchTerm
                ? "No bank details match your search."
                : "No students have submitted their bank details yet."}
            </p>
          </section>
        ) : (
          <>
          <div className="flex-1 min-h-0 overflow-auto">
            {viewMode === "table" && <TableView />}
            {viewMode === "grid" && <CardView />}
            {viewMode === "list" && <ListView />}
          </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}



