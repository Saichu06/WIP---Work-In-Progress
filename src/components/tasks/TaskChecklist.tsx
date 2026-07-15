import React, { useState } from 'react';
import { ChecklistItem } from '@/types';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { TaskStorage } from '@/storage/TaskStorage';

interface TaskChecklistProps {
  taskId: string;
  checklist: ChecklistItem[];
  onUpdate: () => void;
}

export function TaskChecklist({ taskId, checklist, onUpdate }: TaskChecklistProps) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    TaskStorage.addChecklistItem(taskId, newItemTitle.trim());
    setNewItemTitle('');
    onUpdate();
  };

  const handleToggle = (itemId: string) => {
    TaskStorage.toggleChecklistItem(taskId, itemId);
    onUpdate();
  };

  const startRename = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const saveRename = (itemId: string) => {
    if (!editTitle.trim()) return;
    TaskStorage.renameChecklistItem(taskId, itemId, editTitle.trim());
    setEditingId(null);
    onUpdate();
  };

  const handleDelete = (itemId: string) => {
    TaskStorage.deleteChecklistItem(taskId, itemId);
    onUpdate();
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between text-xs text-content-secondary">
        <span className="font-medium">Checklist Progress</span>
        <span className="font-semibold text-content-primary">
          {completedCount} / {totalCount} ({progressPercent}%)
        </span>
      </div>
      <div className="w-full bg-surface-secondary rounded-full h-1.5">
        <div 
          className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* List items */}
      <div className="space-y-2">
        {checklist.map(item => (
          <div 
            key={item.id} 
            className="flex items-center gap-3 p-2 rounded-lg bg-surface-secondary/50 border border-surface-border hover:bg-surface-secondary/80 group transition-all"
          >
            <input
              type="checkbox"
              className="w-4 h-4 rounded text-content-primary border-surface-border focus:ring-content-primary"
              checked={item.completed}
              onChange={() => handleToggle(item.id)}
            />

            {editingId === item.id ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  className="input h-7 px-2 text-xs flex-1"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') saveRename(item.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
                <button 
                  onClick={() => saveRename(item.id)} 
                  className="btn-ghost p-1 h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                >
                  <Check size={13} />
                </button>
                <button 
                  onClick={() => setEditingId(null)} 
                  className="btn-ghost p-1 h-7 w-7 text-red-500 hover:bg-red-50"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <span className={`text-xs flex-1 break-all ${item.completed ? 'line-through text-content-muted' : 'text-content-primary'}`}>
                {item.title}
              </span>
            )}

            {editingId !== item.id && (
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startRename(item)} 
                  className="btn-ghost p-1 h-7 w-7 text-content-muted hover:text-content-primary"
                >
                  <Edit2 size={11} />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="btn-ghost p-1 h-7 w-7 text-content-muted hover:text-red-500"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )}
          </div>
        ))}

        {checklist.length === 0 && (
          <p className="text-xs text-content-muted italic text-center py-4">No checklist items yet.</p>
        )}
      </div>

      {/* Add Item form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          className="input h-8 px-3 text-xs flex-1"
          placeholder="Add checklist item..."
          value={newItemTitle}
          onChange={e => setNewItemTitle(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!newItemTitle.trim()} 
          className="btn-primary h-8 px-3 text-xs gap-1"
        >
          <Plus size={12} /> Add
        </button>
      </form>
    </div>
  );
}
