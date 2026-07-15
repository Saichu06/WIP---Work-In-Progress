import { useEffect, useState } from 'react';
import { ActivityStorage } from '@/storage/ActivityStorage';
import { ActivityFeed } from '@/components/common/ActivityFeed';
import { Bell } from 'lucide-react';
import type { ActivityLog } from '@/types';

export function Notifications() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setActivities(ActivityStorage.getRecent(100));
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-8 w-full animate-in">
      <div className="max-w-2xl mx-auto">
        <div className="page-header">
          <div>
            <h1 className="page-title">Activity Timeline</h1>
            <p className="page-subtitle">Every important action in your workspace.</p>
          </div>
          {activities.length > 0 && (
            <button onClick={() => { ActivityStorage.clear(); setActivities([]); }} className="btn-ghost text-xs">
              Clear all
            </button>
          )}
        </div>

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
      </div>
    </div>
  );
}
