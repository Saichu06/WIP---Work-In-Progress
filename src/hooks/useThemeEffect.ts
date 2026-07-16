import { useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import type { UserPreferences } from '@/types';

/**
 * Reads UserPreferences and applies data-* attributes + CSS custom properties
 * to <html> so that CSS variables defined in index.css activate instantly.
 *
 * Mount this once inside the authenticated app shell.
 */
export function useThemeEffect() {
  const { preferences } = useApp();

  useEffect(() => {
    applyTheme(preferences);
  }, [preferences]);

  // If user chose "system", also respond to OS dark/light mode changes live
  useEffect(() => {
    if (preferences.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(preferences);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preferences]);
}

export function applyTheme(prefs: UserPreferences) {
  const root = document.documentElement;

  /* ── Theme (light / dark / system) ── */
  const resolvedTheme =
    prefs.theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : prefs.theme;
  root.setAttribute('data-theme', resolvedTheme);

  /* ── Font size ── */
  root.setAttribute('data-font-size', prefs.fontSize);

  /* ── Reduced motion ── */
  root.setAttribute('data-motion', prefs.reducedMotion ? 'reduced' : 'normal');

  /* ── Sidebar density ── */
  root.setAttribute('data-sidebar-density', prefs.sidebarDensity);

  /* ── Accent color ── */
  root.style.setProperty('--color-accent', prefs.accentColor);
  // Derive a slightly darker shade for borders/hover
  root.style.setProperty('--color-accent-dark', darkenHex(prefs.accentColor, 15));
}

/** Darken a hex color by a fixed amount (0–255). */
function darkenHex(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Apply saved preferences on initial page load (before React hydrates)
 * so there's no flash of un-themed content.
 */
export function applyInitialTheme() {
  try {
    const raw = localStorage.getItem('wip_preferences');
    if (raw) {
      const prefs = JSON.parse(raw) as Partial<UserPreferences>;
      applyTheme({
        theme: 'light',
        sidebarDensity: 'comfortable',
        cardRadius: 'lg',
        reducedMotion: false,
        fontSize: 'medium',
        accentColor: '#FFE58F',
        notificationsEnabled: true,
        notifyTaskCreated: true,
        notifyTaskCompleted: true,
        notifySprintStarted: true,
        notifyBlueprintImported: true,
        notifyDocUpdated: false,
        notifyAssetUploaded: false,
        ...prefs,
      });
    }
  } catch {
    // Silently fail — defaults will apply
  }
}
