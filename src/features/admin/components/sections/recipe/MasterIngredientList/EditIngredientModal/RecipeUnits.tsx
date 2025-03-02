import React from "react";
import { MasterIngredient } from "@/types/master-ingredient";
import { useOperationsStore } from "@/stores/operationsStore";
import { Scale } from "lucide-react";

interface RecipeUnitsProps {
  formData: MasterIngredient;
  onChange: (updates: Partial<MasterIngredient>) => void;
}

export const RecipeUnits: React.FC<RecipeUnitsProps> = ({
  formData,
  onChange,
}) => {
  const { settings, fetchSettings } = useOperationsStore();

  // Fetch settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        await fetchSettings();
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, [fetchSettings]);

  // Calculate the actual cost per recipe unit based on yield
  const baseUnitCost =
    formData.current_price && formData.recipe_unit_per_purchase_unit
      ? formData.current_price / formData.recipe_unit_per_purchase_unit
      : 0;
  const adjustedUnitCost = formData.yield_percent
    ? baseUnitCost / (formData.yield_percent / 100)
    : baseUnitCost;

  // Update the parent component with the calculated cost per recipe unit
  React.useEffect(() => {
    // Calculate the cost per recipe unit
    const baseUnitCost =
      formData.current_price && formData.recipe_unit_per_purchase_unit
        ? formData.current_price / formData.recipe_unit_per_purchase_unit
        : 0;
    const adjustedUnitCost = formData.yield_percent
      ? baseUnitCost / (formData.yield_percent / 100)
      : baseUnitCost;

    // Only update if the value has actually changed
    if (adjustedUnitCost !== formData.cost_per_recipe_unit) {
      onChange({ cost_per_recipe_unit: adjustedUnitCost });
    }
  }, [
    formData.current_price,
    formData.recipe_unit_per_purchase_unit,
    formData.yield_percent,
    formData.cost_per_recipe_unit,
    onChange,
  ]);

  return (
    <div className="bg-emerald-500/10 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Scale className="w-5 h-5 text-emerald-400" />
        <h3 className="text-emerald-400 font-medium">Recipe Units</h3>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        Define how this ingredient is measured in recipes. The cost per recipe
        unit is automatically calculated based on the case price and units per
        case.
      </p>

      <div className="bg-gray-900/50 rounded-lg p-4 space-y-4">
        {/* Total Recipe Units per Case */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Total Recipe Units per Case
            <span className="text-xs text-gray-500 ml-2">
              (e.g., total oz, lb, or portions per case)
            </span>
          </label>
          <input
            type="number"
            value={formData.recipe_unit_per_purchase_unit || ""}
            onChange={(e) =>
              onChange({
                recipe_unit_per_purchase_unit: parseFloat(e.target.value) || 0,
              })
            }
            className="input w-full"
            min="0"
            step="0.01"
            placeholder="Enter total recipe units..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Recipe Unit Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Recipe Unit Type
            </label>
            <select
              value={formData.recipe_unit_type || ""}
              onChange={(e) => onChange({ recipe_unit_type: e.target.value })}
              className="input w-full"
            >
              <option value="">Select unit type...</option>
              {settings?.recipe_unit_measures?.map((measure) => (
                <option key={measure} value={measure}>
                  {measure}
                </option>
              ))}
            </select>
          </div>

          {/* Yield Percent */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Yield Percentage
              <span className="text-xs text-gray-500 ml-2">
                (affects final cost)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={formData.yield_percent || 100}
                onChange={(e) =>
                  onChange({ yield_percent: parseFloat(e.target.value) || 100 })
                }
                className="input w-full pr-8"
                min="0"
                max="100"
                step="1"
                placeholder="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Cost Calculation Display */}
        <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
          <div className="text-sm text-gray-400 mb-2">
            <strong className="text-white">Cost Calculation</strong>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">Base Cost per Unit</div>
              <div className="text-sm text-gray-300">
                ${baseUnitCost.toFixed(4)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Yield Adjustment</div>
              <div className="text-sm text-gray-300">
                {formData.yield_percent || 100}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Final Cost per Unit</div>
              <div className="text-sm text-emerald-400 font-medium">
                ${adjustedUnitCost.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
