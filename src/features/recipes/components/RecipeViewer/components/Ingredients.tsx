import React, { useState, useEffect } from "react";
import { UtensilsCrossed, AlertTriangle, X } from "lucide-react";
import type { Recipe } from "../../../types/recipe";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";

interface IngredientsProps {
  recipe: Recipe;
}

export const Ingredients: React.FC<IngredientsProps> = ({ recipe }) => {
  const [showNote, setShowNote] = useState(true);
  const { ingredients: masterIngredients, fetchIngredients } =
    useMasterIngredientsStore();

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const getIngredientName = (id: string) => {
    const ingredient = masterIngredients.find((i) => i.id === id);
    return ingredient ? ingredient.product : id;
  };

  return (
    <div className="space-y-6">
      {/* Chef's Note */}
      {showNote && (
        <div className="bg-blue-500/10 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-blue-400 font-medium text-lg">
                Important Note
              </h3>
              <p className="text-sm text-gray-300 mt-1">
                Before starting production, ensure all ingredients are sourced
                and available. If any ingredients are missing, notify the
                appropriate team members immediately to avoid production delays.
              </p>
            </div>
            <button
              onClick={() => setShowNote(false)}
              className="text-gray-400 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-800/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
          <UtensilsCrossed className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-medium text-white">Recipe Ingredients</h2>
          <p className="text-sm text-gray-400">
            Ingredients and measurements required
          </p>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-4 px-4 py-3 bg-gray-900/50 text-sm font-medium text-gray-400">
          <div className="col-span-2">Ingredient</div>
          <div>Common Measure</div>
          <div>R/U Type</div>
          <div className="text-right"># R/U</div>
          <div className="text-right">R/U Cost</div>
          <div className="text-right">Total Cost</div>
        </div>

        <div className="divide-y divide-gray-700">
          {recipe.ingredients.map((ingredient, index) => (
            <div
              key={ingredient.id}
              className="grid grid-cols-7 gap-4 px-4 py-3"
            >
              <div className="col-span-2 text-white">
                {getIngredientName(ingredient.name)}
              </div>
              <div className="text-gray-400">
                {ingredient.commonMeasure || "-"}
              </div>
              <div className="text-gray-400">{ingredient.unit}</div>
              <div className="text-right text-gray-400">
                {ingredient.quantity}
              </div>
              <div className="text-right text-gray-400">
                ${ingredient.cost.toFixed(2)}
              </div>
              <div className="text-right text-gray-400">
                $
                {(
                  parseFloat(ingredient.quantity || "0") * ingredient.cost
                ).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Cost Summary */}
      {recipe.ingredients.length > 0 && (
        <div className="bg-emerald-500/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-emerald-400 font-medium">
              Total Recipe Cost
            </span>
            <span className="text-2xl font-medium text-emerald-400">
              $
              {recipe.ingredients
                .reduce(
                  (sum, ing) =>
                    sum + parseFloat(ing.quantity || "0") * ing.cost,
                  0,
                )
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {recipe.ingredients.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No ingredients have been added to this recipe.
        </div>
      )}
    </div>
  );
};
