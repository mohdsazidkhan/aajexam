'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '../../Sidebar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Pagination from '../../Pagination';
import ViewToggle from '../../ViewToggle';
import SearchFilter from '../../SearchFilter';
import { isMobile } from 'react-device-detect';
import {
  User,
  Mail,
  Calendar,
  Trash2,
  Filter,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  List,
  Table as TableIcon,
  MessageSquare,
  Send,
  MoreVertical,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import useDebounce from '../../../hooks/useDebounce';
import API from '../../../lib/api';
import AdminMobileAppWrapper from '../../AdminMobileAppWrapper';
import Loading from '../../Loading';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminContacts() {
  const { isMounted, isRouterReady, router } = useSSR();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({});

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('userInfo') || 'null') : null;
  const isAdminRoute = router?.pathname?.startsWith('/admin') || false;
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const debouncedSearch = useDebounce(searchTerm, 1000);

  useEffect(() => {
    fetchContacts(page, itemsPerPage, debouncedSearch);
  }, [debouncedSearch, page, itemsPerPage]);

  const fetchContacts = async (currentpage = 1, limit = 10, search = '') => {
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
    if (window.confirm('Are you sure you want to neutralized this signal node?')) {
      try {
        const res = await API.getAdminContacts(id);
        if (res.ok) {
          toast.success('Signal node neutralized!');
          fetchContacts(page, itemsPerPage, searchTerm);
        } else {
          toast.error('Failed to neutralize signal');
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
        toast.error('Interference detected during neutralization');
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading && contacts.length === 0) {
    return (
      <AdminMobileAppWrapper title="Correspondence Stream">
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] flex flex-col items-center justify-center p-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 border-4 border-primary-500/10 border-t-primary-500 rounded-full shadow-2xl"
            />
            <MessageSquare className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary-500" />
          </div>
          <div className="mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Extracting Transmission Metadata...</div>
        </div>
      </AdminMobileAppWrapper>
    );
  }

  return (
    <AdminMobileAppWrapper title="Correspondence Stream">
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#060813] font-outfit text-slate-900 dark:text-white pb-20">
        {isMounted && <Sidebar />}
        <div className={`transition-all duration-500 ${isOpen ? 'lg:pl-80' : 'lg:pl-24'} p-4 lg:p-10 pt-16 lg:pt-10`}>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-500/10 text-primary-500 rounded-2xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">CORRESPONDENCE_HUB // SIGNAL_AUDIT</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
                  TRANSMISSION <span className="text-primary-500">LOGS</span> <span className="text-slate-300 dark:text-white/10 ml-2 italic tracking-widest text-2xl lg:text-4xl">({pagination.total || 0})</span>
                </h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">System-wide audit of external correspondence signals. Maintain protocol integrity and response efficiency.</p>
              </div>
            </div>

            {/* Interface Controller */}
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 mb-12 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-8 text-[10px] font-black">
              <div className="flex flex-wrap items-center gap-6">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 text-primary-500 rounded-xl">
                      <Filter className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-slate-400 uppercase tracking-widest mb-1">DATA_FILTERING</div>
                      <div className="text-sm italic uppercase tracking-tighter italic">Signal Spectrum Index</div>
                    </div>
                 </div>

                 <div className="flex items-center bg-slate-100 dark:bg-white/5 p-2 rounded-[2rem] border-2 border-slate-200 dark:border-white/10 shadow-inner">
                  {[
                    { icon: TableIcon, id: 'table', label: 'TABULAR' },
                    { icon: List, id: 'list', label: 'LINEAR' },
                    { icon: LayoutGrid, id: 'grid', label: 'SPECTRAL' }
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
                <div className="flex items-center gap-3">
                   <span className="text-slate-400">INDEX_BY:</span>
                   <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-6 py-5 bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none transition-all shadow-inner"
                   >
                     {[10, 20, 50, 100, 500].map(v => <option key={v} value={v}>{v}</option>)}
                   </select>
                </div>

                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={handleSearch}
                  placeholder="LOCALIZE_TRANSMITTER..."
                  className="bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 rounded-2xl py-2"
                />
              </div>
            </div>
          </motion.div>

          {/* Results Stream */}
          <AnimatePresence mode="wait">
             {contacts.length === 0 ? (
               <motion.div
                 key="empty"
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center py-40 text-center bg-white/50 dark:bg-white/5 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-white/5 shadow-inner"
               >
                 <div className="p-10 bg-slate-100/50 dark:bg-white/5 rounded-[3rem] mb-8 shadow-xl">
                   <Mail className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                 </div>
                 <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">ZERO_SIGNALS_RECOVERED</h3>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">No Recorded correspondence detected for the selected tactical parameters.</p>
               </motion.div>
             ) : (
               <motion.div
                 key="content"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-12"
               >
                {viewMode === 'table' && (
                  <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border-4 border-slate-100 dark:border-white/10 overflow-hidden shadow-2xl">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/10 text-left">
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">#REF</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">UNIT</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">TRANSMITTER_IDENT</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">SIGNAL_PAYLOAD</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">TIMESTAMP</th>
                          <th className="px-8 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ACTION_MODULE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {contacts.map((contact, i) => (
                          <motion.tr
                            key={contact._id || i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group hover:bg-primary-500/5 transition-all"
                          >
                            <td className="px-8 py-6 text-center">
                              <span className="text-[10px] font-black text-slate-400 tabular-nums">#{((page - 1) * itemsPerPage) + i + 1}</span>
                            </td>
                            <td className="px-8 py-6 text-center">
                               <div className="w-10 h-10 bg-slate-900 dark:bg-white/10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-lg group-hover:scale-110 group-hover:bg-primary-500 transition-all uppercase">
                                 {contact.name?.[0].toUpperCase() || 'U'}
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none mb-1">{contact.name || 'NULL_ID'}</div>
                               <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">{contact.email || 'OFFLINE'}</div>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2 text-slate-500 max-w-sm">{contact.message}</p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <div className="flex flex-col items-end">
                                <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter tabular-nums">{formatDate(contact.createdAt)}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{formatTime(contact.createdAt)}</div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex justify-center gap-3">
                                  <button onClick={() => window.open(`mailto:${contact.email}`, '_blank')} className="p-3 bg-primary-500/10 text-primary-500 border-2 border-primary-500/20 rounded-xl hover:bg-primary-500 hover:text-white transition-all shadow-lg active:scale-95">
                                     <Send className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleDelete(contact._id)} className="p-3 bg-rose-500/10 text-rose-500 border-2 border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-95">
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                     {contacts.map((contact, i) => (
                       <motion.div
                         key={contact._id || i}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: i * 0.05 }}
                         className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-8 hover:border-primary-500/30 transition-all shadow-xl flex flex-col items-center text-center overflow-hidden"
                       >
                          <div className="w-16 h-16 bg-slate-900 dark:bg-white/10 text-white rounded-[1.5rem] flex items-center justify-center mb-6 border-2 border-slate-100 dark:border-white/10 shadow-lg group-hover:scale-110 group-hover:bg-primary-500 transition-all uppercase font-black text-lg">
                             {contact.name?.[0].toUpperCase() || 'U'}
                          </div>
                          
                          <h3 className="text-md font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-tight mb-1 uppercase">{contact.name || 'NULL_ID'}</h3>
                          <div className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-6 italic">{contact.email || 'OFFLINE'}</div>
                          
                          <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 w-full mb-8 relative">
                             <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed text-slate-400 line-clamp-4">{contact.message}</p>
                          </div>

                          <div className="w-full flex items-center justify-between pt-6 border-t-2 border-slate-50 dark:border-white/5 mt-auto">
                             <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-[9px] font-black uppercase text-slate-400">{formatDate(contact.createdAt)}</span>
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => window.open(`mailto:${contact.email}`, '_blank')} className="p-3 bg-primary-500/10 text-primary-500 border-2 border-primary-500/20 rounded-xl hover:bg-primary-500 hover:text-white transition-all active:scale-95">
                                   <Send className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(contact._id)} className="p-3 bg-rose-500/10 text-rose-500 border-2 border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                )}

                {viewMode === 'list' && (
                  <div className="grid grid-cols-1 gap-6">
                    {contacts.map((contact, i) => (
                      <motion.div
                        key={contact._id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-[3rem] border-4 border-slate-100 dark:border-white/10 p-6 lg:p-10 hover:border-primary-500/30 transition-all shadow-xl flex flex-col lg:flex-row lg:items-center gap-8"
                      >
                         <div className="w-16 h-16 bg-slate-100 dark:bg-white/10 text-slate-400 rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 border-slate-100 dark:border-white/10 shadow-lg group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all">
                            <User className="w-7 h-7" />
                         </div>

                         <div className="flex-1 space-y-4">
                            <div className="flex flex-wrap items-center gap-4">
                               <h3 className="text-md lg:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-primary-500 transition-colors uppercase">{contact.name || 'NULL_IDENTITY'}</h3>
                               <div className="px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border border-slate-100 dark:border-white/10">{contact.email || 'OFFLINE'}</div>
                            </div>
                            <p className="text-[11px] lg:text-sm font-black uppercase tracking-widest leading-relaxed text-slate-500">{contact.message}</p>
                            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                               <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-primary-500/50" />
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{formatDate(contact.createdAt)} @ {formatTime(contact.createdAt)}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ENCRYPTED_SIGNAL_STREAM</span>
                               </div>
                            </div>
                         </div>

                         <div className="flex lg:flex-col gap-4">
                            <button
                               onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                               className="flex items-center justify-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-duo-primary hover:scale-105 active:scale-95 transition-all"
                            >
                               <Send className="w-5 h-5" /> RESPOND
                            </button>
                            <button
                               onClick={() => handleDelete(contact._id)}
                               className="flex items-center justify-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-duo-rose hover:scale-105 active:scale-95 transition-all"
                            >
                               <Trash2 className="w-5 h-5" /> NEUTRALIZE
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Spectral Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-16">
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
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
}

