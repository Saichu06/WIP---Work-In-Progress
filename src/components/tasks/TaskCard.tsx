import React, { memo } from 'react';
import { Task, BoardPreferences } from '@/types';
import { cn, formatDate } from '@/utils';
import { PriorityBadge } from '../common/PriorityBadge';
import { TaskContextMenu } from './TaskContextMenu';
import { MessageSquare, Paperclip, CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import { isPast, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns';

interface TaskCardProps {
  task: Task;
  preferences: BoardPreferences;
  selected: boolean;
  onSelectToggle: (taskId: string, selected: boolean) => void;
  onClick: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore?: () => void;
  onDelete: () => void;
}

export const TaskCard = memo(function TaskCard({
  task,
  preferences,
  selected,
  onSelectToggle,
  onClick,
  onEdit,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete
}: TaskCardProps) {
  const completedChecklist = (task.checklist || []).filter(item => item.completed).length;
  const totalChecklist = (task.checklist || []).length;
  const hasChecklist = totalChecklist > 0;

  const commentCount = (task.comments || []).length;
  const attachmentCount = (task.attachments || []).length;

  // Due date status calculator
  const getDueDateStatus = () => {
    if (!task.dueDate) return { label: 'No Due Date', className: 'text-content-muted bg-gray-50' };

    try {
      const due = startOfDay(parseISO(task.dueDate));

      if (isToday(due)) {
        return { label: 'Due Today', className: 'text-amber-600 bg-amber-50 font-semibold border-amber-200' };
      }
      if (isTomorrow(due)) {
        return { label: 'Due Tomorrow', className: 'text-blue-600 bg-blue-50 border-blue-200' };
      }
      if (isPast(due)) {
        return { label: 'Overdue', className: 'text-red-600 bg-red-50 border-red-200 font-semibold', isOverdue: true };
      }

      return { label: `Due ${formatDate(task.dueDate, 'MMM d')}`, className: 'text-content-secondary bg-surface-secondary border-surface-border' };
    } catch {
      return { label: task.dueDate, className: 'text-content-secondary bg-surface-secondary border-surface-border' };
    }
  };

  const dueStatus = getDueDateStatus();

  const isCompact = preferences.cardSize === 'sm';
  const isLarge = preferences.cardSize === 'lg';

  // Card size styles
  const paddingClass = isCompact ? 'p-2.5' : isLarge ? 'p-4' : 'p-3.5';
  const titleSizeClass = isCompact ? 'text-xs' : isLarge ? 'text-sm font-semibold' : 'text-sm font-medium';
  const gapClass = isCompact ? 'gap-1.5' : 'gap-2.5';

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-surface-border transition-all duration-150 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 select-none group relative flex flex-col',
        selected ? 'ring-2 ring-content-primary border-transparent shadow-md' : '',
        gapClass,
        paddingClass
      )}
    >
      {/* Top row: Checkbox, ID, Context menu */}
      <div className="flex items-center justify-between gap-2" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded text-content-primary border-surface-border focus:ring-content-primary cursor-pointer flex-shrink-0"
            checked={selected}
            onChange={(e) => onSelectToggle(task.id, e.target.checked)}
          />
          {!isCompact && (
            <span className="text-[10px] font-mono text-content-muted tracking-wider bg-surface-secondary px-1.5 py-0.5 rounded-md border border-surface-border">
              {task.taskId}
            </span>
          )}
        </div>
        <TaskContextMenu
          isArchived={!!task.archivedAt}
          onOpen={onClick}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      </div>

      {/* Title */}
      <p className={cn('text-content-primary leading-snug', isCompact ? 'line-clamp-1' : 'line-clamp-2', titleSizeClass)}>
        {task.title}
      </p>

      {/* Description preview in Large mode */}
      {isLarge && task.description && (
        <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {!isCompact && preferences.showLabels && task.labels.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {task.labels.slice(0, isLarge ? 5 : 3).map(l => (
            <span
              key={l}
              className="text-[9px] px-1.5 py-0.5 rounded-md font-semibold bg-surface-secondary text-content-secondary border border-surface-border capitalize"
            >
              {l}
            </span>
          ))}
        </div>
      )}

      {/* Middle row: Priority, Story Points, Due Date */}
      <div className={cn('flex items-center gap-2 flex-wrap', isCompact ? 'justify-between' : '')}>
        <PriorityBadge priority={task.priority} />

        {!isCompact && preferences.showStoryPoints && task.storyPoints > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-surface-secondary text-content-primary border border-surface-border font-bold">
            {task.storyPoints}pt
          </span>
        )}

        {preferences.showDueDates && task.dueDate && (
          <span className={cn('badge text-[9px] border flex items-center gap-1', dueStatus.className)}>
            {dueStatus.isOverdue ? <AlertCircle size={9} /> : <Calendar size={9} />}
            {dueStatus.label}
          </span>
        )}
      </div>

      {/* Bottom row: Checklist, Counters, Assignee - hidden in compact */}
      {!isCompact && (hasChecklist || commentCount > 0 || attachmentCount > 0 || task.assignee) && (
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-surface-secondary mt-0.5">
          <div className="flex items-center gap-2 text-content-muted">
            {preferences.showChecklist && hasChecklist && (
              <span className="flex items-center gap-1 text-[10px] font-medium" title="Checklist progress">
                <CheckSquare size={10} />
                {completedChecklist}/{totalChecklist}
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-medium" title="Comments">
                <MessageSquare size={10} />
                {commentCount}
              </span>
            )}
            {attachmentCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-medium" title="Attachments">
                <Paperclip size={10} />
                {attachmentCount}
              </span>
            )}
          </div>

          {task.assignee && (
            <span
              className="w-5 h-5 rounded-full bg-brand-yellow text-content-primary flex items-center justify-center text-[9px] font-bold border border-brand-yellow-dark shadow-sm flex-shrink-0 cursor-default"
              title={`Assigned to ${task.assignee}`}
            >
              {task.assignee.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}, (prev, next) => {
  // Custom comparison: only re-render if relevant task fields changed
  return (
    prev.task.updatedAt === next.task.updatedAt &&
    prev.task.id === next.task.id &&
    prev.selected === next.selected &&
    prev.preferences.cardSize === next.preferences.cardSize &&
    prev.preferences.compact === next.preferences.compact &&
    prev.preferences.showLabels === next.preferences.showLabels &&
    prev.preferences.showStoryPoints === next.preferences.showStoryPoints &&
    prev.preferences.showDueDates === next.preferences.showDueDates &&
    prev.preferences.showChecklist === next.preferences.showChecklist
  );
});
