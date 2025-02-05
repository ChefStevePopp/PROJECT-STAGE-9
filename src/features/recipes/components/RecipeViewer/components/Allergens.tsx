import React from "react";
import { AlertTriangle } from "lucide-react";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import type { Recipe } from "../../../types/recipe";

interface AllergensProps {
  recipe: Recipe;
}

export const Allergens: React.FC<AllergensProps> = ({ recipe }) => {
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
      {recipe.allergens?.contains?.length > 0 && (
        <div className="bg-rose-500/10 rounded-lg p-4">
          <h3 className="text-sm font-medium text-rose-400 mb-4">Contains</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.allergens.contains.map((allergen) => (
              <AllergenBadge key={allergen} type={allergen} showLabel />
            ))}
          </div>
        </div>
      )}

      {/* May Contain */}
      {recipe.allergens?.mayContain?.length > 0 && (
        <div className="bg-amber-500/10 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-medium text-amber-400 mb-4">
            May Contain
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.allergens.mayContain.map((allergen) => (
              <AllergenBadge key={allergen} type={allergen} showLabel />
            ))}
          </div>
        </div>
      )}

      {/* Cross Contact Risk */}
      {recipe.allergens?.crossContactRisk?.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Cross-Contact Risk
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.allergens.crossContactRisk.map((allergen) => (
              <AllergenBadge key={allergen} type={allergen} showLabel />
            ))}
          </div>
        </div>
      )}

      {!recipe.allergens?.contains?.length &&
        !recipe.allergens?.mayContain?.length &&
        !recipe.allergens?.crossContactRisk?.length && (
          <div className="text-center py-8 text-gray-400">
            No allergen information has been specified for this recipe.
          </div>
        )}
    </div>
  );
};
