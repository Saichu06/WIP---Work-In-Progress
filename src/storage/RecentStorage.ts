const KEY = 'wip_recent';

interface RecentEntry {
  id: string;
  accessedAt: string;
}

interface RecentData {
  recentProjects: RecentEntry[];
  pinnedProjects: string[];
  recentDocuments: RecentEntry[];
  recentSnippets: RecentEntry[];
}

const DEFAULTS: RecentData = {
  recentProjects: [],
  pinnedProjects: [],
  recentDocuments: [],
  recentSnippets: [],
};

const MAX_RECENT = 10;

export const RecentStorage = {
  _get(): RecentData {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  },

  _save(data: RecentData): void {
    localStorage.setItem(KEY, JSON.stringify(data));
  },

  /* ─── Projects ─── */

  getRecentProjects(): string[] {
    return this._get().recentProjects.map(e => e.id);
  },

  addRecentProject(id: string): void {
    const data = this._get();
    const filtered = data.recentProjects.filter(e => e.id !== id);
    data.recentProjects = [{ id, accessedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_RECENT);
    this._save(data);
  },

  /* ─── Pins ─── */

  getPinnedProjects(): string[] {
    return this._get().pinnedProjects;
  },

  pinProject(id: string): void {
    const data = this._get();
    if (!data.pinnedProjects.includes(id)) {
      data.pinnedProjects = [id, ...data.pinnedProjects];
    }
    this._save(data);
  },

  unpinProject(id: string): void {
    const data = this._get();
    data.pinnedProjects = data.pinnedProjects.filter(p => p !== id);
    this._save(data);
  },

  togglePin(id: string): boolean {
    const pinned = this.getPinnedProjects().includes(id);
    if (pinned) this.unpinProject(id);
    else this.pinProject(id);
    return !pinned;
  },

  isPinned(id: string): boolean {
    return this._get().pinnedProjects.includes(id);
  },

  /* ─── Documents ─── */

  getRecentDocuments(): string[] {
    return this._get().recentDocuments.map(e => e.id);
  },

  addRecentDocument(id: string): void {
    const data = this._get();
    const filtered = data.recentDocuments.filter(e => e.id !== id);
    data.recentDocuments = [{ id, accessedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_RECENT);
    this._save(data);
  },

  /* ─── Snippets ─── */

  getRecentSnippets(): string[] {
    return this._get().recentSnippets.map(e => e.id);
  },

  addRecentSnippet(id: string): void {
    const data = this._get();
    const filtered = data.recentSnippets.filter(e => e.id !== id);
    data.recentSnippets = [{ id, accessedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_RECENT);
    this._save(data);
  },

  /* ─── Utilities ─── */

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
