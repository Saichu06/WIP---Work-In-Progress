import React, { useState, useEffect } from 'react';
import type { Task, Priority, TaskStatus } from '@/types';
import { SprintStorage } from '@/storage/SprintStorage';

interface TaskFormProps {
  projectId: string;
  initialStatus?: TaskStatus;
  initialTask?: Task;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const TEMPLATES = [
  { id: 'blank', label: 'Blank Task', titlePrefix: '', defaultLabels: [], defaultPriority: 'medium' as Priority, defaultDesc: '' },
  { id: 'bug', label: 'Bug Report', titlePrefix: '[BUG] ', defaultLabels: ['bug'], defaultPriority: 'high' as Priority, defaultDesc: '### Steps to Reproduce\n1. \n2. \n\n### Expected Behavior\n\n### Actual Behavior\n\n### Environment Info\n' },
  { id: 'feature', label: 'Feature Request', titlePrefix: '[FEAT] ', defaultLabels: ['feature'], defaultPriority: 'medium' as Priority, defaultDesc: '### Goal / Context\n\n### Proposed Solution\n\n### Acceptance Criteria\n- [ ] UI implemented\n- [ ] Unit tests pass\n' },
  { id: 'research', label: 'Research Spike', titlePrefix: '[SPIKE] ', defaultLabels: ['research'], defaultPriority: 'medium' as Priority, defaultDesc: '### Objective\n\n### Questions to Answer\n\n### Deliverables\n' },
  { id: 'documentation', label: 'Documentation Task', titlePrefix: '[DOC] ', defaultLabels: ['documentation'], defaultPriority: 'low' as Priority, defaultDesc: '### Target Audience\n\n### Pages/Sections to Update\n' },
  { id: 'meeting', label: 'Meeting notes & Sync', titlePrefix: '[SYNC] ', defaultLabels: ['sync'], defaultPriority: 'low' as Priority, defaultDesc: '### Agenda\n\n### Meeting Notes\n\n### Action Items\n' },
  { id: 'improvement', label: 'Improvement / Chore', titlePrefix: '[CHORE] ', defaultLabels: ['improvement'], defaultPriority: 'medium' as Priority, defaultDesc: '### Current Pain Point\n\n### Improvement Plan\n' }
];

export function TaskForm({ projectId, initialStatus = 'todo', initialTask, onSave, onCancel }: TaskFormProps) {
  const [template, setTemplate] = useState('blank');
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || initialStatus);
  const [storyPoints, setStoryPoints] = useState(initialTask?.storyPoints || 0);
  const [labels, setLabels] = useState(initialTask?.labels.join(', ') || '');
  const [assignee, setAssignee] = useState(initialTask?.assignee || '');
  const [watchers, setWatchers] = useState(initialTask?.watchers?.join(', ') || '');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [estimatedTime, setEstimatedTime] = useState(initialTask?.estimatedTime || 0);
  const [actualTime, setActualTime] = useState(initialTask?.actualTime || 0);
  const [epicId, setEpicId] = useState(initialTask?.epicId || '');
  const [storyId, setStoryId] = useState(initialTask?.storyId || '');
  const [sprintId, setSprintId] = useState(initialTask?.sprintId || '');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(initialTask?.acceptanceCriteria || '');

  const sprints = SprintStorage.getByProject(projectId);

  // Apply template values if creating a new task
  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId);
    if (initialTask) return; // Ignore template auto-fills when editing existing task

    const t = TEMPLATES.find(x => x.id === templateId);
    if (!t) return;

    setTitle(prev => {
      // If previous title was another template prefix or empty, replace it
      const currentPrefix = TEMPLATES.find(x => prev.startsWith(x.titlePrefix))?.titlePrefix || '';
      const coreTitle = prev.substring(currentPrefix.length);
      return t.titlePrefix + coreTitle;
    });

    setDescription(t.defaultDesc);
    setPriority(t.defaultPriority);
    setLabels(t.defaultLabels.join(', '));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedLabels = labels.split(',').map(l => l.trim()).filter(Boolean);
    const parsedWatchers = watchers.split(',').map(w => w.trim()).filter(Boolean);

    onSave({
      projectId,
      title,
      description,
      priority,
      status,
      storyPoints: Number(storyPoints),
      labels: parsedLabels,
      assignee,
      watchers: parsedWatchers,
      dueDate: dueDate || undefined,
      estimatedTime: Number(estimatedTime) || undefined,
      actualTime: Number(actualTime) || undefined,
      epicId: epicId || undefined,
      storyId: storyId || undefined,
      sprintId: sprintId || undefined,
      acceptanceCriteria,
      isFavorite: initialTask?.isFavorite || false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
      {/* Template Select (Only for new tasks) */}
      {!initialTask && (
        <div>
          <label className="label text-xs">Task Template</label>
          <select
            className="input h-9 text-xs"
            value={template}
            onChange={e => handleTemplateChange(e.target.value)}
          >
            {TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="label text-xs">Title *</label>
        <input
          type="text"
          className="input text-sm h-9"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="label text-xs">Description</label>
        <textarea
          className="textarea font-sans text-xs h-24"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Markdown supported description..."
        />
      </div>

      {/* Basic fields grid */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Status</label>
          <select
            className="input h-9 text-xs"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
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
          <label className="label text-xs">Priority</label>
          <select
            className="input h-9 text-xs"
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Sprint, Story Points */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Sprint</label>
          <select
            className="input h-9 text-xs"
            value={sprintId}
            onChange={e => setSprintId(e.target.value)}
          >
            <option value="">None (Backlog)</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">Story Points</label>
          <input
            type="number"
            className="input h-9 text-xs"
            min={0}
            value={storyPoints}
            onChange={e => setStoryPoints(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Assignee, Watchers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Assignee</label>
          <input
            type="text"
            className="input h-9 text-xs"
            value={assignee}
            onChange={e => setAssignee(e.target.value)}
            placeholder="Assignee name"
          />
        </div>
        <div>
          <label className="label text-xs">Due Date</label>
          <input
            type="date"
            className="input h-9 text-xs"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Watchers list */}
      <div>
        <label className="label text-xs">Watchers (comma separated)</label>
        <input
          type="text"
          className="input h-9 text-xs"
          value={watchers}
          onChange={e => setWatchers(e.target.value)}
          placeholder="e.g. John, Sarah, Mark"
        />
      </div>

      {/* Time Tracking & Epics (Scalable placeholders) */}
      <div className="grid grid-cols-2 gap-3 border-t border-surface-border pt-3">
        <div>
          <label className="label text-xs">Estimated Time (hrs)</label>
          <input
            type="number"
            className="input h-9 text-xs"
            min={0}
            value={estimatedTime || ''}
            onChange={e => setEstimatedTime(Number(e.target.value))}
            placeholder="e.g. 8"
          />
        </div>
        <div>
          <label className="label text-xs">Actual Time (hrs)</label>
          <input
            type="number"
            className="input h-9 text-xs"
            min={0}
            value={actualTime || ''}
            onChange={e => setActualTime(Number(e.target.value))}
            placeholder="e.g. 5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label text-xs">Parent Epic ID (placeholder)</label>
          <input
            type="text"
            className="input h-9 text-xs"
            value={epicId}
            onChange={e => setEpicId(e.target.value)}
            placeholder="e.g. EPIC-01"
          />
        </div>
        <div>
          <label className="label text-xs">Parent Story ID (placeholder)</label>
          <input
            type="text"
            className="input h-9 text-xs"
            value={storyId}
            onChange={e => setStoryId(e.target.value)}
            placeholder="e.g. STORY-05"
          />
        </div>
      </div>

      {/* Acceptance Criteria */}
      <div>
        <label className="label text-xs">Acceptance Criteria</label>
        <textarea
          className="textarea font-sans text-xs h-16"
          value={acceptanceCriteria}
          onChange={e => setAcceptanceCriteria(e.target.value)}
          placeholder="Acceptance criteria guidelines..."
        />
      </div>

      {/* Labels */}
      <div>
        <label className="label text-xs">Labels (comma separated)</label>
        <input
          type="text"
          className="input h-9 text-xs"
          value={labels}
          onChange={e => setLabels(e.target.value)}
          placeholder="bug, feature, backend"
        />
      </div>

      {/* Submit / Cancel Buttons */}
      <div className="flex gap-2 justify-end border-t border-surface-border pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary h-9 px-4 text-xs">
          Cancel
        </button>
        <button type="submit" className="btn-primary h-9 px-4 text-xs">
          {initialTask ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
