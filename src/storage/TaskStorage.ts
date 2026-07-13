import { v4 as uuidv4 } from 'uuid';
import type { Task, Comment } from '@/types';

const KEY = 'wip_tasks';

export const TaskStorage = {
  get(): Task[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },
  getByProject(projectId: string): Task[] {
    return this.get().filter(t => t.projectId === projectId);
  },
  getBySprint(sprintId: string): Task[] {
    return this.get().filter(t => t.sprintId === sprintId);
  },
  getById(id: string): Task | undefined {
    return this.get().find(t => t.id === id);
  },
  getBacklog(projectId: string): Task[] {
    return this.get().filter(t => t.projectId === projectId && !t.sprintId);
  },
  create(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Task {
    const task: Task = { ...data, id: uuidv4(), comments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    const all = this.get();
    localStorage.setItem(KEY, JSON.stringify([...all, task]));
    return task;
  },
  update(id: string, data: Partial<Task>): Task | undefined {
    const all = this.get();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },
  addComment(taskId: string, content: string, author: string): Task | undefined {
    const comment: Comment = { id: uuidv4(), author, content, createdAt: new Date().toISOString() };
    const task = this.getById(taskId);
    if (!task) return undefined;
    return this.update(taskId, { comments: [...task.comments, comment] });
  },
  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(t => t.id !== id)));
  },
  deleteByProject(projectId: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(t => t.projectId !== projectId)));
  },
  moveToSprint(taskId: string, sprintId: string | undefined): void {
    this.update(taskId, { sprintId });
  },
  search(query: string, projectId?: string): Task[] {
    const q = query.toLowerCase();
    return this.get().filter(t =>
      (!projectId || t.projectId === projectId) &&
      (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.labels.some(l => l.toLowerCase().includes(q)))
    );
  },
};
