import { formatRelative } from '@/utils';
import type { ActivityLog } from '@/types';
import {
  FolderOpen, Zap, CheckSquare, FileText, Code2, Image,
  ArrowRight, Archive, Trash2, Plus, Play, Square
} from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  project_created: <FolderOpen size={14} />,
  project_updated: <FolderOpen size={14} />,
  project_archived: <Archive size={14} />,
  project_deleted: <Trash2 size={14} />,
  sprint_created: <Zap size={14} />,
  sprint_started: <Play size={14} />,
  sprint_completed: <Square size={14} />,
  task_created: <Plus size={14} />,
  task_updated: <ArrowRight size={14} />,
  task_completed: <CheckSquare size={14} />,
  task_moved: <ArrowRight size={14} />,
  doc_created: <FileText size={14} />,
  doc_updated: <FileText size={14} />,
  doc_deleted: <Trash2 size={14} />,
  snippet_created: <Code2 size={14} />,
  snippet_updated: <Code2 size={14} />,
  asset_uploaded: <Image size={14} />,
  planning_updated: <FileText size={14} />,
};

interface ActivityFeedProps {
  activities: ActivityLog[];
  limit?: number;
}

export function ActivityFeed({ activities, limit = 20 }: ActivityFeedProps) {
  const items = activities.slice(0, limit);

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-content-secondary text-sm">
        No activity yet. Start building to see your history here.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((activity, i) => (
        <div key={activity.id} className="flex gap-3 group">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-surface-secondary border border-surface-border flex items-center justify-center text-content-secondary flex-shrink-0 mt-0.5">
              {ICONS[activity.type] || <ArrowRight size={14} />}
            </div>
            {i < items.length - 1 && <div className="w-px flex-1 bg-surface-border mt-1 mb-1 min-h-[16px]" />}
          </div>
          <div className="pb-4 min-w-0 flex-1">
            <p className="text-sm text-content-primary font-medium leading-tight">{activity.title}</p>
            <p className="text-xs text-content-secondary mt-0.5">{activity.description}</p>
            <p className="text-xs text-content-muted mt-1">{formatRelative(activity.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
