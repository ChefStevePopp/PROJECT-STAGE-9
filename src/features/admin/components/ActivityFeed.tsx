import React from 'react';
import { format } from 'date-fns';
import type { Activity } from '@/shared/types';

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg">
            <div className={`w-2 h-2 rounded-full ${
              activity.type === 'recipe' ? 'bg-blue-400' :
              activity.type === 'inventory' ? 'bg-yellow-400' :
              activity.type === 'team' ? 'bg-green-400' : 'bg-purple-400'
            }`} />
            <div>
              <p className="text-sm text-white">{activity.message}</p>
              <p className="text-xs text-gray-400">
                {format(new Date(activity.timestamp), 'MMM d, h:mm a')} by {activity.user}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;