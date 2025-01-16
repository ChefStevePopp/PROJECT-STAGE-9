import React, { useState, useEffect, useRef } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import type { Recipe, RecipeIngredient } from "../../../types/recipe";
import toast from "react-hot-toast";

// Ingredient Select Dropdown Component
const IngredientSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  ingredients: any[];
}> = ({ value, onChange, ingredients }) => {
  const [open, setOpen] = useState(false);
  const selectedIngredient = ingredients.find((i) => i.id === value);
  const [search, setSearch] = useState(() => selectedIngredient?.product || "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update search when selected ingredient changes
  useEffect(() => {
    if (selectedIngredient) {
      setSearch(selectedIngredient.product);
    }
  }, [selectedIngredient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter ingredients based on search
  const filteredIngredients = ingredients.filter(
    (item) =>
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      (item.vendor_codes?.current?.code || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search ingredients..."
          className="input w-full bg-gray-800/50 pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {open && search !== selectedIngredient?.product && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg max-h-64 overflow-auto">
          <div className="p-2 space-y-1">
            {filteredIngredients.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onChange(item.id);
                  setSearch(item.product);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors
                  ${value === item.id ? "bg-primary-500/20 text-primary-400" : "hover:bg-gray-700/50 text-gray-300"}`}
              >
                <div className="font-medium">{item.product}</div>
                <div className="text-xs text-gray-500 flex justify-between">
                  {item.recipe_unit_type && (
                    <span>Unit: {item.recipe_unit_type}</span>
                  )}
                  {item.vendor_codes?.current?.code && (
                    <span>Code: {item.vendor_codes.current.code}</span>
                  )}
                </div>
              </button>
            ))}
            {filteredIngredients.length === 0 && (
              <div className="text-center py-2 text-gray-500 text-sm">
                No ingredients found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main IngredientsInput Component
export const IngredientsInput: React.FC<{
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}> = ({ recipe, onChange }) => {
  const {
    ingredients: masterIngredients,
    fetchIngredients,
    isLoading,
    error,
  } = useMasterIngredientsStore();

  // Fetch master ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Initialize ingredients from recipe data
  useEffect(() => {
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      // Validate and update ingredient data with master ingredients
      const validatedIngredients = recipe.ingredients.map((ingredient) => {
        const masterIngredient = masterIngredients.find(
          (mi) => mi.id === ingredient.name,
        );
        if (masterIngredient) {
          return {
            ...ingredient,
            unit: masterIngredient.recipe_unit_type || ingredient.unit,
            cost: masterIngredient.cost_per_recipe_unit || ingredient.cost,
          };
        }
        return ingredient;
      });

      onChange({ ingredients: validatedIngredients });
    }
  }, [masterIngredients]); // Only run when master ingredients are loaded

  const handleIngredientChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    try {
      const newIngredients = [...recipe.ingredients];
      const ingredient = newIngredients[index];

      if (field === "name") {
        const masterIngredient = masterIngredients.find(
          (mi) => mi.id === value,
        );
        if (masterIngredient) {
          ingredient.name = value;
          ingredient.unit = masterIngredient.recipe_unit_type || "";
          ingredient.cost = Number(masterIngredient.cost_per_recipe_unit) || 0;
        }
      } else {
        ingredient[field] = value;
      }

      onChange({ ingredients: newIngredients });
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast.error("Error updating ingredient");
    }
  };

  const addIngredient = () => {
    const newIngredient = {
      id: `ing-${Date.now()}`,
      type: "raw",
      name: "",
      quantity: "",
      unit: "",
      notes: "",
      cost: 0,
    };

    onChange({ ingredients: [...recipe.ingredients, newIngredient] });
  };

  const removeIngredient = (index: number) => {
    onChange({
      ingredients: recipe.ingredients.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-400">Loading ingredients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-rose-500/10 text-rose-400 p-4 rounded-lg">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error Loading Ingredients</p>
          <p className="text-sm text-gray-300 mt-1">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-gray-800 z-20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-medium text-white">
              Recipe Ingredients
            </h3>
          </div>
          <button onClick={addIngredient} className="btn-ghost text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-gray-800/50 rounded-lg text-sm font-medium text-gray-400 mt-4">
          <div className="col-span-2">Ingredient</div>
          <div>Common Measure</div>
          <div>R/U Type</div>
          <div># R/U</div>
          <div>R/U Cost</div>
          <div>Total Cost</div>
        </div>
      </div>

      {/* Ingredients List */}
      <div className="space-y-2">
        {recipe.ingredients.map((ingredient, index) => (
          <div
            key={ingredient.id}
            className="grid grid-cols-7 gap-4 items-center bg-gray-800/50 px-4 py-3 rounded-lg"
          >
            {/* Ingredient Selection */}
            <div className="col-span-2">
              <IngredientSelect
                value={ingredient.name}
                onChange={(value) =>
                  handleIngredientChange(index, "name", value)
                }
                ingredients={masterIngredients}
              />
            </div>

            {/* Common Measure */}
            <div>
              <input
                type="text"
                value={ingredient.commonMeasure || ""}
                onChange={(e) =>
                  handleIngredientChange(index, "commonMeasure", e.target.value)
                }
                className="input w-full bg-gray-800/50"
                placeholder="e.g., 2 cups"
              />
            </div>

            {/* Recipe Unit Type */}
            <div>
              <input
                type="text"
                value={ingredient.unit}
                className="input w-full bg-gray-800/50"
                disabled
              />
            </div>

            {/* Number of Recipe Units */}
            <div>
              <input
                type="text"
                value={ingredient.quantity}
                onChange={(e) =>
                  handleIngredientChange(index, "quantity", e.target.value)
                }
                className="input w-full text-right bg-gray-800/50"
                placeholder="0"
                required
              />
            </div>

            {/* Recipe Unit Cost */}
            <div>
              <input
                type="text"
                value={`$${ingredient.cost.toFixed(2)}`}
                className="input w-full bg-gray-800/50 text-right"
                disabled
              />
            </div>

            {/* Total Cost */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`$${(
                  parseFloat(ingredient.quantity || "0") * ingredient.cost
                ).toFixed(2)}`}
                className="input w-full bg-gray-800/50 text-right"
                disabled
              />
              <button
                onClick={() => removeIngredient(index)}
                className="text-gray-400 hover:text-rose-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {recipe.ingredients.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No ingredients added yet. Click "Add Ingredient" to start building
          your recipe.
        </div>
      )}

      {/* Total Cost Summary */}
      {recipe.ingredients.length > 0 && (
        <div className="mt-6 p-4 bg-emerald-500/10 rounded-lg">
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
    </div>
  );
};
