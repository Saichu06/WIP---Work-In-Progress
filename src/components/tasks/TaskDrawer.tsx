import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskStatus, Priority } from '@/types';
import { TaskStorage } from '@/storage/TaskStorage';
import { SprintStorage } from '@/storage/SprintStorage';
import { TaskChecklist } from './TaskChecklist';
import { TaskSubtasks } from './TaskSubtasks';
import { TaskComments } from './TaskComments';
import { TaskAttachments } from './TaskAttachments';
import { TaskActivity } from './TaskActivity';
import { X, Archive, Trash2, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/utils';

interface TaskDrawerProps {
  taskId: string;
  projectId: string;
  onClose: () => void;
  onUpdate: () => void;
  onArchiveToggle: (taskId: string, archive: boolean) => void;
  onDelete: (taskId: string) => void;
}

type TabType = 'general' | 'checklist' | 'subtasks' | 'attachments' | 'comments' | 'activity';

export function TaskDrawer({
  taskId,
  projectId,
  onClose,
  onUpdate,
  onArchiveToggle,
  onDelete
}: TaskDrawerProps) {
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [saveIndicator, setSaveIndicator] = useState('Autosaved');

  // Input states for autosave
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [storyPoints, setStoryPoints] = useState(0);
  const [sprintId, setSprintId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignee, setAssignee] = useState('');
  const [watchers, setWatchers] = useState('');
  const [labels, setLabels] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [actualTime, setActualTime] = useState(0);
  const [epicId, setEpicId] = useState('');
  const [storyId, setStoryId] = useState('');

  const debouncedTimer = useRef<ReturnType<typeof setTimeout>>();

  const refreshTask = () => {
    const fresh = TaskStorage.getById(taskId);
    if (fresh) {
      setTask(fresh);
      setTitle(fresh.title);
      setDescription(fresh.description || '');
      setPriority(fresh.priority);
      setStatus(fresh.status);
      setStoryPoints(fresh.storyPoints || 0);
      setSprintId(fresh.sprintId || '');
      setDueDate(fresh.dueDate || '');
      setAssignee(fresh.assignee || '');
      setWatchers(fresh.watchers?.join(', ') || '');
      setLabels(fresh.labels?.join(', ') || '');
      setAcceptanceCriteria(fresh.acceptanceCriteria || '');
      setEstimatedTime(fresh.estimatedTime || 0);
      setActualTime(fresh.actualTime || 0);
      setEpicId(fresh.epicId || '');
      setStoryId(fresh.storyId || '');
    }
  };

  useEffect(() => {
    refreshTask();
    return () => {
      if (debouncedTimer.current) clearTimeout(debouncedTimer.current);
    };
  }, [taskId]);

  if (!task) return null;

  // Trigger autosave debounced
  const triggerAutosave = (updatedFields: Partial<Task>) => {
    setSaveIndicator('Saving...');
    if (debouncedTimer.current) clearTimeout(debouncedTimer.current);

    debouncedTimer.current = setTimeout(() => {
      TaskStorage.update(taskId, updatedFields);
      setSaveIndicator('Saved');
      onUpdate();
      // Reload timeline and version
      const fresh = TaskStorage.getById(taskId);
      if (fresh) setTask(fresh);
    }, 800);
  };

  const handleFieldChange = (field: keyof Task, val: any) => {
    let finalVal = val;
    if (field === 'labels') {
      finalVal = (val as string).split(',').map(l => l.trim()).filter(Boolean);
    } else if (field === 'watchers') {
      finalVal = (val as string).split(',').map(w => w.trim()).filter(Boolean);
    } else if (field === 'storyPoints' || field === 'estimatedTime' || field === 'actualTime') {
      finalVal = Number(val) || 0;
    }

    // Update local state first
    switch (field) {
      case 'title': setTitle(val); break;
      case 'description': setDescription(val); break;
      case 'priority': setPriority(val); break;
      case 'status': setStatus(val); break;
      case 'storyPoints': setStoryPoints(Number(val)); break;
      case 'sprintId': setSprintId(val); break;
      case 'dueDate': setDueDate(val); break;
      case 'assignee': setAssignee(val); break;
      case 'watchers': setWatchers(val); break;
      case 'labels': setLabels(val); break;
      case 'acceptanceCriteria': setAcceptanceCriteria(val); break;
      case 'estimatedTime': setEstimatedTime(Number(val)); break;
      case 'actualTime': setActualTime(Number(val)); break;
      case 'epicId': setEpicId(val); break;
      case 'storyId': setStoryId(val); break;
    }

    triggerAutosave({ [field]: finalVal });
  };

  const sprints = SprintStorage.getByProject(projectId);

  // Tab Header mapping
  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'general', label: 'Details' },
    { id: 'checklist', label: 'Checklist', count: task.checklist?.length },
    { id: 'subtasks', label: 'Subtasks', count: task.subtasks?.length },
    { id: 'attachments', label: 'Files', count: task.attachments?.length },
    { id: 'comments', label: 'Comments', count: task.comments?.length },
    { id: 'activity', label: 'History' }
  ];

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-xs" onClick={onClose} />

      {/* Drawer content */}
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col z-50 border-l border-surface-border animate-slide-in-left">
        {/* Drawer Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-secondary/40 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-surface-secondary border border-surface-border text-content-primary">
              {task.taskId}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-content-muted">
              <span>Version: v{task.version || 1}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Check size={12} className="text-emerald-600" />
                {saveIndicator}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {task.archivedAt ? (
              <button
                onClick={() => {
                  onArchiveToggle(task.id, false);
                  refreshTask();
                }}
                className="btn-ghost p-1.5 h-8 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs gap-1"
                title="Restore from archive"
              >
                <RotateCcw size={13} /> Restore
              </button>
            ) : (
              <button
                onClick={() => onArchiveToggle(task.id, true)}
                className="btn-ghost p-1.5 h-8 text-content-secondary hover:bg-surface-secondary rounded-lg text-xs gap-1"
                title="Archive task"
              >
                <Archive size={13} /> Archive
              </button>
            )}
            <button
              onClick={() => onDelete(task.id)}
              className="btn-ghost p-1.5 h-8 text-red-600 hover:bg-red-50 rounded-lg text-xs gap-1"
              title="Delete permanently"
            >
              <Trash2 size={13} /> Delete
            </button>
            <div className="w-px bg-surface-border h-6 mx-1" />
            <button onClick={onClose} className="btn-ghost p-1.5 h-8 w-8 rounded-lg flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Headers Bar */}
        <div className="flex border-b border-surface-border overflow-x-auto bg-white flex-shrink-0 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-2.5 text-xs font-semibold border-b-2 border-transparent transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-content-primary border-content-primary'
                  : 'text-content-muted hover:text-content-primary hover:border-gray-300'
              )}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1 bg-surface-secondary px-1.5 py-0.5 rounded-full text-[9px] font-bold text-content-secondary">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-primary/20">
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* Title Input */}
              <div>
                <label className="label text-[10px] uppercase tracking-wide text-content-muted">Title</label>
                <input
                  type="text"
                  className="w-full text-base font-bold text-content-primary border-0 border-b border-transparent focus:border-content-primary/20 rounded-none focus:ring-0 outline-none p-0 pb-1.5 placeholder:text-content-muted bg-transparent focus:bg-transparent"
                  value={title}
                  onChange={e => handleFieldChange('title', e.target.value)}
                  placeholder="Task title"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="label text-[10px] uppercase tracking-wide text-content-muted">Description</label>
                <textarea
                  className="textarea text-xs font-sans border border-surface-border focus:border-content-primary w-full p-3 bg-white h-32 rounded-xl placeholder:text-content-muted"
                  value={description}
                  onChange={e => handleFieldChange('description', e.target.value)}
                  placeholder="Explain this task... (Markdown supported)"
                />
              </div>

              {/* Parameters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-surface-border pt-4">
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Status</label>
                  <select
                    className="input h-9 text-xs bg-white"
                    value={status}
                    onChange={e => handleFieldChange('status', e.target.value)}
                  >
                    <option value="backlog">Backlog</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="testing">Testing</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Priority</label>
                  <select
                    className="input h-9 text-xs bg-white"
                    value={priority}
                    onChange={e => handleFieldChange('priority', e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Sprint</label>
                  <select
                    className="input h-9 text-xs bg-white"
                    value={sprintId}
                    onChange={e => handleFieldChange('sprintId', e.target.value)}
                  >
                    <option value="">None (Backlog)</option>
                    {sprints.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Story Points</label>
                  <input
                    type="number"
                    className="input h-9 text-xs bg-white"
                    min={0}
                    value={storyPoints}
                    onChange={e => handleFieldChange('storyPoints', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Assignee</label>
                  <input
                    type="text"
                    className="input h-9 text-xs bg-white"
                    value={assignee}
                    onChange={e => handleFieldChange('assignee', e.target.value)}
                    placeholder="Assignee name"
                  />
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Due Date</label>
                  <input
                    type="date"
                    className="input h-9 text-xs bg-white"
                    value={dueDate}
                    onChange={e => handleFieldChange('dueDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Watchers, Labels, Times */}
              <div className="space-y-4 border-t border-surface-border pt-4">
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Watchers (comma separated)</label>
                  <input
                    type="text"
                    className="input h-9 text-xs bg-white"
                    value={watchers}
                    onChange={e => handleFieldChange('watchers', e.target.value)}
                    placeholder="e.g. Sarah, Mark"
                  />
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Labels (comma separated)</label>
                  <input
                    type="text"
                    className="input h-9 text-xs bg-white"
                    value={labels}
                    onChange={e => handleFieldChange('labels', e.target.value)}
                    placeholder="bug, feature, documentation"
                  />
                </div>
              </div>

              {/* Estimated / Actual time tracker */}
              <div className="grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Estimated Time (hrs)</label>
                  <input
                    type="number"
                    className="input h-9 text-xs bg-white"
                    min={0}
                    value={estimatedTime || ''}
                    onChange={e => handleFieldChange('estimatedTime', e.target.value)}
                    placeholder="e.g. 10"
                  />
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Actual Time (hrs)</label>
                  <input
                    type="number"
                    className="input h-9 text-xs bg-white"
                    min={0}
                    value={actualTime || ''}
                    onChange={e => handleFieldChange('actualTime', e.target.value)}
                    placeholder="e.g. 4"
                  />
                </div>
              </div>

              {/* Relationships */}
              <div className="grid grid-cols-2 gap-4 border-t border-surface-border pt-4">
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Epic ID Link</label>
                  <input
                    type="text"
                    className="input h-9 text-xs bg-white"
                    value={epicId}
                    onChange={e => handleFieldChange('epicId', e.target.value)}
                    placeholder="e.g. EPIC-01"
                  />
                </div>
                <div>
                  <label className="label text-[10px] uppercase tracking-wide text-content-muted">Story ID Link</label>
                  <input
                    type="text"
                    className="input h-9 text-xs bg-white"
                    value={storyId}
                    onChange={e => handleFieldChange('storyId', e.target.value)}
                    placeholder="e.g. STORY-05"
                  />
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div className="border-t border-surface-border pt-4">
                <label className="label text-[10px] uppercase tracking-wide text-content-muted">Acceptance Criteria</label>
                <textarea
                  className="textarea text-xs font-sans border border-surface-border focus:border-content-primary w-full p-3 bg-white h-20 rounded-xl"
                  value={acceptanceCriteria}
                  onChange={e => handleFieldChange('acceptanceCriteria', e.target.value)}
                  placeholder="Acceptance criteria rules..."
                />
              </div>

              {/* Future-ready dependencies warning placeholder */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2.5 text-blue-700 text-xs">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Dependency Relationships (Future Ready)</p>
                  <p className="mt-0.5 leading-normal text-blue-600">Supports tracking blocks, blocked-by, related, duplicate, parent, and child dependencies in future builds.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <TaskChecklist
              taskId={task.id}
              checklist={task.checklist || []}
              onUpdate={refreshTask}
            />
          )}

          {activeTab === 'subtasks' && (
            <TaskSubtasks
              taskId={task.id}
              subtasks={task.subtasks || []}
              onUpdate={refreshTask}
            />
          )}

          {activeTab === 'attachments' && (
            <TaskAttachments
              taskId={task.id}
              attachments={task.attachments || []}
              onUpdate={refreshTask}
            />
          )}

          {activeTab === 'comments' && (
            <TaskComments
              taskId={task.id}
              comments={task.comments || []}
              onUpdate={refreshTask}
            />
          )}

          {activeTab === 'activity' && (
            <TaskActivity
              activities={task.activities || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
