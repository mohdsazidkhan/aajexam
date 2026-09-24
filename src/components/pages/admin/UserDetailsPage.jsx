'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Calendar, Phone, Crown, Instagram, Facebook,
  Youtube, Search, LayoutGrid, List, Table as TableIcon,
  MailWarning, ChevronRight, Users, DownloadCloud
} from "lucide-react";

import Pagination from "../../Pagination";
import ViewToggle from "../../ViewToggle";
import SearchFilter from "../../SearchFilter";
import ResponsiveTable from "../../ResponsiveTable";
import { isMobile } from "react-device-detect";
import API from '../../../lib/api';
import useDebounce from "../../../hooks/useDebounce";
import { useSSR } from '../../../hooks/useSSR';
import Sidebar from "../../Sidebar";
import Link from 'next/link';
import { AdminDetailSkeleton } from '../../admin/Skeletons';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


const PAGE_LIMIT = DEFAULT_PAGE_SIZE;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day}-${month}-${year} at ${time}`;
};

export default function UserDetailsPage() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [userDetails, setUserDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(PAGE_LIMIT);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({});
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
  const handleItemsPerPageChange = (l) => {
    setItemsPerPage(l); setLimit(l); setPage(1);
  };

  const columns = [
    {
      key: 'profile', header: 'Profile', render: (_, u) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center font-black text-sm uppercase shadow-sm animate-in">{u.name?.[0] || 'U'}</div>
          <div>
            <Link href={`/u/${u.username}`} target="_blank" className="text-sm font-black text-slate-900 dark:text-white uppercase leading-none mb-1 hover:text-primary-600 transition-colors tracking-tight block">{u.name || 'Anonymous'}</Link>
            <Link href={`/u/${u.username}`} target="_blank" className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic hover:text-primary-600 transition-colors">{u.username ? `@${u.username}` : '@unknown'}</Link>
          </div>
        </div>
      )
    },
    {
      key: 'contact', header: 'Contact Information', render: (_, u) => (
        <div className="space-y-1">
          <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-2"><Mail className="w-3" /> {u.email || 'N/A'}</div>
          <div className="text-[9px] font-black text-slate-400 flex items-center gap-2"><Phone className="w-3" /> {u.phone || 'No phone'}</div>
        </div>
      )
    },
    {
      key: 'joined', header: 'Joined', render: (_, u) => (
        <div className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{formatDate(u.createdAt)}</div>
      )
    },
    {
      key: 'plan', header: 'Plan', align: 'right', render: (_, u) => (
        <div className="flex flex-col items-end gap-1">
          <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${u.subscriptionStatus === 'PRO' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>{u.subscriptionStatus || 'FREE'}</div>
        </div>
      )
    },
    {
      key: 'social', header: 'Social Links', align: 'right', render: (_, u) => (
        <div className="flex justify-end gap-2">
          {[
            { icon: Instagram, link: u.socialLinks?.instagram, color: 'text-black dark:text-white' },
            { icon: Facebook, link: u.socialLinks?.facebook, color: 'text-black dark:text-white' },
            { icon: Youtube, link: u.socialLinks?.youtube, color: 'text-black dark:text-white' }
          ].map((s, idx) => (
            s.link ? (
              <a key={idx} href={s.link} target="_blank" className={`p-2 bg-slate-50 dark:bg-white/5 rounded-lg hover:scale-110 transition-all ${s.color}`}><s.icon className="w-4 h-4" /></a>
            ) : null
          ))}
          {!u.socialLinks && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">None linked</span>}
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by name, email, or username..."
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[{ icon: TableIcon, id: 'table', label: 'Table View' }, { icon: List, id: 'list', label: 'List View' }, { icon: LayoutGrid, id: 'grid', label: 'Grid View' }].map((mode) => (
        <button key={mode.id} onClick={() => setViewMode(mode.id)} title={mode.label} className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const exportButton = (
    <button className="w-full col-span-2 lg:col-span-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg lg:rounded-xl font-bold text-sm hover:bg-primary-700">
      <DownloadCloud className="w-4 h-4" /> Export
    </button>
  );

  const paginationControl = (
    <Pagination
      compact
      currentPage={pagination.currentPage || page}
      totalPages={pagination.totalPages || 1}
      onPageChange={handlePageChange}
      totalItems={pagination.total || 0}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );

  useAdminMobileHeader({
    title: 'User Details',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {exportButton}
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

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-32"><AdminDetailSkeleton /></div>
          ) : error ? (
            <div className="text-center py-32">
              <div className="p-3 lg:p-8 bg-black/10 dark:bg-white/10 rounded-lg lg:rounded-xl xl:rounded-[3rem] mb-6 border-2 border-dashed border-black/20 dark:border-white/20 inline-block"><MailWarning className="w-16 h-16 text-black dark:text-white" /></div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase mb-2">Connection Problem</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
              <button onClick={() => fetchUserDetails(page, limit, searchTerm)} className="mt-4 lg:mt-8 px-4 lg:px-10 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">Try Again</button>
            </div>
          ) : userDetails.length === 0 ? (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
              <Users className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tighter">No Users Found</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Try adjusting your search to find students.</p>
            </div>
          ) : (
            <motion.div key={viewMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-auto flex flex-col">
              {viewMode === 'table' && (
                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 overflow-hidden shadow-sm flex-1 min-h-0 overflow-auto flex flex-col">
                  <ResponsiveTable data={userDetails} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} fillHeight />
                </div>
              )}

              {viewMode === 'grid' && (
                <div className="flex-1 min-h-0 overflow-auto grid content-start items-start grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-8">
                  {userDetails.map((u, i) => (
                    <motion.div key={u._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm text-center group relative overflow-hidden flex flex-col font-outfit">
                      <div className={`absolute top-0 left-0 w-full h-1.5 ${u.subscriptionStatus ==='PRO'?'bg-primary-600':'bg-primary-600'}`} />
                      <div className="mb-6 mx-auto relative">
                        <div className="w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-sm group-hover:rotate-6 transition-all">{u.name?.[0] || 'U'}</div>
                        <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{(page - 1) * itemsPerPage + i + 1}</span>
                        {u.subscriptionStatus === 'PRO' && <div className="absolute -bottom-2 -right-2 p-1.5 bg-white dark:bg-[#0D1225] rounded-lg lg:rounded-xl border-2 border-black dark:border-white shadow-sm"><Crown className="w-4 h-4 text-black dark:text-white" /></div>}
                      </div>
                      <Link href={`/u/${u.username}`} target="_blank" className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 truncate hover:text-primary-600 transition-colors block">{u.name || 'Anonymous'}</Link>
                      <Link href={`/u/${u.username}`} target="_blank" className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 lg:mb-8 hover:text-primary-600 transition-colors block">{u.username ? `@${u.username}` : '@unknown'}</Link>

                      <div className="space-y-2 lg:space-y-4 mb-4 lg:mb-8">
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase truncate bg-slate-50/50 dark:bg-white/5 p-3 rounded-lg lg:rounded-xl border border-slate-100 dark:border-white/5"><Mail className="w-4 text-black/50 dark:text-white/50" /> {u.email || 'N/A'}</div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase bg-slate-50/50 dark:bg-white/5 p-3 rounded-lg lg:rounded-xl border border-slate-100 dark:border-white/5"><Phone className="w-4 text-primary-500/50" /> {u.phone || 'N/A'}</div>
                        <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 bg-slate-50/50 dark:bg-white/5 p-3 rounded-lg lg:rounded-xl border border-slate-100 dark:border-white/5"><Calendar className="w-4 text-primary-500/50 shrink-0" /> {formatDate(u.createdAt)}</div>
                      </div>

                      <Link href={`/u/${u.username}`} target="_blank" className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm group-hover:bg-primary-700 group-hover:text-white transition-all text-center block">View Full Profile</Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="flex-1 min-h-0 overflow-auto space-y-3 lg:space-y-6">
                  {userDetails.map((u, i) => (
                    <motion.div key={u._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-lg lg:rounded-xl xl:rounded-[3rem] border-2 border-slate-100 dark:border-white/10 p-3 lg:p-8 shadow-sm flex flex-col md:flex-row md:items-center gap-3 lg:gap-8 group hover:border-primary-500/30 transition-all font-outfit">
                      <div className="relative w-20 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg lg:rounded-xl xl:rounded-[2.5rem] flex items-center justify-center font-black text-4xl shadow-sm shrink-0">
                        {u.name?.[0] || 'U'}
                        <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-primary-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-[#0D1225]">{(page - 1) * itemsPerPage + i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                          <div>
                            <Link href={`/u/${u.username}`} target="_blank" className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1 hover:text-primary-600 transition-colors block">{u.name || 'Anonymous'}</Link>
                            <div className="flex items-center gap-3">
                              <Link href={`/u/${u.username}`} target="_blank" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-600 transition-colors">@{u.username || 'unknown'}</Link>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-10 pt-4 border-t border-slate-100 dark:border-white/5">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest"><Mail className="w-4 text-black/50 dark:text-white/50" /> {u.email || 'No email'}</div>
                          <div className="flex items-center gap-2 text-[9px] font-black text-slate-400"><Calendar className="w-4 text-primary-500/50" /> {formatDate(u.createdAt)}</div>
                          <div className={`px-4 py-1 rounded-lg lg:rounded-xl text-[9px] font-black uppercase tracking-widest border ${u.subscriptionStatus === 'PRO' ? 'bg-black/10 dark:bg-white/10 text-black dark:text-white border-black/20 dark:border-white/20' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>{u.subscriptionStatus || 'FREE'} Member</div>
                        </div>
                      </div>
                      <button className="p-6 bg-slate-100 dark:bg-white/5 text-primary-600 rounded-3xl hover:bg-primary-700 hover:text-white transition-all shadow-sm"><ChevronRight className="w-6 h-6" /></button>
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
}

