import type { UserStatistics } from '@/types';
import { ProjectStorage } from './ProjectStorage';
import { TaskStorage } from './TaskStorage';
import { SprintStorage } from './SprintStorage';
import { DocumentStorage } from './DocumentStorage';
import { SnippetStorage } from './SnippetStorage';
import { AssetStorage } from './AssetStorage';
import { ActivityStorage } from './ActivityStorage';

const KEY = 'wip_statistics';

const DEFAULTS: UserStatistics = {
  projectsCreated: 0,
  tasksCreated: 0,
  tasksCompleted: 0,
  sprintsStarted: 0,
  sprintsCompleted: 0,
  documentsCreated: 0,
  snippetsCreated: 0,
  assetsUploaded: 0,
  blueprintsUsed: 0,
  daysActive: 1,
  currentStreak: 1,
  longestStreak: 1,
  lastActiveDate: new Date().toISOString(),
};

export const StatisticsStorage = {
  get(): UserStatistics {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return this.recalculate();
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  },

  /** Recalculate all statistics from the source-of-truth storages. */
  recalculate(): UserStatistics {
    const projects = ProjectStorage.get();
    const tasks = TaskStorage.get();
    const sprints = SprintStorage.get();
    const docs = DocumentStorage.get();
    const snippets = SnippetStorage.get();
    const assets = AssetStorage.get();
    const activities = ActivityStorage.get();

    // Count blueprints used (projects created from a template)
    const blueprintsUsed = projects.filter(p => p.templateId).length;

    // Calculate days active from unique activity dates
    const activityDates = new Set(
      activities.map(a => new Date(a.createdAt).toDateString())
    );
    const daysActive = Math.max(activityDates.size, 1);

    // Calculate streak
    const { currentStreak, longestStreak } = this._calculateStreak(activities);

    const stats: UserStatistics = {
      projectsCreated: projects.length,
      tasksCreated: tasks.length,
      tasksCompleted: tasks.filter(t => t.status === 'done').length,
      sprintsStarted: sprints.filter(s => s.status === 'active' || s.status === 'completed').length,
      sprintsCompleted: sprints.filter(s => s.status === 'completed').length,
      documentsCreated: docs.filter(d => d.type === 'document').length,
      snippetsCreated: snippets.length,
      assetsUploaded: assets.length,
      blueprintsUsed,
      daysActive,
      currentStreak,
      longestStreak,
      lastActiveDate: new Date().toISOString(),
    };

    localStorage.setItem(KEY, JSON.stringify(stats));
    return stats;
  },

  _calculateStreak(activities: { createdAt: string }[]): { currentStreak: number; longestStreak: number } {
    if (activities.length === 0) return { currentStreak: 1, longestStreak: 1 };

    // Get unique dates descending
    const dates = [...new Set(
      activities.map(a => new Date(a.createdAt).toDateString())
    )].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Current streak: must start from today or yesterday
    const latestDate = dates[0];
    latestDate.setHours(0, 0, 0, 0);
    if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
      currentStreak = 0;
    }

    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i - 1].getTime() - dates[i].getTime()) / (1000 * 60 * 60 * 24);
      if (Math.abs(diff - 1) < 0.1) {
        tempStreak++;
        if (i === 1 && currentStreak > 0) currentStreak = tempStreak;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
    if (currentStreak > 0) currentStreak = Math.max(currentStreak, tempStreak > 1 ? tempStreak : 1);

    return { currentStreak, longestStreak };
  },

  clear(): void {
    localStorage.removeItem(KEY);
  },
};
