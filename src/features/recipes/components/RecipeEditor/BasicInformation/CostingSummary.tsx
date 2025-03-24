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
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30 shadow-md">
        <div className="flex items-center rounded-lg bg-[#1a1f2b] shadow-lg py-[4] pt-[3] px-[3] p-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mx-3">
            Recipe Cost Calculation
          </h3>
        </div>

        <div className="space-y-5 mt-5 bg-gray-800/30 rounded-lg p-4 border border-gray-700/40">
          <p>
            <span className="font-bold font-mono text-base text-stone-300">
              Recipe Total
            </span>{" "}
            <span className="block mt-1 text-sm text-gray-400/90 pl-2 border-l-4 border-green-400/30">
              Sum of all ingredient costs (quantity × recipe unit cost for each
              ingredient)
            </span>
          </p>
          <p>
            <span className="font-bold font-mono text-base text-stone-300">
              Recipe Unit Type
            </span>{" "}
            <span className="block mt-1 text-sm text-gray-400/90 pl-2 border-l-4 border-green-400/30">
              How this item will be measured when used as an ingredient in other
              recipes
            </span>
          </p>
          <p>
            <span className="font-bold font-mono text-base text-stone-300">
              Number of Recipe Units
            </span>{" "}
            <span className="block mt-1 text-sm text-gray-400/90 pl-2 border-l-4 border-green-400/30">
              Total quantity of recipe units this recipe produces
            </span>
          </p>

          <p>
            <span className="font-bold font-mono text-base text-stone-300">
              Cost Per Recipe Unit
            </span>{" "}
            <span className="block mt-1 text-sm text-gray-400/90 pl-2 border-l-4 border-green-400/30">
              Recipe Total ÷ Number of Recipe Units
            </span>
          </p>
        </div>
      </div>
      {/* Costing Summary Card */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/30 shadow-md">
        <div className="flex items-center rounded-lg bg-[#1a1f2b] shadow-lg py-[4] pt-[3] px-[3] p-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mx-3">
            Recipe Unit Type and Costing
          </h3>
        </div>

        <div className="space-y-5 mt-5 bg-gray-800/30 rounded-lg border border-gray-700/40 p-4">
          {/* Recipe Total */}
          <div className="flex items-center p-2 rounded-lg border-b border-gray-700 bg-emerald-500/10 mx-0">
            <span className="flex-1 font-status text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Total Recipe Cost
            </span>
            <div className="w-40 text-right">
              <span className="font-mono text-lg font-semibold text-emerald-400">
                $ {recipeTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Recipe Unit Type */}
          <div className="flex items-center">
            <span className="flex-1 font-status text-xs uppercase tracking-wider font-semibold text-gray-200">
              CHOOSE RECIPE UNIT TYPE
            </span>
            <div className="w-40">
              <select
                value={recipe.unit_type}
                onChange={(e) => onChange({ unit_type: e.target.value })}
                className="input w-full bg-slate-800/20 text-white-400/80 text-right text-lg border border-blue-400/60 focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
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

          {/* Number of Recipe Units */}
          <div className="flex items-center py-2">
            <span className="flex-1 font-status text-xs uppercase tracking-wider font-semibold text-gray-200">
              ENTER NUMBER OF RECIPE UNITS
            </span>
            <div className="w-40">
              <input
                type="text"
                value={recipe.recipe_unit_ratio}
                onChange={(e) =>
                  onChange({ recipe_unit_ratio: e.target.value })
                }
                className="input w-full bg-slate-800/20 text-white-400/80 text-right text-lg border border-blue-400/60 focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Cost Per Recipe Unit */}
          <div className="flex items-center p-2 rounded-lg border-b border-gray-700 bg-emerald-500/10 mx-0">
            <span className="flex-1 font-status text-xs uppercase tracking-wider font-semibold text-emerald-400">
              COST PER RECIPE UNIT
            </span>
            <div className="w-40 text-right">
              <span className="text-lg font-semibold text-emerald-400">
                $ {costPerRecipeUnit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
