import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { CustomAllergen } from '../../types';

interface CustomAllergenInputProps {
  index: 1 | 2 | 3;
  value: CustomAllergen;
  onChange: (value: CustomAllergen) => void;
}

export const CustomAllergenInput: React.FC<CustomAllergenInputProps> = ({
  index,
  value,
  onChange
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value.active}
            onChange={(e) => onChange({ ...value, active: e.target.checked })}
            className="form-checkbox rounded bg-gray-700 border-gray-600 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-300">Custom Allergen {index}</span>
        </label>
        <input
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Enter allergen name"
          className="input flex-1 text-sm"
          disabled={!value.active}
        />
      </div>
      {value.active && !value.name && (
        <div className="flex items-center gap-2 text-yellow-400 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>Please enter a name for this custom allergen</span>
        </div>
      )}
    </div>
  );
};