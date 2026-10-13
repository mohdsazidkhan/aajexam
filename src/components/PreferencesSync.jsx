'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import API from '../lib/api';
import { getUserId } from '../lib/utils/authUtils';
import { useAuthStatus } from '../hooks/useClientSide';
import { THEME_PRESETS, LANGUAGE_THEME_PRESETS } from '../lib/colorShades';
import { sanitizeFont } from '../lib/googleFonts';
import { getLanguage, isSupportedLanguage } from '../lib/i18n/languages';
import { TEXT_SIZE_PRESETS } from '../lib/textSize';
import { setThemeId } from '../store/themeColorSlice';
import { setDarkMode, setFollowSystem } from '../store/darkModeSlice';
import { setFontFamily } from '../store/fontSlice';
import { setTextSize } from '../store/textSizeSlice';
import { setLanguage } from '../store/languageSlice';

const PUSH_DELAY_MS = 1200;
const KEYS = ['themeId', 'isDark', 'followSystem', 'fontFamily', 'textSizeId', 'language'];

const knownThemeIds = new Set([...THEME_PRESETS, ...(LANGUAGE_THEME_PRESETS || [])].map((t) => t.id));
const knownSizeIds = new Set(TEXT_SIZE_PRESETS.map((p) => p.id));

const pick = (obj) => KEYS.reduce((acc, key) => (obj[key] === undefined ? acc : { ...acc, [key]: obj[key] }), {});
const sameValues = (a, b) => KEYS.every((key) => a[key] === b[key]);

// Keeps theme, dark mode, font, text size and language in step with the signed-in account.
// On sign-in the saved account preferences win and are applied on this device; an account that
// has none yet takes this device's current choices. After that every change is pushed (debounced).
// Signed-out visitors are untouched: their choices stay in this browser only.
export default function PreferencesSync() {
  const dispatch = useDispatch();
  const { isAuthenticated, authChecked } = useAuthStatus();
  const themeId = useSelector((s) => s.themeColor?.themeId);
  const isDark = useSelector((s) => s.darkMode?.isDark);
  const followSystem = useSelector((s) => s.darkMode?.followSystem);
  const fontFamily = useSelector((s) => s.font?.fontFamily);
  const textSizeId = useSelector((s) => s.textSize?.sizeId);
  const language = useSelector((s) => s.language?.currentLanguage);

  const current = { themeId, isDark, followSystem, fontFamily, textSizeId, language };
  const currentRef = useRef(current);
  currentRef.current = current;

  // Account whose preferences are loaded, and the last values known to match the server.
  const syncedUserRef = useRef(null);
  const lastSyncedRef = useRef({});
  const timerRef = useRef(null);

  const userId = isAuthenticated ? getUserId() : null;

  // Pull (or seed) once per signed-in account.
  useEffect(() => {
    if (!authChecked || !userId || syncedUserRef.current === userId) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const res = await API.getPreferences();
        if (cancelled || !res?.success) return;
        const saved = res.preferences || {};

        if (Object.keys(saved).length === 0) {
          // First sync for this account: this device's choices become the account's.
          await API.updatePreferences(pick(currentRef.current));
          lastSyncedRef.current = pick(currentRef.current);
        } else {
          const lang = isSupportedLanguage(saved.language) ? saved.language : currentRef.current.language;
          if (lang !== currentRef.current.language) dispatch(setLanguage(lang));
          if (typeof saved.fontFamily === 'string') {
            const font = sanitizeFont(saved.fontFamily, getLanguage(lang).script);
            if (font !== currentRef.current.fontFamily) dispatch(setFontFamily(font));
          }
          if (knownThemeIds.has(saved.themeId) && saved.themeId !== currentRef.current.themeId) {
            dispatch(setThemeId(saved.themeId));
          }
          if (knownSizeIds.has(saved.textSizeId) && saved.textSizeId !== currentRef.current.textSizeId) {
            dispatch(setTextSize(saved.textSizeId));
          }
          // Mode last: setDarkMode switches "follow system" off, which is then restored.
          if (typeof saved.isDark === 'boolean' && saved.isDark !== currentRef.current.isDark) {
            dispatch(setDarkMode(saved.isDark));
          }
          if (typeof saved.followSystem === 'boolean') dispatch(setFollowSystem(saved.followSystem));
          lastSyncedRef.current = { ...pick(currentRef.current), ...pick(saved) };
        }
        syncedUserRef.current = userId;
      } catch {
        // Offline or server error: keep local choices; the next load tries again.
      }
    })();

    return () => { cancelled = true; };
  }, [authChecked, userId, dispatch]);

  // Forget the account on sign-out so the next sign-in pulls its own preferences.
  useEffect(() => {
    if (authChecked && !userId) {
      syncedUserRef.current = null;
      lastSyncedRef.current = {};
    }
  }, [authChecked, userId]);

  // Push local changes once the account's preferences have been applied.
  useEffect(() => {
    if (!userId || syncedUserRef.current !== userId) return undefined;
    // Whatever the pull just applied reads back as "unchanged" once the store catches up.
    const now = pick(currentRef.current);
    if (sameValues(now, lastSyncedRef.current)) return undefined;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const latest = pick(currentRef.current);
      try {
        const res = await API.updatePreferences(latest);
        if (res?.success) lastSyncedRef.current = latest;
      } catch {
        // Retried on the next change.
      }
    }, PUSH_DELAY_MS);
    return () => clearTimeout(timerRef.current);
  }, [userId, themeId, isDark, followSystem, fontFamily, textSizeId, language]);

  return null;
}
