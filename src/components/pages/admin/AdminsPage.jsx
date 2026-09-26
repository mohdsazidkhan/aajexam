'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ShieldOff, User, Mail, Phone, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import API from '../../../lib/api';
import Sidebar from '../../Sidebar';
import useDebounce from '../../../hooks/useDebounce';
import { useSSR } from '../../../hooks/useSSR';
import { AdminTableSkeleton } from '../../admin/Skeletons';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';
import { getUser } from '../../../lib/auth';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')} ${['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()]} ${d.getFullYear()}`;
};

export default function AdminsPage() {
  const { isMounted } = useSSR();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [busyId, setBusyId] = useState(null);
  const currentUser = getUser();

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await API.request(`/api/admin/admins?${params}`);
      if (res?.success) setAdmins(res.admins || []);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleDemote = async (adminUser) => {
    if (!window.confirm(`Remove admin access from ${adminUser.name || adminUser.email}? They will become a regular student.`)) return;
    setBusyId(adminUser._id);
    try {
      const res = await API.request(`/api/admin/users/${adminUser._id}/role`, { method: 'PUT', body: JSON.stringify({ role: 'student' }) });
      if (res?.success) {
        toast.success(res.message || 'Demoted to student');
        fetchAdmins();
      } else {
        toast.error(res?.message || 'Failed to demote');
      }
    } catch (e) {
      toast.error(e?.message || 'Failed to demote');
    } finally {
      setBusyId(null);
    }
  };

  const searchInput = (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search admins by name or email..."
        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-black border border-slate-300 dark:border-slate-700 rounded-lg lg:rounded-xl text-sm"
      />
    </div>
  );

  useAdminMobileHeader({
    title: 'Admins',
    count: admins.length,
    filters: <>{searchInput}</>
  });

  if (loading && admins.length === 0) {
    return (
      <div className="min-h-screen p-3 lg:p-8">
        <AdminTableSkeleton showHeader={false} showFilters={false} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      {isMounted && <Sidebar />}
      <div className="adminContent w-full mx-auto flex-1 min-h-0 overflow-auto flex flex-col gap-4">
        {/* Title + filters live in the navbar (title/count) and the filter drawer (controls), on web and mobile alike */}

        <div className="flex-1 min-h-0 overflow-auto">
          <AnimatePresence mode="wait">
            {admins.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 lg:py-20 text-center bg-white/50 dark:bg-white/5 rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-100 dark:border-white/5 shadow-sm"
              >
                <div className="p-4 lg:p-10 bg-slate-100/50 dark:bg-white/5 rounded-lg lg:rounded-xl xl:rounded-[3rem] mb-4 lg:mb-8 shadow-sm">
                  <ShieldCheck className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-3">No Admins Found</h3>
              </motion.div>
            ) : (
              <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
                {admins.map((a, i) => {
                  const isSelf = String(currentUser?._id || currentUser?.id) === String(a._id);
                  return (
                    <motion.div
                      key={a._id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i, 10) * 0.03 }}
                      className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 flex-wrap sm:flex-nowrap"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
                          {a.name || 'Unnamed'}
                          {isSelf && <span className="text-[10px] font-black text-primary-600 uppercase">You</span>}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {a.email}</span>
                          {a.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {a.phone}</span>}
                          <span>Admin since {formatDate(a.createdAt)}</span>
                        </div>
                      </div>
                      {!isSelf && (
                        <button
                          disabled={busyId === a._id}
                          onClick={() => handleDemote(a)}
                          title="Remove admin access"
                          className="p-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all disabled:opacity-50 shrink-0"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
