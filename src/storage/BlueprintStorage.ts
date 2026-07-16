import { OFFICIAL_BLUEPRINTS } from '@/constants/blueprints';
import type { Blueprint, BlueprintCategory } from '@/types';
import { TaskStorage } from './TaskStorage';
import { DocumentStorage } from './DocumentStorage';
import { SnippetStorage } from './SnippetStorage';
import { SprintStorage } from './SprintStorage';
import { PlanningStorage } from './PlanningStorage';
import { ProjectStorage } from './ProjectStorage';

const CUSTOM_KEY = 'wip_custom_blueprints';

export const BlueprintStorage = {
  /** Get all official blueprints */
  getOfficial(): Blueprint[] {
    return OFFICIAL_BLUEPRINTS;
  },

  /** Get all custom blueprints from localStorage */
  getCustom(): Blueprint[] {
    try {
      const raw = localStorage.getItem(CUSTOM_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Get all blueprints (official + custom) */
  getAll(): Blueprint[] {
    return [...OFFICIAL_BLUEPRINTS, ...this.getCustom()];
  },

  /** Get blueprints filtered by category */
  getByCategory(category: BlueprintCategory | 'All'): Blueprint[] {
    const all = this.getAll();
    if (category === 'All') return all;
    if (category === 'Custom') return this.getCustom();
    return all.filter(b => b.category === category);
  },

  /** Search blueprints by name, description, tags, stack, difficulty, category, or audience */
  search(query: string): Blueprint[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      (b.tags && b.tags.some(t => t.toLowerCase().includes(q))) ||
      (b.recommendedStack && b.recommendedStack.some(s => s.toLowerCase().includes(q))) ||
      (b.difficulty && b.difficulty.toLowerCase().includes(q)) ||
      (b.audience && b.audience.toLowerCase().includes(q))
    );
  },

  /** Get list of favorite blueprint IDs */
  getFavorites(): string[] {
    try {
      return JSON.parse(localStorage.getItem('wip_fav_blueprints') || '[]');
    } catch {
      return [];
    }
  },

  /** Toggle favorite status of a blueprint */
  toggleFavorite(id: string): void {
    const favs = this.getFavorites();
    const updated = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
    localStorage.setItem('wip_fav_blueprints', JSON.stringify(updated));
  },

  /** Get recently used blueprint IDs */
  getRecentlyUsed(): string[] {
    try {
      return JSON.parse(localStorage.getItem('wip_recent_blueprints') || '[]');
    } catch {
      return [];
    }
  },

  /** Record that a blueprint was used */
  recordUsed(id: string): void {
    const recents = this.getRecentlyUsed();
    const filtered = recents.filter(r => r !== id);
    const updated = [id, ...filtered].slice(0, 10);
    localStorage.setItem('wip_recent_blueprints', JSON.stringify(updated));
  },

  /** Save a project as a custom blueprint */
  saveFromProject(projectId: string, meta: { name: string; description: string; category: BlueprintCategory; audience: string; setupTime: string }): Blueprint {
    const project = ProjectStorage.get().find(p => p.id === projectId);
    if (!project) throw new Error('Project not found');

    const tasks = TaskStorage.getByProject(projectId);
    const docs = DocumentStorage.getByProject(projectId);
    const sprints = SprintStorage.getByProject(projectId);
    const planning = PlanningStorage.getByProject(projectId);
    const snippets = SnippetStorage.getByProject(projectId);

    const blueprint: Blueprint = {
      id: `custom_${Date.now()}`,
      name: meta.name,
      description: meta.description,
      icon: project.icon,
      color: project.color,
      category: meta.category,
      audience: meta.audience,
      setupTime: meta.setupTime,
      features: [
        `${tasks.length} tasks`,
        `${sprints.length} sprints`,
        `${docs.length} documents`,
        `${snippets.length} snippets`,
      ],
      planningItems: planning.map(p => ({ title: p.title, content: p.content, order: p.order })),
      sprintNames: sprints.map(s => s.name),
      labels: [...new Set(tasks.flatMap(t => t.labels))],
      defaultDocs: docs.filter(d => d.type === 'document').map(d => ({ title: d.title, content: d.content })),
      sampleTasks: tasks.slice(0, 20).map(t => ({
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        labels: t.labels,
        storyPoints: t.storyPoints,
        acceptanceCriteria: t.acceptanceCriteria,
        assignee: '',
        isFavorite: false,
        dueDate: undefined,
      })),
      defaultSnippets: snippets.map(s => ({
        title: s.title,
        language: s.language,
        code: s.code,
        description: s.description,
        tags: s.tags,
      })),
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    const existing = this.getCustom();
    localStorage.setItem(CUSTOM_KEY, JSON.stringify([...existing, blueprint]));
    return blueprint;
  },

  /** Delete a custom blueprint by id */
  deleteCustom(id: string): void {
    const updated = this.getCustom().filter(b => b.id !== id);
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(updated));
  },
};
