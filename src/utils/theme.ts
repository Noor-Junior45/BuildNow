import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'giriraj_theme_mode';
export const MANUAL_THEME_STORAGE_KEY = 'giriraj_manual_theme';

/**
 * Returns current device system preference
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Reads stored theme mode ('light' | 'dark' | 'system') from localStorage
 */
export function getSavedThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    console.debug('Error reading theme from localStorage', e);
  }
  return 'system';
}

/**
 * Reads last selected manual theme ('light' | 'dark')
 */
export function getSavedManualTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(MANUAL_THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.debug('Error reading manual theme', e);
  }
  return 'light';
}

/**
 * Resolves effective theme based on mode and device preference
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
}

/**
 * Applies or removes the 'dark' CSS class on document.documentElement
 */
export function applyThemeToDocument(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

/**
 * Updates theme mode in localStorage, updates DOM classes and dispatches change event
 */
export function setThemeMode(mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    if (mode !== 'system') {
      localStorage.setItem(MANUAL_THEME_STORAGE_KEY, mode);
    }
  } catch (e) {
    console.warn('Failed to save theme to localStorage', e);
  }
  const resolved = resolveTheme(mode);
  applyThemeToDocument(resolved);
  window.dispatchEvent(new CustomEvent('app-theme-changed', { detail: { mode, resolved } }));
}

/**
 * Custom React hook to observe and update theme state
 */
export function useTheme() {
  const [themeMode, setMode] = useState<ThemeMode>(() => getSavedThemeMode());
  const [resolvedTheme, setResolved] = useState<ResolvedTheme>(() => resolveTheme(getSavedThemeMode()));

  useEffect(() => {
    // Initial sync
    const initialMode = getSavedThemeMode();
    const initialResolved = resolveTheme(initialMode);
    setMode(initialMode);
    setResolved(initialResolved);
    applyThemeToDocument(initialResolved);

    // Watch for OS preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const currentMode = getSavedThemeMode();
      if (currentMode === 'system') {
        const nextResolved = getSystemTheme();
        setResolved(nextResolved);
        applyThemeToDocument(nextResolved);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    // Watch for custom app-theme-changed events (from other components / tabs)
    const handleThemeChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: ThemeMode; resolved: ResolvedTheme }>;
      if (customEvent.detail) {
        setMode(customEvent.detail.mode);
        setResolved(customEvent.detail.resolved);
      } else {
        const m = getSavedThemeMode();
        setMode(m);
        setResolved(resolveTheme(m));
      }
    };

    window.addEventListener('app-theme-changed', handleThemeChanged);
    window.addEventListener('storage', handleThemeChanged);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('app-theme-changed', handleThemeChanged);
      window.removeEventListener('storage', handleThemeChanged);
    };
  }, []);

  const selectMode = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
  }, []);

  const toggleLightDark = useCallback(() => {
    const nextManual: ResolvedTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextManual);
  }, [resolvedTheme]);

  const toggleFollowSystem = useCallback((enable: boolean) => {
    if (enable) {
      setThemeMode('system');
    } else {
      const manual = getSavedManualTheme() || resolvedTheme;
      setThemeMode(manual);
    }
  }, [resolvedTheme]);

  return {
    themeMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isSystem: themeMode === 'system',
    setThemeMode: selectMode,
    toggleLightDark,
    toggleFollowSystem
  };
}
