import React from "react";
import { X, Clock } from "lucide-react";
import { ReviewStatus } from "./ReviewStatus";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import { MasterIngredient } from "@/types/master-ingredient";

interface ModalHeaderProps {
  ingredient: MasterIngredient;
  onClose: () => void;
}

// Function to calculate completion status
const getCompletionStatus = (data: MasterIngredient) => {
  // Required fields for a complete ingredient
  const requiredFields = [
    "product",
    "major_group",
    "category",
    "recipe_unit_type",
    "recipe_unit_per_purchase_unit",
    "current_price",
    "unit_of_measure",
  ];

  // Count how many required fields are filled
  const filledFields = requiredFields.filter((field) => {
    const value = data[field];
    return value !== null && value !== undefined && value !== "" && value !== 0;
  }).length;

  const completionPercentage = (filledFields / requiredFields.length) * 100;

  if (completionPercentage === 100) {
    return { label: "Complete", color: "bg-emerald-500/20 text-emerald-400" };
  } else if (completionPercentage >= 50) {
    return { label: "In Progress", color: "bg-amber-500/20 text-amber-400" };
  } else {
    return { label: "Draft", color: "bg-gray-500/20 text-gray-400" };
  }
};

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  ingredient,
  onClose,
}) => {
  const completionStatus = getCompletionStatus(ingredient);

  return (
    <div className="sticky top-0 z-10 bg-gray-900">
      <div className="p-4 border-b border-gray-800">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-white">
                {ingredient.id ? ingredient.product : "Create New Ingredient"}
              </h2>
              {ingredient.id && (
                <div className="flex items-center gap-1">
                  {ingredient.allergen_peanut && (
                    <AllergenBadge type="peanut" size="sm" />
                  )}
                  {ingredient.allergen_crustacean && (
                    <AllergenBadge type="crustacean" size="sm" />
                  )}
                  {ingredient.allergen_treenut && (
                    <AllergenBadge type="treenut" size="sm" />
                  )}
                  {ingredient.allergen_shellfish && (
                    <AllergenBadge type="shellfish" size="sm" />
                  )}
                  {ingredient.allergen_sesame && (
                    <AllergenBadge type="sesame" size="sm" />
                  )}
                  {ingredient.allergen_soy && (
                    <AllergenBadge type="soy" size="sm" />
                  )}
                  {ingredient.allergen_fish && (
                    <AllergenBadge type="fish" size="sm" />
                  )}
                  {ingredient.allergen_wheat && (
                    <AllergenBadge type="wheat" size="sm" />
                  )}
                  {ingredient.allergen_milk && (
                    <AllergenBadge type="milk" size="sm" />
                  )}
                  {ingredient.allergen_sulphite && (
                    <AllergenBadge type="sulphite" size="sm" />
                  )}
                  {ingredient.allergen_egg && (
                    <AllergenBadge type="egg" size="sm" />
                  )}
                  {ingredient.allergen_gluten && (
                    <AllergenBadge type="gluten" size="sm" />
                  )}
                  {ingredient.allergen_mustard && (
                    <AllergenBadge type="mustard" size="sm" />
                  )}
                  {ingredient.allergen_celery && (
                    <AllergenBadge type="celery" size="sm" />
                  )}
                  {ingredient.allergen_garlic && (
                    <AllergenBadge type="garlic" size="sm" />
                  )}
                  {ingredient.allergen_onion && (
                    <AllergenBadge type="onion" size="sm" />
                  )}
                  {ingredient.allergen_nitrite && (
                    <AllergenBadge type="nitrite" size="sm" />
                  )}
                  {ingredient.allergen_mushroom && (
                    <AllergenBadge type="mushroom" size="sm" />
                  )}
                  {ingredient.allergen_hot_pepper && (
                    <AllergenBadge type="hot_pepper" size="sm" />
                  )}
                  {ingredient.allergen_citrus && (
                    <AllergenBadge type="citrus" size="sm" />
                  )}
                  {ingredient.allergen_pork && (
                    <AllergenBadge type="pork" size="sm" />
                  )}
                  {ingredient.allergen_custom1_active &&
                    ingredient.allergen_custom1_name && (
                      <AllergenBadge
                        type={ingredient.allergen_custom1_name}
                        size="sm"
                      />
                    )}
                  {ingredient.allergen_custom2_active &&
                    ingredient.allergen_custom2_name && (
                      <AllergenBadge
                        type={ingredient.allergen_custom2_name}
                        size="sm"
                      />
                    )}
                  {ingredient.allergen_custom3_active &&
                    ingredient.allergen_custom3_name && (
                      <AllergenBadge
                        type={ingredient.allergen_custom3_name}
                        size="sm"
                      />
                    )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {ingredient.id && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-300">
                  ID: {ingredient.id}
                </span>
              )}
              {ingredient.id && (
                <span className="text-xs text-gray-400">
                  Last edited:{" "}
                  {new Date(ingredient.updated_at).toLocaleDateString()}{" "}
                  {new Date(ingredient.updated_at).toLocaleTimeString()}
                </span>
              )}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${completionStatus.color}`}
                >
                  {completionStatus.label}
                </span>
                {ingredient.updated_at && (
                  <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-gray-800/50">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <ReviewStatus lastUpdated={ingredient.updated_at} />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
