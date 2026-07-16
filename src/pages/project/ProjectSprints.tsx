import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, X, Zap, Play, CheckSquare, Calendar, Target, Trash2, Edit3, ChevronRight, ChevronDown } from 'lucide-react';
import { SprintStorage } from '@/storage/SprintStorage';
import { TaskStorage } from '@/storage/TaskStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { cn, formatDate } from '@/utils';
import type { Project, Sprint, Task, SprintStatus } from '@/types';
import { format, addDays } from 'date-fns';
import { useToast } from '@/contexts/ToastContext';

export function ProjectSprints() {
  const { project } = useOutletContext<{ project: Project }>();
  const { success, warning } = useToast();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editSprint, setEditSprint] = useState<Sprint | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form states
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
      success('Sprint updated');
    } else {
      const s = SprintStorage.create({ projectId: project.id, name, goal, notes, status: 'planning', capacity, startDate, endDate });
      ActivityStorage.log('sprint_created', 'Sprint created', `"${name}" sprint created`, project.id, s.id);
      success('Sprint created');
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
    // Check if there's already an active sprint
    const active = sprints.find(s => s.status === 'active');
    if (active) {
      warning('Active Sprint exists', `Complete "${active.name}" before starting another one.`);
      return;
    }
    SprintStorage.update(sprint.id, { status: 'active' });
    ActivityStorage.log('sprint_started', 'Sprint started', `"${sprint.name}" sprint started`, project.id, sprint.id);
    setSprints(SprintStorage.getByProject(project.id));
    success('Sprint started');
  };

  const handleComplete = (sprint: Sprint) => {
    SprintStorage.update(sprint.id, { status: 'completed' });
    ActivityStorage.log('sprint_completed', 'Sprint completed', `"${sprint.name}" sprint completed`, project.id, sprint.id);
    setSprints(SprintStorage.getByProject(project.id));
    success('Sprint completed', 'Great job finishing the sprint!');
  };

  const handleDelete = (sprint: Sprint) => {
    if (confirm(`Delete "${sprint.name}"?`)) {
      SprintStorage.delete(sprint.id);
      setSprints(SprintStorage.getByProject(project.id));
      success('Sprint deleted');
    }
  };

  const getSprintTasks = (sprintId: string) => tasks.filter(t => t.sprintId === sprintId);
  const getProgress = (sprintId: string) => {
    const st = getSprintTasks(sprintId);
    if (!st.length) return 0;
    return Math.round((st.filter(t => t.status === 'done').length / st.length) * 100);
  };

  const STATUS_COLORS: Record<SprintStatus, string> = {
    planning: 'bg-blue-50 text-blue-600 border border-blue-100',
    active: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    completed: 'bg-gray-100 text-gray-500 border border-gray-200',
  };

  const groupedSprints = {
    active: sprints.filter(s => s.status === 'active'),
    planning: sprints.filter(s => s.status === 'planning'),
    completed: sprints.filter(s => s.status === 'completed'),
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-4xl mx-auto">
        <div className="page-header">
          <div>
            <h1 className="page-title">Sprints Workspace</h1>
            <p className="page-subtitle">{sprints.length} total · {groupedSprints.active.length} active sprint</p>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={16} /> New Sprint
          </button>
        </div>

        {/* Sprint Form */}
        {showForm && (
          <div className="card mb-6 border-2 border-content-primary/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-content-primary">{editSprint ? 'Edit Sprint Settings' : 'Initialize New Sprint'}</h3>
              <button onClick={resetForm} className="btn-ghost p-1 h-7 w-7 rounded-lg flex items-center justify-center"><X size={14} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Sprint Name *</label>
                <input className="input" placeholder="e.g. Sprint 1 - Foundation" value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div>
                <label className="label">Sprint Goal</label>
                <input className="input" placeholder="What are we shipping?" value={goal} onChange={e => setGoal(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Start Date</label>
                  <input type="date" className="input text-sm" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input type="date" className="input text-sm" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div>
                  <label className="label">Capacity (story points/hrs)</label>
                  <input type="number" className="input text-sm" min={1} value={capacity} onChange={e => setCapacity(Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="label">Sprint Notes</label>
                <textarea className="textarea text-sm" rows={2} placeholder="Retrospective notes, resource availability, etc." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={resetForm} className="btn-secondary">Cancel</button>
                <button onClick={handleSave} disabled={!name.trim()} className="btn-primary">{editSprint ? 'Save Changes' : 'Initialize Sprint'}</button>
              </div>
            </div>
          </div>
        )}

        {sprints.length === 0 ? (
          <EmptyState icon={<Zap className="text-content-muted" size={24} />} title="No sprints yet" description="Break your project into focused sprints. Start with a 2-week sprint." action={<button onClick={() => setShowForm(true)} className="btn-yellow">Create First Sprint</button>} />
        ) : (
          <div className="space-y-8">
            {(['active', 'planning', 'completed'] as SprintStatus[]).map(status => {
              const group = groupedSprints[status];
              if (!group.length) return null;
              return (
                <div key={status}>
                  <h2 className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3.5 capitalize">{status} sprints</h2>
                  <div className="space-y-4">
                    {group.map(sprint => {
                      const sprintTasks = getSprintTasks(sprint.id);
                      const progress = getProgress(sprint.id);
                      const expanded = expandedId === sprint.id;
                      return (
                        <div key={sprint.id} className="card hover:border-gray-300 transition-colors">
                          <div className="flex items-center justify-between mb-3 gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button onClick={() => setExpandedId(expanded ? null : sprint.id)} className="text-content-muted hover:text-content-primary transition-colors flex-shrink-0">
                                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-semibold text-content-primary truncate">{sprint.name}</h3>
                                  <span className={cn('badge text-[10px] uppercase font-semibold py-0.5 px-1.5', STATUS_COLORS[sprint.status])}>{sprint.status}</span>
                                </div>
                                {sprint.goal && <p className="text-xs text-content-muted mt-0.5 truncate">{sprint.goal}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {sprint.status === 'planning' && (
                                <button onClick={() => handleStart(sprint)} className="btn-ghost text-xs gap-1 border border-surface-border bg-surface-secondary/50 px-2 py-1 h-7 rounded-lg">
                                  <Play size={11} /> Start
                                </button>
                              )}
                              {sprint.status === 'active' && (
                                <button onClick={() => handleComplete(sprint)} className="btn-ghost text-xs gap-1 text-emerald-600 border border-emerald-100 bg-emerald-50 px-2 py-1 h-7 rounded-lg">
                                  <CheckSquare size={11} /> Complete
                                </button>
                              )}
                              <button onClick={() => openEdit(sprint)} className="btn-ghost p-1.5 h-7 w-7 rounded-lg" title="Edit sprint"><Edit3 size={12} /></button>
                              <button onClick={() => handleDelete(sprint)} className="btn-ghost p-1.5 h-7 w-7 text-red-500 rounded-lg" title="Delete sprint"><Trash2 size={12} /></button>
                            </div>
                          </div>

                          {/* Meta grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-content-muted mb-4 pb-3 border-b border-surface-secondary">
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-content-muted tracking-wider">Dates</span>
                              <span className="flex items-center gap-1 mt-0.5 font-medium text-content-primary">
                                <Calendar size={11} />
                                {formatDate(sprint.startDate, 'MMM d')} – {formatDate(sprint.endDate, 'MMM d')}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-content-muted tracking-wider">Capacity</span>
                              <span className="flex items-center gap-1 mt-0.5 font-medium text-content-primary">
                                <Target size={11} />
                                {sprint.capacity} hours
                              </span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-content-muted tracking-wider">Task count</span>
                              <span className="mt-0.5 block font-medium text-content-primary">{sprintTasks.length} tasks</span>
                            </div>
                            <div>
                              <span className="block text-[10px] uppercase font-bold text-content-muted tracking-wider">Completion</span>
                              <span className="mt-0.5 block font-medium text-content-primary">{progress}% completed</span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-surface-secondary rounded-full h-1.5">
                            <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                          </div>

                          {/* Expanded tasks listing */}
                          {expanded && sprintTasks.length > 0 && (
                            <div className="mt-4 space-y-2.5 border-t border-surface-border pt-4">
                              <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Sprint Backlog ({sprintTasks.length})</p>
                              <div className="divide-y divide-surface-border">
                                {sprintTasks.map(t => (
                                  <div key={t.id} className="flex items-center gap-3 py-2 text-xs">
                                    <StatusBadge status={t.status} />
                                    <span className="text-content-primary flex-1 truncate font-medium">{t.title}</span>
                                    <PriorityBadge priority={t.priority} />
                                    {t.storyPoints > 0 && (
                                      <span className="text-content-muted font-bold ml-1">{t.storyPoints}pt</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {expanded && sprintTasks.length === 0 && (
                            <div className="mt-4 border-t border-surface-border pt-4">
                              <p className="text-xs text-content-muted italic">No tasks assigned to this sprint. Go to backlog page to assign.</p>
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
    </div>
  );
}
