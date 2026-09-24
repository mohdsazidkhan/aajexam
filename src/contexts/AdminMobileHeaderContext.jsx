'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

// Lets an admin page hand its title/count/filters over to the mobile AdminNavbar
// (title+count shown centered in the navbar) and to the right-side filter
// drawer (search, dropdowns, view toggle, primary action button — everything
// that used to sit inline in the page's own header row). Split into two
// contexts on purpose:
//
//   - the VALUE context (header, drawerOpen) is reactive — AdminNavbar and
//     AdminMobileFilterDrawer subscribe to it and re-render when it changes.
//   - the ACTIONS context (setAdminMobileHeader, setDrawerOpen) never changes
//     reference — pages that just need to *register* their header subscribe
//     to this one instead.
//
// If a page subscribed to the reactive VALUE context too, registering its
// header would change that context's value, which would re-render the page
// itself (since it's a consumer), which re-runs its registration effect,
// which changes the value again — an infinite render loop. Keeping "who
// writes" and "who reads the live value" on separate contexts avoids that.
const AdminMobileHeaderValueContext = createContext(null);
const AdminMobileHeaderActionsContext = createContext(null);

const EMPTY_HEADER = { title: '', count: null, filters: null };

// Fallbacks used when a component mounts outside AdminMobileHeaderProvider —
// e.g. the brief window in _app.js where the page renders without AppLayout
// while the client mount / auth check hasn't resolved yet. A no-op here
// (instead of throwing) lets pages call the hook unconditionally, as rules
// of hooks requires, without crashing during that window.
const NOOP_VALUE = { header: EMPTY_HEADER, drawerOpen: false };
const NOOP_ACTIONS = { setAdminMobileHeader: () => {}, setDrawerOpen: () => {} };

export const AdminMobileHeaderProvider = ({ children }) => {
  const [header, setHeader] = useState(EMPTY_HEADER);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const setAdminMobileHeader = useCallback((next) => {
    setHeader((prev) => ({ ...prev, ...next }));
  }, []);

  const value = useMemo(() => ({ header, drawerOpen }), [header, drawerOpen]);
  const actions = useMemo(() => ({ setAdminMobileHeader, setDrawerOpen }), [setAdminMobileHeader]);

  return (
    <AdminMobileHeaderActionsContext.Provider value={actions}>
      <AdminMobileHeaderValueContext.Provider value={value}>
        {children}
      </AdminMobileHeaderValueContext.Provider>
    </AdminMobileHeaderActionsContext.Provider>
  );
};

// Used by AdminNavbar / AdminMobileFilterDrawer — reactive, re-renders when
// header/drawerOpen change.
export const useAdminMobileHeaderContext = () => {
  const value = useContext(AdminMobileHeaderValueContext);
  const actions = useContext(AdminMobileHeaderActionsContext);
  if (!value || !actions) return { ...NOOP_VALUE, ...NOOP_ACTIONS };
  return { ...value, ...actions };
};

// Used internally by useAdminMobileHeader — only the stable actions, so
// registering a header never re-renders the calling page itself.
const useAdminMobileHeaderActions = () => {
  const actions = useContext(AdminMobileHeaderActionsContext);
  return actions || NOOP_ACTIONS;
};

// Page-facing hook. Call once near the top of an admin list page's component:
//
//   useAdminMobileHeader({
//     title: 'Expenses',
//     count: totalItems,
//     filters: (
//       <>...search input, dropdowns, ViewToggle, "+ Add" button...</>
//     ),
//   });
//
// Re-registers on every render so controlled inputs inside `filters` (search
// value, selected filter, etc.) stay live while the drawer is open. Clears
// itself on unmount so the navbar doesn't show a stale title when navigating
// to a page that hasn't registered one yet.
export const useAdminMobileHeader = ({ title = '', count = null, filters = null }) => {
  const { setAdminMobileHeader } = useAdminMobileHeaderActions();

  useEffect(() => {
    setAdminMobileHeader({ title, count, filters });
  });

  useEffect(() => {
    return () => setAdminMobileHeader(EMPTY_HEADER);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
