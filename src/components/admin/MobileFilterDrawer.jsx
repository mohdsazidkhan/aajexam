'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter } from 'lucide-react';
import { useAdminMobileHeaderContext } from '../../contexts/AdminMobileHeaderContext';

// Right-side slide-in drawer (web + mobile) that hosts whatever the current
// admin page registered via useAdminMobileHeader({ filters: ... }) — search
// box, dropdown filters, view toggle, primary "+ Add" button, pagination,
// etc. Opened by the filter icon in AdminNavbar.
const AdminMobileFilterDrawer = () => {
  const { header, drawerOpen, setDrawerOpen } = useAdminMobileHeaderContext();

  // Lock the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [drawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[190]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 bottom-0 z-[200] w-[85vw] max-w-sm lg:max-w-md bg-white dark:bg-slate-900 border-l-2 border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-12 border-b-2 border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Filter className="w-4 h-4 text-primary-600 shrink-0" />
                <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                  {header.title}
                  {header.count !== null && header.count !== undefined && (
                    <span className="text-slate-400 dark:text-slate-500"> ({header.count})</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {header.filters}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminMobileFilterDrawer;
