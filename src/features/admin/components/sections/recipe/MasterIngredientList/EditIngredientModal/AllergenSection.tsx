import React from "react";
import { AlertTriangle } from "lucide-react";
import { MasterIngredientFormData } from "@/types/master-ingredient";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";

interface AllergenSectionProps {
  formData: MasterIngredientFormData;
  onChange: (updates: Partial<MasterIngredientFormData>) => void;
}

// Helper function to ensure boolean values
const ensureBooleanValue = (value: any): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return false;
};

export const AllergenSection: React.FC<AllergenSectionProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="bg-rose-500/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">
            Allergen Information
          </h3>
          <p className="text-sm text-gray-400">
            Select all allergens present in this ingredient
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_peanut)}
            onChange={(e) => onChange({ allergen_peanut: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="peanut" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_crustacean)}
            onChange={(e) =>
              onChange({ allergen_crustacean: e.target.checked })
            }
            className="checkbox"
          />
          <AllergenBadge type="crustacean" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_treenut)}
            onChange={(e) => onChange({ allergen_treenut: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="treenut" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_shellfish)}
            onChange={(e) => onChange({ allergen_shellfish: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="shellfish" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_sesame)}
            onChange={(e) => onChange({ allergen_sesame: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="sesame" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_soy)}
            onChange={(e) => onChange({ allergen_soy: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="soy" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_fish)}
            onChange={(e) => onChange({ allergen_fish: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="fish" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_wheat)}
            onChange={(e) => onChange({ allergen_wheat: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="wheat" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_milk)}
            onChange={(e) => onChange({ allergen_milk: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="milk" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_sulphite)}
            onChange={(e) => onChange({ allergen_sulphite: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="sulphite" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_egg)}
            onChange={(e) => onChange({ allergen_egg: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="egg" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_gluten)}
            onChange={(e) => onChange({ allergen_gluten: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="gluten" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_mustard)}
            onChange={(e) => onChange({ allergen_mustard: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="mustard" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_celery)}
            onChange={(e) => onChange({ allergen_celery: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="celery" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_garlic)}
            onChange={(e) => onChange({ allergen_garlic: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="garlic" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_onion)}
            onChange={(e) => onChange({ allergen_onion: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="onion" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_nitrite)}
            onChange={(e) => onChange({ allergen_nitrite: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="nitrite" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_mushroom)}
            onChange={(e) => onChange({ allergen_mushroom: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="mushroom" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_hot_pepper)}
            onChange={(e) =>
              onChange({ allergen_hot_pepper: e.target.checked })
            }
            className="checkbox"
          />
          <AllergenBadge type="hot_pepper" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_citrus)}
            onChange={(e) => onChange({ allergen_citrus: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="citrus" showLabel />
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={ensureBooleanValue(formData.allergen_pork)}
            onChange={(e) => onChange({ allergen_pork: e.target.checked })}
            className="checkbox"
          />
          <AllergenBadge type="pork" showLabel />
        </label>
      </div>

      {/* Custom Allergens */}
      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-medium text-gray-400">Custom Allergens</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              value={formData.allergen_custom1_name || ""}
              onChange={(e) =>
                onChange({ allergen_custom1_name: e.target.value })
              }
              placeholder="Custom allergen 1"
              className="input w-full mb-2"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ensureBooleanValue(formData.allergen_custom1_active)}
                onChange={(e) =>
                  onChange({ allergen_custom1_active: e.target.checked })
                }
                className="checkbox"
                disabled={!formData.allergen_custom1_name}
              />
              <span className="text-gray-300">Active</span>
            </label>
          </div>

          <div>
            <input
              type="text"
              value={formData.allergen_custom2_name || ""}
              onChange={(e) =>
                onChange({ allergen_custom2_name: e.target.value })
              }
              placeholder="Custom allergen 2"
              className="input w-full mb-2"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ensureBooleanValue(formData.allergen_custom2_active)}
                onChange={(e) =>
                  onChange({ allergen_custom2_active: e.target.checked })
                }
                className="checkbox"
                disabled={!formData.allergen_custom2_name}
              />
              <span className="text-gray-300">Active</span>
            </label>
          </div>

          <div>
            <input
              type="text"
              value={formData.allergen_custom3_name || ""}
              onChange={(e) =>
                onChange({ allergen_custom3_name: e.target.value })
              }
              placeholder="Custom allergen 3"
              className="input w-full mb-2"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={ensureBooleanValue(formData.allergen_custom3_active)}
                onChange={(e) =>
                  onChange({ allergen_custom3_active: e.target.checked })
                }
                className="checkbox"
                disabled={!formData.allergen_custom3_name}
              />
              <span className="text-gray-300">Active</span>
            </label>
          </div>
        </div>
      </div>

      {/* Allergen Notes */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-400 mb-2">
          Allergen Notes
        </label>
        <textarea
          value={formData.allergen_notes || ""}
          onChange={(e) => onChange({ allergen_notes: e.target.value })}
          className="input w-full h-24"
          placeholder="Enter any additional allergen information or notes..."
        />
      </div>
    </div>
  );
};
