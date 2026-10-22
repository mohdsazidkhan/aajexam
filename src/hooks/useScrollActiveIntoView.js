import { useEffect } from 'react';

// Scrolls the sidebar's nav so the active menu item sits in the middle of it.
// Active links carry data-active="true"; runs after the open/close transition has settled.
export default function useScrollActiveIntoView(navRef, deps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      const nav = navRef.current;
      const active = nav?.querySelector('[data-active="true"]');
      if (!nav || !active) return;
      const top = active.offsetTop - (nav.clientHeight - active.offsetHeight) / 2;
      nav.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
