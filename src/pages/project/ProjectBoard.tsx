import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, CheckSquare, Trash2, Archive, Copy, Undo, X, HelpCircle } from 'lucide-react';

import { TaskStorage } from '@/storage/TaskStorage';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { KANBAN_COLUMNS } from '@/constants';
import { cn } from '@/utils';
import type { Project, Task, TaskStatus, BoardPreferences, Priority } from '@/types';

// Task Components
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDrawer } from '@/components/tasks/TaskDrawer';
import { TaskForm } from '@/components/tasks/TaskForm';
import { TaskToolbar, SortType } from '@/components/tasks/TaskToolbar';
import { FilterState } from '@/components/tasks/TaskFilters';
import { TaskBulkActions } from '@/components/tasks/TaskBulkActions';
import { EmptyState } from '@/components/common/EmptyState';

const DEFAULT_PREFERENCES: BoardPreferences = {
  compact: false,
  showLabels: true,
  showStoryPoints: true,
  showDueDates: true,
  showChecklist: true,
  cardSize: 'md'
};

const DEFAULT_FILTERS: FilterState = {
  search: '',
  priority: 'all',
  sprintId: 'all',
  label: 'all',
  dueDateType: 'all',
  showArchived: false
};

export function ProjectBoard() {
  const { project } = useOutletContext<{ project: Project }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // User Preferences & View states
  const [preferences, setPreferences] = useState<BoardPreferences>(DEFAULT_PREFERENCES);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortType>('newest');

  // Selected tasks for bulk action operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer / Modals states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Undo Snackbar notification state
  const [snackbar, setSnackbar] = useState<{ message: string; undoId: string } | null>(null);
  const [snackbarTimer, setSnackbarTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const refreshBoard = () => {
    setTasks(TaskStorage.getByProject(project.id));
  };

  useEffect(() => {
    refreshBoard();
    setSelectedIds([]);
  }, [project.id]);

  // Keyboard Shortcuts Listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focused in text inputs / textareas
      const target = event?.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // 'N' for New Task
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCreateStatus('todo');
      }

      // 'Delete' for Delete Selected Tasks
      if (e.key === 'Delete' && selectedIds.length > 0) {
        e.preventDefault();
        handleBulkDelete();
      }

      // 'Escape' to close Drawer/Modals
      if (e.key === 'Escape') {
        setSelectedTaskId(null);
        setCreateStatus(null);
        setEditingTask(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds]);

  // Undo notification controller
  const triggerUndoNotification = (message: string, undoId: string) => {
    if (snackbarTimer) clearTimeout(snackbarTimer);
    setSnackbar({ message, undoId });

    const timer = setTimeout(() => {
      setSnackbar(null);
    }, 5000); // Expose for 5 seconds
    setSnackbarTimer(timer);
  };

  const handlePerformUndo = () => {
    if (!snackbar) return;
    const success = TaskStorage.performUndo(snackbar.undoId);
    if (success) {
      refreshBoard();
      setSnackbar(null);
    } else {
      alert('Undo failed: Action expired or task deleted.');
    }
  };

  // Drag and drop handler
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetStatus = destination.droppableId as TaskStatus;
    const projectTasks = TaskStorage.getByProject(project.id);
    const siblings = projectTasks
      .filter(t => t.status === targetStatus && !t.archivedAt && t.id !== draggableId)
      .sort((a, b) => a.position - b.position);

    // Calculate position mathematically
    let newPosition = 1000;
    if (siblings.length === 0) {
      newPosition = 1000;
    } else if (destination.index === 0) {
      newPosition = siblings[0].position / 2;
    } else if (destination.index >= siblings.length) {
      newPosition = siblings[siblings.length - 1].position + 1000;
    } else {
      const prev = siblings[destination.index - 1];
      const next = siblings[destination.index];
      newPosition = (prev.position + next.position) / 2;
    }

    const oldTask = TaskStorage.getById(draggableId);
    if (oldTask) {
      const undoPayload = {
        id: oldTask.id,
        status: oldTask.status,
        sprintId: oldTask.sprintId,
        position: oldTask.position
      };
      const undoId = TaskStorage.addUndoAction('move', undoPayload);
      triggerUndoNotification('Task position moved', undoId);
    }

    TaskStorage.update(draggableId, { status: targetStatus, position: newPosition });
    
    // Log project log activity
    if (targetStatus === 'done') {
      ActivityStorage.log('task_completed', 'Task completed', `Task moved to Done`, project.id, draggableId);
    } else {
      ActivityStorage.log('task_moved', 'Task status changed', `Task moved to ${targetStatus}`, project.id, draggableId);
    }

    refreshBoard();
  };

  // Select logic
  const handleSelectToggle = (taskId: string, select: boolean) => {
    if (select) {
      setSelectedIds(prev => [...prev, taskId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Multi-select bulk triggers
  const handleBulkArchive = () => {
    const backup = selectedIds.map(id => TaskStorage.getById(id)).filter(Boolean);
    TaskStorage.bulkArchive(selectedIds);
    const undoId = TaskStorage.addUndoAction('archive', backup);
    triggerUndoNotification(`${selectedIds.length} tasks archived`, undoId);
    setSelectedIds([]);
    refreshBoard();
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.length} tasks permanently?`)) return;
    const backup = selectedIds.map(id => TaskStorage.getById(id)).filter(Boolean);
    TaskStorage.bulkDelete(selectedIds);
    const undoId = TaskStorage.addUndoAction('delete', backup);
    triggerUndoNotification(`${selectedIds.length} tasks deleted`, undoId);
    setSelectedIds([]);
    refreshBoard();
  };

  const handleBulkMoveSprint = (sprintId?: string) => {
    TaskStorage.bulkMoveSprint(selectedIds, sprintId);
    setSelectedIds([]);
    refreshBoard();
  };

  const handleBulkMoveStatus = (status: TaskStatus) => {
    TaskStorage.bulkMoveStatus(selectedIds, status);
    setSelectedIds([]);
    refreshBoard();
  };

  const handleBulkAssignLabels = (labels: string[]) => {
    TaskStorage.bulkAssignLabels(selectedIds, labels);
    setSelectedIds([]);
    refreshBoard();
  };

  const handleBulkDuplicate = () => {
    const duplicatedCopies = TaskStorage.bulkDuplicate(selectedIds);
    const backup = duplicatedCopies.map(id => TaskStorage.getById(id)).filter(Boolean);
    const undoId = TaskStorage.addUndoAction('duplicate', backup);
    triggerUndoNotification(`${selectedIds.length} tasks duplicated`, undoId);
    setSelectedIds([]);
    refreshBoard();
  };

  // Card Context triggers
  const handleArchiveToggle = (taskId: string, shouldArchive: boolean) => {
    const taskObj = TaskStorage.getById(taskId);
    if (!taskObj) return;

    if (shouldArchive) {
      TaskStorage.archive(taskId);
      const undoId = TaskStorage.addUndoAction('archive', taskObj);
      triggerUndoNotification('Task archived', undoId);
    } else {
      TaskStorage.restore(taskId);
      const undoId = TaskStorage.addUndoAction('restore', taskObj);
      triggerUndoNotification('Task restored', undoId);
    }
    refreshBoard();
  };

  const handleTaskDelete = (taskId: string) => {
    const taskObj = TaskStorage.getById(taskId);
    if (!taskObj) return;
    if (!confirm(`Delete task permanently?`)) return;

    TaskStorage.delete(taskId);
    const undoId = TaskStorage.addUndoAction('delete', taskObj);
    triggerUndoNotification('Task deleted permanently', undoId);
    setSelectedTaskId(null);
    refreshBoard();
  };

  const handleTaskDuplicate = (taskId: string) => {
    const dup = TaskStorage.duplicate(taskId);
    if (dup) {
      const undoId = TaskStorage.addUndoAction('duplicate', dup);
      triggerUndoNotification('Task duplicated', undoId);
      refreshBoard();
    }
  };

  // Form saving callback
  const handleFormSave = (formData: any) => {
    if (editingTask) {
      TaskStorage.update(editingTask.id, formData);
      setEditingTask(null);
    } else {
      TaskStorage.create(formData);
      setCreateStatus(null);
    }
    refreshBoard();
  };

  // Available labels aggregator for search list
  const availableLabels = Array.from(
    new Set(tasks.flatMap(t => t.labels || []))
  );

  // Filters & Sorting implementation
  const filteredTasks = tasks.filter(t => {
    // Archived filter
    if (filters.showArchived) {
      if (!t.archivedAt) return false;
    } else {
      if (t.archivedAt) return false;
    }

    // Search query matches title, description, ID, labels
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchId = t.taskId.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchLabel = t.labels?.some(l => l.toLowerCase().includes(q));
      if (!matchId && !matchTitle && !matchDesc && !matchLabel) return false;
    }

    // Priority filter
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false;

    // Sprint filter
    if (filters.sprintId !== 'all') {
      if (filters.sprintId === 'none') {
        if (t.sprintId) return false;
      } else {
        if (t.sprintId !== filters.sprintId) return false;
      }
    }

    // Label filter
    if (filters.label !== 'all' && !t.labels.includes(filters.label)) return false;

    // Due date calculator filter
    if (filters.dueDateType !== 'all') {
      if (!t.dueDate) {
        if (filters.dueDateType !== 'none') return false;
      } else {
        try {
          const dueTime = new Date(t.dueDate).getTime();
          const todayTime = new Date().setHours(0, 0, 0, 0);
          const tomorrowTime = todayTime + 86400000;
          
          if (filters.dueDateType === 'overdue' && dueTime >= todayTime) return false;
          if (filters.dueDateType === 'today' && (dueTime < todayTime || dueTime >= tomorrowTime)) return false;
          if (filters.dueDateType === 'tomorrow' && (dueTime < tomorrowTime || dueTime >= tomorrowTime + 86400000)) return false;
          if (filters.dueDateType === 'upcoming' && dueTime < tomorrowTime + 86400000) return false;
          if (filters.dueDateType === 'none') return false;
        } catch {
          return false;
        }
      }
    }

    return true;
  });

  // Sort tasks list
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'storypoints') {
      return (b.storyPoints || 0) - (a.storyPoints || 0);
    }
    if (sortBy === 'duedate') {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === 'priority') {
      const ranks: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      return ranks[b.priority] - ranks[a.priority];
    }
    return 0;
  });

  // Split tasks by column mapping status
  const getColumnTasks = (statusId: TaskStatus) => {
    return sortedTasks
      .filter(t => t.status === statusId)
      .sort((a, b) => a.position - b.position); // deterministic visual positioning
  };

  const totalBoardTasks = tasks.filter(t => !t.archivedAt).length;

  return (
    <div className="h-full flex flex-col min-w-0 bg-surface-primary/10 overflow-hidden">
      {/* Search filters & Toolbar */}
      <div className="px-6 pt-6 pb-2 flex-shrink-0">
        <div className="mb-4">
          <h1 className="page-title">Kanban Board</h1>
          <p className="page-subtitle">
            {totalBoardTasks} active task{totalBoardTasks !== 1 ? 's' : ''} on board
          </p>
        </div>

        <TaskToolbar
          projectId={project.id}
          filters={filters}
          onFiltersChange={setFilters}
          availableLabels={availableLabels}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          preferences={preferences}
          onPreferencesChange={setPreferences}
        />
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 pb-6">
        {totalBoardTasks === 0 ? (
          <EmptyState
            icon="📋"
            title="Nothing in progress."
            description="Start building your first task. Organize details, dates, and priorities."
            action={
              <button onClick={() => setCreateStatus('todo')} className="btn-yellow">
                Create Task
              </button>
            }
          />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
              {KANBAN_COLUMNS.map(col => {
                const columnTasks = getColumnTasks(col.id as TaskStatus);
                const colWidth =
                  preferences.cardSize === 'sm' ? 'w-60' :
                  preferences.cardSize === 'lg' ? 'w-80' : 'w-72';
                return (
                  <div key={col.id} className={`flex flex-col ${colWidth} h-full max-h-full bg-surface-secondary rounded-2xl border border-surface-border flex-shrink-0`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 border-b border-surface-border flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                        <span className="text-[10px] font-bold text-content-primary uppercase tracking-wider">{col.title}</span>
                        <span className="text-[10px] font-bold bg-white text-content-secondary px-1.5 py-0.5 rounded-md border border-surface-border">{columnTasks.length}</span>
                      </div>
                      <button
                        onClick={() => setCreateStatus(col.id as TaskStatus)}
                        className="btn-ghost p-1 h-7 w-7 text-content-muted hover:text-content-primary rounded-md flex items-center justify-center"
                        title="Add task in this column"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Droppable cards wrapper */}
                    <Droppable droppableId={col.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={cn(
                            'flex-1 overflow-y-auto p-2.5 space-y-2.5 transition-all duration-150 scrollbar-none',
                            snapshot.isDraggingOver && 'bg-brand-yellow/5'
                          )}
                          style={{ minHeight: '120px' }}
                        >
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  className={dragSnapshot.isDragging ? 'shadow-2xl rotate-1 z-35' : ''}
                                >
                                  <TaskCard
                                    task={task}
                                    preferences={preferences}
                                    selected={selectedIds.includes(task.id)}
                                    onSelectToggle={handleSelectToggle}
                                    onClick={() => setSelectedTaskId(task.id)}
                                    onEdit={() => setEditingTask(task)}
                                    onDuplicate={() => handleTaskDuplicate(task.id)}
                                    onArchive={() => handleArchiveToggle(task.id, true)}
                                    onRestore={() => handleArchiveToggle(task.id, false)}
                                    onDelete={() => handleTaskDelete(task.id)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}

                          {provided.placeholder}

                          {columnTasks.length === 0 && (
                            <div className="h-20 border-2 border-dashed border-surface-border/55 rounded-xl flex items-center justify-center text-[10px] text-content-muted">
                              No tasks here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>

                    {/* Footer "+ New Task" visual trigger button */}
                    <button
                      onClick={() => setCreateStatus(col.id as TaskStatus)}
                      className="flex items-center justify-center gap-1.5 h-9 border-t border-surface-border text-[11px] font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-secondary/40 rounded-b-2xl transition-all"
                    >
                      <Plus size={13} />
                      <span>New Task</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Task Drawer details */}
      {selectedTaskId && (
        <TaskDrawer
          taskId={selectedTaskId}
          projectId={project.id}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={refreshBoard}
          onArchiveToggle={handleArchiveToggle}
          onDelete={handleTaskDelete}
        />
      )}

      {/* Create Task modal */}
      {createStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setCreateStatus(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-50 animate-scale-in border border-surface-border">
            <h2 className="text-base font-bold text-content-primary mb-4 flex items-center gap-2">
              <Plus size={18} /> New Task Creation
            </h2>
            <TaskForm
              projectId={project.id}
              initialStatus={createStatus}
              onSave={handleFormSave}
              onCancel={() => setCreateStatus(null)}
            />
          </div>
        </div>
      )}

      {/* Edit Task modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setEditingTask(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-50 animate-scale-in border border-surface-border">
            <h2 className="text-base font-bold text-content-primary mb-4 flex items-center gap-2">
              Edit Task Properties
            </h2>
            <TaskForm
              projectId={project.id}
              initialTask={editingTask}
              onSave={handleFormSave}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}

      {/* Floating Bulk Actions bar */}
      <TaskBulkActions
        projectId={project.id}
        selectedIds={selectedIds}
        onClearSelection={handleClearSelection}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
        onBulkMoveSprint={handleBulkMoveSprint}
        onBulkMoveStatus={handleBulkMoveStatus}
        onBulkAssignLabels={handleBulkAssignLabels}
        onBulkDuplicate={handleBulkDuplicate}
      />

      {/* Undo Snackbar popup */}
      {snackbar && (
        <div className="fixed bottom-6 right-6 bg-content-primary text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-4 z-40 border border-gray-800 animate-in">
          <span className="text-xs font-medium text-gray-200">{snackbar.message}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePerformUndo}
              className="btn-ghost hover:bg-gray-800 text-brand-yellow hover:text-white px-2.5 py-1 text-xs rounded-lg gap-1 border border-brand-yellow/30"
            >
              <Undo size={12} />
              <span>UNDO</span>
            </button>
            <button
              onClick={() => setSnackbar(null)}
              className="text-gray-400 hover:text-white p-1 rounded-md"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
