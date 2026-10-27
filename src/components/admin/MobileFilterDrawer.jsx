'use client';

import React, { useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
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
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-[998]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 bottom-0 z-[999] w-[300px] max-w-sm xl:w-[350px] xl:max-w-[350px] bg-background-surface-secondary border-l-2 border-border-primary flex flex-col"
          >
            <div className="flex items-center justify-between px-4 h-12 border-b-2 border-border-primary shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Filter className="w-4 h-4 text-primary-600 shrink-0" />
                <span className="text-sm font-bold text-content-primary truncate">
                  {header.title}
                  {header.count !== null && header.count !== undefined && (
                    <span className="text-content-muted"> ({header.count})</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="p-2 rounded-lg bg-background-surface-secondary text-content-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* !w-full beats pages' own sm:w-auto/sm:w-56 (viewport, not container, media queries) so controls stay full-width in this narrow drawer regardless of screen size. */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 [&>*]:!w-full [&_input]:!w-full [&_select]:!w-full [&_[data-styled-select]]:!w-full [&_[data-styled-select]]:!max-w-none [&_[data-styled-select]]:!min-w-0 [&_div:has(>[data-styled-select])]:!w-full">
              {header.filters}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminMobileFilterDrawer;
