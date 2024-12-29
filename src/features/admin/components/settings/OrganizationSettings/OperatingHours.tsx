import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DailySchedule } from '@/types/organization';

interface OperatingHoursProps {
  schedule: DailySchedule;
  onChange: (schedule: DailySchedule) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
] as const;

export const OperatingHours: React.FC<OperatingHoursProps> = ({ schedule, onChange }) => {
  const handleDayToggle = (day: string, closed: boolean) => {
    const newSchedule = { ...schedule };
    if (closed) {
      newSchedule[day] = [{ open: '', close: '', closed: true }];
    } else {
      newSchedule[day] = [{ open: '09:00', close: '17:00' }];
    }
    onChange(newSchedule);
  };

  const handleTimeChange = (day: string, index: number, field: 'open' | 'close', value: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = [];
    }
    if (!newSchedule[day][index]) {
      newSchedule[day][index] = { open: '', close: '' };
    }
    newSchedule[day][index] = { ...newSchedule[day][index], [field]: value };
    onChange(newSchedule);
  };

  const addTimeSlot = (day: string) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = [];
    }
    newSchedule[day].push({ open: '', close: '' });
    onChange(newSchedule);
  };

  const removeTimeSlot = (day: string, index: number) => {
    const newSchedule = { ...schedule };
    newSchedule[day].splice(index, 1);
    if (newSchedule[day].length === 0) {
      newSchedule[day] = [{ open: '', close: '', closed: true }];
    }
    onChange(newSchedule);
  };

  return (
    <div className="space-y-4">
      {DAYS_OF_WEEK.map((day) => {
        const daySchedule = schedule[day] || [{ open: '', close: '', closed: true }];
        const isClosed = daySchedule[0]?.closed;

        return (
          <div key={day} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!isClosed}
                  onChange={(e) => handleDayToggle(day, !e.target.checked)}
                  className="form-checkbox rounded bg-gray-700 border-gray-600 text-amber-500"
                />
                <span className="text-white font-medium">{day}</span>
              </label>
              {!isClosed && daySchedule.length < 3 && (
                <button
                  onClick={() => addTimeSlot(day)}
                  className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Slot
                </button>
              )}
            </div>

            {!isClosed && (
              <div className="space-y-2 pl-7">
                {daySchedule.map((slot, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="time"
                      value={slot.open}
                      onChange={(e) => handleTimeChange(day, index, 'open', e.target.value)}
                      className="input"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={slot.close}
                      onChange={(e) => handleTimeChange(day, index, 'close', e.target.value)}
                      className="input"
                    />
                    {daySchedule.length > 1 && (
                      <button
                        onClick={() => removeTimeSlot(day, index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};