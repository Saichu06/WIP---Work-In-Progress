import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, X, ChevronDown, Star, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { cn, formatDate } from '@/utils';
import type { Project, Task, Sprint, Priority, TaskStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'testing', 'done'];

export function ProjectBacklog() {
  const { project } = useOutletContext<{ project: Project }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('backlog');
  const [storyPoints, setStoryPoints] = useState(1);
  const [labels, setLabels] = useState('');
  const [assignee, setAssignee] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [sprintId, setSprintId] = useState('');

  useEffect(() => {
    setTasks(TaskStorage.getByProject(project.id));
    setSprints(SprintStorage.getByProject(project.id));
  }, [project.id]);

  const refresh = () => setTasks(TaskStorage.getByProject(project.id));

  const filtered = tasks.filter(t => {
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const resetForm = () => {
    setTitle(''); setDescription(''); setPriority('medium'); setStatus('backlog');
    setStoryPoints(1); setLabels(''); setAssignee(''); setAcceptanceCriteria(''); setSprintId('');
    setEditTask(null); setShowForm(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const labelArr = labels.split(',').map(l => l.trim()).filter(Boolean);
    if (editTask) {
      TaskStorage.update(editTask.id, { title, description, priority, status, storyPoints, labels: labelArr, assignee, acceptanceCriteria, sprintId: sprintId || undefined });
      ActivityStorage.log('task_updated', 'Task updated', `"${title}" was updated`, project.id, editTask.id);
    } else {
      const t = TaskStorage.create({ projectId: project.id, title, description, priority, status, storyPoints, labels: labelArr, assignee, acceptanceCriteria, isFavorite: false, sprintId: sprintId || undefined });
      ActivityStorage.log('task_created', 'Task created', `"${title}" added to backlog`, project.id, t.id);
    }
    refresh();
    resetForm();
  };

  const openEdit = (task: Task) => {
    setEditTask(task);
    setTitle(task.title); setDescription(task.description); setPriority(task.priority);
    setStatus(task.status); setStoryPoints(task.storyPoints); setLabels(task.labels.join(', '));
    setAssignee(task.assignee); setAcceptanceCriteria(task.acceptanceCriteria);
    setSprintId(task.sprintId || '');
    setShowForm(true);
  };

  const handleDelete = (task: Task) => {
    if (confirm(`Delete "${task.title}"?`)) {
      TaskStorage.delete(task.id);
      ActivityStorage.log('task_updated', 'Task deleted', `"${task.title}" was removed`, project.id);
      refresh();
      if (selectedTask?.id === task.id) setSelectedTask(null);
    }
  };

  const moveToSprint = (taskId: string, sid: string) => {
    TaskStorage.update(taskId, { sprintId: sid || undefined });
    refresh();
    ActivityStorage.log('task_moved', 'Task moved to sprint', `Task moved to sprint`, project.id, taskId);
  };

  return (
    <div className="flex h-full">
      {/* Main list */}
      <div className={cn('flex-1 p-8 overflow-y-auto', selectedTask && 'pr-0')}>
        <div className="max-w-4xl">
          <div className="page-header">
            <div>
              <h1 className="page-title">Backlog</h1>
              <p className="page-subtitle">{filtered.length} tasks · {tasks.filter(t => t.status === 'done').length} done</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={16} /> Add Task
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input className="input pl-9 h-9 text-sm" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input h-9 text-sm w-32" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)}>
              <option value="all">All priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="card mb-6 border-content-primary/20 border-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-content-primary">{editTask ? 'Edit Task' : 'New Task'}</h3>
                <button onClick={resetForm} className="btn-ghost p-1.5"><X size={14} /></button>
              </div>
              <div className="space-y-3">
                <input className="input" placeholder="Task title *" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                <textarea className="textarea" rows={2} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-xs">Priority</label>
                    <select className="input h-9 text-sm" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Status</label>
                    <select className="input h-9 text-sm" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Story Points</label>
                    <input type="number" className="input h-9 text-sm" min={0} max={100} value={storyPoints} onChange={e => setStoryPoints(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="label text-xs">Assignee</label>
                    <input className="input h-9 text-sm" placeholder="Name" value={assignee} onChange={e => setAssignee(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Labels <span className="text-content-muted font-normal">(comma separated)</span></label>
                  <input className="input h-9 text-sm" placeholder="frontend, api, bug..." value={labels} onChange={e => setLabels(e.target.value)} />
                </div>
                {sprints.length > 0 && (
                  <div>
                    <label className="label text-xs">Assign to Sprint</label>
                    <select className="input h-9 text-sm" value={sprintId} onChange={e => setSprintId(e.target.value)}>
                      <option value="">None (Backlog)</option>
                      {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <textarea className="textarea" rows={2} placeholder="Acceptance criteria" value={acceptanceCriteria} onChange={e => setAcceptanceCriteria(e.target.value)} />
                <div className="flex gap-2 justify-end">
                  <button onClick={resetForm} className="btn-secondary">Cancel</button>
                  <button onClick={handleSave} disabled={!title.trim()} className="btn-primary">
                    {editTask ? 'Save Changes' : 'Add Task'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title="Nothing in the backlog"
              description="Add your first task to start building. Break down your work into manageable pieces."
              action={<button onClick={() => setShowForm(true)} className="btn-yellow">Add First Task</button>}
            />
          ) : (
            <div className="space-y-2">
              {filtered.map(task => (
                <div
                  key={task.id}
                  className={cn('card-hover flex items-center gap-3 cursor-pointer group', selectedTask?.id === task.id && 'ring-2 ring-content-primary/20')}
                  onClick={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium text-content-primary truncate">{task.title}</span>
                      {task.labels.slice(0, 3).map(l => (
                        <span key={l} className="badge bg-surface-secondary text-content-muted text-xs">{l}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-content-muted">{task.storyPoints} pts</span>
                      {task.assignee && <span className="text-xs text-content-muted">· {task.assignee}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => { e.stopPropagation(); openEdit(task); }} className="btn-ghost p-1.5">
                      <Edit3 size={12} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(task); }} className="btn-ghost p-1.5 text-red-500">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Sidebar */}
      {selectedTask && (
        <div className="w-80 border-l border-surface-border bg-white p-6 overflow-y-auto flex-shrink-0 animate-slide-in-left">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-content-primary">Task Details</h3>
            <button onClick={() => setSelectedTask(null)} className="btn-ghost p-1.5"><X size={14} /></button>
          </div>
          <h2 className="text-base font-semibold text-content-primary mb-3">{selectedTask.title}</h2>
          {selectedTask.description && <p className="text-sm text-content-secondary mb-4">{selectedTask.description}</p>}
          <div className="space-y-3 text-sm">
            <Row label="Status"><StatusBadge status={selectedTask.status} /></Row>
            <Row label="Priority"><PriorityBadge priority={selectedTask.priority} /></Row>
            <Row label="Points"><span className="font-medium">{selectedTask.storyPoints}</span></Row>
            {selectedTask.assignee && <Row label="Assignee"><span>{selectedTask.assignee}</span></Row>}
            {selectedTask.labels.length > 0 && (
              <Row label="Labels">
                <div className="flex gap-1 flex-wrap">
                  {selectedTask.labels.map(l => <span key={l} className="badge bg-surface-secondary text-content-muted text-xs">{l}</span>)}
                </div>
              </Row>
            )}
            {selectedTask.acceptanceCriteria && (
              <div>
                <p className="text-xs text-content-muted mb-1">Acceptance Criteria</p>
                <p className="text-sm text-content-secondary bg-surface-secondary rounded-lg p-3">{selectedTask.acceptanceCriteria}</p>
              </div>
            )}
            {sprints.length > 0 && (
              <div>
                <p className="text-xs text-content-muted mb-1">Move to Sprint</p>
                <select className="input h-9 text-sm" value={selectedTask.sprintId || ''} onChange={e => { moveToSprint(selectedTask.id, e.target.value); setSelectedTask({ ...selectedTask, sprintId: e.target.value || undefined }); }}>
                  <option value="">None (Backlog)</option>
                  {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-6">
            <button onClick={() => { openEdit(selectedTask); setSelectedTask(null); }} className="btn-secondary flex-1 text-xs">Edit</button>
            <button onClick={() => handleDelete(selectedTask)} className="btn-danger flex-1 text-xs">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-content-muted">{label}</span>
      <div>{children}</div>
    </div>
  );
}
