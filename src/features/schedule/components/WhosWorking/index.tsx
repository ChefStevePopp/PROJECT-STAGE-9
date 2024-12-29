import React from 'react';
import { Clock, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { useSchedule } from '../../hooks/useSchedule';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const WhosWorking: React.FC = () => {
  const { shifts, error, isLoading, syncSchedule, isConfigured } = useSchedule();
  const now = new Date();

  // Get currently working staff
  const currentlyWorking = shifts.filter(shift => 
    isWithinInterval(now, { start: shift.start, end: shift.end })
  );

  // Get upcoming shifts for today
  const upcomingToday = shifts.filter(shift => 
    shift.start > now && 
    shift.start.getDate() === now.getDate()
  ).sort((a, b) => a.start.getTime() - b.start.getTime());

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Schedule Not Configured</h3>
        <p className="text-gray-400 text-sm max-w-md mb-4">
          Connect your 7shifts account to see who's working.
        </p>
        <Link 
          to={ROUTES.ADMIN.SETTINGS}
          className="btn-primary inline-flex items-center"
        >
          <Settings className="w-4 h-4 mr-2" />
          Configure Integration
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 rounded-lg p-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-red-400">{error}</p>
        <button 
          onClick={() => syncSchedule()}
          className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline-block" />
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-2" />
        <p className="text-gray-400">Syncing schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Currently Working */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Currently Working</h3>
        <div className="grid gap-4">
          {currentlyWorking.length > 0 ? (
            currentlyWorking.map(shift => (
              <div
                key={shift.id}
                className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-white font-medium">{shift.employeeName}</h4>
                  <p className="text-sm text-gray-400">{shift.role}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Until {format(shift.end, 'h:mm a')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">
              No one is currently working
            </p>
          )}
        </div>
      </div>

      {/* Coming Up */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Coming Up Today</h3>
        <div className="grid gap-4">
          {upcomingToday.length > 0 ? (
            upcomingToday.map(shift => (
              <div
                key={shift.id}
                className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-white font-medium">{shift.employeeName}</h4>
                  <p className="text-sm text-gray-400">{shift.role}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {format(shift.start, 'h:mm a')} - {format(shift.end, 'h:mm a')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4">
              No more shifts scheduled for today
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhosWorking;