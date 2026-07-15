import React, { useState } from 'react';
import { FilterState, TaskFilters } from './TaskFilters';
import { BoardPreferences } from '@/types';
import { Settings, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils';

export type SortType = 'priority' | 'duedate' | 'storypoints' | 'newest' | 'oldest' | 'alphabetical';

interface TaskToolbarProps {
  projectId: string;
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  availableLabels: string[];
  sortBy: SortType;
  onSortByChange: (s: SortType) => void;
  preferences: BoardPreferences;
  onPreferencesChange: (p: BoardPreferences) => void;
}

export function TaskToolbar({
  projectId,
  filters,
  onFiltersChange,
  availableLabels,
  sortBy,
  onSortByChange,
  preferences,
  onPreferencesChange
}: TaskToolbarProps) {
  const [showPreferencesMenu, setShowPreferencesMenu] = useState(false);

  const togglePreference = (key: keyof Omit<BoardPreferences, 'cardSize'>) => {
    onPreferencesChange({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  const handleCardSizeChange = (cardSize: 'sm' | 'md' | 'lg') => {
    onPreferencesChange({
      ...preferences,
      cardSize
    });
  };

  return (
    <div className="space-y-3 w-full flex-shrink-0">
      {/* Search & Filters */}
      <TaskFilters
        projectId={projectId}
        filters={filters}
        onFiltersChange={onFiltersChange}
        availableLabels={availableLabels}
      />

      {/* Sorting & Board preferences controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-surface-border px-3.5 py-2.5 rounded-xl shadow-sm">
        {/* Sorting controls */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-content-muted" />
          <span className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider">Sort By:</span>
          <select
            className="input h-8 text-xs w-36 bg-surface-secondary/55"
            value={sortBy}
            onChange={e => onSortByChange(e.target.value as SortType)}
          >
            <option value="newest">Newest Created</option>
            <option value="oldest">Oldest Created</option>
            <option value="priority">Priority Rank</option>
            <option value="duedate">Due Date</option>
            <option value="storypoints">Story Points</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>

        {/* Board preferences toggle */}
        <div className="relative">
          <button
            onClick={() => setShowPreferencesMenu(!showPreferencesMenu)}
            className={cn(
              'btn-secondary h-8 px-3 text-xs gap-1.5',
              showPreferencesMenu && 'bg-surface-secondary border-content-primary/30'
            )}
          >
            <Settings size={13} />
            <span>Board Prefs</span>
          </button>

          {showPreferencesMenu && (
            <>
              {/* Overlay helper to close menu */}
              <div className="fixed inset-0 z-20" onClick={() => setShowPreferencesMenu(false)} />
              
              {/* Preferences Modal Box */}
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-surface-border rounded-xl shadow-lg z-30 p-3.5 animate-scale-in space-y-3">
                <h4 className="text-xs font-bold text-content-primary border-b border-surface-border pb-1.5 flex items-center gap-1.5">
                  <SlidersHorizontal size={12} /> Board Layout Options
                </h4>

                {/* Option Toggles */}
                <div className="space-y-2">
                  {[
                    { key: 'compact', label: 'Compact Layout' },
                    { key: 'showLabels', label: 'Display Labels' },
                    { key: 'showStoryPoints', label: 'Display Story Points' },
                    { key: 'showDueDates', label: 'Display Due Dates' },
                    { key: 'showChecklist', label: 'Display Checklists' }
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center justify-between text-xs text-content-secondary hover:text-content-primary cursor-pointer select-none">
                      <span>{opt.label}</span>
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded text-content-primary border-surface-border focus:ring-content-primary"
                        checked={preferences[opt.key as keyof Omit<BoardPreferences, 'cardSize'>]}
                        onChange={() => togglePreference(opt.key as keyof Omit<BoardPreferences, 'cardSize'>)}
                      />
                    </label>
                  ))}
                </div>

                {/* Sizing Toggles */}
                <div className="border-t border-surface-border pt-2">
                  <span className="text-[10px] font-semibold text-content-muted uppercase tracking-wider block mb-1.5">Card Size</span>
                  <div className="flex gap-1 bg-surface-secondary border border-surface-border p-0.5 rounded-lg">
                    {(['sm', 'md', 'lg'] as const).map(size => (
                      <button
                        key={size}
                        onClick={() => handleCardSizeChange(size)}
                        className={cn(
                          'flex-1 text-center py-1 rounded-md text-[10px] font-bold uppercase transition-all',
                          preferences.cardSize === size
                            ? 'bg-white shadow-xs text-content-primary'
                            : 'text-content-muted hover:text-content-secondary'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
