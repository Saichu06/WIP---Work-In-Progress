import { v4 as uuidv4 } from 'uuid';
import type { ActivityLog, ActivityType } from '@/types';

const KEY = 'wip_activity';

export const ActivityStorage = {
  get(): ActivityLog[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  getRecent(limit = 50): ActivityLog[] {
    return this.get().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  },
  getByProject(projectId: string, limit = 30): ActivityLog[] {
    return this.get()
      .filter(a => a.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },
  log(type: ActivityType, title: string, description: string, projectId?: string, entityId?: string): ActivityLog {
    const entry: ActivityLog = { id: uuidv4(), type, title, description, projectId, entityId, createdAt: new Date().toISOString() };
    const all = this.get();
    const trimmed = [entry, ...all].slice(0, 500); // keep last 500
    localStorage.setItem(KEY, JSON.stringify(trimmed));
    return entry;
  },
  clearByProject(projectId: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(a => a.projectId !== projectId)));
  },
  clear(): void {
    localStorage.removeItem(KEY);
  },
};
