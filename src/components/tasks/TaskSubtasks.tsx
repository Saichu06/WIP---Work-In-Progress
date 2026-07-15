import React, { useState } from 'react';
import { Subtask, TaskStatus, Priority } from '@/types';
import { Plus, Trash2, Calendar, Target, CheckSquare } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';
import { PriorityBadge } from '../common/PriorityBadge';
import { StatusBadge } from '../common/StatusBadge';

interface TaskSubtasksProps {
  taskId: string;
  subtasks: Subtask[];
  onUpdate: () => void;
}

export function TaskSubtasks({ taskId, subtasks, onUpdate }: TaskSubtasksProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    TaskStorage.addSubtask(taskId, newTitle.trim(), newPriority);
    setNewTitle('');
    setNewPriority('medium');
    setShowAddForm(false);
    onUpdate();
  };

  const handleUpdateStatus = (subtaskId: string, status: TaskStatus) => {
    TaskStorage.updateSubtask(taskId, subtaskId, { status });
    onUpdate();
  };

  const handleUpdatePriority = (subtaskId: string, priority: Priority) => {
    TaskStorage.updateSubtask(taskId, subtaskId, { priority });
    onUpdate();
  };

  const handleUpdateDueDate = (subtaskId: string, dueDate: string) => {
    TaskStorage.updateSubtask(taskId, subtaskId, { dueDate: dueDate || undefined });
    onUpdate();
  };

  const handleDelete = (subtaskId: string) => {
    TaskStorage.deleteSubtask(taskId, subtaskId);
    onUpdate();
  };

  const completedCount = subtasks.filter(s => s.status === 'done').length;
  const totalCount = subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Subtasks progress */}
      <div className="flex items-center justify-between text-xs text-content-secondary">
        <span className="font-medium flex items-center gap-1"><CheckSquare size={13} /> Subtasks Progress</span>
        <span className="font-semibold text-content-primary">
          {completedCount} / {totalCount} ({progressPercent}%)
        </span>
      </div>
      <div className="w-full bg-surface-secondary rounded-full h-1.5">
        <div 
          className="h-1.5 rounded-full bg-blue-500 transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Subtasks Listing */}
      <div className="space-y-2">
        {subtasks.sort((a, b) => a.order - b.order).map(sub => (
          <div 
            key={sub.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-surface-secondary/40 border border-surface-border hover:bg-surface-secondary/60 transition-all group"
          >
            {/* Left: Info */}
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
              <span className={`text-xs font-medium break-all mt-0.5 ${sub.status === 'done' ? 'line-through text-content-muted' : 'text-content-primary'}`}>
                {sub.title}
              </span>
            </div>

            {/* Right: Actions and Settings */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Status Select */}
              <select
                className="input h-7 px-1.5 py-0 text-[10px] w-24 bg-white border border-surface-border rounded-md"
                value={sub.status}
                onChange={e => handleUpdateStatus(sub.id, e.target.value as TaskStatus)}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="testing">Testing</option>
                <option value="done">Done</option>
              </select>

              {/* Priority Select */}
              <select
                className="input h-7 px-1.5 py-0 text-[10px] w-20 bg-white border border-surface-border rounded-md"
                value={sub.priority}
                onChange={e => handleUpdatePriority(sub.id, e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              {/* Due Date */}
              <div className="relative">
                <input
                  type="date"
                  className="input h-7 px-1.5 text-[10px] w-28 bg-white border border-surface-border rounded-md"
                  value={sub.dueDate || ''}
                  onChange={e => handleUpdateDueDate(sub.id, e.target.value)}
                />
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(sub.id)}
                className="btn-ghost p-1.5 h-7 w-7 text-content-muted hover:text-red-500 rounded-md"
                title="Delete subtask"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {subtasks.length === 0 && !showAddForm && (
          <p className="text-xs text-content-muted italic text-center py-4">No subtasks yet.</p>
        )}
      </div>

      {/* Add form toggles */}
      {showAddForm ? (
        <form onSubmit={handleAdd} className="card p-3 border border-surface-border space-y-3 bg-surface-secondary/20">
          <div>
            <label className="label text-[10px] mb-1">Subtask Title</label>
            <input
              type="text"
              className="input h-8 px-2.5 text-xs"
              placeholder="e.g. Write integration test"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label text-[10px] mb-1">Priority</label>
              <select
                className="input h-8 text-xs bg-white"
                value={newPriority}
                onChange={e => setNewPriority(e.target.value as Priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="flex gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-ghost h-7 px-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="btn-primary h-7 px-3 text-xs"
            >
              Create
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-secondary w-full h-8 justify-center text-xs text-content-secondary hover:text-content-primary"
        >
          <Plus size={13} /> Add Subtask
        </button>
      )}
    </div>
  );
}
