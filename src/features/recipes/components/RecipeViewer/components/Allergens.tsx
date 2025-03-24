import React from "react";
import { AlertTriangle } from "lucide-react";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import type { Recipe } from "../../../types/recipe";

interface AllergensProps {
  recipe: Recipe;
}

export const Allergens: React.FC<AllergensProps> = ({ recipe }) => {
  // Check for allergens in the allergenInfo field (case sensitive)
  const allergenData = recipe.allergenInfo || {};

  // Log the recipe data to help with debugging
  console.log("Recipe data in Allergens component:", recipe);
  console.log("Allergen data being used:", allergenData);

  // Extract allergen arrays with fallbacks
  const containsAllergens = Array.isArray(allergenData.contains)
    ? allergenData.contains
    : [];
  const mayContainAllergens = Array.isArray(allergenData.mayContain)
    ? allergenData.mayContain
    : [];
  const crossContactAllergens = Array.isArray(allergenData.crossContactRisk)
    ? allergenData.crossContactRisk
    : [];

  // Check if we have any allergen data at all
  const hasAllergenData =
    containsAllergens.length > 0 ||
    mayContainAllergens.length > 0 ||
    crossContactAllergens.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">
            Allergen Information
          </h2>
          <p className="text-sm text-gray-400">
            Allergen warnings and cross-contamination risks
          </p>
        </div>
      </div>

      {/* Contains Allergens */}
      {containsAllergens.length > 0 && (
        <div className="bg-rose-500/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-rose-400 mb-4">Contains</h3>
          <div className="flex flex-wrap gap-2">
            {containsAllergens.map((allergen) => (
              <AllergenBadge key={allergen} type={allergen} showLabel />
            ))}
          </div>
        </div>
      )}

      {/* May Contain */}
      {mayContainAllergens.length > 0 && (
        <div className="bg-amber-500/10 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-medium text-amber-400 mb-4">
            May Contain
          </h3>
          <div className="flex flex-wrap gap-2">
            {mayContainAllergens.map((allergen) => (
              <AllergenBadge key={allergen} type={allergen} showLabel />
            ))}
          </div>
        </div>
      )}

      {/* Cross Contact Risk */}
      {crossContactAllergens.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Cross-Contact Risk
          </h3>
          <div className="flex flex-wrap gap-2">
            {crossContactAllergens.map((allergen) => (
              <AllergenBadge key={allergen} type={allergen} showLabel />
            ))}
          </div>
        </div>
      )}

      {/* No allergen information message */}
      {!hasAllergenData && (
        <div className="text-center py-8 text-gray-400">
          No allergen information has been specified for this recipe.
        </div>
      )}
    </div>
  );
};
