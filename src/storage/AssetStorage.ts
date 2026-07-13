import { v4 as uuidv4 } from 'uuid';
import type { Asset } from '@/types';

const KEY = 'wip_assets';

export const AssetStorage = {
  get(): Asset[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  getByProject(projectId: string): Asset[] {
    return this.get().filter(a => a.projectId === projectId);
  },
  getById(id: string): Asset | undefined {
    return this.get().find(a => a.id === id);
  },
  create(data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset {
    const asset: Asset = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify([...this.get(), asset]));
    return asset;
  },
  update(id: string, data: Partial<Asset>): Asset | undefined {
    const all = this.get();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },
  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(a => a.id !== id)));
  },
  deleteByProject(projectId: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(a => a.projectId !== projectId)));
  },
  search(query: string, projectId?: string): Asset[] {
    const q = query.toLowerCase();
    return this.get().filter(a =>
      (!projectId || a.projectId === projectId) &&
      a.name.toLowerCase().includes(q)
    );
  },
};
