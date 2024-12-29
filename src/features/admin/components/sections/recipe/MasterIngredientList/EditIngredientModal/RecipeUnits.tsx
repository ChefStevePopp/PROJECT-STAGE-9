import React from 'react';
import { Scale, CircleDollarSign } from 'lucide-react';
import type { MasterIngredient } from '@/types/master-ingredient';
import type { OperationsSettings } from '@/types/operations';

interface RecipeUnitsProps {
  formData: MasterIngredient;
  settings: OperationsSettings | null;
  onChange: (updates: MasterIngredient) => void;
}

export const RecipeUnits: React.FC<RecipeUnitsProps> = ({
  formData,
  settings,
  onChange
}) => {
 // Calculate cost per recipe unit with proper type handling
const costPerRecipeUnit = React.useMemo(() => {
  const casePrice = Number(formData.currentPrice) || 0;
  const recipeUnitsPerCase = Number(formData.recipeUnitPerPurchaseUnit) || 1;
  const yieldPercent = (Number(formData.yieldPercent) || 1) * 100;

  const costPerUnit = casePrice / recipeUnitsPerCase;
  const adjustedCost = costPerUnit * (100 / yieldPercent);

  console.log('Cost calculation:', {
    casePrice,
    recipeUnitsPerCase,
    yieldPercent,
    costPerUnit,
    adjustedCost,
    currentStoredCost: formData.costPerRecipeUnit
  });

  return adjustedCost;
}, [formData.currentPrice, formData.recipeUnitPerPurchaseUnit, formData.yieldPercent]);

// Use useEffect to update the cost when calculation changes
React.useEffect(() => {
  if (costPerRecipeUnit !== formData.costPerRecipeUnit) {
    console.log('Updating cost in database:', costPerRecipeUnit);
    onChange({
      ...formData,
      costPerRecipeUnit: costPerRecipeUnit
    });
  }
}, [costPerRecipeUnit, formData.costPerRecipeUnit]);

  // Handle yield percentage input - store as decimal
  const handleYieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let yieldValue: number;

    if (!inputValue) {
      yieldValue = 1; // Default to 100%
    } else {
      // Convert percentage input to decimal (e.g., 95 -> 0.95)
      yieldValue = parseFloat(inputValue) / 100;
    }

    onChange({
      ...formData,
      yieldPercent: yieldValue
    });
  };

  // Convert decimal yield to percentage for display
  const displayYield = ((formData.yieldPercent || 1) * 100).toFixed(0);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <Scale className="w-4 h-4 text-emerald-400" />
        </div>
        <h3 className="text-lg font-medium text-emerald-400">Recipe Units</h3>
      </div>

      {/* Recipe Units and Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Recipe Units per Case
          </label>
          <input
            type="number"
            value={formData.recipeUnitPerPurchaseUnit || ''}
            onChange={(e) => onChange({ 
              ...formData, 
              recipeUnitPerPurchaseUnit: parseFloat(e.target.value) || 0
            })}
            className="input w-full"
            required
            step="0.001"
            min="0"
            placeholder="Enter recipe units per case"
          />
          <p className="text-xs text-gray-400 mt-1">
            How many recipe units can you get from one case?
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Recipe Unit Type
          </label>
          <select
            value={formData.recipeUnitType || ''}
            onChange={(e) => onChange({ ...formData, recipeUnitType: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Select recipe unit...</option>
            {settings?.recipe_unit_measures?.map((unit, index) => (
              <option key={`${unit}-${index}`} value={unit}>{unit}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            How do you measure this item in recipes?
          </p>
        </div>
      </div>

      {/* Yield Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Yield Percentage
        </label>
        <div className="relative">
          <input
            type="number"
            value={displayYield}
            onChange={handleYieldChange}
            className="input w-full pr-8"
            required
            min="1"
            max="100"
            step="1"
            placeholder="Enter yield percentage"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Percentage of usable product after waste/loss (e.g., 95 for 95% yield)
        </p>
      </div>

      {/* Cost Calculation */}
      <div className="bg-emerald-500/10 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 font-medium">Recipe Unit Calculation</p>
            <p className="text-lg font-semibold text-emerald-300 mt-1">
              Cost per Recipe Unit: ${costPerRecipeUnit.toFixed(4)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Based on case price divided by recipe units per case, adjusted for yield percentage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};