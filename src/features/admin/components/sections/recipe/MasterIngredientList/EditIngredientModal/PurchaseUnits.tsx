import React from "react";
import { MasterIngredient } from "@/types/master-ingredient";
import { useOperationsStore } from "@/stores/operationsStore";
import { Package } from "lucide-react";

interface PurchaseUnitsProps {
  formData: MasterIngredient;
  onChange: (updates: Partial<MasterIngredient>) => void;
}

export const PurchaseUnits: React.FC<PurchaseUnitsProps> = ({
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

  return (
    <div className="space-y-4">
      <div className="bg-blue-500/10 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-blue-400" />
          <h3 className="text-blue-400 font-medium">Inventory Information</h3>
        </div>
        <p className="text-sm text-gray-300">
          Define how this ingredient is purchased and tracked in inventory.
          These values determine the cost per recipe unit:
        </p>
        <ul className="text-sm text-gray-400 mt-2 ml-5 list-disc space-y-1">
          <li>
            Case Size - The physical size/weight of each case (e.g. "6 - #10
            cans")
          </li>
          <li>Units per Case - Number of countable units in each case</li>
          <li>Case Price - The cost of purchasing one complete case</li>
          <li>Inventory Unit - How this item is counted in inventory</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Case Size */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Case Size
          </label>
          <input
            type="text"
            value={formData.case_size || ""}
            onChange={(e) => onChange({ case_size: e.target.value })}
            className="input w-full"
            placeholder="Enter case size..."
          />
        </div>

        {/* Units per Case */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Units Per Case
          </label>
          <input
            type="number"
            value={formData.units_per_case || ""}
            onChange={(e) =>
              onChange({ units_per_case: parseFloat(e.target.value) || 0 })
            }
            className="input w-full"
            min="0"
            step="0.01"
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Case Price */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Case Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="number"
              value={formData.current_price || ""}
              onChange={(e) =>
                onChange({ current_price: parseFloat(e.target.value) || 0 })
              }
              className="input w-full pl-7"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Inventory Unit of Measure */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Inventory Unit of Measure
          </label>
          <select
            value={formData.unit_of_measure || ""}
            onChange={(e) => onChange({ unit_of_measure: e.target.value })}
            className="input w-full"
          >
            <option value="">Select unit of measure...</option>
            {settings?.volume_measures?.length > 0 && (
              <optgroup label="Volume Measures">
                {settings.volume_measures.map((measure) => (
                  <option key={measure} value={measure}>
                    {measure}
                  </option>
                ))}
              </optgroup>
            )}
            {settings?.weight_measures?.length > 0 && (
              <optgroup label="Weight Measures">
                {settings.weight_measures.map((measure) => (
                  <option key={measure} value={measure}>
                    {measure}
                  </option>
                ))}
              </optgroup>
            )}
            {settings?.batch_units?.length > 0 && (
              <optgroup label="Batch Units">
                {settings.batch_units.map((measure) => (
                  <option key={measure} value={measure}>
                    {measure}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>
    </div>
  );
};
