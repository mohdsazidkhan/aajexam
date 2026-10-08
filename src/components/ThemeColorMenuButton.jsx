'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sun, Moon, Search, Type, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../lib/api';
import { getCurrentUser } from '../lib/utils/authUtils';
import { getStoredTargetExamIds, notifyTargetExamsChanged } from '../lib/utils/targetExams';
import { THEME_PRESETS, LANGUAGE_THEME_PRESETS } from '../lib/colorShades';
import { ENGLISH_FONTS, SCRIPT_FONTS, LANGUAGE_FONTS, DEFAULT_FONT, GOOGLE_FONTS, defaultFontForScript } from '../lib/googleFonts';
import { LANGUAGES, getLanguage } from '../lib/i18n/languages';
import { TEXT_SIZE_PRESETS } from '../lib/textSize';
import { setThemeId } from '../store/themeColorSlice';
import { setDarkMode } from '../store/darkModeSlice';
import { setFontFamily } from '../store/fontSlice';
import { setTextSize } from '../store/textSizeSlice';
import { setLanguage } from '../store/languageSlice';
import useTranslate from '../hooks/useTranslate';

// The ten offered themes: five light and five dark. Other presets stay defined (a saved
// choice keeps working) but are not listed.
const LIGHT_THEME_IDS = ['green', 'blue', 'indigo', 'teal', 'orange'];
const DARK_THEME_IDS = ['green', 'blue', 'indigo', 'cyan', 'orange'];
const presetById = (id) => THEME_PRESETS.find((theme) => theme.id === id);
const THEME_OPTIONS = [
  ...LIGHT_THEME_IDS.map((id) => presetById(id)).filter(Boolean).map((theme) => (
    { key: `${theme.id}-light`, themeId: theme.id, isDark: false, label: theme.name, hex: theme.light }
  )),
  ...DARK_THEME_IDS.map((id) => presetById(id)).filter(Boolean).map((theme) => (
    { key: `${theme.id}-dark`, themeId: theme.id, isDark: true, label: theme.darkName, hex: theme.dark }
  )),
];
const LANGUAGE_THEME_OPTIONS = [
  ...LANGUAGE_THEME_PRESETS.map((theme) => (
    { key: `${theme.id}-light`, themeId: theme.id, isDark: false, label: theme.name, hex: theme.light }
  )),
  ...LANGUAGE_THEME_PRESETS.map((theme) => (
    { key: `${theme.id}-dark`, themeId: theme.id, isDark: true, label: theme.darkName, hex: theme.dark }
  )),
];

const TARGET_TAB = { id: 'targets', label: 'Target Exams' };
const TABS = [
  { id: 'theme', label: 'Themes' },
  { id: 'font', label: 'Font Family' },
  { id: 'size', label: 'Text Size' },
  { id: 'language', label: 'Language' },
];
// Indian scripts need a font with proper glyphs: switching to such a language selects that
// script's font (unless one of its fonts is already chosen) and remembers the previous English
// font, which comes back on switching to English or Hinglish.
const FONT_BEFORE_HINDI_KEY = 'fontBeforeHindi';
const LANGUAGE_OPTIONS = LANGUAGES;

// Drop-in replacement for the header's Sun/Moon dark-mode icon button.
// Shows a swatch of the active theme+mode; clicking it opens a panel with two
// tabs: theme/mode combinations, and the site's font family.
const ThemeColorMenuButton = ({ buttonClassName = '' }) => {
  const dispatch = useDispatch();
  const { translate, lang } = useTranslate();
  const themeId = useSelector((state) => state.themeColor?.themeId ?? 'green');
  const isDark = useSelector((state) => state.darkMode?.isDark ?? false);
  const fontFamily = useSelector((state) => state.font?.fontFamily ?? DEFAULT_FONT);
  const textSizeId = useSelector((state) => state.textSize?.sizeId ?? 'm');
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('theme');
  const [search, setSearch] = useState('');
  // Target Exams tab is for logged-in users only; resolved after mount to avoid an SSR mismatch.
  const [loggedIn, setLoggedIn] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExamIds, setSelectedExamIds] = useState([]);
  const [savingTargets, setSavingTargets] = useState(false);
  const tabs = loggedIn ? [...TABS, TARGET_TAB] : TABS;

  const activeTheme = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  const activeHex = isDark ? activeTheme.dark : activeTheme.light;

  // All themes (general + per-language), sorted A to Z by name.
  const filteredThemeOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    const seen = new Set();
    const all = [...THEME_OPTIONS, ...LANGUAGE_THEME_OPTIONS]
      .filter((o) => !seen.has(o.key) && seen.add(o.key))
      .sort((a, b) => a.label.localeCompare(b.label));
    if (!query) return all;
    return all.filter((option) => option.label.toLowerCase().includes(query));
  }, [search]);

  // One best font per language, shown as "Font - Language"; the current language's font first.
  const filteredFonts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = LANGUAGE_FONTS.filter((f) => !query || f.font.toLowerCase().includes(query) || f.label.toLowerCase().includes(query));
    return [...list].sort((x, y) => (y.code === lang) - (x.code === lang));
  }, [search, lang]);

  // On open (logged-in users): load exams + current selection for the Target Exams tab.
  useEffect(() => {
    if (!open) return;
    setTab('theme'); // always open on the first tab
    setSearch('');
    const user = getCurrentUser();
    setLoggedIn(!!user);
    if (!user) return;
    let cancelled = false;
    API.getAllExams().then((res) => {
      if (cancelled || !res?.success) return;
      const list = res.data || [];
      setExams(list);
      let ids = getStoredTargetExamIds();
      if (!ids.length && user.primaryTargetExam && user.primaryTargetExam !== 'All Exams') {
        const names = user.primaryTargetExam.split(', ');
        ids = list.filter((e) => names.includes(e.name)).map((e) => e._id);
      }
      setSelectedExamIds(ids);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [open]);

  const toggleTargetExam = (id) => {
    setSelectedExamIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSaveTargets = async () => {
    setSavingTargets(true);
    try {
      const res = await API.updateProfile({ targetExams: selectedExamIds });
      if (res?.success && res.user) {
        const stored = getCurrentUser();
        if (stored) localStorage.setItem('userInfo', JSON.stringify({ ...stored, ...res.user }));
        notifyTargetExamsChanged();
        toast.success(translate('Target exams updated.'));
        setOpen(false);
        setSearch('');
      }
    } finally {
      setSavingTargets(false);
    }
  };

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exams;
    return exams.filter((e) => e.name.toLowerCase().includes(query));
  }, [exams, search]);

  const handleSelectTheme = (option) => {
    dispatch(setThemeId(option.themeId));
    dispatch(setDarkMode(option.isDark));
    setOpen(false);
    setSearch('');
  };

  // Picking a "Font - Language" entry also switches the site to that language (and keeps exactly that font).
  const handleSelectFont = (item) => {
    if (item.code !== lang) dispatch(setLanguage(item.code));
    dispatch(setFontFamily(item.font));
    setOpen(false);
    setSearch('');
  };

  const handleSelectLanguage = (code) => {
    try {
      const next = getLanguage(code);
      const current = getLanguage(lang);
      const script = next.script;
      const customised = fontFamily !== current.font; // the reader picked a font of their own
      if (script !== 'latin') {
        if (!SCRIPT_FONTS[script].includes(fontFamily) || (code !== lang && !customised)) {
          // remember the English font only, so hopping between two Indian languages keeps it
          if (ENGLISH_FONTS.includes(fontFamily)) localStorage.setItem(FONT_BEFORE_HINDI_KEY, fontFamily);
          dispatch(setFontFamily(next.font || defaultFontForScript(script)));
        }
      } else if (GOOGLE_FONTS.includes(fontFamily) && !ENGLISH_FONTS.includes(fontFamily)) {
        const previous = localStorage.getItem(FONT_BEFORE_HINDI_KEY);
        dispatch(setFontFamily(ENGLISH_FONTS.includes(previous) ? previous : next.font || DEFAULT_FONT));
        localStorage.removeItem(FONT_BEFORE_HINDI_KEY);
      }
    } catch {
      // storage blocked: still switch the language, just skip the font swap
    }
    dispatch(setLanguage(code));
    setOpen(false);
  };

  const handleSelectTextSize = (sizeId) => {
    dispatch(setTextSize(sizeId));
    setOpen(false);
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
        aria-label={translate('Theme settings')}
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
                  {tabs.map((tabItem) => (
                    <button
                      key={tabItem.id}
                      type="button"
                      onClick={() => { setTab(tabItem.id); setSearch(''); }}
                      style={tab === tabItem.id ? { backgroundColor: activeHex } : undefined}
                      className={`flex-1 text-center text-xs font-black uppercase tracking-wide py-2 rounded-lg transition-all ${
                        tab === tabItem.id
                          ? 'text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {translate(tabItem.label)}
                    </button>
                  ))}
                </div>

                {tab !== 'size' && tab !== 'language' && (
                  <div className="relative px-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={tab === 'theme' ? translate('Search theme...') : tab === 'targets' ? translate('Search exam...') : translate('Search font...')}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                  </div>
                )}
              </div>

              {tab === 'targets' && loggedIn && (
                <>
                  <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                    <p className="text-xs font-semibold text-slate-400 px-1 pb-3">
                      {translate('Select the exams you are preparing for.')} {selectedExamIds.length ? translate('{count} selected.', { count: selectedExamIds.length }) : translate('Nothing selected means all exams.')}
                    </p>
                    {filteredExams.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">{exams.length ? translate('No exam found') : translate('Loading exams...')}</p>
                    )}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
                      {filteredExams.map((exam, index) => {
                        const active = selectedExamIds.includes(exam._id);
                        return (
                          <button
                            key={exam._id}
                            type="button"
                            onClick={() => toggleTargetExam(exam._id)}
                            style={active ? { backgroundColor: activeHex, borderColor: activeHex } : undefined}
                            className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                              active ? 'text-white' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-500'
                            }`}
                          >
                            <span className="w-6 text-[10px] font-black opacity-60 flex-shrink-0 text-left">{index + 1}.</span>
                            {active && <Check className="w-3 h-3 flex-shrink-0" />}
                            <span className="flex-1 text-left truncate">{exam.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedExamIds([])}
                      disabled={!selectedExamIds.length}
                      className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                    >
                      {translate('Clear')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveTargets}
                      disabled={savingTargets}
                      style={{ backgroundColor: activeHex }}
                      className="flex-1 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide text-white disabled:opacity-60"
                    >
                      {savingTargets ? translate('Saving...') : translate('Save target exams')}
                    </button>
                  </div>
                </>
              )}

              {tab === 'theme' && (
                <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 xl:grid-cols-4 gap-2 content-start px-4 pb-6">
                  {filteredThemeOptions.length === 0 && (
                    <p className="col-span-full text-sm text-slate-400 text-center py-4">{translate('No theme found')}</p>
                  )}
                  {filteredThemeOptions.map((option, index) => {
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
                        <span className="w-6 text-[10px] font-black opacity-60 flex-shrink-0 text-left">{index + 1}.</span>
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
              )}

              {tab === 'font' && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
                  {filteredFonts.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">{translate('No font found')}</p>
                  )}
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
                    {filteredFonts.map((item, index) => {
                      // fonts are shared between languages of one script, so the row of the active language is the selected one
                      const isSelected = item.code === lang;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => handleSelectFont(item)}
                          style={isSelected ? { backgroundColor: activeHex } : undefined}
                          className={`w-full flex items-center gap-2 px-2 py-2 rounded-xl text-sm font-semibold transition-all ${
                            isSelected
                              ? 'text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="w-6 text-[10px] font-black opacity-60 flex-shrink-0 text-left">{index + 1}.</span>
                          <Type className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white/90' : 'text-slate-400'}`} />
                          <span className="flex-1 text-left truncate">{item.font} - {item.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}


              {tab === 'language' && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
                  <p className="text-xs font-semibold text-slate-400 px-1 pb-3">
                    {translate('Choose the language for menus, buttons and pages.')}{' '}
                    {translate('Quiz and test questions have their own EN / हिं switch.')}
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
                    {LANGUAGE_OPTIONS.map((option, index) => {
                      const isSelected = option.code === lang;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => handleSelectLanguage(option.code)}
                          style={isSelected ? { backgroundColor: activeHex } : undefined}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                            isSelected
                              ? 'text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="w-6 text-[10px] font-black opacity-60 flex-shrink-0 text-left">{index + 1}.</span>
                          <span className="flex-1 text-left">
                            <span className="block text-sm font-semibold">{option.native}</span>
                            {(option.native !== option.label || option.speakers) && (
                              <span className={`block text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                                {option.native !== option.label ? option.label : ''}
                                {option.speakers ? `${option.native !== option.label ? ' · ' : ''}${option.speakers} Avg. Population` : ''}
                              </span>
                            )}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === 'size' && (
                <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 xl:grid-cols-4 gap-2 content-start px-4 pb-6">
                  {TEXT_SIZE_PRESETS.map((preset, index) => {
                    const isSelected = preset.id === textSizeId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectTextSize(preset.id)}
                        style={isSelected ? { backgroundColor: activeHex } : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          isSelected
                            ? 'text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="w-6 text-[10px] font-black opacity-60 flex-shrink-0 text-left">{index + 1}.</span>
                        <span className="w-8 text-center font-black leading-none flex-shrink-0" style={{ fontSize: `${preset.px}px` }}>
                          {translate('Aa')}
                        </span>
                        <span className="flex-1 text-left">
                          <span className="block text-sm font-semibold">{preset.shortLabel} — {preset.label}</span>
                          <span className={`block text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>{preset.px}px</span>
                        </span>
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
