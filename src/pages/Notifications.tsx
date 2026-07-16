import { useEffect, useState } from 'react';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { NotificationStorage } from '@/storage/NotificationStorage';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import { useApp } from '@/contexts/AppContext';
import { Bell, CheckCheck, Trash2, Info, CheckSquare, Zap, FileText, Image } from 'lucide-react';
import { cn } from '@/utils';
import type { ActivityLog, AppNotification } from '@/types';

type Tab = 'notifications' | 'activity';

const NOTIFICATION_ICONS: Record<string, React.ElementType> = {
  task_created: CheckSquare,
  task_completed: CheckSquare,
  sprint_started: Zap,
  sprint_completed: Zap,
  blueprint_imported: FileText,
  doc_updated: FileText,
  asset_uploaded: Image,
  project_created: Bell,
  info: Info,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function Notifications() {
  const [activeTab, setActiveTab] = useState<Tab>('notifications');
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const { notifications, unreadCount, markNotificationRead, markAllNotificationsRead, clearNotifications, refreshNotifications } = useApp();

  useEffect(() => {
    setActivities(ActivityStorage.getRecent(100));
    refreshNotifications();
  }, [refreshNotifications]);

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Bell size={20} />
              Notifications
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </h1>
            <p className="page-subtitle">Stay updated on your workspace activity.</p>
          </div>
          <div className="flex gap-2">
            {activeTab === 'notifications' && notifications.length > 0 && (
              <>
                <button
                  onClick={markAllNotificationsRead}
                  className="btn-ghost text-xs"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
                <button
                  onClick={clearNotifications}
                  className="btn-ghost text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                  title="Clear all"
                >
                  <Trash2 size={14} /> Clear all
                </button>
              </>
            )}
            {activeTab === 'activity' && activities.length > 0 && (
              <button
                onClick={() => { ActivityStorage.clear(); setActivities([]); }}
                className="btn-ghost text-xs"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-border mb-6">
          <button
            onClick={() => setActiveTab('notifications')}
            className={cn('tab-link flex items-center gap-2', activeTab === 'notifications' && 'tab-link-active')}
          >
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={cn('tab-link', activeTab === 'activity' && 'tab-link-active')}
          >
            Activity Timeline
          </button>
        </div>

        {/* ── Notifications Tab ── */}
        {activeTab === 'notifications' && (
          <div className="card">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell size={32} className="mx-auto text-content-muted mb-3" />
                <h3 className="text-sm font-semibold text-content-primary mb-1">No notifications</h3>
                <p className="text-sm text-content-secondary">Activity in your workspace will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {notifications.map(n => {
                  const Icon = NOTIFICATION_ICONS[n.type] || Bell;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        'w-full flex items-start gap-3 p-3 text-left hover:bg-surface-secondary transition-colors',
                        !n.read && 'bg-blue-50/40'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                        n.read ? 'bg-surface-secondary text-content-muted' : 'bg-blue-100 text-blue-600'
                      )}>
                        <Icon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-semibold truncate', n.read ? 'text-content-secondary' : 'text-content-primary')}>
                          {n.title}
                        </p>
                        <p className="text-xs text-content-muted mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-content-muted mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === 'activity' && (
          <div className="card">
            {activities.length === 0 ? (
              <div className="text-center py-16">
                <Bell size={32} className="mx-auto text-content-muted mb-3" />
                <h3 className="text-sm font-semibold text-content-primary mb-1">Nothing yet</h3>
                <p className="text-sm text-content-secondary">Start building to see your activity here.</p>
              </div>
            ) : (
              <ActivityFeed activities={activities} limit={100} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
