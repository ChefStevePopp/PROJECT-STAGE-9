import React from 'react';
import { Utensils, Plus, Trash2 } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';

interface TasteStandardsProps {
  qualityStandards: Recipe['qualityStandards'];
  onChange: (updates: Partial<Recipe['qualityStandards']>) => void;
}

export const TasteStandards: React.FC<TasteStandardsProps> = ({
  qualityStandards,
  onChange
}) => {
  const addTastePoint = () => {
    const point = prompt('Enter taste quality point:');
    if (!point) return;

    onChange({
      taste: [...(qualityStandards?.taste || []), point]
    });
  };

  const removeTastePoint = (index: number) => {
    const points = qualityStandards?.taste?.filter((_, i) => i !== index);
    onChange({ taste: points });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Utensils className="w-5 h-5 text-green-400" />
          Taste Standards
        </h3>
        <button
          onClick={addTastePoint}
          className="btn-ghost text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Taste Point
        </button>
      </div>
      <div className="space-y-2">
        {qualityStandards?.taste?.map((point, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"
          >
            <Utensils className="w-5 h-5 text-green-400 flex-shrink-0" />
            <input
              type="text"
              value={point}
              onChange={(e) => {
                const points = [...(qualityStandards.taste || [])];
                points[index] = e.target.value;
                onChange({ taste: points });
              }}
              className="flex-1 bg-transparent border-none text-gray-300 focus:outline-none"
              placeholder="Describe taste quality point..."
            />
            <button
              onClick={() => removeTastePoint(index)}
              className="text-gray-500 hover:text-rose-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};