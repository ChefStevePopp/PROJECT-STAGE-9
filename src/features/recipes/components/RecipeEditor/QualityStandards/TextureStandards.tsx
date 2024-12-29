import React from 'react';
import { Scale, Plus, Trash2 } from 'lucide-react';
import type { Recipe } from '../../../types/recipe';

interface TextureStandardsProps {
  qualityStandards: Recipe['qualityStandards'];
  onChange: (updates: Partial<Recipe['qualityStandards']>) => void;
}

export const TextureStandards: React.FC<TextureStandardsProps> = ({
  qualityStandards,
  onChange
}) => {
  const addTexturePoint = () => {
    const point = prompt('Enter texture quality point:');
    if (!point) return;

    onChange({
      texture: [...(qualityStandards?.texture || []), point]
    });
  };

  const removeTexturePoint = (index: number) => {
    const points = qualityStandards?.texture?.filter((_, i) => i !== index);
    onChange({ texture: points });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          Texture Standards
        </h3>
        <button
          onClick={addTexturePoint}
          className="btn-ghost text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Texture Point
        </button>
      </div>
      <div className="space-y-2">
        {qualityStandards?.texture?.map((point, index) => (
          <div
            key={index}
            className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3"
          >
            <Scale className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <input
              type="text"
              value={point}
              onChange={(e) => {
                const points = [...(qualityStandards.texture || [])];
                points[index] = e.target.value;
                onChange({ texture: points });
              }}
              className="flex-1 bg-transparent border-none text-gray-300 focus:outline-none"
              placeholder="Describe texture quality point..."
            />
            <button
              onClick={() => removeTexturePoint(index)}
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