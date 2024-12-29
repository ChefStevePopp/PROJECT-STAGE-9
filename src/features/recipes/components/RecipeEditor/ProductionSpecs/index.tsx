import React from 'react';
import { Clock, Thermometer, Scale, AlertCircle, Plus, Trash2 } from 'lucide-react';
import type { Recipe, RecipeStep } from '../../../types/recipe';

interface ProductionSpecsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const ProductionSpecs: React.FC<ProductionSpecsProps> = ({ recipe, onChange }) => {
  const handleTimeChange = (field: 'prepTime' | 'cookTime' | 'restTime', value: number) => {
    onChange({
      [field]: value,
      totalTime: (field === 'prepTime' ? value : recipe.prepTime) +
                (field === 'cookTime' ? value : recipe.cookTime) +
                (field === 'restTime' ? value : recipe.restTime || 0)
    });
  };

  return (
    <div className="space-y-6">
      {/* Station Assignment */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4">Station Assignment</h3>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Station Responsible for Production
          </label>
          <select
            value={recipe.station}
            onChange={(e) => onChange({ station: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select station...</option>
            <option value="grill">Grill</option>
            <option value="saute">Sauté</option>
            <option value="fry">Fry</option>
            <option value="prep">Prep</option>
            <option value="pantry">Pantry</option>
            <option value="pizza">Pizza</option>
            <option value="expo">Expo</option>
          </select>
        </div>
      </div>

      {/* Timing Requirements */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4">Time Requirements</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Prep Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.prepTime}
              onChange={(e) => handleTimeChange('prepTime', parseInt(e.target.value))}
              className="input w-full"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Cook Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.cookTime}
              onChange={(e) => handleTimeChange('cookTime', parseInt(e.target.value))}
              className="input w-full"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Rest/Cooling Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.restTime || 0}
              onChange={(e) => handleTimeChange('restTime', parseInt(e.target.value))}
              className="input w-full"
              min="0"
              step="1"
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Time</span>
            <span className="text-xl font-medium text-white">
              {recipe.totalTime} minutes
            </span>
          </div>
        </div>
      </div>

      {/* Rest of production specs... */}
    </div>
  );
};