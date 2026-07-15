import { v4 as uuidv4 } from 'uuid';
import type { Task, TaskComment, ChecklistItem, Subtask, TaskAttachment, TaskActivityLog, TaskDependency, TaskStatus, Priority } from '@/types';
import { SprintStorage } from './SprintStorage';
import { ActivityStorage } from './ActivityStorage';

const KEY = 'wip_tasks';
const COUNTER_KEY = 'wip_task_counter';
const UNDO_KEY = 'wip_undo_actions';

export const TaskStorage = {
  get(): Task[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  },

  getByProject(projectId: string): Task[] {
    return this.get().filter(t => t.projectId === projectId);
  },

  getBySprint(sprintId: string): Task[] {
    return this.get().filter(t => t.sprintId === sprintId);
  },

  getById(id: string): Task | undefined {
    return this.get().find(t => t.id === id);
  },

  getBacklog(projectId: string): Task[] {
    return this.get().filter(t => t.projectId === projectId && !t.sprintId && !t.archivedAt);
  },

  getNextTaskId(): string {
    let current = Number(localStorage.getItem(COUNTER_KEY) || '0');
    current += 1;
    localStorage.setItem(COUNTER_KEY, String(current));
    return `WIP-${String(current).padStart(3, '0')}`;
  },

  create(data: Omit<Task, 'id' | 'taskId' | 'position' | 'version' | 'comments' | 'checklist' | 'subtasks' | 'attachments' | 'activities' | 'dependencies' | 'watchers' | 'createdAt' | 'updatedAt'>): Task {
    const all = this.get();
    const taskId = this.getNextTaskId();

    // Calculate position in the target column
    const siblings = all.filter(t => t.projectId === data.projectId && t.status === data.status && !t.archivedAt);
    const maxPos = siblings.reduce((max, t) => t.position > max ? t.position : max, 0);
    const position = maxPos + 1000;

    const task: Task = {
      ...data,
      id: uuidv4(),
      taskId,
      position,
      version: 1,
      comments: [],
      checklist: [],
      subtasks: [],
      attachments: [],
      activities: [{ id: uuidv4(), type: 'created', message: 'Task created', createdAt: new Date().toISOString() }],
      dependencies: [],
      watchers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(KEY, JSON.stringify([...all, task]));
    return task;
  },

  update(id: string, data: Partial<Task>, skipActivityLog = false): Task | undefined {
    const all = this.get();
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return undefined;

    const oldTask = all[idx];
    const updatedActivities = [...oldTask.activities];

    // Log detailed history changes
    if (!skipActivityLog) {
      if (data.status && data.status !== oldTask.status) {
        updatedActivities.push({
          id: uuidv4(),
          type: 'moved_status',
          message: `Moved status from ${oldTask.status} to ${data.status}`,
          createdAt: new Date().toISOString()
        });
      }
      if (data.priority && data.priority !== oldTask.priority) {
        updatedActivities.push({
          id: uuidv4(),
          type: 'priority_changed',
          message: `Priority changed from ${oldTask.priority} to ${data.priority}`,
          createdAt: new Date().toISOString()
        });
      }
      if (data.sprintId !== undefined && data.sprintId !== oldTask.sprintId) {
        const sprintName = data.sprintId ? (SprintStorage.getById(data.sprintId)?.name || 'Sprint') : 'Backlog';
        updatedActivities.push({
          id: uuidv4(),
          type: 'sprint_changed',
          message: `Moved to ${sprintName}`,
          createdAt: new Date().toISOString()
        });
      }
      if (data.assignee !== undefined && data.assignee !== oldTask.assignee) {
        const msg = data.assignee ? `Assigned to ${data.assignee}` : 'Unassigned';
        updatedActivities.push({
          id: uuidv4(),
          type: 'assignee_changed',
          message: msg,
          createdAt: new Date().toISOString()
        });
      }
      if (data.dueDate !== undefined && data.dueDate !== oldTask.dueDate) {
        const msg = data.dueDate ? `Due date updated to ${data.dueDate}` : 'Due date removed';
        updatedActivities.push({
          id: uuidv4(),
          type: 'duedate_changed',
          message: msg,
          createdAt: new Date().toISOString()
        });
      }
      if (data.title && data.title !== oldTask.title) {
        updatedActivities.push({
          id: uuidv4(),
          type: 'title_changed',
          message: `Renamed task to "${data.title}"`,
          createdAt: new Date().toISOString()
        });
      }
    }

    const nextVersion = (oldTask.version || 1) + 1;

    all[idx] = {
      ...oldTask,
      ...data,
      version: nextVersion,
      activities: updatedActivities,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(KEY, JSON.stringify(all));
    return all[idx];
  },

  addComment(taskId: string, message: string, author: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const newComment: TaskComment = {
      id: uuidv4(),
      author,
      message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedComments = [...(task.comments || []), newComment];
    const updatedActivities = [
      ...(task.activities || []),
      { id: uuidv4(), type: 'comment_added', message: `Comment added by ${author}`, createdAt: new Date().toISOString() }
    ];

    return this.update(taskId, {
      comments: updatedComments,
      activities: updatedActivities
    }, true);
  },

  deleteComment(taskId: string, commentId: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const updatedComments = (task.comments || []).filter(c => c.id !== commentId);
    return this.update(taskId, { comments: updatedComments }, true);
  },

  addChecklistItem(taskId: string, title: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const newItem: ChecklistItem = {
      id: uuidv4(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedChecklist = [...(task.checklist || []), newItem];
    const updatedActivities = [
      ...(task.activities || []),
      { id: uuidv4(), type: 'checklist_added', message: `Added checklist item: "${title}"`, createdAt: new Date().toISOString() }
    ];

    return this.update(taskId, {
      checklist: updatedChecklist,
      activities: updatedActivities
    }, true);
  },

  toggleChecklistItem(taskId: string, itemId: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const updatedChecklist = (task.checklist || []).map(item => {
      if (item.id === itemId) {
        const nextCompleted = !item.completed;
        return {
          ...item,
          completed: nextCompleted,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    const targetItem = task.checklist.find(i => i.id === itemId);
    const updatedActivities = [...(task.activities || [])];
    if (targetItem) {
      updatedActivities.push({
        id: uuidv4(),
        type: 'checklist_toggled',
        message: `${targetItem.completed ? 'Uncompleted' : 'Completed'} checklist item: "${targetItem.title}"`,
        createdAt: new Date().toISOString()
      });
    }

    return this.update(taskId, {
      checklist: updatedChecklist,
      activities: updatedActivities
    }, true);
  },

  renameChecklistItem(taskId: string, itemId: string, newTitle: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const updatedChecklist = (task.checklist || []).map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          title: newTitle,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });

    return this.update(taskId, { checklist: updatedChecklist }, true);
  },

  deleteChecklistItem(taskId: string, itemId: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const targetItem = task.checklist.find(i => i.id === itemId);
    const updatedChecklist = (task.checklist || []).filter(item => item.id !== itemId);
    const updatedActivities = [...(task.activities || [])];
    if (targetItem) {
      updatedActivities.push({
        id: uuidv4(),
        type: 'checklist_deleted',
        message: `Deleted checklist item: "${targetItem.title}"`,
        createdAt: new Date().toISOString()
      });
    }

    return this.update(taskId, {
      checklist: updatedChecklist,
      activities: updatedActivities
    }, true);
  },

  addSubtask(taskId: string, title: string, priority: Priority = 'medium'): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const newSubtask: Subtask = {
      id: uuidv4(),
      title,
      status: 'todo',
      priority,
      order: (task.subtasks || []).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    const updatedActivities = [
      ...(task.activities || []),
      { id: uuidv4(), type: 'subtask_created', message: `Created subtask: "${title}"`, createdAt: new Date().toISOString() }
    ];

    return this.update(taskId, {
      subtasks: updatedSubtasks,
      activities: updatedActivities
    }, true);
  },

  updateSubtask(taskId: string, subtaskId: string, updates: Partial<Subtask>): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const updatedSubtasks = (task.subtasks || []).map(sub => {
      if (sub.id === subtaskId) {
        return {
          ...sub,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return sub;
    });

    const targetSub = task.subtasks.find(s => s.id === subtaskId);
    const updatedActivities = [...(task.activities || [])];
    if (targetSub && updates.status && updates.status !== targetSub.status) {
      updatedActivities.push({
        id: uuidv4(),
        type: 'subtask_status_changed',
        message: `Subtask "${targetSub.title}" status updated to ${updates.status}`,
        createdAt: new Date().toISOString()
      });
    }

    return this.update(taskId, {
      subtasks: updatedSubtasks,
      activities: updatedActivities
    }, true);
  },

  deleteSubtask(taskId: string, subtaskId: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const targetSub = task.subtasks.find(s => s.id === subtaskId);
    const updatedSubtasks = (task.subtasks || []).filter(sub => sub.id !== subtaskId);
    const updatedActivities = [...(task.activities || [])];
    if (targetSub) {
      updatedActivities.push({
        id: uuidv4(),
        type: 'subtask_deleted',
        message: `Deleted subtask: "${targetSub.title}"`,
        createdAt: new Date().toISOString()
      });
    }

    return this.update(taskId, {
      subtasks: updatedSubtasks,
      activities: updatedActivities
    }, true);
  },

  addAttachment(taskId: string, name: string, type: string, size: number, dataUrl: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const newAttachment: TaskAttachment = {
      id: uuidv4(),
      name,
      type,
      size,
      dataUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedAttachments = [...(task.attachments || []), newAttachment];
    const updatedActivities = [
      ...(task.activities || []),
      { id: uuidv4(), type: 'attachment_uploaded', message: `Uploaded attachment: "${name}"`, createdAt: new Date().toISOString() }
    ];

    return this.update(taskId, {
      attachments: updatedAttachments,
      activities: updatedActivities
    }, true);
  },

  deleteAttachment(taskId: string, attachmentId: string): Task | undefined {
    const task = this.getById(taskId);
    if (!task) return undefined;

    const targetAttach = task.attachments.find(a => a.id === attachmentId);
    const updatedAttachments = (task.attachments || []).filter(a => a.id !== attachmentId);
    const updatedActivities = [...(task.activities || [])];
    if (targetAttach) {
      updatedActivities.push({
        id: uuidv4(),
        type: 'attachment_deleted',
        message: `Deleted attachment: "${targetAttach.name}"`,
        createdAt: new Date().toISOString()
      });
    }

    return this.update(taskId, {
      attachments: updatedAttachments,
      activities: updatedActivities
    }, true);
  },

  duplicate(id: string): Task | undefined {
    const task = this.getById(id);
    if (!task) return undefined;

    const newTaskId = this.getNextTaskId();
    const duplicatedTask: Task = {
      ...task,
      id: uuidv4(),
      taskId: newTaskId,
      title: `${task.title} (Copy)`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [{ id: uuidv4(), type: 'created', message: `Task duplicated from ${task.taskId}`, createdAt: new Date().toISOString() }],
      comments: [],
      archivedAt: undefined
    };

    const all = this.get();
    localStorage.setItem(KEY, JSON.stringify([...all, duplicatedTask]));
    return duplicatedTask;
  },

  archive(id: string): void {
    const archivedAt = new Date().toISOString();
    const task = this.getById(id);
    if (task) {
      const updatedActivities = [
        ...(task.activities || []),
        { id: uuidv4(), type: 'archived', message: 'Task archived', createdAt: archivedAt }
      ];
      this.update(id, { archivedAt, activities: updatedActivities }, true);
    }
  },

  restore(id: string): void {
    const task = this.getById(id);
    if (task) {
      const updatedActivities = [
        ...(task.activities || []),
        { id: uuidv4(), type: 'restored', message: 'Task restored', createdAt: new Date().toISOString() }
      ];
      this.update(id, { archivedAt: undefined, activities: updatedActivities }, true);
    }
  },

  delete(id: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(t => t.id !== id)));
  },

  deleteByProject(projectId: string): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(t => t.projectId !== projectId)));
  },

  // Undo Management Subsystem
  getUndoActions(): any[] {
    try { return JSON.parse(localStorage.getItem(UNDO_KEY) || '[]'); } catch { return []; }
  },

  addUndoAction(type: 'archive' | 'delete' | 'restore' | 'move' | 'duplicate', payload: any): string {
    const undoId = uuidv4();
    const newAction = {
      id: undoId,
      type,
      payload,
      expiresAt: new Date(Date.now() + 5000).toISOString() // 5 seconds expiration
    };
    const all = this.getUndoActions().filter(a => new Date(a.expiresAt).getTime() > Date.now());
    localStorage.setItem(UNDO_KEY, JSON.stringify([...all, newAction]));
    return undoId;
  },

  performUndo(actionId: string): boolean {
    const allActions = this.getUndoActions();
    const action = allActions.find(a => a.id === actionId);
    if (!action) return false;

    // Clean up from stack
    localStorage.setItem(UNDO_KEY, JSON.stringify(allActions.filter(a => a.id !== actionId)));

    if (new Date(action.expiresAt).getTime() < Date.now()) {
      return false; // Expired
    }

    const tasks = this.get();

    if (action.type === 'archive') {
      // Revert soft-archive: restore task
      this.restore(action.payload.id);
      return true;
    }

    if (action.type === 'restore') {
      // Revert restore: re-archive task
      this.archive(action.payload.id);
      return true;
    }

    if (action.type === 'delete') {
      // Revert delete: put original task payload back in local storage
      const restoredTask = action.payload;
      localStorage.setItem(KEY, JSON.stringify([...tasks.filter(t => t.id !== restoredTask.id), restoredTask]));
      return true;
    }

    if (action.type === 'move') {
      // Revert drag/move status or sprint
      const oldState = action.payload; // has task ID and old status/sprintId/position
      this.update(oldState.id, {
        status: oldState.status,
        sprintId: oldState.sprintId,
        position: oldState.position
      }, true);
      return true;
    }

    if (action.type === 'duplicate') {
      // Revert duplication: delete the duplicated copy
      this.delete(action.payload.id);
      return true;
    }

    return false;
  },

  // Bulk operations
  bulkArchive(ids: string[]): void {
    ids.forEach(id => this.archive(id));
  },

  bulkDelete(ids: string[]): void {
    localStorage.setItem(KEY, JSON.stringify(this.get().filter(t => !ids.includes(t.id))));
  },

  bulkMoveSprint(ids: string[], sprintId?: string): void {
    ids.forEach(id => this.update(id, { sprintId }));
  },

  bulkMoveStatus(ids: string[], status: TaskStatus): void {
    ids.forEach(id => this.update(id, { status }));
  },

  bulkAssignLabels(ids: string[], labels: string[]): void {
    ids.forEach(id => {
      const task = this.getById(id);
      if (task) {
        const merged = Array.from(new Set([...task.labels, ...labels]));
        this.update(id, { labels: merged }, true);
      }
    });
  },

  bulkDuplicate(ids: string[]): string[] {
    const newIds: string[] = [];
    ids.forEach(id => {
      const dup = this.duplicate(id);
      if (dup) newIds.push(dup.id);
    });
    return newIds;
  },

  search(query: string, projectId?: string): Task[] {
    const q = query.toLowerCase();
    return this.get().filter(t =>
      (!projectId || t.projectId === projectId) &&
      (
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) || 
        t.taskId.toLowerCase().includes(q) ||
        t.labels.some(l => l.toLowerCase().includes(q))
      )
    );
  },
};
