import React from 'react';
import { Thermometer } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';

interface TemperatureControlsProps {
  storage?: Recipe['storage'];
  onChange: (updates: Partial<Recipe['storage']>) => void;
}

export const TemperatureControls: React.FC<TemperatureControlsProps> = ({
  storage,
  onChange
}) => {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-blue-400" />
        Temperature Controls
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Target Temperature
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={storage?.temperature?.value || 40}
              onChange={(e) => onChange({
                temperature: {
                  ...storage?.temperature,
                  value: parseFloat(e.target.value)
                }
              })}
              className="input flex-1"
              step="0.1"
            />
            <select
              value={storage?.temperature?.unit || 'F'}
              onChange={(e) => onChange({
                temperature: {
                  ...storage?.temperature,
                  unit: e.target.value as 'F' | 'C'
                }
              })}
              className="input w-20"
            >
              <option value="F">°F</option>
              <option value="C">°C</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Tolerance (±)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={storage?.temperature?.tolerance || 2}
              onChange={(e) => onChange({
                temperature: {
                  ...storage?.temperature,
                  tolerance: parseFloat(e.target.value)
                }
              })}
              className="input flex-1"
              min="0"
              step="0.1"
            />
            <div className="input w-20 bg-gray-700 flex items-center justify-center">
              {storage?.temperature?.unit || 'F'}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Acceptable Range
          </label>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-white">
              {(storage?.temperature?.value || 40) - (storage?.temperature?.tolerance || 2)}° - 
              {(storage?.temperature?.value || 40) + (storage?.temperature?.tolerance || 2)}°
              {storage?.temperature?.unit || 'F'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};