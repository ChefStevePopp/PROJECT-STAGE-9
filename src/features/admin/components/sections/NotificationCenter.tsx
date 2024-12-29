import React from 'react';
import { Bell, Filter } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';

export const NotificationCenter: React.FC = () => {
  const alerts = useAdminStore((state) => state.alerts);

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Notification Center</h1>
        <div className="flex gap-4">
          <select className="input">
            <option value="all">All Types</option>
            <option value="critical">Critical</option>
            <option value="warning">Warnings</option>
            <option value="info">Information</option>
          </select>
          <button className="btn-ghost">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
        </div>
      </header>

      <div className="card p-6">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-lg ${
                alert.type === 'critical' ? 'bg-red-500/10' :
                alert.type === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
              }`}
            >
              <Bell className={`w-5 h-5 ${
                alert.type === 'critical' ? 'text-red-400' :
                alert.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'
              }`} />
              <div className="flex-1">
                <h3 className="text-white font-medium">{alert.message}</h3>
                <p className="text-sm text-gray-400 mt-1">{alert.details}</p>
                <p className="text-xs text-gray-500 mt-2">{alert.timestamp}</p>
              </div>
              <button className="text-gray-400 hover:text-white">
                Mark as Read
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;