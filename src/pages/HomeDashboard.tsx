import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, TrendingUp, CheckSquare, Zap, Star, ArrowRight,
  Clock, Target, LayoutGrid, FileText, Code2, FolderOpen,
  ChevronRight, Sparkles
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { ActivityLog, Task, Sprint } from '@/types';

interface HomeDashboardProps {
  onCreateProject: () => void;
}

const QUICK_ACTIONS = [
  { icon: LayoutGrid, label: 'New Project', action: 'create' as const, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { icon: FolderOpen, label: 'All Projects', href: ROUTES.PROJECTS, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { icon: FileText, label: 'Recent Docs', href: '#docs', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { icon: Code2, label: 'Snippets', href: '#snippets', color: 'text-amber-600 bg-amber-50 border-amber-100' },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getTodaysTasks(projectIds: string[]): Task[] {
  const allTasks = TaskStorage.get();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return allTasks.filter(t =>
    projectIds.includes(t.projectId) &&
    t.status !== 'done' &&
    (t.priority === 'critical' || t.priority === 'high') &&
    t.sprintId
  ).slice(0, 6);
}

export function HomeDashboard({ onCreateProject }: HomeDashboardProps) {
  const { projects } = useApp();
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activeSprints, setActiveSprints] = useState<Sprint[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);

  useEffect(() => {
    setActivities(ActivityStorage.getRecent(30));
    const sprints = SprintStorage.get();
    setActiveSprints(sprints.filter(s => s.status === 'active').slice(0, 4));
    setTodaysTasks(getTodaysTasks(projects.map(p => p.id)));
  }, [projects]);

  const activeProjects = projects.filter(p => p.status === 'active');
  const favoriteProjects = projects.filter(p => p.isFavorite);
  const allTasks = TaskStorage.get();
  const doneTasks = allTasks.filter(t => t.status === 'done');
  const inProgressTasks = allTasks.filter(t => t.status === 'in-progress');
  const totalProgress = allTasks.length > 0 ? Math.round((doneTasks.length / allTasks.length) * 100) : 0;

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="flex-1 overflow-y-auto bg-surface-primary animate-in">
      <div className="max-w-7xl mx-auto p-8">

        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-content-muted uppercase tracking-widest">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-content-primary">
                {getGreeting()}, {firstName}.
              </h1>
              {inProgressTasks.length > 0 ? (
                <p className="text-sm text-content-secondary mt-1">
                  You have{' '}
                  <span className="font-semibold text-content-primary">{inProgressTasks.length} task{inProgressTasks.length !== 1 ? 's' : ''}</span>{' '}
                  in progress across{' '}
                  <span className="font-semibold text-content-primary">{activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''}</span>.
                </p>
              ) : (
                <p className="text-sm text-content-secondary mt-1">
                  {activeProjects.length > 0
                    ? `You have ${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''}. Ready to continue?`
                    : 'Your workspace is ready. Start by creating your first project.'}
                </p>
              )}
            </div>
            <button
              onClick={onCreateProject}
              className="btn-primary flex-shrink-0 hidden sm:flex"
            >
              <Plus size={15} /> New Project
            </button>
          </div>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Active Projects',
              value: activeProjects.length,
              sub: `${projects.length} total`,
              icon: <FolderOpen size={15} />,
              accent: 'bg-blue-50 border-blue-100 text-blue-600',
            },
            {
              label: 'Active Sprints',
              value: activeSprints.length,
              sub: activeSprints.length > 0 ? 'sprint ongoing' : 'no active sprint',
              icon: <Zap size={15} />,
              accent: 'bg-amber-50 border-amber-100 text-amber-600',
            },
            {
              label: 'Tasks Completed',
              value: doneTasks.length,
              sub: `of ${allTasks.length} total`,
              icon: <CheckSquare size={15} />,
              accent: 'bg-emerald-50 border-emerald-100 text-emerald-600',
            },
            {
              label: 'Overall Progress',
              value: `${totalProgress}%`,
              sub: allTasks.length > 0 ? `${allTasks.length - doneTasks.length} remaining` : 'no tasks yet',
              icon: <TrendingUp size={15} />,
              accent: 'bg-purple-50 border-purple-100 text-purple-600',
            },
          ].map(stat => (
            <div key={stat.label} className="card flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-content-secondary font-medium">{stat.label}</span>
                <div className={cn('w-7 h-7 rounded-lg border flex items-center justify-center', stat.accent)}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-content-primary">{stat.value}</div>
              <div className="text-[11px] text-content-muted">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {QUICK_ACTIONS.map(action => (
            action.action === 'create' ? (
              <button
                key={action.label}
                onClick={onCreateProject}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-3 rounded-xl border font-medium text-sm transition-all hover:shadow-sm active:scale-[0.98]',
                  action.color
                )}
              >
                <action.icon size={15} />
                {action.label}
              </button>
            ) : (
              <Link
                key={action.label}
                to={action.href!}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-3 rounded-xl border font-medium text-sm transition-all hover:shadow-sm active:scale-[0.98]',
                  action.color
                )}
              >
                <action.icon size={15} />
                {action.label}
              </Link>
            )
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left 2-col ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Pinned / Favorites */}
            {favoriteProjects.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                    <Star size={13} className="text-amber-500" /> Pinned Projects
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteProjects.map(p => {
                    const pTasks = TaskStorage.getByProject(p.id);
                    const done = pTasks.filter(t => t.status === 'done').length;
                    const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
                    return (
                      <Link
                        key={p.id}
                        to={ROUTES.PROJECT_OVERVIEW(p.id)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-surface-border hover:bg-surface-secondary transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ backgroundColor: p.color + '22' }}>
                          {p.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-content-primary truncate">{p.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-surface-secondary rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                            </div>
                            <span className="text-[10px] text-content-muted font-medium">{pct}%</span>
                          </div>
                        </div>
                        <ChevronRight size={13} className="text-content-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Today's Focus */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  <Target size={13} className="text-red-500" /> Today's Focus
                </h2>
                <span className="text-[10px] text-content-muted font-medium bg-surface-secondary border border-surface-border px-2 py-0.5 rounded-md">
                  High priority + In sprint
                </span>
              </div>
              {todaysTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles size={20} className="text-content-muted mx-auto mb-2" />
                  <p className="text-xs text-content-muted">No high-priority tasks in active sprints.</p>
                  <p className="text-[10px] text-content-muted mt-0.5">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todaysTasks.map(task => {
                    const proj = projects.find(p => p.id === task.projectId);
                    return (
                      <Link
                        key={task.id}
                        to={proj ? ROUTES.PROJECT_BOARD(proj.id) : '#'}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-secondary transition-colors group"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: task.priority === 'critical' ? '#EF4444' : '#F59E0B' }}
                        />
                        <span className="text-xs text-content-primary font-medium flex-1 truncate">{task.title}</span>
                        {proj && (
                          <span className="text-[10px] text-content-muted px-2 py-0.5 rounded-md bg-surface-secondary border border-surface-border flex-shrink-0">
                            {proj.icon} {proj.name}
                          </span>
                        )}
                        <ArrowRight size={12} className="text-content-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Projects */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  <TrendingUp size={13} /> Projects
                </h2>
                <Link to={ROUTES.PROJECTS} className="text-xs text-content-secondary hover:text-content-primary flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              {activeProjects.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title="No active projects"
                  description="Create a project to start tracking your work."
                  action={<button onClick={onCreateProject} className="btn-yellow">Create Project</button>}
                />
              ) : (
                <div className="space-y-3">
                  {activeProjects.slice(0, 6).map(p => {
                    const pTasks = TaskStorage.getByProject(p.id);
                    const done = pTasks.filter(t => t.status === 'done').length;
                    const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
                    const inProg = pTasks.filter(t => t.status === 'in-progress').length;
                    return (
                      <Link
                        key={p.id}
                        to={ROUTES.PROJECT_OVERVIEW(p.id)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-secondary transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: p.color + '22' }}>
                          {p.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-content-primary truncate">{p.name}</span>
                            <span className="text-[10px] text-content-muted font-medium">{pct}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-surface-secondary rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                            </div>
                            {inProg > 0 && (
                              <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md font-medium flex-shrink-0">
                                {inProg} active
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={13} className="text-content-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Active Sprints */}
            {activeSprints.length > 0 && (
              <div className="card">
                <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2 mb-4">
                  <Zap size={13} className="text-amber-500" /> Active Sprints
                </h2>
                <div className="space-y-3">
                  {activeSprints.map(s => {
                    const proj = projects.find(p => p.id === s.projectId);
                    if (!proj) return null;
                    const sTasks = TaskStorage.getBySprint(s.id);
                    const done = sTasks.filter(t => t.status === 'done').length;
                    const pct = sTasks.length > 0 ? Math.round((done / sTasks.length) * 100) : 0;
                    const endDate = new Date(s.endDate);
                    const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <Link
                        key={s.id}
                        to={ROUTES.PROJECT_SPRINTS(s.projectId)}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-surface-border hover:bg-surface-secondary transition-colors group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-content-primary truncate">{s.name}</span>
                            <span className="text-[9px] font-semibold text-content-muted bg-surface-secondary border border-surface-border px-1.5 py-0.5 rounded-md">
                              {proj.icon} {proj.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-content-muted">
                            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Ends today'} · {done}/{sTasks.length} tasks
                          </span>
                        </div>
                        <div className="flex items-center gap-2 w-28 flex-shrink-0">
                          <div className="flex-1 h-1.5 bg-surface-secondary rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: proj.color }} />
                          </div>
                          <span className="text-xs font-semibold text-content-secondary min-w-[28px] text-right">{pct}%</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right col ── */}
          <div className="space-y-6">
            {/* Activity */}
            <div className="card">
              <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2 mb-4">
                <Clock size={13} /> Recent Activity
              </h2>
              <ActivityFeed activities={activities} limit={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
