import React from "react";
import { MasterIngredient } from "@/types/master-ingredient";
import { useOperationsStore } from "@/stores/operationsStore";
import { useFoodRelationshipsStore } from "@/stores/foodRelationshipsStore";

interface BasicInformationProps {
  formData: MasterIngredient;
  onChange: (updates: Partial<MasterIngredient>) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  formData,
  onChange,
}) => {
  const { settings, fetchSettings } = useOperationsStore();
  const {
    majorGroups,
    categories,
    subCategories,
    fetchFoodRelationships,
    isLoading,
  } = useFoodRelationshipsStore();

  // Fetch settings and food relationships on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchSettings(), fetchFoodRelationships()]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [fetchSettings, fetchFoodRelationships]);

  // Get filtered categories based on major group
  const filteredCategories = React.useMemo(() => {
    if (!formData.major_group) return [];
    return categories.filter((c) => c.group_id === formData.major_group);
  }, [categories, formData.major_group]);

  // Get filtered subcategories based on category
  const filteredSubCategories = React.useMemo(() => {
    if (!formData.category) return [];
    return subCategories.filter((s) => s.category_id === formData.category);
  }, [subCategories, formData.category]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-400">Loading food relationships...</div>
      </div>
    );
  }

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
            value={formData.item_code || ""}
            onChange={(e) => onChange({ item_code: e.target.value })}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Vendor*
          </label>
          <select
            value={formData.vendor || ""}
            onChange={(e) => onChange({ vendor: e.target.value })}
            className="input w-full"
            required
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
          <select
            value={formData.major_group || ""}
            onChange={(e) => {
              onChange({
                major_group: e.target.value || null,
                category: null,
                sub_category: null,
              });
            }}
            className="input w-full"
            required
          >
            <option value="">Select major group...</option>
            {majorGroups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Category*
          </label>
          <select
            value={formData.category || ""}
            onChange={(e) => {
              onChange({
                category: e.target.value || null,
                sub_category: null,
              });
            }}
            className="input w-full"
            required
            disabled={!formData.major_group}
          >
            <option value="">Select category...</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Sub Category
          </label>
          <select
            value={formData.sub_category || ""}
            onChange={(e) => {
              onChange({
                sub_category: e.target.value || null,
              });
            }}
            className="input w-full"
            disabled={!formData.category}
          >
            <option value="">Select sub-category...</option>
            {filteredSubCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Line 3: Storage Area */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Storage Area
        </label>
        <select
          value={formData.storage_area || ""}
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
