import { v4 as uuidv4 } from 'uuid';
import type { Project } from '@/types';

const KEY = 'wip_projects';

export const ProjectStorage = {
  get(): Project[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch { return []; }
  },
  getById(id: string): Project | undefined {
    return this.get().find(p => p.id === id);
  },
  create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const project: Project = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = this.get();
    localStorage.setItem(KEY, JSON.stringify([...all, project]));
    return project;
  },
  update(id: string, data: Partial<Project>): Project | undefined {
    const all = this.get();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },
  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(p => p.id !== id)));
  },
  search(query: string): Project[] {
    const q = query.toLowerCase();
    return this.get().filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  },
  toggleFavorite(id: string): void {
    const p = this.getById(id);
    if (p) this.update(id, { isFavorite: !p.isFavorite });
  },
};
