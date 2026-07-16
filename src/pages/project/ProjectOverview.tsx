import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Zap, CheckSquare, FileText, Clock, TrendingUp, Plus, Code2, Image, Map } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { DocumentStorage } from '@/storage/DocumentStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ROUTES } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { Project, Task, Sprint, Document, ActivityLog } from '@/types';

export function ProjectOverview() {
  const { project } = useOutletContext<{ project: Project }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setTasks(TaskStorage.getByProject(project.id));
    setSprints(SprintStorage.getByProject(project.id));
    setDocs(DocumentStorage.getByProject(project.id).filter(d => d.type === 'document').slice(0, 5));
    setActivities(ActivityStorage.getByProject(project.id, 20));
  }, [project.id]);

  const activeSprint = sprints.find(s => s.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : project.progress;

  const upcomingTasks = tasks.filter(t => t.status !== 'done').slice(0, 5);
  const recentDocs = docs.slice(0, 3);

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: 'text-blue-600 bg-blue-50' },
    { label: 'In Progress', value: inProgressTasks, color: 'text-amber-600 bg-amber-50' },
    { label: 'Completed', value: completedTasks, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Sprints', value: sprints.length, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-in">
      <div className="max-w-7xl mx-auto">
        {/* Health Strip */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
              <TrendingUp size={14} /> Project Health
            </h2>
            <span className="text-sm font-bold text-content-primary">{progress}% complete</span>
          </div>
          <div className="w-full bg-surface-secondary rounded-full h-2 mb-4">
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: project.color }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className={cn('rounded-xl p-3', s.color.split(' ')[1])}>
                <div className={cn('text-2xl font-bold', s.color.split(' ')[0])}>{s.value}</div>
                <div className="text-xs font-medium text-content-secondary mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Sprint */}
            {activeSprint ? (
              <div className="card border-l-4" style={{ borderLeftColor: project.color }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" /> Current Sprint
                  </h2>
                  <Link to={ROUTES.PROJECT_SPRINTS(project.id)} className="text-xs text-content-secondary hover:text-content-primary">View →</Link>
                </div>
                <p className="font-semibold text-content-primary">{activeSprint.name}</p>
                {activeSprint.goal && <p className="text-sm text-content-secondary mt-1">{activeSprint.goal}</p>}
                <div className="flex items-center gap-4 mt-3 text-xs text-content-muted">
                  <span>Start: {formatDate(activeSprint.startDate)}</span>
                  <span>End: {formatDate(activeSprint.endDate)}</span>
                </div>
              </div>
            ) : (
              <div className="card border-dashed border-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-content-primary">No active sprint</p>
                  <p className="text-xs text-content-muted mt-0.5">Create a sprint to start tracking progress.</p>
                </div>
                <Link to={ROUTES.PROJECT_SPRINTS(project.id)} className="btn-secondary text-xs">
                  <Plus size={13} /> Create Sprint
                </Link>
              </div>
            )}

            {/* Open Tasks */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                  <CheckSquare size={14} /> Open Tasks
                </h2>
                <Link to={ROUTES.PROJECT_BACKLOG(project.id)} className="text-xs text-content-secondary hover:text-content-primary">
                  View all →
                </Link>
              </div>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare size={28} className="mx-auto text-emerald-400 mb-2" />
                  <p className="text-sm font-medium text-content-primary">All caught up!</p>
                  <p className="text-xs text-content-muted">No open tasks. Ship faster.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-secondary transition-colors">
                      <StatusBadge status={task.status} />
                      <span className="text-sm text-content-primary flex-1 truncate">{task.title}</span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-sm font-semibold text-content-primary mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { to: ROUTES.PROJECT_BACKLOG(project.id), icon: <CheckSquare size={16} className="text-content-secondary" />, label: 'Add Task' },
                  { to: ROUTES.PROJECT_SPRINTS(project.id), icon: <Zap size={16} className="text-content-secondary" />, label: 'Plan Sprint' },
                  { to: ROUTES.PROJECT_DOCS(project.id), icon: <FileText size={16} className="text-content-secondary" />, label: 'Write Docs' },
                  { to: ROUTES.PROJECT_SNIPPETS(project.id), icon: <Code2 size={16} className="text-content-secondary" />, label: 'Add Snippet' },
                  { to: ROUTES.PROJECT_ASSETS(project.id), icon: <Image size={16} className="text-content-secondary" />, label: 'Upload Asset' },
                  { to: ROUTES.PROJECT_PLANNING(project.id), icon: <Map size={16} className="text-content-secondary" />, label: 'Update Plan' },
                ].map(a => (
                  <Link key={a.to} to={a.to} className="flex items-center gap-2.5 p-3 rounded-xl border border-surface-border hover:bg-surface-secondary transition-colors text-sm font-medium text-content-primary">
                    {a.icon} <span>{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Recent Docs */}
            {recentDocs.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-content-primary flex items-center gap-2">
                    <FileText size={14} /> Recent Docs
                  </h2>
                  <Link to={ROUTES.PROJECT_DOCS(project.id)} className="text-xs text-content-secondary">View all →</Link>
                </div>
                <div className="space-y-2">
                  {recentDocs.map(d => (
                    <Link key={d.id} to={ROUTES.PROJECT_DOCS(project.id)} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface-secondary transition-colors">
                      <FileText size={13} className="text-content-muted flex-shrink-0" />
                      <span className="text-sm text-content-primary truncate">{d.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-content-muted" />
                <h2 className="text-sm font-semibold text-content-primary">Activity</h2>
              </div>
              <ActivityFeed activities={activities} limit={10} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
