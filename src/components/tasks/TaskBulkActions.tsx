import React, { useState } from 'react';
import { TaskStatus, Priority, Sprint } from '@/types';
import { Archive, Trash2, Zap, Tag, Copy, X, FolderInput } from 'lucide-react';
import { SprintStorage } from '@/storage/SprintStorage';

interface TaskBulkActionsProps {
  projectId: string;
  selectedIds: string[];
  onClearSelection: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onBulkMoveSprint: (sprintId?: string) => void;
  onBulkMoveStatus: (status: TaskStatus) => void;
  onBulkAssignLabels: (labels: string[]) => void;
  onBulkDuplicate: () => void;
}

export function TaskBulkActions({
  projectId,
  selectedIds,
  onClearSelection,
  onBulkArchive,
  onBulkDelete,
  onBulkMoveSprint,
  onBulkMoveStatus,
  onBulkAssignLabels,
  onBulkDuplicate
}: TaskBulkActionsProps) {
  const [activeMenu, setActiveMenu] = useState<'sprint' | 'status' | 'label' | null>(null);
  const [newLabelInput, setNewLabelInput] = useState('');

  const sprints = SprintStorage.getByProject(projectId);

  if (selectedIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-content-primary text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3 z-30 animate-in border border-gray-800">
      {/* Selected count info */}
      <div className="flex items-center gap-2 pl-2">
        <span className="text-[10px] font-bold bg-white text-content-primary rounded-full w-5 h-5 flex items-center justify-center shadow-inner">
          {selectedIds.length}
        </span>
        <span className="text-[11px] font-semibold tracking-wide text-gray-200">selected</span>
      </div>

      <div className="h-4 w-px bg-gray-700" />

      {/* Primary Actions Group */}
      <div className="flex items-center gap-1 relative">
        {/* Bulk Status update */}
        <button
          onClick={() => setActiveMenu(activeMenu === 'status' ? null : 'status')}
          className="btn-ghost hover:bg-gray-800 text-gray-200 hover:text-white px-2.5 h-8 text-[11px]"
        >
          Move Status
        </button>

        {/* Bulk Sprint update */}
        <button
          onClick={() => setActiveMenu(activeMenu === 'sprint' ? null : 'sprint')}
          className="btn-ghost hover:bg-gray-800 text-gray-200 hover:text-white px-2.5 h-8 text-[11px]"
        >
          Move Sprint
        </button>

        {/* Bulk Labels assignment */}
        <button
          onClick={() => setActiveMenu(activeMenu === 'label' ? null : 'label')}
          className="btn-ghost hover:bg-gray-800 text-gray-200 hover:text-white px-2.5 h-8 text-[11px]"
        >
          Assign Label
        </button>

        {/* Bulk Duplication */}
        <button
          onClick={onBulkDuplicate}
          className="btn-ghost hover:bg-gray-800 text-gray-200 hover:text-white p-2 h-8 w-8 rounded-lg flex items-center justify-center"
          title="Duplicate tasks"
        >
          <Copy size={13} />
        </button>

        {/* Bulk Archive */}
        <button
          onClick={onBulkArchive}
          className="btn-ghost hover:bg-gray-800 text-gray-200 hover:text-white p-2 h-8 w-8 rounded-lg flex items-center justify-center"
          title="Archive tasks"
        >
          <Archive size={13} />
        </button>

        {/* Bulk Delete */}
        <button
          onClick={onBulkDelete}
          className="btn-ghost hover:bg-red-900 text-red-300 hover:text-red-100 p-2 h-8 w-8 rounded-lg flex items-center justify-center"
          title="Delete permanently"
        >
          <Trash2 size={13} />
        </button>

        {/* Dropdown contextual overlay submenus */}
        {activeMenu === 'status' && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-surface-border rounded-xl shadow-xl p-1 w-32 flex flex-col z-40 text-content-primary">
            {(['backlog', 'todo', 'in-progress', 'review', 'testing', 'done'] as TaskStatus[]).map(st => (
              <button
                key={st}
                onClick={() => {
                  onBulkMoveStatus(st);
                  setActiveMenu(null);
                }}
                className="px-2.5 py-1.5 text-left text-[10px] font-semibold hover:bg-surface-secondary rounded-lg capitalize"
              >
                {st.replace('-', ' ')}
              </button>
            ))}
          </div>
        )}

        {activeMenu === 'sprint' && (
          <div className="absolute bottom-full mb-2 left-0 bg-white border border-surface-border rounded-xl shadow-xl p-1 w-44 flex flex-col z-40 text-content-primary">
            <button
              onClick={() => {
                onBulkMoveSprint(undefined);
                setActiveMenu(null);
              }}
              className="px-2.5 py-1.5 text-left text-[10px] font-semibold hover:bg-surface-secondary rounded-lg border-b border-surface-border text-content-secondary"
            >
              Backlog (No Sprint)
            </button>
            {sprints.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  onBulkMoveSprint(s.id);
                  setActiveMenu(null);
                }}
                className="px-2.5 py-1.5 text-left text-[10px] font-semibold hover:bg-surface-secondary rounded-lg truncate"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}

        {activeMenu === 'label' && (
          <form
            onSubmit={e => {
              e.preventDefault();
              if (newLabelInput.trim()) {
                onBulkAssignLabels([newLabelInput.trim()]);
                setNewLabelInput('');
                setActiveMenu(null);
              }
            }}
            className="absolute bottom-full mb-2 left-0 bg-white border border-surface-border rounded-xl shadow-xl p-2 w-48 flex gap-1.5 z-40 text-content-primary"
          >
            <input
              type="text"
              className="input h-7 px-2 text-[10px] flex-1 bg-surface-secondary"
              placeholder="Label name (e.g. bug)"
              value={newLabelInput}
              onChange={e => setNewLabelInput(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="btn-primary h-7 px-2 text-[10px] rounded-lg">
              Apply
            </button>
          </form>
        )}
      </div>

      <div className="h-4 w-px bg-gray-700" />

      {/* Clear selection button */}
      <button
        onClick={onClearSelection}
        className="btn-ghost hover:bg-gray-800 text-gray-400 hover:text-white p-1 h-7 w-7 rounded-lg flex items-center justify-center"
        title="Clear selection"
      >
        <X size={13} />
      </button>
    </div>
  );
}
