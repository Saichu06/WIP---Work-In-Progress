import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart2, CheckSquare, Zap, TrendingUp, Target,
  Clock, AlertTriangle, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { TASK_STATUS_COLORS, PRIORITY_COLORS } from '@/constants';
import { cn, formatDate } from '@/utils';
import type { Project, Task, Sprint, ActivityLog } from '@/types';

const COLORS = ['#60A5FA', '#F59E0B', '#A78BFA', '#38BDF8', '#22C55E', '#9CA3AF'];

export function ProjectAnalytics() {
  const { project } = useOutletContext<{ project: Project }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setTasks(TaskStorage.getByProject(project.id));
    setSprints(SprintStorage.getByProject(project.id));
    setActivity(ActivityStorage.getByProject(project.id, 100));
  }, [project.id]);

  // Status breakdown
  const statusData = [
    { name: 'Backlog', value: tasks.filter(t => t.status === 'backlog').length, color: TASK_STATUS_COLORS.backlog },
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: TASK_STATUS_COLORS.todo },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: TASK_STATUS_COLORS['in-progress'] },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: TASK_STATUS_COLORS.review },
    { name: 'Testing', value: tasks.filter(t => t.status === 'testing').length, color: TASK_STATUS_COLORS.testing },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: TASK_STATUS_COLORS.done },
  ].filter(d => d.value > 0);

  // Priority breakdown
  const priorityData = [
    { name: 'Critical', value: tasks.filter(t => t.priority === 'critical').length, color: PRIORITY_COLORS.critical },
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: PRIORITY_COLORS.high },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: PRIORITY_COLORS.medium },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: PRIORITY_COLORS.low },
  ].filter(d => d.value > 0);

  // Sprint velocity
  const sprintVelocity = sprints.map(s => {
    const sprintTasks = tasks.filter(t => t.sprintId === s.id);
    const completed = sprintTasks.filter(t => t.status === 'done');
    const totalPoints = sprintTasks.reduce((acc, t) => acc + t.storyPoints, 0);
    const completedPoints = completed.reduce((acc, t) => acc + t.storyPoints, 0);
    return {
      name: s.name.length > 12 ? s.name.slice(0, 12) + '…' : s.name,
      planned: totalPoints,
      completed: completedPoints,
      tasks: sprintTasks.length,
      done: completed.length,
    };
  });

  // Activity over time (last 14 days)
  const now = new Date();
  const activityByDay = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = activity.filter(a => a.createdAt.startsWith(dateStr)).length;
    return { day: formatDate(d.toISOString(), 'MMM d'), count };
  });

  // Top labels
  const labelCounts: Record<string, number> = {};
  tasks.forEach(t => t.labels.forEach(l => { labelCounts[l] = (labelCounts[l] || 0) + 1; }));
  const topLabels = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Metrics
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const totalPoints = tasks.reduce((acc, t) => acc + t.storyPoints, 0);
  const completedPoints = tasks.filter(t => t.status === 'done').reduce((acc, t) => acc + t.storyPoints, 0);
  const avgPointsPerTask = tasks.length > 0 ? (totalPoints / tasks.length).toFixed(1) : '0';
  const activeSprint = sprints.find(s => s.status === 'active');
  const activeSprintTasks = activeSprint ? tasks.filter(t => t.sprintId === activeSprint.id) : [];
  const activeSprintDone = activeSprintTasks.filter(t => t.status === 'done').length;
  const activeSprintProgress = activeSprintTasks.length > 0 ? Math.round((activeSprintDone / activeSprintTasks.length) * 100) : 0;

  const kpis = [
    { label: 'Completion Rate', value: `${completionRate}%`, sub: `${completedTasks}/${tasks.length} tasks`, icon: <Target size={16} />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Story Points Done', value: completedPoints, sub: `of ${totalPoints} total`, icon: <Award size={16} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Avg Points/Task', value: avgPointsPerTask, sub: 'story points', icon: <TrendingUp size={16} />, color: 'text-purple-600 bg-purple-50' },
    { label: 'Sprint Progress', value: activeSprint ? `${activeSprintProgress}%` : '—', sub: activeSprint ? activeSprint.name : 'No active sprint', icon: <Zap size={16} />, color: 'text-amber-600 bg-amber-50' },
  ];

  const EmptyChart = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-40 text-content-muted">
      <BarChart2 size={28} className="mb-2 opacity-30" />
      <p className="text-xs">{message}</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Project metrics, velocity, and progress insights.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-content-secondary">{kpi.label}</span>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', kpi.color)}>{kpi.icon}</div>
            </div>
            <div className="text-2xl font-bold text-content-primary">{kpi.value}</div>
            <div className="text-xs text-content-muted mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Task Status Breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
            <CheckSquare size={14} /> Task Status
          </h2>
          {statusData.length === 0 ? <EmptyChart message="No tasks yet" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${value}`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => [value, 'Tasks']} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority Breakdown */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
            <AlertTriangle size={14} /> Priority Distribution
          </h2>
          {priorityData.length === 0 ? <EmptyChart message="No tasks yet" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={55} />
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <Tooltip formatter={(v: number) => [v, 'Tasks']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Labels */}
        <div className="card">
          <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
            <Clock size={14} /> Top Labels
          </h2>
          {topLabels.length === 0 ? <EmptyChart message="No labels used yet" /> : (
            <div className="space-y-2">
              {topLabels.map(([label, count]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-content-secondary w-20 truncate">{label}</span>
                  <div className="flex-1 bg-surface-secondary rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-content-primary transition-all" style={{ width: `${(count / (topLabels[0][1] || 1)) * 100}%` }} />
                  </div>
                  <span className="text-xs text-content-muted w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sprint Velocity */}
      {sprints.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" /> Sprint Velocity (Story Points)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sprintVelocity} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend iconType="square" wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="planned" name="Planned Points" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed Points" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Activity Trend */}
      <div className="card">
        <h2 className="text-sm font-semibold text-content-primary mb-4 flex items-center gap-2">
          <TrendingUp size={14} /> Activity — Last 14 Days
        </h2>
        {activity.length === 0 ? <EmptyChart message="No activity recorded yet" /> : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityByDay} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="actGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFE58F" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#FFE58F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="count" name="Events" stroke="#F5C800" strokeWidth={2} fill="url(#actGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
