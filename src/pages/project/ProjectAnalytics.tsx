import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart2, CheckSquare, Zap, TrendingUp, Target,
  Clock, AlertTriangle, Award, ShieldAlert, CheckCircle2, History
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { TASK_STATUS_COLORS, PRIORITY_COLORS } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { Project, Task, Sprint, ActivityLog } from '@/types';
import { isPast, parseISO } from 'date-fns';
import { ActivityFeed } from '@/components/common/ActivityFeed';

export function ProjectAnalytics() {
  const { project } = useOutletContext<{ project: Project }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setTasks(TaskStorage.getByProject(project.id));
    setSprints(SprintStorage.getByProject(project.id));
    setActivities(ActivityStorage.getByProject(project.id, 20));
  }, [project.id]);

  // Calculations
  const completedTasks = tasks.filter(t => t.status === 'done');
  const openTasks = tasks.filter(t => t.status !== 'done');
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Blocked & Overdue Tasks
  const blockedTasks = tasks.filter(t =>
    t.status !== 'done' &&
    (t.dependencies?.some(d => d.relationship === 'blocked-by') || t.title.toLowerCase().includes('[blocked]'))
  );

  const overdueTasks = tasks.filter(t =>
    t.status !== 'done' &&
    t.dueDate &&
    isPast(parseISO(t.dueDate))
  );

  // Active Sprint
  const activeSprint = sprints.find(s => s.status === 'active');
  const activeSprintTasks = activeSprint ? tasks.filter(t => t.sprintId === activeSprint.id) : [];
  const activeSprintCompleted = activeSprintTasks.filter(t => t.status === 'done');
  const activeSprintProgress = activeSprintTasks.length > 0
    ? Math.round((activeSprintCompleted.length / activeSprintTasks.length) * 100)
    : 0;

  // Velocity Calculation (Average completed story points per completed sprint)
  const completedSprints = sprints.filter(s => s.status === 'completed');
  let avgVelocity = 0;
  if (completedSprints.length > 0) {
    const totalSprintPoints = completedSprints.reduce((sum, s) => {
      const sTasks = tasks.filter(t => t.sprintId === s.id && t.status === 'done');
      return sum + sTasks.reduce((pSum, t) => pSum + (t.storyPoints || 0), 0);
    }, 0);
    avgVelocity = Math.round(totalSprintPoints / completedSprints.length);
  }

  // Cycle Time Calculation (Average days from creation to completion)
  let avgCycleTimeStr = '—';
  if (completedTasks.length > 0) {
    const totalMs = completedTasks.reduce((sum, t) => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.updatedAt).getTime();
      return sum + Math.max(end - start, 86400000); // minimum 1 day
    }, 0);
    const avgDays = (totalMs / completedTasks.length / (1000 * 60 * 60 * 24)).toFixed(1);
    avgCycleTimeStr = `${avgDays} days`;
  }

  // Sprints breakdown
  const sprintData = sprints.map(s => {
    const sTasks = tasks.filter(t => t.sprintId === s.id);
    const completed = sTasks.filter(t => t.status === 'done');
    const plannedPoints = sTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = completed.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    return {
      name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
      planned: plannedPoints,
      completed: completedPoints,
      capacity: s.capacity,
    };
  });

  // Task distributions
  const statusData = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length, color: TASK_STATUS_COLORS.backlog },
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: TASK_STATUS_COLORS.todo },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: TASK_STATUS_COLORS['in-progress'] },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: TASK_STATUS_COLORS.review },
    { name: 'Testing', value: tasks.filter(t => t.status === 'testing').length, color: TASK_STATUS_COLORS.testing },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: TASK_STATUS_COLORS.done },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'Critical', value: tasks.filter(t => t.priority === 'critical').length, color: PRIORITY_COLORS.critical },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: PRIORITY_COLORS.high },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: PRIORITY_COLORS.medium },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: PRIORITY_COLORS.low },
  ].filter(d => d.value > 0);

  const labelCounts: Record<string, number> = {};
  tasks.forEach(t => t.labels?.forEach(l => { labelCounts[l] = (labelCounts[l] || 0) + 1; }));
  const topLabels = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-44 text-content-muted">
      <BarChart2 size={24} className="mb-2 opacity-35" />
      <p className="text-xs">{message}</p>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Project Insights</h1>
            <p className="page-subtitle">Track velocity, task distributions, and productivity diagnostics.</p>
          </div>
        </div>

        {/* Section 1: Project Health Command */}
        <div>
          <h2 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-3">Project Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* KPI Cards Strip */}
            <div className="md:col-span-2 card grid grid-cols-2 gap-4">
              <div className="border-r border-surface-border pr-2">
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block">Total Progress</span>
                <span className="text-2xl font-extrabold text-content-primary mt-1 block">{progress}%</span>
                <span className="text-xs text-content-secondary">{completedTasks.length} of {tasks.length} tasks completed</span>
                <div className="w-full bg-surface-secondary rounded-full h-1.5 mt-2">
                  <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="pl-2">
                <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block">Current Sprint Progress</span>
                {activeSprint ? (
                  <>
                    <span className="text-2xl font-extrabold text-content-primary mt-1 block">{activeSprintProgress}%</span>
                    <span className="text-xs text-content-secondary">{activeSprint.name}</span>
                    <div className="w-full bg-surface-secondary rounded-full h-1.5 mt-2">
                      <div className="h-1.5 rounded-full bg-amber-500 transition-all" style={{ width: `${activeSprintProgress}%` }} />
                    </div>
                  </>
                ) : (
                  <span className="text-sm font-medium text-content-muted mt-2 block">No Active Sprint</span>
                )}
              </div>
            </div>

            {/* Health Indicators List */}
            <div className="card flex flex-col justify-between py-4">
              <div className="flex items-center justify-between border-b border-surface-secondary pb-2.5">
                <span className="text-xs text-content-secondary flex items-center gap-1.5"><ShieldAlert size={13} className="text-red-500" /> Overdue Tasks</span>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', overdueTasks.length > 0 ? 'bg-red-50 text-red-600' : 'bg-surface-secondary text-content-muted')}>{overdueTasks.length}</span>
              </div>
              <div className="flex items-center justify-between border-b border-surface-secondary py-2.5">
                <span className="text-xs text-content-secondary flex items-center gap-1.5"><AlertTriangle size={13} className="text-amber-500" /> Blocked Tasks</span>
                <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md', blockedTasks.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-surface-secondary text-content-muted')}>{blockedTasks.length}</span>
              </div>
              <div className="flex items-center justify-between pt-2.5">
                <span className="text-xs text-content-secondary flex items-center gap-1.5"><TrendingUp size={13} className="text-blue-500" /> Team Velocity</span>
                <span className="text-xs font-extrabold text-content-primary">{avgVelocity || '—'} pt/sprint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Task Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card flex flex-col justify-between">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">Status Distribution</h3>
            {statusData.length === 0 ? <EmptyChart message="Add tasks to see status charts" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                    {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, 'Tasks']} />
                  <Legend iconType="circle" iconSize={6} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card flex flex-col justify-between">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">Priority Breakdown</h3>
            {priorityData.length === 0 ? <EmptyChart message="Add tasks to see priorities" /> : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={priorityData} margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v, 'Tasks']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card flex flex-col justify-between">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">Top Labels</h3>
            {topLabels.length === 0 ? <EmptyChart message="No labels utilized" /> : (
              <div className="space-y-3">
                {topLabels.map(([label, count]) => (
                  <div key={label} className="flex items-center gap-3 text-xs">
                    <span className="text-content-secondary font-medium w-16 truncate capitalize">{label}</span>
                    <div className="flex-1 bg-surface-secondary rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-content-primary" style={{ width: `${(count / topLabels[0][1]) * 100}%` }} />
                    </div>
                    <span className="text-content-muted font-bold text-right w-4">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Sprint Insights & Productivity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Velocity Trend */}
          <div className="lg:col-span-2 card">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">Sprint Velocity Tracker</h3>
            {sprints.length === 0 ? <EmptyChart message="No sprints defined yet" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sprintData} margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend iconType="square" wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="planned" name="Planned Points" fill="#D1D5DB" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="completed" name="Completed Points" fill="#111827" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Productivity Diagnostic */}
          <div className="card flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">Productivity diagnostics</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <div>
                    <span className="text-xs text-content-muted block">Tasks Completed</span>
                    <span className="text-sm font-bold text-content-primary">{completedTasks.length} tasks total</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                    <Clock size={15} />
                  </div>
                  <div>
                    <span className="text-xs text-content-muted block">Average Cycle Time</span>
                    <span className="text-sm font-bold text-content-primary">{avgCycleTimeStr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Finished tasks preview */}
            <div className="mt-4 pt-4 border-t border-surface-border space-y-2">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider block">Recently Completed</span>
              {completedTasks.length === 0 ? (
                <span className="text-xs text-content-muted italic">No tasks completed yet.</span>
              ) : (
                <div className="space-y-1.5">
                  {completedTasks.slice(0, 3).map(t => (
                    <div key={t.id} className="flex items-center justify-between text-xs text-content-primary">
                      <span className="truncate flex-1 font-medium">{t.title}</span>
                      <span className="text-[10px] text-content-muted font-mono ml-2">{t.taskId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Recent Activities stream */}
        <div className="card">
          <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <History size={14} /> Recent Workspace Activity
          </h3>
          <div className="max-h-60 overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-xs text-content-muted italic py-4">No recent activity logged.</p>
            ) : (
              <ActivityFeed activities={activities} limit={15} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
