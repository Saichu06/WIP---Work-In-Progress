import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SprintStorage } from '@/storage/SprintStorage';
import { cn, formatDate } from '@/utils';
import type { Project, Sprint } from '@/types';
import { differenceInDays, parseISO, isWithinInterval, startOfMonth, endOfMonth, eachMonthOfInterval, format } from 'date-fns';

export function ProjectTimeline() {
  const { project } = useOutletContext<{ project: Project }>();
  const [sprints, setSprints] = useState<Sprint[]>([]);

  useEffect(() => {
    setSprints(SprintStorage.getByProject(project.id));
  }, [project.id]);

  if (sprints.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-base font-semibold text-content-primary mb-1">No Timeline Yet</h3>
          <p className="text-sm text-content-secondary">Create sprints to see them on the timeline.</p>
        </div>
      </div>
    );
  }

  const allDates = sprints.flatMap(s => [parseISO(s.startDate), parseISO(s.endDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  const months = eachMonthOfInterval({ start: startOfMonth(minDate), end: endOfMonth(maxDate) });
  const totalDays = differenceInDays(maxDate, minDate) + 1;
  const DAY_WIDTH = 28;

  const STATUS_COLORS: Record<string, string> = {
    planning: '#60A5FA',
    active: '#22C55E',
    completed: '#9CA3AF',
  };

  return (
    <div className="p-8 overflow-x-auto animate-in">
      <div className="page-header mb-6">
        <div>
          <h1 className="page-title">Timeline</h1>
          <p className="page-subtitle">Visual overview of all sprints.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-border overflow-hidden">
        {/* Month headers */}
        <div className="flex border-b border-surface-border bg-surface-secondary">
          <div className="w-48 flex-shrink-0 px-4 py-3 text-xs font-semibold text-content-muted border-r border-surface-border">SPRINT</div>
          <div className="flex">
            {months.map(month => {
              const daysInMonth = Math.min(
                differenceInDays(endOfMonth(month), month > minDate ? month : minDate) + 1,
                totalDays
              );
              return (
                <div key={month.toISOString()} className="border-r border-surface-border px-3 py-3 text-xs font-semibold text-content-muted" style={{ width: daysInMonth * DAY_WIDTH }}>
                  {format(month, 'MMM yyyy')}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sprint rows */}
        {sprints.map(sprint => {
          const start = parseISO(sprint.startDate);
          const end = parseISO(sprint.endDate);
          const offsetDays = differenceInDays(start, minDate);
          const durationDays = differenceInDays(end, start) + 1;

          return (
            <div key={sprint.id} className="flex items-center border-b border-surface-border last:border-0 hover:bg-surface-secondary/50 transition-colors">
              <div className="w-48 flex-shrink-0 px-4 py-3 border-r border-surface-border">
                <div className="text-sm font-medium text-content-primary truncate">{sprint.name}</div>
                <div className="text-xs text-content-muted mt-0.5">{formatDate(sprint.startDate, 'MMM d')} – {formatDate(sprint.endDate, 'MMM d')}</div>
              </div>
              <div className="flex-1 py-4 relative" style={{ width: totalDays * DAY_WIDTH }}>
                <div
                  className="absolute h-8 rounded-lg flex items-center px-3 top-1/2 -translate-y-1/2 transition-all cursor-pointer hover:brightness-95"
                  style={{
                    left: offsetDays * DAY_WIDTH,
                    width: durationDays * DAY_WIDTH - 4,
                    backgroundColor: STATUS_COLORS[sprint.status] + '33',
                    borderLeft: `3px solid ${STATUS_COLORS[sprint.status]}`,
                  }}
                >
                  <span className="text-xs font-medium truncate" style={{ color: STATUS_COLORS[sprint.status] }}>{sprint.name}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-content-muted">
        {[['planning', '#60A5FA'], ['active', '#22C55E'], ['completed', '#9CA3AF']].map(([s, c]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c + '33', border: `2px solid ${c}` }} />
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
