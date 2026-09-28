'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone, Plus, Search, Users, Crown, Gift, User as UserIcon,
  Table as TableIcon, LayoutGrid, List, Calendar, Send
} from 'lucide-react';
import { isMobile } from 'react-device-detect';
import API from '../../../lib/api';
import { useSSR } from '../../../hooks/useSSR';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import ResponsiveTable from '../../ResponsiveTable';
import Pagination from '../../Pagination';
import StyledSelect from '../../ui/StyledSelect';
import AnnounceModal from '../../admin/AnnounceModal';
import Sidebar from '../../Sidebar';
import useDebounce from '../../../hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const TARGET_META = {
  all: { label: 'All Users', icon: Users, className: 'bg-primary-100 text-primary-600 dark:bg-primary-600 dark:text-primary-200' },
  pro: { label: 'PRO Subscribers', icon: Crown, className: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  free: { label: 'Free Users', icon: Gift, className: 'bg-slate-100 dark:bg-slate-800 text-black dark:text-white' },
  users: { label: 'Selected Users', icon: UserIcon, className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  }).format(new Date(dateString));
};

const getTargetTypeLabel = (target, recipientCount) => {
  if (target === 'users') return recipientCount === 1 ? 'Specific User' : 'Selected Users';
  return TARGET_META[target]?.label || TARGET_META.all.label;
};

const TargetTypeTag = ({ target, recipientCount }) => {
  const meta = TARGET_META[target] || TARGET_META.all;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${meta.className}`}>
      <meta.icon className="w-3 h-3" /> {getTargetTypeLabel(target, recipientCount)}
    </span>
  );
};

const TargetBadge = ({ target, recipientCount, recipients }) => {
  if (target === 'users' && recipientCount === 1 && recipients?.[0]?.email) {
    return (
      <span title={recipients[0].name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        <UserIcon className="w-3 h-3 shrink-0" /> {recipients[0].email}
      </span>
    );
  }

  if (target === 'users') {
    const tooltip = (recipients || []).map((r) => r.email).join(', ');
    return (
      <span title={tooltip} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
        <UserIcon className="w-3 h-3" /> {recipientCount} users
      </span>
    );
  }

  return <TargetTypeTag target={target} recipientCount={recipientCount} />;
};

const AnnouncementsPage = () => {
  const { isMounted } = useSSR();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [showCompose, setShowCompose] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const fetchAnnouncements = useCallback(async (pageNum, searchTerm, target) => {
    setLoading(true);
    try {
      const res = await API.getAdminAnnouncements({ page: pageNum, limit: itemsPerPage, search: searchTerm, target });
      if (res?.success) {
        setAnnouncements(res.data || []);
        setPagination(res.pagination || {});
      }
    } catch (e) {
      // swallow — table just shows empty state
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  useEffect(() => {
    fetchAnnouncements(page, debouncedSearch, targetFilter);
  }, [page, debouncedSearch, targetFilter, fetchAnnouncements]);

  useEffect(() => { setPage(1); }, [debouncedSearch, targetFilter]);

  const columns = [
    {
      key: 'title',
      header: 'Announcement',
      render: (_, a) => (
        <div className="max-w-xs">
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{a.title}</div>
          <div className="text-xs text-slate-400 truncate">{a.description}</div>
        </div>
      )
    },
    {
      key: 'sentType',
      header: 'Sent Type',
      render: (_, a) => <TargetTypeTag target={a.target} recipientCount={a.recipientCount} />
    },
    {
      key: 'target',
      header: 'Sent To',
      render: (_, a) => <TargetBadge target={a.target} recipientCount={a.recipientCount} recipients={a.recipients} />
    },
    {
      key: 'recipientCount',
      header: 'Recipients',
      render: (_, a) => <span className="text-sm font-bold text-slate-900 dark:text-white">{a.recipientCount}</span>
    },
    {
      key: 'sentBy',
      header: 'Sent By',
      render: (_, a) => <span className="text-sm text-slate-600 dark:text-slate-300">{a.sentBy?.name || 'Admin'}</span>
    },
    {
      key: 'createdAt',
      header: 'Sent At',
      render: (_, a) => <span className="text-sm text-slate-500 dark:text-slate-400">{formatDateTime(a.createdAt)}</span>
    }
  ];

  const viewToggleButtons = (
    <div className="flex items-center gap-1 w-full">
      {[
        { icon: TableIcon, id: 'table', label: 'Table View' },
        { icon: List, id: 'list', label: 'List View' },
        { icon: LayoutGrid, id: 'grid', label: 'Grid View' }
      ].map((mode) => (
        <button
          key={mode.id}
          onClick={() => setViewMode(mode.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          title={mode.label}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const filters = (
    <>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search title or message..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg xl:rounded-xl text-sm" />
      </div>
      <StyledSelect
        icon={Users}
        value={targetFilter}
        onChange={setTargetFilter}
        options={[
          { value: '', label: 'All Targets' },
          { value: 'all', label: 'All Users' },
          { value: 'pro', label: 'PRO Subscribers' },
          { value: 'free', label: 'Free Users' },
          { value: 'users', label: 'Specific / Selected Users' }
        ]}
        placeholder="All Targets"
        className="w-full xl:w-64"
      />
      {viewToggleButtons}
      <button onClick={() => setShowCompose(true)} className="w-full xl:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg xl:rounded-xl font-bold text-sm hover:bg-primary-700">
        <Plus className="w-4 h-4" /> New Announcement
      </button>
      <Pagination
        compact
        currentPage={page}
        totalPages={pagination.totalPages || 1}
        onPageChange={setPage}
        totalItems={pagination.total || 0}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(val) => { setItemsPerPage(val); setPage(1); }}
      />
    </>
  );

  useAdminMobileHeader({
    title: 'Announcements',
    count: pagination.total || 0,
    filters
  });

  if (!isMounted) return null;

  const renderGridCard = (a, idx) => (
    <div key={a._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="relative w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5" />
          <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
        </div>
        <TargetTypeTag target={a.target} recipientCount={a.recipientCount} />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{a.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{a.description}</p>
      </div>
      {a.target === 'users' && <TargetBadge target={a.target} recipientCount={a.recipientCount} recipients={a.recipients} />}
      <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-slate-100 dark:border-slate-700">
        <span className="flex items-center gap-1"><Send className="w-3 h-3" /> {a.recipientCount} sent</span>
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(a.createdAt)}</span>
      </div>
    </div>
  );

  const renderListRow = (a, idx) => (
    <div key={a._id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
      <div className="relative w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
        <Megaphone className="w-5 h-5" />
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + idx + 1}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 dark:text-white truncate">{a.title}</h3>
        <p className="text-xs text-slate-400 truncate">{a.description}</p>
      </div>
      <span className="text-xs text-slate-400 shrink-0 hidden sm:flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateTime(a.createdAt)}</span>
      {a.target === 'users' && <div className="hidden md:block shrink-0"><TargetTypeTag target={a.target} recipientCount={a.recipientCount} /></div>}
      <TargetBadge target={a.target} recipientCount={a.recipientCount} recipients={a.recipients} />
    </div>
  );

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto">
          {loading ? (
            <AdminTableSkeleton showHeader={false} showFilters={false} />
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Megaphone className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-500 uppercase">No Announcements Yet</h3>
              <p className="text-sm text-slate-400 mt-2">Send your first announcement to see it here.</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden h-auto flex flex-col">
              <ResponsiveTable data={announcements} columns={columns} viewModes={['table']} defaultView="table" showPagination={false} showViewToggle={false} emptyMessage="No announcements found" fillHeight />
            </div>
          ) : viewMode === 'grid' ? (
            <div className="h-auto overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
              {announcements.map((a, idx) => renderGridCard(a, idx))}
            </div>
          ) : (
            <div className="h-full overflow-auto space-y-2">
              {announcements.map((a, idx) => renderListRow(a, idx))}
            </div>
          )}
        </div>

        <AnnounceModal
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
          onSent={() => fetchAnnouncements(1, debouncedSearch, targetFilter)}
        />
      </div>
    </div>
  );
};

export default AnnouncementsPage;
