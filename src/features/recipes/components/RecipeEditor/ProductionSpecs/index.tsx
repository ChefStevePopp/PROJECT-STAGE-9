import React from "react";
import { Scale, Clock, ThermometerSun, Info, Book } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface ProductionSpecsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const ProductionSpecs: React.FC<ProductionSpecsProps> = ({
  recipe,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Book className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              Production Specs
            </h2>
            <p className="text-gray-400">
              Set up your recipe's production details
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              Production Specifications
            </h2>
            <p className="text-sm text-gray-400">
              Define recipe yield and timing requirements
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Yield Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Recipe Yield</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Yield Amount
              </label>
              <input
                type="text"
                value={recipe.yield_amount || ""}
                onChange={(e) => onChange({ yield_amount: e.target.value })}
                className="input w-full"
                placeholder="Enter yield amount..."
              />
            </div>
          </div>

          {/* Timing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Timing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  <Clock className="w-4 h-4 inline-block mr-1.5 opacity-70" />
                  Prep Time (min)
                </label>
                <input
                  type="number"
                  value={recipe.prep_time || ""}
                  onChange={(e) =>
                    onChange({ prep_time: parseInt(e.target.value) || null })
                  }
                  className="input w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  <Clock className="w-4 h-4 inline-block mr-1.5 opacity-70" />
                  Cook Time (min)
                </label>
                <input
                  type="number"
                  value={recipe.cook_time || ""}
                  onChange={(e) =>
                    onChange({ cook_time: parseInt(e.target.value) || null })
                  }
                  className="input w-full"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes Section */}
        <div className="space-y-4 mt-6">
          <h3 className="text-sm font-medium text-gray-300">
            Additional Notes
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <ThermometerSun className="w-4 h-4 inline-block mr-1.5 opacity-70" />
              Working Temperature Notes
            </label>
            <textarea
              value={recipe.working_temperature_notes || ""}
              onChange={(e) =>
                onChange({ working_temperature_notes: e.target.value })
              }
              className="input w-full h-24"
              placeholder="Enter working temperature notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              <Info className="w-4 h-4 inline-block mr-1.5 opacity-70" />
              Time Management Notes
            </label>
            <textarea
              value={recipe.time_management_notes || ""}
              onChange={(e) =>
                onChange({ time_management_notes: e.target.value })
              }
              className="input w-full h-24"
              placeholder="Enter time management notes..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
