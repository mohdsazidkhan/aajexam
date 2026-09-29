'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sun, Moon, Search } from 'lucide-react';
import { THEME_PRESETS } from '../lib/colorShades';
import { setThemeId } from '../store/themeColorSlice';
import { setDarkMode } from '../store/darkModeSlice';

// Every theme x mode combination, e.g. "AajExam Green" (light) / "AajExam Dark" (dark).
const THEME_OPTIONS = THEME_PRESETS.flatMap((theme) => [
  { key: `${theme.id}-light`, themeId: theme.id, isDark: false, label: theme.name, hex: theme.light },
  { key: `${theme.id}-dark`, themeId: theme.id, isDark: true, label: theme.darkName, hex: theme.dark },
]);

// Drop-in replacement for the header's Sun/Moon dark-mode icon button.
// Shows a swatch of the active theme+mode; clicking it opens a panel listing
// all theme/mode combinations together, so picking one sets both at once.
const ThemeColorMenuButton = ({ buttonClassName = '' }) => {
  const dispatch = useDispatch();
  const themeId = useSelector((state) => state.themeColor?.themeId ?? 'green');
  const isDark = useSelector((state) => state.darkMode?.isDark ?? false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const activeTheme = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  const activeHex = isDark ? activeTheme.dark : activeTheme.light;

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return THEME_OPTIONS;
    return THEME_OPTIONS.filter((option) => option.label.toLowerCase().includes(query));
  }, [search]);

  const handleSelect = (option) => {
    dispatch(setThemeId(option.themeId));
    dispatch(setDarkMode(option.isDark));
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Theme settings"
        aria-expanded={open}
        className={`border-2 ${buttonClassName}`}
        style={{ borderColor: activeHex }}
      >
        <span
          className="block w-6 h-6 xl:w-7 xl:h-7 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
          style={{ backgroundColor: activeHex }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-[160] bg-black/30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              role="menu"
              className="fixed inset-x-0 bottom-0 z-[170] w-full h-[70vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-lg flex flex-col"
            >
              <div className="flex-shrink-0 p-4 pb-2">
                <div className="relative px-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search theme..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 xl:grid-cols-3 gap-2 content-start px-4 pb-6">
                {filteredOptions.length === 0 && (
                  <p className="col-span-full text-sm text-slate-400 text-center py-4">No theme found</p>
                )}
                {filteredOptions.map((option) => {
                  const isSelected = option.themeId === themeId && option.isDark === isDark;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => handleSelect(option)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 dark:border-white/10 flex-shrink-0"
                        style={{ backgroundColor: option.hex }}
                      />
                      <span className="flex-1 text-left truncate">{option.label}</span>
                      {option.isDark ? (
                        <Moon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      {isSelected && <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeColorMenuButton;
