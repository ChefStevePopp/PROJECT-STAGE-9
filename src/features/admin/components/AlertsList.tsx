import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';
import type { Alert } from '@/shared/types';

interface AlertsListProps {
  alerts: Alert[];
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-white mb-4">System Alerts</h2>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              alert.type === 'critical' ? 'bg-red-500/10' :
              alert.type === 'warning' ? 'bg-yellow-500/10' : 'bg-blue-500/10'
            }`}
          >
            {alert.type === 'critical' ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : alert.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            ) : (
              <Info className="w-5 h-5 text-blue-400" />
            )}
            <div>
              <p className="text-sm text-white">{alert.message}</p>
              <p className="text-xs text-gray-400">{alert.details}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsList;