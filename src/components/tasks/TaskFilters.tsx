import React from 'react';
import { Priority, TaskStatus } from '@/types';
import { Search, Filter, Calendar } from 'lucide-react';
import { SprintStorage } from '@/storage/SprintStorage';

export interface FilterState {
  search: string;
  priority: Priority | 'all';
  sprintId: string | 'all' | 'none';
  label: string | 'all';
  dueDateType: 'all' | 'overdue' | 'today' | 'tomorrow' | 'upcoming' | 'none';
  showArchived: boolean;
}

interface TaskFiltersProps {
  projectId: string;
  filters: FilterState;
  onFiltersChange: (newFilters: FilterState) => void;
  availableLabels: string[];
}

export function TaskFilters({ projectId, filters, onFiltersChange, availableLabels }: TaskFiltersProps) {
  const sprints = SprintStorage.getByProject(projectId);

  const handleFieldChange = (key: keyof FilterState, val: any) => {
    onFiltersChange({
      ...filters,
      [key]: val
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full bg-white border border-surface-border p-3.5 rounded-xl shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
        <input
          type="text"
          className="input pl-9 h-9 text-xs"
          placeholder="Search task title, description, ID or label..."
          value={filters.search}
          onChange={e => handleFieldChange('search', e.target.value)}
        />
      </div>

      {/* Filters dropdowns group */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority select */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider hidden sm:inline">Priority:</span>
          <select
            className="input h-9 text-xs w-28 bg-surface-secondary/55"
            value={filters.priority}
            onChange={e => handleFieldChange('priority', e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sprint select */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider hidden sm:inline">Sprint:</span>
          <select
            className="input h-9 text-xs w-32 bg-surface-secondary/55"
            value={filters.sprintId}
            onChange={e => handleFieldChange('sprintId', e.target.value)}
          >
            <option value="all">All Sprints</option>
            <option value="none">Backlog (No Sprint)</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Label filter select */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider hidden sm:inline">Label:</span>
          <select
            className="input h-9 text-xs w-28 bg-surface-secondary/55 capitalize"
            value={filters.label}
            onChange={e => handleFieldChange('label', e.target.value)}
          >
            <option value="all">All Labels</option>
            {availableLabels.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Due Date select */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider hidden sm:inline">Due Date:</span>
          <select
            className="input h-9 text-xs w-32 bg-surface-secondary/55"
            value={filters.dueDateType}
            onChange={e => handleFieldChange('dueDateType', e.target.value)}
          >
            <option value="all">Any Due Date</option>
            <option value="overdue">Overdue</option>
            <option value="today">Due Today</option>
            <option value="tomorrow">Due Tomorrow</option>
            <option value="upcoming">Upcoming</option>
            <option value="none">No Due Date</option>
          </select>
        </div>

        {/* Show Archived filter check */}
        <label className="flex items-center gap-2 px-3 h-9 bg-surface-secondary/55 rounded-xl border border-surface-border text-xs text-content-secondary hover:text-content-primary transition-all cursor-pointer">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded text-content-primary border-surface-border focus:ring-content-primary"
            checked={filters.showArchived}
            onChange={e => handleFieldChange('showArchived', e.target.checked)}
          />
          <span>Show Archived</span>
        </label>
      </div>
    </div>
  );
}
