import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, X, ChevronDown, Trash2, Edit3, CheckSquare, Layers, Award, Sparkles } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { cn } from '@/utils';
import type { Project, Task, Sprint, Priority, TaskStatus } from '@/types';
import { useToast } from '@/contexts/ToastContext';

const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: TaskStatus[] = ['backlog', 'todo', 'in-progress', 'review', 'testing', 'done'];

export function ProjectBacklog() {
  const { project } = useOutletContext<{ project: Project }>();
  const { success, warning } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [sprintFilter, setSprintFilter] = useState<string | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);

  // Form states
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
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (sprintFilter !== 'all') {
      if (sprintFilter === 'none' && t.sprintId) return false;
      if (sprintFilter !== 'none' && t.sprintId !== sprintFilter) return false;
    }
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
      success('Task updated');
    } else {
      const t = TaskStorage.create({ projectId: project.id, title, description, priority, status, storyPoints, labels: labelArr, assignee, acceptanceCriteria, isFavorite: false, sprintId: sprintId || undefined });
      ActivityStorage.log('task_created', 'Task created', `"${title}" added to backlog`, project.id, t.id);
      success('Task created');
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
      setBulkSelected(prev => prev.filter(id => id !== task.id));
      success('Task deleted');
    }
  };

  // Inline modifiers
  const handleCyclePriority = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const curIdx = PRIORITIES.indexOf(task.priority);
    const nextPriority = PRIORITIES[(curIdx + 1) % PRIORITIES.length];
    TaskStorage.update(task.id, { priority: nextPriority });
    refresh();
    if (selectedTask?.id === task.id) setSelectedTask({ ...selectedTask, priority: nextPriority });
  };

  const handleCycleStatus = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    const curIdx = STATUSES.indexOf(task.status);
    const nextStatus = STATUSES[(curIdx + 1) % STATUSES.length];
    TaskStorage.update(task.id, { status: nextStatus });
    refresh();
    if (selectedTask?.id === task.id) setSelectedTask({ ...selectedTask, status: nextStatus });
  };

  const handleUpdatePoints = (e: React.ChangeEvent<HTMLInputElement>, task: Task) => {
    e.stopPropagation();
    const pts = Math.max(0, Number(e.target.value));
    TaskStorage.update(task.id, { storyPoints: pts });
    refresh();
    if (selectedTask?.id === task.id) setSelectedTask({ ...selectedTask, storyPoints: pts });
  };

  // Bulk operations
  const toggleBulkSelect = (e: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    e.stopPropagation();
    if (e.target.checked) {
      setBulkSelected(prev => [...prev, taskId]);
    } else {
      setBulkSelected(prev => prev.filter(id => id !== taskId));
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setBulkSelected(filtered.map(t => t.id));
    } else {
      setBulkSelected([]);
    }
  };

  const handleBulkMoveSprint = (sid: string) => {
    if (bulkSelected.length === 0) return;
    bulkSelected.forEach(tid => {
      TaskStorage.update(tid, { sprintId: sid || undefined });
    });
    refresh();
    setBulkSelected([]);
    success(`Moved ${bulkSelected.length} tasks to sprint`);
  };

  const handleBulkDelete = () => {
    if (bulkSelected.length === 0) return;
    if (confirm(`Delete ${bulkSelected.length} selected tasks?`)) {
      bulkSelected.forEach(tid => TaskStorage.delete(tid));
      refresh();
      setBulkSelected([]);
      setSelectedTask(null);
      success(`Deleted ${bulkSelected.length} tasks`);
    }
  };

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden animate-in">
      {/* Main List Column */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface-primary/10 overflow-hidden">
        {/* Sticky Filters header */}
        <div className="px-8 pt-6 pb-4 bg-white border-b border-surface-border flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-base font-bold text-content-primary">Backlog Workspace</h1>
              <p className="text-xs text-content-muted">{filtered.length} tasks matches · {tasks.filter(t => t.status === 'done').length} completed</p>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-primary h-9 text-xs">
              <Plus size={14} /> Add Task
            </button>
          </div>

          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
              <input className="input pl-8 h-8 text-xs placeholder:text-content-muted" placeholder="Search title or ID..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <select className="input h-8 text-xs w-32 py-0" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value as any)}>
              <option value="all">Priorities (All)</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>

            <select className="input h-8 text-xs w-32 py-0" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
              <option value="all">Statuses (All)</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {sprints.length > 0 && (
              <select className="input h-8 text-xs w-36 py-0" value={sprintFilter} onChange={e => setSprintFilter(e.target.value)}>
                <option value="all">Sprints (All)</option>
                <option value="none">Backlog (No Sprint)</option>
                {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-8 py-5">
          {/* Add/Edit Form Inline container */}
          {showForm && (
            <div className="card mb-6 border-2 border-content-primary/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-content-primary">{editTask ? 'Edit Task Details' : 'Initialize Backlog Task'}</h3>
                <button onClick={resetForm} className="btn-ghost p-1 h-7 w-7 rounded-lg flex items-center justify-center"><X size={14} /></button>
              </div>
              <div className="space-y-3.5">
                <input className="input" placeholder="What needs to be done? *" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
                <textarea className="textarea text-xs" rows={2} placeholder="Add context or description..." value={description} onChange={e => setDescription(e.target.value)} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="label text-xs">Priority</label>
                    <select className="input h-9 text-xs py-0" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Status</label>
                    <select className="input h-9 text-xs py-0" value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs">Story Points</label>
                    <input type="number" className="input h-9 text-xs" min={0} max={100} value={storyPoints} onChange={e => setStoryPoints(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="label text-xs">Assignee</label>
                    <input className="input h-9 text-xs" placeholder="e.g. Sarah" value={assignee} onChange={e => setAssignee(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label text-xs">Labels <span className="text-content-muted font-normal">(comma-separated)</span></label>
                  <input className="input h-9 text-xs" placeholder="frontend, ui, auth" value={labels} onChange={e => setLabels(e.target.value)} />
                </div>
                {sprints.length > 0 && (
                  <div>
                    <label className="label text-xs">Assign to Sprint</label>
                    <select className="input h-9 text-xs py-0" value={sprintId} onChange={e => setSprintId(e.target.value)}>
                      <option value="">None (Backlog)</option>
                      {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                <textarea className="textarea text-xs" rows={2} placeholder="Acceptance criteria guidelines..." value={acceptanceCriteria} onChange={e => setAcceptanceCriteria(e.target.value)} />
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={resetForm} className="btn-secondary">Cancel</button>
                  <button onClick={handleSave} disabled={!title.trim()} className="btn-primary">{editTask ? 'Save Changes' : 'Initialize Task'}</button>
                </div>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No backlog tasks matched"
              description="Refine your filters, or initialize a new task to build up your backlog backlog."
              action={<button onClick={() => setShowForm(true)} className="btn-yellow">Create Task</button>}
            />
          ) : (
            <div className="bg-white border border-surface-border rounded-2xl shadow-sm overflow-hidden select-none">
              {/* Header row */}
              <div className="flex items-center gap-3 px-4 py-2 bg-surface-secondary border-b border-surface-border text-[10px] font-bold text-content-muted uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded text-content-primary border-surface-border focus:ring-content-primary"
                  checked={bulkSelected.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                />
                <span className="w-16">ID</span>
                <span className="flex-1">Task Title</span>
                <span className="w-24 text-center">Status</span>
                <span className="w-24 text-center">Priority</span>
                <span className="w-16 text-center">Points</span>
                <span className="w-14"></span>
              </div>

              {/* Task list rows */}
              <div className="divide-y divide-surface-border">
                {filtered.map(task => {
                  const isSelected = selectedTask?.id === task.id;
                  const isChecked = bulkSelected.includes(task.id);

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(isSelected ? null : task)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer group hover:bg-surface-secondary/40',
                        isSelected && 'bg-surface-secondary/80'
                      )}
                    >
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded text-content-primary border-surface-border focus:ring-content-primary flex-shrink-0"
                        checked={isChecked}
                        onClick={e => e.stopPropagation()}
                        onChange={e => toggleBulkSelect(e, task.id)}
                      />
                      <span className="text-[10px] font-mono text-content-muted w-16 tracking-wider">{task.taskId}</span>
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className="text-xs font-semibold text-content-primary truncate">{task.title}</span>
                        {task.labels.slice(0, 2).map(l => (
                          <span key={l} className="badge bg-surface-secondary text-content-muted text-[9px] capitalize">{l}</span>
                        ))}
                      </div>
                      <div className="w-24 flex justify-center" onClick={e => handleCycleStatus(e, task)} title="Click to cycle status">
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="w-24 flex justify-center" onClick={e => handleCyclePriority(e, task)} title="Click to cycle priority">
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="w-16 flex justify-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="number"
                          min={0}
                          className="w-12 text-center text-xs font-bold border border-surface-border rounded p-0.5 bg-surface-secondary focus:bg-white"
                          value={task.storyPoints}
                          onChange={e => handleUpdatePoints(e, task)}
                        />
                      </div>
                      <div className="w-14 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); openEdit(task); }}
                          className="p-1 text-content-secondary hover:text-content-primary rounded hover:bg-surface-border"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(task); }}
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-surface-border"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bulk Action Sticky Footer bar */}
        {bulkSelected.length > 0 && (
          <div className="px-8 py-3.5 bg-content-primary text-white border-t border-gray-800 flex items-center justify-between flex-shrink-0 animate-scale-in">
            <span className="text-xs font-bold">{bulkSelected.length} tasks selected</span>
            <div className="flex items-center gap-2">
              {sprints.length > 0 && (
                <div className="relative">
                  <select
                    className="bg-gray-800 border border-gray-700 text-white rounded px-2.5 py-1 text-xs outline-none cursor-pointer"
                    onChange={e => handleBulkMoveSprint(e.target.value)}
                    value=""
                  >
                    <option value="" disabled>Move to Sprint...</option>
                    <option value="none">None (Backlog)</option>
                    {sprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white rounded px-3 py-1 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={12} /> Delete
              </button>
              <button onClick={() => setBulkSelected([])} className="text-xs text-gray-400 hover:text-white px-2 py-1">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Sidebar */}
      {selectedTask && (
        <div className="w-80 border-l border-surface-border bg-white p-6 overflow-y-auto flex-shrink-0 animate-slide-in-left select-none">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-surface-secondary">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider">Inspect properties</h3>
            <button onClick={() => setSelectedTask(null)} className="btn-ghost p-1 h-7 w-7 rounded-lg flex items-center justify-center"><X size={14} /></button>
          </div>
          <span className="text-[10px] font-mono text-content-muted tracking-wider bg-surface-secondary px-1.5 py-0.5 rounded border border-surface-border">{selectedTask.taskId}</span>
          <h2 className="text-sm font-bold text-content-primary mt-2 mb-3 leading-snug">{selectedTask.title}</h2>
          {selectedTask.description && <p className="text-xs text-content-secondary leading-relaxed bg-surface-secondary/40 rounded-xl p-3 mb-4">{selectedTask.description}</p>}

          <div className="space-y-3.5 text-xs">
            <Row label="Status"><StatusBadge status={selectedTask.status} /></Row>
            <Row label="Priority"><PriorityBadge priority={selectedTask.priority} /></Row>
            <Row label="Story Points"><span className="font-extrabold text-content-primary">{selectedTask.storyPoints} pt</span></Row>
            {selectedTask.assignee && <Row label="Assignee"><span className="font-semibold text-content-primary">{selectedTask.assignee}</span></Row>}
            {selectedTask.labels.length > 0 && (
              <Row label="Labels">
                <div className="flex gap-1 flex-wrap justify-end max-w-[160px]">
                  {selectedTask.labels.map(l => <span key={l} className="badge bg-surface-secondary text-content-muted text-[10px] capitalize">{l}</span>)}
                </div>
              </Row>
            )}
            {selectedTask.acceptanceCriteria && (
              <div className="pt-2 border-t border-surface-secondary">
                <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">Acceptance criteria</p>
                <p className="text-xs text-content-secondary leading-relaxed bg-surface-secondary/60 rounded-xl p-3 border border-surface-border">{selectedTask.acceptanceCriteria}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-6 pt-4 border-t border-surface-secondary">
            <button onClick={() => { openEdit(selectedTask); setSelectedTask(null); }} className="btn-secondary flex-1 text-xs h-9">Edit</button>
            <button onClick={() => handleDelete(selectedTask)} className="btn-danger flex-1 text-xs h-9">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-surface-secondary">
      <span className="text-content-secondary font-medium">{label}</span>
      <div>{children}</div>
    </div>
  );
}
