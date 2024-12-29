import React from 'react';
import { Clock, MapPin } from 'lucide-react';
import type { TeamMemberData } from '@/features/team/types';

interface StaffScheduleProps {
  team: TeamMemberData[];
}

export const StaffSchedule: React.FC<StaffScheduleProps> = ({ team }) => {
  return (
    <div className="card p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Staff Schedule</h2>
      {team.length > 0 ? (
        <div className="space-y-4">
          {team.map((member) => (
            <div 
              key={member.id} 
              className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={member.avatar}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-10 h-10 rounded-full bg-gray-700"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full" />
              </div>

              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-white truncate">
                    {member.firstName} {member.lastName}
                  </h3>
                  {member.roles.map((role, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-medium"
                    >
                      {role}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 mt-1">
                  {/* Shift Time */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>8:00 AM - 4:00 PM</span>
                  </div>

                  {/* Location */}
                  {member.locations?.[0] && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{member.locations[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Departments */}
              <div className="hidden sm:flex flex-wrap gap-2">
                {member.departments.map((dept, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-gray-400 text-sm">
            No staff members scheduled for today
          </p>
        </div>
      )}
    </div>
  );
};