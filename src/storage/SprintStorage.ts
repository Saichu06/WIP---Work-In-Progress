import { v4 as uuidv4 } from 'uuid';
import type { Sprint } from '@/types';

const KEY = 'wip_sprints';

export const SprintStorage = {
  get(): Sprint[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  getByProject(projectId: string): Sprint[] {
    return this.get().filter(s => s.projectId === projectId);
  },
  getById(id: string): Sprint | undefined {
    return this.get().find(s => s.id === id);
  },
  create(data: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Sprint {
    const sprint: Sprint = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const all = this.get();
    localStorage.setItem(KEY, JSON.stringify([...all, sprint]));
    return sprint;
  },
  update(id: string, data: Partial<Sprint>): Sprint | undefined {
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
  search(query: string, projectId?: string): Sprint[] {
    const q = query.toLowerCase();
    return this.get().filter(s =>
      (!projectId || s.projectId === projectId) &&
      (s.name.toLowerCase().includes(q) || s.goal.toLowerCase().includes(q))
    );
  },
};
