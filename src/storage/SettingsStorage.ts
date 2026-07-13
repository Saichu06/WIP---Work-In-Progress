import type { WorkspaceSettings } from '@/types';

const KEY = 'wip_settings';

const DEFAULTS: WorkspaceSettings = {
  workspaceName: 'My Workspace',
  accentColor: '#FFE58F',
  defaultTemplate: 'blank',
  dateFormat: 'MMM dd, yyyy',
  sidebarCollapsed: false,
};

export const SettingsStorage = {
  get(): WorkspaceSettings {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
      return { ...DEFAULTS, ...stored };
    } catch { return DEFAULTS; }
  },
  update(data: Partial<WorkspaceSettings>): WorkspaceSettings {
    const current = this.get();
    const updated = { ...current, ...data };
    localStorage.setItem(KEY, JSON.stringify(updated));
    return updated;
  },
  reset(): WorkspaceSettings {
    localStorage.setItem(KEY, JSON.stringify(DEFAULTS));
    return DEFAULTS;
  },
};
