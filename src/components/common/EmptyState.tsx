import { cn } from '@/utils';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}
//i have added a comment here for github streak

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('empty-state animate-in', className)}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-secondary border border-surface-border flex items-center justify-center mb-5 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-content-primary mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-content-secondary max-w-sm leading-relaxed mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
