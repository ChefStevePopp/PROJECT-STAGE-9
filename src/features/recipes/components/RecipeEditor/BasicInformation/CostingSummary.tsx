import React, { useEffect } from "react";
import { CircleDollarSign, Calculator } from "lucide-react";
import type { Recipe } from "../../../types/recipe";
import type { OperationsSettings } from "@/types/operations";

interface CostingSummaryProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
  settings: OperationsSettings;
}

export const CostingSummary: React.FC<CostingSummaryProps> = ({
  recipe,
  onChange,
  settings,
}) => {
  // Calculate total ingredient cost
  const recipeTotal = recipe.ingredients.reduce((sum, ingredient) => {
    const quantity = parseFloat(ingredient.quantity) || 0;
    return sum + quantity * ingredient.cost;
  }, 0);

  // Calculate cost per recipe unit
  const recipeUnits = parseFloat(recipe.recipe_unit_ratio) || 1;
  const costPerRecipeUnit = recipeTotal / recipeUnits;

  // Update the cost_per_unit whenever the calculation changes
  useEffect(() => {
    // Only update if the calculated value is different from stored value
    if (costPerRecipeUnit !== recipe.cost_per_unit) {
      onChange({ cost_per_unit: costPerRecipeUnit });
    }
  }, [costPerRecipeUnit, recipe.cost_per_unit, onChange]);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Explanation Card */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-white">
            Recipe Cost Calculation
          </h3>
        </div>

        <div className="space-y-4 text-sm text-gray-300">
          <p>
            <span className="font-medium text-white">Recipe Total:</span> Sum of
            all ingredient costs (quantity × recipe unit cost for each
            ingredient)
          </p>
          <p>
            <span className="font-medium text-white">
              Number of Recipe Units:
            </span>{" "}
            Total quantity of recipe units this recipe produces
          </p>
          <p>
            <span className="font-medium text-white">
              Cost Per Recipe Unit:
            </span>{" "}
            Recipe Total ÷ Number of Recipe Units
          </p>
          <p>
            <span className="font-medium text-white">Recipe Unit Type:</span>{" "}
            How this item will be measured when used as an ingredient in other
            recipes
          </p>
        </div>
      </div>

      {/* Costing Summary Card */}
      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CircleDollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Recipe Costing</h3>
        </div>

        <div className="space-y-4">
          {/* Recipe Total */}
          <div className="flex items-center py-2 border-b border-gray-700">
            <span className="flex-1 font-status text-sm font-medium text-gray-400">
              RECIPE TOTAL
            </span>
            <div className="w-40 text-right">
              <span className="font-mono text-lg text-white">
                $ {recipeTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Number of Recipe Units */}
          <div className="flex items-center py-2 border-b border-gray-700">
            <span className="flex-1 font-status text-sm font-medium text-gray-400">
              NUMBER OF RECIPE UNITS
            </span>
            <div className="w-40">
              <input
                type="text"
                value={recipe.recipe_unit_ratio}
                onChange={(e) =>
                  onChange({ recipe_unit_ratio: e.target.value })
                }
                className="input w-full text-right font-mono text-lg"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Cost Per Recipe Unit */}
          <div className="flex items-center py-2 border-b border-gray-700">
            <span className="flex-1 font-status text-sm font-medium text-gray-400">
              COST PER RECIPE UNIT
            </span>
            <div className="w-40 text-right">
              <span className="font-mono text-lg text-white">
                $ {costPerRecipeUnit.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Recipe Unit Type */}
          <div className="flex items-center py-2">
            <span className="flex-1 font-status text-sm font-medium text-gray-400">
              PER
            </span>
            <div className="w-40">
              <select
                value={recipe.unit_type}
                onChange={(e) => onChange({ unit_type: e.target.value })}
                className="input w-full text-right font-mono text-lg"
                required
              >
                <option value="">Select unit...</option>
                {settings.recipe_unit_measures?.map((measure) => (
                  <option key={measure} value={measure}>
                    {measure}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
