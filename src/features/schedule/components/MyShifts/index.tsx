import React from 'react';
import { Clock, Calendar as CalendarIcon, AlertCircle, Settings } from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { useSchedule } from '../../hooks/useSchedule';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

// In a real app, this would come from user authentication
const CURRENT_USER = "John Doe"; // Example user

const MyShifts: React.FC = () => {
  const { shifts, error, isConfigured } = useSchedule();

  // Get user's upcoming shifts for the next 7 days
  const myShifts = shifts
    .filter(shift => 
      shift.employeeName === CURRENT_USER &&
      shift.start >= new Date() &&
      shift.start <= addDays(new Date(), 7)
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="w-12 h-12 text-yellow-400 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Schedule Not Configured</h3>
        <p className="text-gray-400 text-sm max-w-md mb-4">
          Connect your 7shifts account to see your upcoming shifts.
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
      <div className="text-center py-8 text-red-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        <p>Failed to load schedule: {error}</p>
      </div>
    );
  }

  const formatShiftDate = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Upcoming Shifts</h3>
        <span className="text-sm text-gray-400">Next 7 days</span>
      </div>

      {myShifts.length > 0 ? (
        <div className="space-y-6">
          {myShifts.map(shift => (
            <div
              key={shift.id}
              className="bg-gray-800/50 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-primary-400" />
                  <span className="text-white font-medium">
                    {formatShiftDate(shift.start)}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{shift.role}</span>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {format(shift.start, 'h:mm a')} - {format(shift.end, 'h:mm a')}
                </span>
              </div>

              {shift.notes && (
                <p className="text-sm text-gray-400 border-t border-gray-700 pt-3">
                  {shift.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No upcoming shifts scheduled</p>
        </div>
      )}
    </div>
  );
};

export default MyShifts;