import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Zap, Play, CheckSquare, Calendar, Target, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { SprintStorage } from '@/storage/SprintStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { cn, formatDate } from '@/utils';
import type { Project, Sprint, Task, SprintStatus } from '@/types';
import { format, addDays } from 'date-fns';

export function ProjectSprints() {
  const { project } = useOutletContext<{ project: Project }>();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [notes, setNotes] = useState('');
  const [capacity, setCapacity] = useState(40);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 13), 'yyyy-MM-dd'));

  useEffect(() => {
    setSprints(SprintStorage.getByProject(project.id));
    setTasks(TaskStorage.getByProject(project.id));
  }, [project.id]);

  const resetForm = () => {
    setName(''); setGoal(''); setNotes(''); setCapacity(40);
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setEndDate(format(addDays(new Date(), 13), 'yyyy-MM-dd'));
    setEditSprint(null); setShowForm(false);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editSprint) {
      SprintStorage.update(editSprint.id, { name, goal, notes, capacity, startDate, endDate });
    } else {
      const s = SprintStorage.create({ projectId: project.id, name, goal, notes, status: 'planning', capacity, startDate, endDate });
      ActivityStorage.log('sprint_created', 'Sprint created', `"${name}" sprint created`, project.id, s.id);
    }
    setSprints(SprintStorage.getByProject(project.id));
    resetForm();
  };

  const openEdit = (sprint: Sprint) => {
    setEditSprint(sprint);
    setName(sprint.name); setGoal(sprint.goal); setNotes(sprint.notes);
    setCapacity(sprint.capacity); setStartDate(sprint.startDate); setEndDate(sprint.endDate);
    setShowForm(true);
  };

  const handleStart = (sprint: Sprint) => {
    SprintStorage.update(sprint.id, { status: 'active' });
    ActivityStorage.log('sprint_started', 'Sprint started', `"${sprint.name}" sprint started`, project.id, sprint.id);
    setSprints(SprintStorage.getByProject(project.id));
  };

  const handleComplete = (sprint: Sprint) => {
    SprintStorage.update(sprint.id, { status: 'completed' });
    ActivityStorage.log('sprint_completed', 'Sprint completed', `"${sprint.name}" sprint completed`, project.id, sprint.id);
    setSprints(SprintStorage.getByProject(project.id));
  };

  const handleDelete = (sprint: Sprint) => {
    if (confirm(`Delete "${sprint.name}"?`)) {
      SprintStorage.delete(sprint.id);
      setSprints(SprintStorage.getByProject(project.id));
    }
  };

  const getSprintTasks = (sprintId: string) => tasks.filter(t => t.sprintId === sprintId);
  const getProgress = (sprintId: string) => {
    const st = getSprintTasks(sprintId);
    if (!st.length) return 0;
    return Math.round((st.filter(t => t.status === 'done').length / st.length) * 100);
  };

  const STATUS_COLORS: Record<SprintStatus, string> = {
    planning: 'bg-blue-50 text-blue-600',
    active: 'bg-emerald-50 text-emerald-600',
    completed: 'bg-gray-100 text-gray-500',
  };

  const groupedSprints = {
    active: sprints.filter(s => s.status === 'active'),
    planning: sprints.filter(s => s.status === 'planning'),
    completed: sprints.filter(s => s.status === 'completed'),
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sprints</h1>
          <p className="page-subtitle">{sprints.length} total · {groupedSprints.active.length} active</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={16} /> New Sprint
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-6 border-2 border-content-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">{editSprint ? 'Edit Sprint' : 'New Sprint'}</h3>
            <button onClick={resetForm} className="btn-ghost p-1.5"><X size={14} /></button>
          </div>
          <div className="space-y-3">
            <input className="input" placeholder="Sprint name *" value={name} onChange={e => setName(e.target.value)} autoFocus />
            <input className="input" placeholder="Sprint goal" value={goal} onChange={e => setGoal(e.target.value)} />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Start Date</label>
                <input type="date" className="input h-9 text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <label className="label text-xs">End Date</label>
                <input type="date" className="input h-9 text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div>
                <label className="label text-xs">Capacity (hrs)</label>
                <input type="number" className="input h-9 text-sm" min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} />
              </div>
            </div>
            <textarea className="textarea" rows={2} placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button onClick={resetForm} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={!name.trim()} className="btn-primary">{editSprint ? 'Save' : 'Create Sprint'}</button>
            </div>
          </div>
        </div>
      )}

      {sprints.length === 0 ? (
        <EmptyState icon="⚡" title="No sprints yet" description="Break your project into focused sprints. Start with a 2-week sprint." action={<button onClick={() => setShowForm(true)} className="btn-yellow">Create First Sprint</button>} />
      ) : (
        <div className="space-y-6">
          {(['active', 'planning', 'completed'] as SprintStatus[]).map(status => {
            const group = groupedSprints[status];
            if (!group.length) return null;
            return (
              <div key={status}>
                <h2 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3 capitalize">{status}</h2>
                <div className="space-y-3">
                  {group.map(sprint => {
                    const sprintTasks = getSprintTasks(sprint.id);
                    const progress = getProgress(sprint.id);
                    const expanded = expandedId === sprint.id;
                    return (
                      <div key={sprint.id} className="card">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button onClick={() => setExpandedId(expanded ? null : sprint.id)} className="text-content-muted hover:text-content-primary transition-colors">
                              <Zap size={15} className={sprint.status === 'active' ? 'text-amber-500' : ''} />
                            </button>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-content-primary truncate">{sprint.name}</h3>
                                <span className={cn('badge text-xs', STATUS_COLORS[sprint.status])}>{sprint.status}</span>
                              </div>
                              {sprint.goal && <p className="text-xs text-content-muted mt-0.5 truncate">{sprint.goal}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {sprint.status === 'planning' && (
                              <button onClick={() => handleStart(sprint)} className="btn-ghost text-xs gap-1">
                                <Play size={12} /> Start
                              </button>
                            )}
                            {sprint.status === 'active' && (
                              <button onClick={() => handleComplete(sprint)} className="btn-ghost text-xs gap-1 text-emerald-600">
                                <CheckSquare size={12} /> Complete
                              </button>
                            )}
                            <button onClick={() => openEdit(sprint)} className="btn-ghost p-1.5"><Edit3 size={12} /></button>
                            <button onClick={() => handleDelete(sprint)} className="btn-ghost p-1.5 text-red-500"><Trash2 size={12} /></button>
                          </div>
                        </div>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-content-muted mb-3">
                          <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(sprint.startDate, 'MMM d')} – {formatDate(sprint.endDate, 'MMM d')}</span>
                          <span className="flex items-center gap-1"><Target size={11} />{sprint.capacity}h capacity</span>
                          <span>{sprintTasks.length} tasks</span>
                          <span>{progress}% done</span>
                        </div>

                        {/* Progress */}
                        <div className="w-full bg-surface-secondary rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
                        </div>

                        {/* Expanded tasks */}
                        {expanded && sprintTasks.length > 0 && (
                          <div className="mt-4 space-y-1.5 border-t border-surface-border pt-4">
                            {sprintTasks.map(t => (
                              <div key={t.id} className="flex items-center gap-2">
                                <StatusBadge status={t.status} />
                                <span className="text-xs text-content-primary flex-1 truncate">{t.title}</span>
                                <PriorityBadge priority={t.priority} />
                                <span className="text-xs text-content-muted">{t.storyPoints}pt</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {expanded && sprintTasks.length === 0 && (
                          <div className="mt-4 border-t border-surface-border pt-4">
                            <p className="text-xs text-content-muted italic">No tasks in this sprint yet. Assign tasks from the backlog.</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
