import React from "react";
import { Clock, Thermometer, Scale, AlertCircle, Book } from "lucide-react";
import type { Recipe } from "../../types/recipe";

interface ProductionSpecsProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const ProductionSpecs: React.FC<ProductionSpecsProps> = ({
  recipe,
  onChange,
}) => {
  const handleTimeChange = (
    field: "prep_time" | "cook_time" | "rest_time",
    value: number,
  ) => {
    onChange({
      [field]: value,
      total_time:
        (field === "prep_time" ? value : recipe.prep_time || 0) +
        (field === "cook_time" ? value : recipe.cook_time || 0) +
        (field === "rest_time" ? value : recipe.rest_time || 0),
    });
  };

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
              Production Specifications
            </h2>
            <p className="text-gray-400">
              Manage timing, yield, and temperature requirements
            </p>
          </div>
        </div>
      </div>

      {/* Timing Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-400" />
          Time Requirements
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Prep Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.prep_time || 0}
              onChange={(e) =>
                handleTimeChange("prep_time", parseInt(e.target.value))
              }
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
              value={recipe.cook_time || 0}
              onChange={(e) =>
                handleTimeChange("cook_time", parseInt(e.target.value))
              }
              className="input w-full"
              min="0"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Rest Time (minutes)
            </label>
            <input
              type="number"
              value={recipe.rest_time || 0}
              onChange={(e) =>
                handleTimeChange("rest_time", parseInt(e.target.value))
              }
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
              {recipe.total_time || 0} minutes
            </span>
          </div>
        </div>
      </div>

      {/* Expected Yield */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-400" />
          Expected Yield
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Yield Amount
            </label>
            <input
              type="number"
              value={recipe.yield_amount || 0}
              onChange={(e) =>
                onChange({
                  yield_amount: parseFloat(e.target.value),
                })
              }
              className="input w-full"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Yield Unit
            </label>
            <input
              type="text"
              value={recipe.yield_unit || ""}
              onChange={(e) =>
                onChange({
                  yield_unit: e.target.value,
                })
              }
              className="input w-full"
              placeholder="e.g., portions, pieces, loaves"
            />
          </div>
        </div>
      </div>

      {/* Temperature Requirements */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-400" />
          Preparation Temperature Requirements
        </h3>

        <div className="space-y-6">
          {/* Food Safety Notice */}
          <div className="bg-amber-500/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-amber-400 font-medium">
                  Food Safety Notice
                </h4>
                <p className="text-sm text-gray-300">
                  Time and temperature control is critical for food safety. The
                  danger zone (4°C-60°C / 40°F-140°F) requires strict
                  monitoring. Always follow your local health department
                  regulations regarding:
                </p>
                <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
                  <li>Maximum cumulative time in the danger zone</li>
                  <li>Required internal cooking temperatures</li>
                  <li>Cooling and reheating procedures</li>
                  <li>Temperature monitoring and documentation requirements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preparation Temperature Guidelines */}
          <div className="bg-gray-800/50 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">
              Preparation Temperature Guidelines
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Working Temperature Requirements
                </label>
                <textarea
                  value={recipe.prep_temp_notes || ""}
                  onChange={(e) =>
                    onChange({
                      prep_temp_notes: e.target.value,
                    })
                  }
                  className="input w-full h-24"
                  placeholder="Specify temperature requirements during mise en place (e.g., 'Maintain butter at 18°C/65°F for lamination', 'Keep protein below 4°C/40°F during preparation')"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Time Management Notes
                </label>
                <textarea
                  value={recipe.prep_time_notes || ""}
                  onChange={(e) =>
                    onChange({
                      prep_time_notes: e.target.value,
                    })
                  }
                  className="input w-full h-24"
                  placeholder="Specify maximum time ingredients can remain at working temperature (e.g., 'Return unused portions to refrigeration within 30 minutes', 'Complete forming within 15 minutes')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
