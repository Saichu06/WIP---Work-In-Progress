import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, CheckSquare, Zap, Star, ArrowRight, Clock, FolderOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import { EmptyState } from '@/components/common/EmptyState';
import { ROUTES } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { ActivityLog, Task, Sprint } from '@/types';

interface DashboardProps {
  onCreateProject: () => void;
}

export function Dashboard({ onCreateProject }: DashboardProps) {
  const { projects } = useApp();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [activeSprints, setActiveSprints] = useState<Sprint[]>([]);

  useEffect(() => {
    setActivities(ActivityStorage.getRecent(30));
    const tasks = TaskStorage.get();
    setRecentTasks(tasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5));
    const sprints = SprintStorage.get();
    setActiveSprints(sprints.filter(s => s.status === 'active').slice(0, 3));
  }, []);

  const activeProjects = projects.filter(p => p.status === 'active');
  const favoriteProjects = projects.filter(p => p.isFavorite);
  const totalTasks = TaskStorage.get().length;
  const completedTasks = TaskStorage.get().filter(t => t.status === 'done').length;

  const stats = [
    { label: 'Active Projects', value: activeProjects.length, icon: <TrendingUp size={16} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Tasks', value: totalTasks, icon: <CheckSquare size={16} />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Completed', value: completedTasks, icon: <CheckSquare size={16} />, color: 'text-purple-600 bg-purple-50' },
    { label: 'Active Sprints', value: activeSprints.length, icon: <Zap size={16} />, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Everything that matters at a glance.</p>
          </div>
          <button onClick={onCreateProject} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-content-secondary text-sm">{stat.label}</span>
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.color)}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-content-primary">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Favorites */}
            {favoriteProjects.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                    <Star size={14} className="text-amber-500" /> Favorites
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {favoriteProjects.map(p => (
                    <Link key={p.id} to={ROUTES.PROJECT_OVERVIEW(p.id)} className="flex items-center gap-3 p-3 rounded-xl border border-surface-border hover:bg-surface-secondary transition-colors group">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ backgroundColor: p.color + '33' }}>
                        {p.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-content-primary truncate">{p.name}</div>
                        <div className="text-xs text-content-muted">{p.status}</div>
                      </div>
                      <ArrowRight size={14} className="text-content-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Active Projects */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  <TrendingUp size={14} /> Active Projects Progress
                </h2>
                <Link to={ROUTES.PROJECTS} className="text-xs text-content-secondary hover:text-content-primary">All Projects →</Link>
              </div>
              {activeProjects.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="text-content-muted" size={24} />}
                  title="No active projects"
                  description="Create a project to start tracking tasks and sprints."
                  action={<button onClick={onCreateProject} className="btn-yellow">Create Project</button>}
                />
              ) : (
                <div className="space-y-4">
                  {activeProjects.slice(0, 5).map(p => {
                    const pTasks = TaskStorage.getByProject(p.id);
                    const completed = pTasks.filter(t => t.status === 'done').length;
                    const pct = pTasks.length > 0 ? Math.round((completed / pTasks.length) * 100) : 0;
                    return (
                      <Link key={p.id} to={ROUTES.PROJECT_OVERVIEW(p.id)} className="block hover:bg-surface-secondary/40 p-2 -mx-2 rounded-lg transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm">{p.icon}</span>
                            <span className="text-xs font-semibold text-content-primary truncate">{p.name}</span>
                          </div>
                          <span className="text-xs font-medium text-content-secondary">{pct}%</span>
                        </div>
                        <div className="w-full bg-surface-secondary rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sprints Focus */}
            {activeSprints.length > 0 && (
              <div className="card">
                <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-amber-500" /> Sprints in Focus
                </h2>
                <div className="space-y-3">
                  {activeSprints.map(s => {
                    const p = projects.find(proj => proj.id === s.projectId);
                    if (!p) return null;
                    const sTasks = TaskStorage.getBySprint(s.id);
                    const doneCount = sTasks.filter(t => t.status === 'done').length;
                    const pct = sTasks.length > 0 ? Math.round((doneCount / sTasks.length) * 100) : 0;
                    return (
                      <Link key={s.id} to={ROUTES.PROJECT_SPRINTS(s.projectId)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-surface-border hover:bg-surface-secondary transition-colors">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-content-primary">{s.name}</span>
                            <span className="text-[10px] text-content-muted font-semibold bg-surface-secondary border border-surface-border px-1.5 py-0.5 rounded-md">
                              {p.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-content-muted block mt-0.5">Ends {formatDate(s.endDate)}</span>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-44 flex-shrink-0">
                          <div className="flex-1 bg-surface-secondary rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: p.color }} />
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

          {/* Right col — Activity */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  <Clock size={14} /> Recent Activity
                </h2>
              </div>
              <ActivityFeed activities={activities} limit={15} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
