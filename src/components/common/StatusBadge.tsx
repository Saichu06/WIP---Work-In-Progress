import { cn } from '@/utils';
import { TASK_STATUS_LABELS } from '@/constants';
import type { TaskStatus } from '@/types';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('badge', `status-${status}`, className)}>
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
