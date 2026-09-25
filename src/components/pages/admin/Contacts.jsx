'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import ResponsiveTable from '../../ResponsiveTable';
import { isMobile } from 'react-device-detect';
import {
  User,
  Mail,
  Calendar,
  Trash2,
  Clock,
  LayoutGrid,
  List,
  Table as TableIcon,
  MessageSquare,
  Send,
  ShieldCheck
} from 'lucide-react';
import useDebounce from '../../../hooks/useDebounce';
import API from '../../../lib/api';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../../Sidebar';
import { DEFAULT_PAGE_SIZE } from '../../../lib/constants/pagination';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';


export default function AdminContacts() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(isMobile ? 'grid' : 'table');
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [pagination, setPagination] = useState({});
  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchContacts(page, itemsPerPage, debouncedSearch);
  }, [debouncedSearch, page, itemsPerPage]);

  const fetchContacts = async (currentpage = 1, limit = DEFAULT_PAGE_SIZE, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentpage.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await API.getAdminContacts(params);
      setContacts(response.contacts || response);
      setPagination(response.pagination || {});
    } catch (err) {
      setError('Failed to fetch contacts');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const res = await API.deleteContact(id);
        if (res.ok) {
          toast.success('Message deleted successfully!');
          fetchContacts(page, itemsPerPage, searchTerm);
        } else {
          toast.error('Failed to delete message');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('An error occurred while deleting the message');
      }
    }
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
    setPage(1);
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


  const contactTableColumns = [
    {
      key: 'user', header: 'USER', align: 'center', render: (_, contact) => (
        <div className="flex justify-center">
          <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-lg lg:rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 group-hover:bg-primary-700 transition-all uppercase">
            {contact.name?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      )
    },
    {
      key: 'email', header: 'EMAIL', render: (_, contact) => (
        <>
          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{contact.name || 'Unknown'}</div>
          <div className="text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">{contact.email || 'No email'}</div>
        </>
      )
    },
    {
      key: 'message', header: 'MESSAGE', render: (_, contact) => (
        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2 text-slate-500 max-w-sm">{contact.message}</p>
      )
    },
    {
      key: 'date', header: 'DATE', align: 'right', render: (_, contact) => (
        <div className="flex flex-col items-end">
          <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums">{formatDate(contact.createdAt)}</div>
          <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(contact.createdAt)}</div>
        </div>
      )
    },
    {
      key: 'actions', header: 'ACTIONS', align: 'center', render: (_, contact) => (
        <div className="flex justify-center gap-3">
          <button onClick={() => window.open(`mailto:${contact.email}`, '_blank')} className="p-3 bg-primary-500/10 text-primary-600 border-2 border-primary-500/20 rounded-lg lg:rounded-xl hover:bg-primary-700 hover:text-white transition-all shadow-sm active:scale-95">
            <Send className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(contact._id)} className="p-3 bg-black/10 dark:bg-white/10 text-black dark:text-white border-2 border-black/20 dark:border-white/20 rounded-lg lg:rounded-xl hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all shadow-sm active:scale-95">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const searchInput = (
    <div className="relative w-full">
      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search messages..."
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

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
          title={mode.label}
          className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5'}`}
        >
          <mode.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-widest">{mode.label.replace(' View', '')}</span>
        </button>
      ))}
    </div>
  );

  const paginationControl = (
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
    title: 'Contacts',
    count: pagination.total || 0,
    filters: (
      <>
        {searchInput}
        {viewToggleButtons}
        {paginationControl}
      </>
    )
  });

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen p-3 lg:p-8">
        <AdminTableSkeleton showHeader={false} showFilters={false} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
        {isMounted && <Sidebar />}
        <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col lg:overflow-hidden">

          {/* Title + filters now live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

          {/* Results */}
          <div className="flex-1 min-h-0 overflow-auto">
          <AnimatePresence mode="wait">
             {contacts.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-10 lg:py-20 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm"
               >
                 <div className="p-4 lg:p-10 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-xl xl:rounded-[3rem] mb-4 lg:mb-8 shadow-sm">
                   <Mail className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">No Messages Found</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No contact messages yet. Messages will appear here when users submit the contact form.</p>
               </motion.div>
             ) : (
               <motion.div
                 key="content"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="h-auto flex flex-col"
               >
                {viewMode === 'table' && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 min-h-0 overflow-auto flex flex-col">
                    <ResponsiveTable
                      data={contacts}
                      columns={contactTableColumns}
                      viewModes={['table']}
                      defaultView="table"
                      showPagination={false}
                      showViewToggle={false}
                      fillHeight
                    />
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="flex-1 min-h-0 overflow-auto grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start">
                     {contacts.map((contact, i) => (
                       <motion.div
                         key={contact._id || i}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.05 }}
                         className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-500/30 transition-all flex flex-col items-center text-center"
                       >
                          <div className="relative w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center mb-3 uppercase font-black text-sm">
                             {contact.name?.[0].toUpperCase() || 'U'}
                             <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + i + 1}</span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-0.5">{contact.name || 'Unknown'}</h3>
                          <div className="text-[10px] font-bold text-primary-600 mb-3">{contact.email || 'No email'}</div>

                          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 w-full mb-3">
                             <p className="text-[10px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">{contact.message}</p>
                          </div>

                          <div className="w-full flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 mt-auto">
                             <div className="flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400">{formatDate(contact.createdAt)}</span>
                             </div>
                             <div className="flex gap-1">
                                <button onClick={() => window.open(`mailto:${contact.email}`, '_blank')} className="p-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 rounded-lg hover:bg-primary-700 hover:text-white transition-all" title="Reply">
                                   <Send className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => handleDelete(contact._id)} className="p-1.5 bg-slate-100 dark:bg-slate-700 text-black dark:text-white rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all" title="Delete">
                                   <Trash2 className="w-3.5 h-3.5" />
                                </button>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-3">
                    {contacts.map((contact, i) => (
                      <motion.div
                        key={contact._id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-primary-500/30 transition-all flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4"
                      >
                         <div className="relative w-10 h-10 bg-slate-100 dark:bg-white/10 text-slate-400 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-700 group-hover:text-white transition-all">
                            <User className="w-5 h-5" />
                            <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-primary-600 text-white text-[9px] font-black flex items-center justify-center shadow-sm z-10 ring-2 ring-white dark:ring-slate-800">{(page - 1) * itemsPerPage + i + 1}</span>
                         </div>

                         <div className="flex-1 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                               <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{contact.name || 'Unknown'}</h3>
                               <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 border border-slate-100 dark:border-white/10">{contact.email || 'No email'}</span>
                               <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-primary-500/60" />
                                  <span className="text-[10px] font-bold text-slate-400">{formatDate(contact.createdAt)} @ {formatTime(contact.createdAt)}</span>
                               </div>
                               <div className="flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-primary-500/60" />
                                  <span className="text-[10px] font-bold text-slate-400">Verified</span>
                               </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{contact.message}</p>
                         </div>

                         <div className="flex items-center gap-1.5 shrink-0">
                            <button
                               onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                               className="p-2 bg-primary-50 dark:bg-primary-950/30 text-primary-600 rounded-lg hover:bg-primary-700 hover:text-white transition-all"
                               title="Reply"
                            >
                               <Send className="w-4 h-4" />
                            </button>
                            <button
                               onClick={() => handleDelete(contact._id)}
                               className="p-2 bg-slate-100 dark:bg-slate-700 text-black dark:text-white rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                               title="Delete"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
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
}

