import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-surface-secondary', className)}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4 rounded-md" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-surface-border">
      <Skeleton className="h-4 w-20 flex-shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
      <Skeleton className="h-5 w-14 rounded-full flex-shrink-0" />
    </div>
  );
}

export function SkeletonBoardColumn({ cardCount = 3 }: { cardCount?: number }) {
  return (
    <div className="flex flex-col w-72 flex-shrink-0 bg-surface-secondary rounded-2xl border border-surface-border p-3 gap-2.5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-6 rounded-md" />
      </div>
      {Array.from({ length: cardCount }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDashboardStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl p-4 bg-surface-secondary">
          <Skeleton className="h-8 w-10 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDocSidebar({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-28' : i % 3 === 1 ? 'w-24' : 'w-32'}`} />
        </div>
      ))}
    </div>
  );
}
