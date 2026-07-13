import { v4 as uuidv4 } from 'uuid';
import type { Snippet } from '@/types';

const KEY = 'wip_snippets';

export const SnippetStorage = {
  get(): Snippet[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  getByProject(projectId: string): Snippet[] {
    return this.get().filter(s => s.projectId === projectId);
  },
  getById(id: string): Snippet | undefined {
    return this.get().find(s => s.id === id);
  },
  create(data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>): Snippet {
    const snippet: Snippet = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify([...this.get(), snippet]));
    return snippet;
  },
  update(id: string, data: Partial<Snippet>): Snippet | undefined {
    const all = this.get();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },
  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(s => s.id !== id)));
  },
  deleteByProject(projectId: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(s => s.projectId !== projectId)));
  },
  search(query: string, projectId?: string): Snippet[] {
    const q = query.toLowerCase();
    return this.get().filter(s =>
      (!projectId || s.projectId === projectId) &&
      (s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) ||
       s.code.toLowerCase().includes(q) || s.tags.some(t => t.toLowerCase().includes(q)) ||
       s.language.toLowerCase().includes(q))
    );
  },
  toggleFavorite(id: string): void {
    const s = this.getById(id);
    if (s) this.update(id, { isFavorite: !s.isFavorite });
  },
};
