'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, m as motion } from 'framer-motion';
import { Check, Sun, Moon, Search, Type, Settings, Palette, ALargeSmall, Languages, SlidersHorizontal, Target, Zap, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { getCurrentUser } from '../../lib/utils/authUtils';
import { getStoredTargetExamIds, notifyTargetExamsChanged } from '../../lib/utils/targetExams';
import { THEME_PRESETS } from '../../lib/colorShades';
import { ENGLISH_FONTS, SCRIPT_FONTS, LANGUAGE_FONTS, DEFAULT_FONT, GOOGLE_FONTS, defaultFontForScript } from '../../lib/googleFonts';
import { LANGUAGES, getLanguage } from '../../lib/i18n/languages';
import { TEXT_SIZE_PRESETS } from '../../lib/textSize';
import { setThemeId } from '../../store/themeColorSlice';
import { setDarkMode, setFollowSystem } from '../../store/darkModeSlice';
import { setFontFamily } from '../../store/fontSlice';
import { setTextSize } from '../../store/textSizeSlice';
import { setLanguage } from '../../store/languageSlice';
import { setDisplayPref } from '../../store/displaySlice';
import useTranslate from '../../hooks/useTranslate';

// The 24 offered themes: 12 light and 12 dark (AajExam Default Light / Default Dark first).
// Other presets stay defined (a saved choice keeps working) but are not listed.
const OFFERED_THEME_IDS = ['green', 'blue', 'indigo', 'orange', 'cyan', 'red', 'rose', 'emerald', 'amber', 'teal', 'purple', 'magenta'];
const presetById = (id) => THEME_PRESETS.find((theme) => theme.id === id);
const OFFERED_PRESETS = OFFERED_THEME_IDS.map(presetById).filter(Boolean);
const lightOption = (theme) => ({ key: `${theme.id}-light`, themeId: theme.id, isDark: false, label: theme.name, hex: theme.light });
const darkOption = (theme) => ({ key: `${theme.id}-dark`, themeId: theme.id, isDark: true, label: theme.darkName, hex: theme.dark });
// Each colour's Dark and Light sit side by side, the default green pair first.
const THEME_OPTIONS = OFFERED_PRESETS.flatMap((theme) => [darkOption(theme), lightOption(theme)]);

const TARGET_TAB = { id: 'targets', label: 'Target Exams', icon: Target };
const TABS = [
  { id: 'theme', label: 'Themes', icon: Palette },
  { id: 'font', label: 'Font Family', icon: Type },
  { id: 'size', label: 'Text Size', icon: ALargeSmall },
  { id: 'language', label: 'Language', icon: Languages },
  { id: 'display', label: 'Display', icon: SlidersHorizontal },
];

// Shared look of every selectable card in the settings panel: a ticket-style tile whose
// selected state is outlined and tinted in the active theme colour.
const CARD_BASE = 'relative w-full flex items-center gap-3 px-3 py-2.5 text-left border bg-white dark:bg-slate-800/60 transition-all hover:-translate-y-0.5 hover:shadow-md';
const CARD_IDLE = 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500';
const CARD_ON = 'text-slate-900 dark:text-white shadow-md';
const cardStyle = (selected, hex) => (selected ? { borderColor: hex, backgroundColor: `${hex}1f`, boxShadow: `0 0 0 1px ${hex}` } : undefined);
const IDX = 'w-5 text-[9px] font-black text-slate-400 dark:text-slate-500 flex-shrink-0 text-left tabular-nums';
const CheckBadge = ({ hex }) => (
  <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-white shadow" style={{ backgroundColor: hex, borderRadius: 999 }}>
    <Check className="w-3 h-3" strokeWidth={3.5} />
  </span>
);
// Small square tile (icon or glyph) in a colour.
const Tile = ({ hex, children, className = '' }) => (
  <span
    className={`w-9 h-9 flex items-center justify-center flex-shrink-0 text-white font-black shadow-sm rotate-[-4deg] ${className}`}
    style={{ background: `linear-gradient(135deg, ${hex}, ${hex}cc)`, borderRadius: 10 }}
  >
    {children}
  </span>
);

// On/off comfort switches in the Display tab (see lib/displayPrefs.js and styles/displayModes.css).
const DISPLAY_SWITCHES = [
  { key: 'liteMode', icon: Zap, label: 'Lite mode', hint: 'Saves data and runs faster on slow phones: no blur effects, no animations, no reel music and fewer pictures.' },
  { key: 'reduceMotion', icon: SlidersHorizontal, label: 'Reduce motion', hint: 'Stops sliding and fading animations. It also follows the reduce-motion setting of your device.' },
  { key: 'eyeComfort', icon: Eye, label: 'Eye comfort', hint: 'Adds a soft warm tint that cuts blue light, easier on the eyes at night.' },
  { key: 'pureBlack', icon: Moon, label: 'Pure black dark mode', hint: 'A true black background in dark mode. Saves battery on OLED screens.', needsDark: true },
  { key: 'colorBlind', icon: Palette, label: 'Colour-blind friendly', hint: 'Adds a tick or cross mark to answers and uses blue and orange instead of green and red.' },
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
  const followSystem = useSelector((state) => state.darkMode?.followSystem ?? false);
  const fontFamily = useSelector((state) => state.font?.fontFamily ?? DEFAULT_FONT);
  const textSizeId = useSelector((state) => state.textSize?.sizeId ?? 'm');
  const display = useSelector((state) => state.display) || {};
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

  // The 24 themes, in the fixed order defined above (defaults first).
  const filteredThemeOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return THEME_OPTIONS;
    return THEME_OPTIONS.filter((option) => option.label.toLowerCase().includes(query));
  }, [search]);

  const filteredLanguages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return LANGUAGE_OPTIONS;
    return LANGUAGE_OPTIONS.filter((option) => `${option.native} ${option.label}`.toLowerCase().includes(query));
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
    // with "follow system" on, only the colour changes; the device decides Dark or Light
    if (!followSystem) dispatch(setDarkMode(option.isDark));
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
              className="fixed inset-x-0 bottom-0 z-[170] w-full h-[75vh] xl:h-[90vh] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-lg flex flex-col"
            >
              <div className="flex-shrink-0 p-4 pb-2">
                <div className="flex items-center gap-1 mb-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 overflow-x-auto no-scrollbar" style={{ borderRadius: 14 }}>
                  {tabs.map((tabItem) => (
                    <button
                      key={tabItem.id}
                      type="button"
                      onClick={() => { setTab(tabItem.id); setSearch(''); }}
                      style={tab === tabItem.id ? { background: `linear-gradient(135deg, ${activeHex}, ${activeHex}d9)`, borderRadius: 10 } : { borderRadius: 10 }}
                      className={`flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap text-center text-xs font-black uppercase tracking-wide px-2.5 py-2 transition-all ${
                        tab === tabItem.id
                          ? 'text-white shadow-md'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      <tabItem.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {translate(tabItem.label)}
                    </button>
                  ))}
                </div>

                {tab !== 'size' && tab !== 'display' && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="relative flex-1 min-w-0">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={tab === 'theme' ? translate('Search theme...') : tab === 'targets' ? translate('Search exam...') : tab === 'language' ? translate('Search language...') : translate('Search font...')}
                        className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal outline-none focus:ring-2 focus:ring-primary-500/50"
                      />
                    </div>
                    {tab === 'theme' && (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={followSystem}
                        onClick={() => dispatch(setFollowSystem(!followSystem))}
                        title={translate('Follow your device setting')}
                        className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <span className="whitespace-nowrap">{translate('Auto Dark / Light')}</span>
                        <span
                          className="relative w-9 h-5 rounded-full flex-shrink-0 transition-colors"
                          style={{ backgroundColor: followSystem ? activeHex : '#94a3b8' }}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${followSystem ? 'translate-x-4' : ''}`} />
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {tab === 'targets' && loggedIn && (
                <>
                  <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 pb-3 mb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
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
                            style={cardStyle(active, activeHex)}
                            className={`${CARD_BASE} text-xs font-bold ${active ? CARD_ON : CARD_IDLE}`}
                          >
                            <span className={IDX}>{index + 1}.</span>
                            <span className="flex-1 text-left truncate">{exam.name}</span>
                            {active && <CheckBadge hex={activeHex} />}
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
                  <p className="col-span-full text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 pb-2 mb-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                    {translate('Pick a colour with Dark or Light mode, or turn on Auto to follow your device.')}
                  </p>
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
                        style={cardStyle(isSelected, option.hex)}
                        className={`${CARD_BASE} text-sm font-semibold ${isSelected ? CARD_ON : CARD_IDLE}`}
                      >
                        <span className={IDX}>{index + 1}.</span>
                        <span
                          className="relative w-10 h-10 overflow-hidden flex-shrink-0 flex items-start justify-center pt-1 ring-1 ring-black/10 dark:ring-white/10 shadow-sm"
                          style={{ background: option.isDark ? '#0f172a' : '#ffffff', borderRadius: 10 }}
                        >
                          {option.isDark ? <Moon className="w-3.5 h-3.5" style={{ color: option.hex }} /> : <Sun className="w-3.5 h-3.5" style={{ color: option.hex }} />}
                          <span className="absolute inset-x-0 bottom-0 h-3.5" style={{ background: `linear-gradient(90deg, ${option.hex}, ${option.hex}aa)` }} />
                        </span>
                        <span className="flex-1 text-left truncate">{option.label}</span>
                        {isSelected && <CheckBadge hex={option.hex} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === 'font' && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 pb-3 mb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
                    {translate('Choose a font for the whole website. Picking one also switches to that language.')}
                  </p>
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
                          style={cardStyle(isSelected, activeHex)}
                          className={`${CARD_BASE} text-sm font-semibold ${isSelected ? CARD_ON : CARD_IDLE}`}
                        >
                          <span className={IDX}>{index + 1}.</span>
                          <Tile hex={activeHex}><Type className="w-4 h-4" /></Tile>
                          <span className="flex-1 text-left truncate">{item.font} - {item.label}</span>
                          {isSelected && <CheckBadge hex={activeHex} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}


              {tab === 'language' && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 pb-3 mb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
                    {translate('Choose your website language. Tests and quizzes are available in English and Hindi only.')}
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
                    {filteredLanguages.map((option, index) => {
                      const isSelected = option.code === lang;
                      return (
                        <button
                          key={option.code}
                          type="button"
                          onClick={() => handleSelectLanguage(option.code)}
                          style={cardStyle(isSelected, activeHex)}
                          className={`${CARD_BASE} ${isSelected ? CARD_ON : CARD_IDLE}`}
                        >
                          <span className={IDX}>{index + 1}.</span>
                          <Tile hex={activeHex} className="text-base"><span aria-hidden="true">{Array.from(option.native || option.label)[0]}</span></Tile>
                          <span className="flex-1 text-left">
                            <span className="block text-sm font-semibold">
                              {option.native}{option.speakers ? ' - Avg. Population' : ''}
                            </span>
                            {(option.native !== option.label || option.speakers) && (
                              <span className="block text-xs text-slate-500 dark:text-slate-400">
                                {option.label}{option.speakers ? ` - ${option.speakers}` : ''}
                              </span>
                            )}
                          </span>
                          {isSelected && <CheckBadge hex={activeHex} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === 'display' && (
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 pb-3 mb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
                    {translate('Make the site lighter, calmer and easier to read. Each switch applies right away.')}
                  </p>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {DISPLAY_SWITCHES.map((item) => {
                      const on = !!display[item.key];
                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="switch"
                          aria-checked={on}
                          onClick={() => dispatch(setDisplayPref({ key: item.key, value: !on }))}
                          style={cardStyle(on, activeHex)}
                          className={`${CARD_BASE} py-3 ${on ? CARD_ON : CARD_IDLE}`}
                        >
                          <Tile hex={on ? activeHex : '#94a3b8'}>{React.createElement(item.icon || Zap, { className: 'w-4 h-4' })}</Tile>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">{translate(item.label)}</span>
                            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                              {translate(item.hint)}
                              {item.needsDark && !isDark ? ` ${translate('Turn on a dark theme to see it.')}` : ''}
                            </span>
                          </span>
                          <span
                            className="relative w-10 h-6 rounded-full flex-shrink-0 transition-colors"
                            style={{ backgroundColor: on ? activeHex : '#94a3b8' }}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : ''}`} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === 'size' && (
                <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 xl:grid-cols-4 gap-2 content-start px-4 pb-6">
                  <p className="col-span-full text-xs font-semibold text-slate-500 dark:text-slate-400 px-1 pb-2 mb-1 border-b border-dashed border-slate-200 dark:border-slate-700">
                    {translate('Choose how large the text appears across the website.')}
                  </p>
                  {TEXT_SIZE_PRESETS.map((preset, index) => {
                    const isSelected = preset.id === textSizeId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectTextSize(preset.id)}
                        style={cardStyle(isSelected, activeHex)}
                        className={`${CARD_BASE} ${isSelected ? CARD_ON : CARD_IDLE}`}
                      >
                        <span className={IDX}>{index + 1}.</span>
                        <span className="w-12 h-10 flex items-center justify-center flex-shrink-0 font-black leading-none bg-slate-100 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700" style={{ fontSize: `${preset.px}px`, color: activeHex, borderRadius: 10 }}>
                          {translate('Aa')}
                        </span>
                        <span className="flex-1 text-left">
                          <span className="block text-sm font-semibold">{preset.shortLabel} — {preset.label}</span>
                          <span className="block text-xs text-slate-500 dark:text-slate-400">{preset.px}px</span>
                        </span>
                        {isSelected && <CheckBadge hex={activeHex} />}
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
