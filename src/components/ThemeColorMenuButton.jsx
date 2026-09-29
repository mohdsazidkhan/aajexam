'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sun, Moon, Search, Type, Settings } from 'lucide-react';
import { THEME_PRESETS } from '../lib/colorShades';
import { GOOGLE_FONTS } from '../lib/googleFonts';
import { setThemeId } from '../store/themeColorSlice';
import { setDarkMode } from '../store/darkModeSlice';
import { setFontFamily } from '../store/fontSlice';

// Every theme x mode combination, e.g. "AajExam Green" (light) / "AajExam Dark" (dark).
const THEME_OPTIONS = THEME_PRESETS.flatMap((theme) => [
  { key: `${theme.id}-light`, themeId: theme.id, isDark: false, label: theme.name, hex: theme.light },
  { key: `${theme.id}-dark`, themeId: theme.id, isDark: true, label: theme.darkName, hex: theme.dark },
]);

const TABS = [
  { id: 'theme', label: 'Themes' },
  { id: 'font', label: 'Font Family' },
];

// Drop-in replacement for the header's Sun/Moon dark-mode icon button.
// Shows a swatch of the active theme+mode; clicking it opens a panel with two
// tabs: theme/mode combinations, and the site's font family.
const ThemeColorMenuButton = ({ buttonClassName = '' }) => {
  const dispatch = useDispatch();
  const themeId = useSelector((state) => state.themeColor?.themeId ?? 'green');
  const isDark = useSelector((state) => state.darkMode?.isDark ?? false);
  const fontFamily = useSelector((state) => state.font?.fontFamily ?? 'Lato');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('theme');
  const [search, setSearch] = useState('');

  const activeTheme = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  const activeHex = isDark ? activeTheme.dark : activeTheme.light;

  const filteredThemeOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return THEME_OPTIONS;
    return THEME_OPTIONS.filter((option) => option.label.toLowerCase().includes(query));
  }, [search]);

  const filteredFonts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return GOOGLE_FONTS;
    return GOOGLE_FONTS.filter((font) => font.toLowerCase().includes(query));
  }, [search]);

  const handleSelectTheme = (option) => {
    dispatch(setThemeId(option.themeId));
    dispatch(setDarkMode(option.isDark));
    setOpen(false);
    setSearch('');
  };

  const handleSelectFont = (font) => {
    dispatch(setFontFamily(font));
    setOpen(false);
    setSearch('');
  };

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
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
        <Settings className="w-5 h-5 xl:w-6 xl:h-6" style={{ color: activeHex }} />
        <span
          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-[4px] border-2 border-white dark:border-slate-900 shadow-sm"
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
                <div className="flex items-center gap-1 mb-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => { setTab(t.id); setSearch(''); }}
                      className={`flex-1 text-center text-xs font-black uppercase tracking-wide py-2 rounded-lg transition-all ${
                        tab === t.id
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="relative px-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={tab === 'theme' ? 'Search theme...' : 'Search font...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-2 focus:ring-primary-500/50"
                  />
                </div>
              </div>

              {tab === 'theme' ? (
                <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 xl:grid-cols-3 gap-2 content-start px-4 pb-6">
                  {filteredThemeOptions.length === 0 && (
                    <p className="col-span-full text-sm text-slate-400 text-center py-4">No theme found</p>
                  )}
                  {filteredThemeOptions.map((option) => {
                    const isSelected = option.themeId === themeId && option.isDark === isDark;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => handleSelectTheme(option)}
                        style={isSelected ? { backgroundColor: option.hex } : undefined}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border-2 border-white/50 flex-shrink-0"
                          style={{ backgroundColor: option.hex }}
                        />
                        <span className="flex-1 text-left truncate">{option.label}</span>
                        {option.isDark ? (
                          <Moon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white/90' : 'text-slate-400'}`} />
                        ) : (
                          <Sun className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white/90' : 'text-slate-400'}`} />
                        )}
                        {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 xl:grid-cols-3 gap-2 content-start px-4 pb-6">
                  {filteredFonts.length === 0 && (
                    <p className="col-span-full text-sm text-slate-400 text-center py-4">No font found</p>
                  )}
                  {filteredFonts.map((font) => {
                    const isSelected = font === fontFamily;
                    return (
                      <button
                        key={font}
                        type="button"
                        onClick={() => handleSelectFont(font)}
                        style={isSelected ? { backgroundColor: activeHex } : undefined}
                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Type className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white/90' : 'text-slate-400'}`} />
                        <span className="flex-1 text-left truncate">{font}</span>
                        {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeColorMenuButton;
