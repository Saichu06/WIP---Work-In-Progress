import type { UserPreferences } from '@/types';

const KEY = 'wip_preferences';

const DEFAULTS: UserPreferences = {
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
};

export const PreferenceStorage = {
  get(): UserPreferences {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  },

  update(data: Partial<UserPreferences>): UserPreferences {
    const current = this.get();
    const updated = { ...current, ...data };
    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  },

  reset(): UserPreferences {
    localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
    return { ...DEFAULTS };
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
