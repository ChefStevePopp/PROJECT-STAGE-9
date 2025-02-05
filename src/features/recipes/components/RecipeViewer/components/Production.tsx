import React from "react";
import { Clock } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface ProductionProps {
  recipe: Recipe;
}

export const Production: React.FC<ProductionProps> = ({ recipe }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Clock className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Production</h2>
          <p className="text-sm text-gray-400">
            Production specifications and timing
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Time Requirements
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Prep Time</div>
              <div className="text-lg font-medium text-white">
                {recipe.prep_time} minutes
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Cook Time</div>
              <div className="text-lg font-medium text-white">
                {recipe.cook_time} minutes
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Total Time</div>
              <div className="text-lg font-medium text-white">
                {recipe.total_time || recipe.prep_time + recipe.cook_time}{" "}
                minutes
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Yield Information
          </h3>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-400">Recipe Yield</div>
              <div className="text-lg font-medium text-white">
                {recipe.yield_amount} {recipe.yield_unit}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Recipe Unit Ratio</div>
              <div className="text-lg font-medium text-white">
                {recipe.recipe_unit_ratio || "1:1"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
