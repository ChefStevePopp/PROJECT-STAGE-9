import React from 'react';
import { Clock } from 'lucide-react';
import { format, addDays, addHours, addWeeks } from 'date-fns';

interface ShelfLife {
  value: number;
  unit: 'hours' | 'days' | 'weeks';
}

interface ShelfLifeSettingsProps {
  shelfLife: ShelfLife;
  onChange: (shelfLife: ShelfLife) => void;
}

export const ShelfLifeSettings: React.FC<ShelfLifeSettingsProps> = ({
  shelfLife,
  onChange
}) => {
  const getExpirationDate = (date: Date): Date => {
    switch (shelfLife.unit) {
      case 'hours':
        return addHours(date, shelfLife.value);
      case 'days':
        return addDays(date, shelfLife.value);
      case 'weeks':
        return addWeeks(date, shelfLife.value);
    }
  };

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-rose-400" />
        Shelf Life
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Duration
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              value={shelfLife.value}
              onChange={(e) => onChange({
                ...shelfLife,
                value: parseInt(e.target.value)
              })}
              className="input flex-1"
              min="1"
              step="1"
              required
            />
            <select
              value={shelfLife.unit}
              onChange={(e) => onChange({
                ...shelfLife,
                unit: e.target.value as ShelfLife['unit']
              })}
              className="input w-32"
              required
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Example Dates
          </label>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">If made today:</span>
              <span className="text-white">
                {format(getExpirationDate(new Date()), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};