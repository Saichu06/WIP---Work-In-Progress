import { cn } from '@/utils';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/constants';
import type { Priority } from '@/types';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn('badge', `priority-${priority}`, className)}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLORS[priority] }} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
