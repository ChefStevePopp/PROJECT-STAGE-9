import React from "react";
import { MasterIngredient } from "@/types/master-ingredient";
import { useOperationsStore } from "@/stores/operationsStore";

interface BasicInformationProps {
  formData: MasterIngredient;
  onChange: (updates: Partial<MasterIngredient>) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
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

  // Debug log when settings change
  React.useEffect(() => {
    console.log("Current settings:", settings);
  }, [settings]);

  return (
    <div className="space-y-6">
      {/* Line 1: Product Name | Vendor Code | Vendor */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Product Name*
          </label>
          <input
            type="text"
            value={formData.product}
            onChange={(e) => onChange({ product: e.target.value })}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Vendor Code
          </label>
          <input
            type="text"
            value={formData.item_code}
            onChange={(e) => onChange({ item_code: e.target.value })}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Vendor
          </label>
          <select
            value={formData.vendor}
            onChange={(e) => onChange({ vendor: e.target.value })}
            className="input w-full"
          >
            <option value="">Select vendor...</option>
            {settings?.vendors?.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Line 2: Major Group | Category | Sub Category */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Major Group*
          </label>
          <input
            type="text"
            value={formData.major_group_name || formData.major_group}
            onChange={(e) => onChange({ major_group: e.target.value })}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Category*
          </label>
          <input
            type="text"
            value={formData.category_name || formData.category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Sub Category
          </label>
          <input
            type="text"
            value={formData.sub_category_name || formData.sub_category}
            onChange={(e) => onChange({ sub_category: e.target.value })}
            className="input w-full"
          />
        </div>
      </div>

      {/* Line 3: Storage Area */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Storage Area
        </label>
        <select
          value={formData.storage_area}
          onChange={(e) => onChange({ storage_area: e.target.value })}
          className="input w-full"
        >
          <option value="">Select storage area...</option>
          {settings?.storage_areas?.map((area) => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
