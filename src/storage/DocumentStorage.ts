import { v4 as uuidv4 } from 'uuid';
import type { Document } from '@/types';

const KEY = 'wip_documents';

export const DocumentStorage = {
  get(): Document[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  getByProject(projectId: string): Document[] {
    return this.get().filter(d => d.projectId === projectId);
  },
  getById(id: string): Document | undefined {
    return this.get().find(d => d.id === id);
  },
  create(data: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document {
    const doc: Document = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify([...this.get(), doc]));
    return doc;
  },
  update(id: string, data: Partial<Document>): Document | undefined {
    const all = this.get();
    const idx = all.findIndex(d => d.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },
  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(d => d.id !== id && d.parentId !== id)));
  },
  deleteByProject(projectId: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(d => d.projectId !== projectId)));
  },
  search(query: string, projectId?: string): Document[] {
    const q = query.toLowerCase();
    return this.get().filter(d =>
      (!projectId || d.projectId === projectId) &&
      (d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q))
    );
  },
  saveDraft(id: string, content: string): void {
    localStorage.setItem(`wip_draft_${id}`, JSON.stringify({ content, savedAt: new Date().toISOString() }));
  },
  getDraft(id: string): { content: string; savedAt: string } | null {
    try { return JSON.parse(localStorage.getItem(`wip_draft_${id}`) || 'null'); } catch { return null; }
  },
  clearDraft(id: string): void {
    localStorage.removeItem(`wip_draft_${id}`);
  },
};
