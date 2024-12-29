import React from 'react';
import { Clock } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';
import type { OperationsSettings } from '@/types/operations';

interface ShelfLifeProps {
  storage?: Recipe['storage'];
  settings: OperationsSettings | null;
  onChange: (updates: Partial<Recipe['storage']>) => void;
}

export const ShelfLife: React.FC<ShelfLifeProps> = ({
  storage,
  settings,
  onChange
}) => {
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
          <select
            value={`${storage?.shelfLife?.value || 1} ${storage?.shelfLife?.unit || 'days'}`}
            onChange={(e) => {
              const [value, unit] = e.target.value.split(' ');
              onChange({
                shelfLife: {
                  value: parseInt(value),
                  unit: unit as 'hours' | 'days' | 'weeks'
                }
              });
            }}
            className="input w-full"
            required
          >
            <option value="">Select shelf life...</option>
            {settings?.shelf_life_options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            How long this item can be stored
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Special Instructions
          </label>
          <textarea
            value={storage?.specialInstructions?.join('\n') || ''}
            onChange={(e) => onChange({
              specialInstructions: e.target.value.split('\n').filter(Boolean)
            })}
            className="input w-full h-24"
            placeholder="Enter any special storage or handling instructions..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Additional storage requirements or notes
          </p>
        </div>
      </div>
    </div>
  );
};