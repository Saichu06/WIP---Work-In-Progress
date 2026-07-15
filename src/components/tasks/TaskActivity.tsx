import React from 'react';
import { TaskActivityLog } from '@/types';
import { Clock, Plus, RefreshCw, MessageSquare, Upload, CheckSquare, ShieldAlert } from 'lucide-react';
import { parseISO } from 'date-fns';

interface TaskActivityProps {
  activities: TaskActivityLog[];
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  created: <Plus size={12} className="text-blue-500" />,
  moved_status: <RefreshCw size={12} className="text-indigo-500" />,
  priority_changed: <ShieldAlert size={12} className="text-red-500" />,
  sprint_changed: <RefreshCw size={12} className="text-orange-500" />,
  assignee_changed: <RefreshCw size={12} className="text-amber-500" />,
  duedate_changed: <RefreshCw size={12} className="text-purple-500" />,
  title_changed: <RefreshCw size={12} className="text-pink-500" />,
  comment_added: <MessageSquare size={12} className="text-emerald-500" />,
  comment_deleted: <MessageSquare size={12} className="text-red-400" />,
  checklist_added: <CheckSquare size={12} className="text-sky-500" />,
  checklist_toggled: <CheckSquare size={12} className="text-emerald-500" />,
  checklist_deleted: <CheckSquare size={12} className="text-red-400" />,
  subtask_created: <Plus size={12} className="text-teal-500" />,
  subtask_status_changed: <RefreshCw size={12} className="text-teal-600" />,
  subtask_deleted: <TrashIcon />,
  attachment_uploaded: <Upload size={12} className="text-blue-600" />,
  attachment_deleted: <Upload size={12} className="text-red-400" />,
  archived: <ShieldAlert size={12} className="text-amber-500" />,
  restored: <RefreshCw size={12} className="text-emerald-500" />
};

function TrashIcon() {
  return (
    <span className="text-[10px] leading-none text-red-500">🗑️</span>
  );
}

export function TaskActivity({ activities }: TaskActivityProps) {
  // Sort activities: newest at top
  const sortedActivities = [...(activities || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="relative border-l border-surface-border ml-2.5 pl-6 space-y-4 py-2">
        {sortedActivities.map(act => (
          <div key={act.id} className="relative group">
            {/* Timeline Dot/Icon */}
            <div className="absolute -left-9 top-0.5 bg-white border border-surface-border rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
              {ACTIVITY_ICONS[act.type] || <Clock size={10} className="text-content-muted" />}
            </div>

            {/* Content info */}
            <div>
              <p className="text-xs text-content-primary font-medium leading-relaxed">
                {act.message}
              </p>
              <p className="text-[10px] text-content-muted mt-0.5">
                {formatRelative(act.createdAt)}
              </p>
            </div>
          </div>
        ))}

        {sortedActivities.length === 0 && (
          <p className="text-xs text-content-muted italic text-center py-4 -ml-6">No activity history recorded yet.</p>
        )}
      </div>
    </div>
  );
}

function formatRelative(dateString: string): string {
  try {
    return formatRelativeDate(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

import { formatDistanceToNow as formatRelativeDate } from 'date-fns';
