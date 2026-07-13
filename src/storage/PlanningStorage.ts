import { v4 as uuidv4 } from 'uuid';
import type { PlanningSection } from '@/types';
import { DEFAULT_PLANNING_SECTIONS } from '@/constants';

const KEY = 'wip_planning';

export const PlanningStorage = {
  get(): PlanningSection[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  getByProject(projectId: string): PlanningSection[] {
    return this.get().filter(s => s.projectId === projectId).sort((a, b) => a.order - b.order);
  },
  initForProject(projectId: string, customSections?: { title: string; content: string; order: number }[]): PlanningSection[] {
    const sections = (customSections || DEFAULT_PLANNING_SECTIONS).map(s => ({
      ...s, id: uuidv4(), projectId, updatedAt: new Date().toISOString(),
    }));
    const all = this.get();
    localStorage.setItem(KEY, JSON.stringify([...all, ...sections]));
    return sections;
  },
  update(id: string, data: Partial<PlanningSection>): PlanningSection | undefined {
    const all = this.get();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },
  create(data: Omit<PlanningSection, 'id' | 'updatedAt'>): PlanningSection {
    const section: PlanningSection = { ...data, id: uuidv4(), updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify([...this.get(), section]));
    return section;
  },
  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(s => s.id !== id)));
  },
  deleteByProject(projectId: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(s => s.projectId !== projectId)));
  },
  search(query: string): PlanningSection[] {
    const q = query.toLowerCase();
    return this.get().filter(s => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q));
  },
};
