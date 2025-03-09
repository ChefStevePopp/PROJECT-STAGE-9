import React, { useState, useEffect, useRef } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  AlertTriangle,
  Search,
  GripVertical,
  ChefHat,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useRecipeStore } from "@/features/recipes/stores/recipeStore";
import type { Recipe, RecipeIngredient } from "../../../types/recipe";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabase";

// Combined Ingredient Select Dropdown Component
const IngredientSelect: React.FC<{
  value: string;
  onChange: (value: string, type: "raw" | "prepared") => void;
  rawIngredients: any[];
  preparedItems: any[];
}> = ({ value, onChange, rawIngredients, preparedItems }) => {
  const [open, setOpen] = useState(false);

  // Find the selected ingredient from either raw ingredients or prepared items
  const selectedRawIngredient = rawIngredients.find((i) => i.id === value);
  const selectedPreparedItem = preparedItems.find((i) => i.id === value);
  const selectedIngredient = selectedRawIngredient || selectedPreparedItem;

  // Get the display name based on the type of ingredient
  const getDisplayName = () => {
    if (selectedRawIngredient) return selectedRawIngredient.product;
    if (selectedPreparedItem) return selectedPreparedItem.name;
    return "";
  };

  const [search, setSearch] = useState(() => getDisplayName());
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update search when selected ingredient changes
  useEffect(() => {
    setSearch(getDisplayName());
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
  const filteredRawIngredients = rawIngredients.filter(
    (item) =>
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      (item.vendor_codes?.current?.code || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  // Filter prepared items based on search
  const filteredPreparedItems = preparedItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Combine the filtered results
  const hasRawResults = filteredRawIngredients.length > 0;
  const hasPreparedResults = filteredPreparedItems.length > 0;
  const hasResults = hasRawResults || hasPreparedResults;

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
          placeholder="Search ingredients or prep items..."
          className="input w-full bg-gray-800/50 pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>

      {open && search !== getDisplayName() && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg max-h-64 overflow-auto">
          <div className="p-2 space-y-1">
            {/* Raw Ingredients Section */}
            {hasRawResults && (
              <div className="mb-2">
                <div className="text-xs font-medium text-gray-500 px-3 py-1 uppercase">
                  Raw Ingredients
                </div>
                {filteredRawIngredients.map((item) => (
                  <button
                    key={`raw-${item.id}`}
                    onClick={() => {
                      onChange(item.id, "raw");
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
              </div>
            )}

            {/* Prepared Items Section */}
            {hasPreparedResults && (
              <div>
                <div className="text-xs font-medium text-gray-500 px-3 py-1 uppercase">
                  Prepared Items
                </div>
                {filteredPreparedItems.map((item) => (
                  <button
                    key={`prep-${item.id}`}
                    onClick={() => {
                      onChange(item.id, "prepared");
                      setSearch(item.name);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors
                      ${value === item.id ? "bg-primary-500/20 text-primary-400" : "hover:bg-gray-700/50 text-gray-300"}`}
                  >
                    <div className="font-medium flex items-center gap-2">
                      <ChefHat className="w-3 h-3 text-blue-400" />
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      {item.unit_type && <span>Unit: {item.unit_type}</span>}
                      <span>Prep Item</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!hasResults && (
              <div className="text-center py-2 text-gray-500 text-sm">
                No ingredients or prep items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main IngredientsInput Component
const SortableIngredientRow = ({
  ingredient,
  index,
  handleIngredientChange,
  removeIngredient,
  rawIngredients,
  preparedItems,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: ingredient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-7 gap-4 items-center bg-gray-800/50 px-4 py-3 rounded-lg"
    >
      <div className="col-span-2 flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <IngredientSelect
            value={ingredient.name}
            onChange={(value, type) =>
              handleIngredientChange(index, "name", value, type)
            }
            rawIngredients={rawIngredients}
            preparedItems={preparedItems}
          />
        </div>
      </div>

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

      <div>
        <input
          type="text"
          value={ingredient.unit}
          className="input w-full bg-gray-800/50"
          disabled
        />
      </div>

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

      <div>
        <input
          type="text"
          value={`${ingredient.cost.toFixed(2)}`}
          className="input w-full bg-gray-800/50 text-right"
          disabled
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={`${(
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
  );
};

export const IngredientsInput: React.FC<{
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}> = ({ recipe, onChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [preparedItems, setPreparedItems] = useState<any[]>([]);
  const [isLoadingPrepared, setIsLoadingPrepared] = useState(true);
  const [preparedError, setPreparedError] = useState<string | null>(null);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = recipe.ingredients.findIndex(
        (ing) => ing.id === active.id,
      );
      const newIndex = recipe.ingredients.findIndex(
        (ing) => ing.id === over.id,
      );

      onChange({
        ingredients: arrayMove(recipe.ingredients, oldIndex, newIndex),
      });
    }
  };
  const {
    ingredients: masterIngredients,
    fetchIngredients,
    isLoading: isLoadingMaster,
    error: masterError,
  } = useMasterIngredientsStore((state) => ({
    ingredients: state.ingredients,
    fetchIngredients: state.fetchIngredients,
    isLoading: state.isLoading,
    error: state.error,
  }));

  // Fetch prepared items (recipes with type="prepared")
  const fetchPreparedItems = async () => {
    try {
      setIsLoadingPrepared(true);
      setPreparedError(null);

      const { data, error } = await supabase
        .from("recipes")
        .select("id, name, type, unit_type, cost_per_unit")
        .eq("type", "prepared");

      if (error) throw error;

      setPreparedItems(data || []);
    } catch (error) {
      console.error("Error fetching prepared items:", error);
      setPreparedError("Failed to load prepared items");
    } finally {
      setIsLoadingPrepared(false);
    }
  };

  // Fetch master ingredients and prepared items on mount
  useEffect(() => {
    fetchIngredients();
    fetchPreparedItems();
  }, [fetchIngredients]);

  // Initialize ingredients from recipe data
  useEffect(() => {
    if (
      recipe.ingredients &&
      recipe.ingredients.length > 0 &&
      masterIngredients.length > 0 &&
      preparedItems.length > 0
    ) {
      // Validate and update ingredient data with master ingredients and prepared items
      const validatedIngredients = recipe.ingredients.map((ingredient) => {
        if (ingredient.type === "raw") {
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
        } else if (ingredient.type === "prepared") {
          const preparedItem = preparedItems.find(
            (pi) => pi.id === ingredient.name,
          );
          if (preparedItem) {
            return {
              ...ingredient,
              unit: preparedItem.unit_type || ingredient.unit,
              cost: preparedItem.cost_per_unit || ingredient.cost,
            };
          }
        }
        return ingredient;
      });

      onChange({ ingredients: validatedIngredients });
    }
  }, [masterIngredients, preparedItems]); // Run when master ingredients or prepared items are loaded

  const handleIngredientChange = (
    index: number,
    field: string,
    value: string,
    type?: "raw" | "prepared",
  ) => {
    try {
      const newIngredients = [...recipe.ingredients];
      const ingredient = newIngredients[index];

      if (field === "name") {
        if (type === "raw" || (!type && ingredient.type === "raw")) {
          // Handle raw ingredient selection
          const masterIngredient = masterIngredients.find(
            (mi) => mi.id === value,
          );
          if (masterIngredient) {
            // Update ingredient with master ingredient information
            ingredient.name = value;
            ingredient.type = "raw";
            ingredient.unit = masterIngredient.recipe_unit_type || "";
            ingredient.cost =
              Number(masterIngredient.cost_per_recipe_unit) || 0;

            // Log for debugging
            console.log("Selected master ingredient:", masterIngredient);
            console.log("Updated ingredient:", ingredient);

            // Update recipe allergens when ingredient changes
            const currentAllergens = new Set(
              recipe.allergenInfo?.contains || [],
            );
            if (masterIngredient.allergens?.length) {
              masterIngredient.allergens.forEach((allergen) =>
                currentAllergens.add(allergen),
              );
            }

            // Recalculate all allergens from all ingredients
            const allAllergens = new Set<string>();
            newIngredients.forEach((ing) => {
              if (ing.type === "raw") {
                const mi = masterIngredients.find((m) => m.id === ing.name);
                if (mi?.allergens?.length) {
                  mi.allergens.forEach((allergen) =>
                    allAllergens.add(allergen),
                  );
                }
              }
            });

            onChange({
              ingredients: newIngredients,
              allergenInfo: {
                ...recipe.allergenInfo,
                contains: Array.from(allAllergens),
              },
            });
          }
        } else if (
          type === "prepared" ||
          (!type && ingredient.type === "prepared")
        ) {
          // Handle prepared item selection
          const preparedItem = preparedItems.find((pi) => pi.id === value);
          if (preparedItem) {
            // Update ingredient with prepared item information
            ingredient.name = value;
            ingredient.type = "prepared";
            ingredient.unit = preparedItem.unit_type || "";
            ingredient.cost = Number(preparedItem.cost_per_unit) || 0;

            // Log for debugging
            console.log("Selected prepared item:", preparedItem);
            console.log("Updated ingredient:", ingredient);

            // Note: We don't update allergens for prepared items here
            // as that would require fetching the prepared item's ingredients

            onChange({
              ingredients: newIngredients,
            });
          }
        }
      } else {
        ingredient[field] = value;
        onChange({ ingredients: newIngredients });
      }
    } catch (error) {
      console.error("Error updating ingredient:", error);
      toast.error("Error updating ingredient");
    }
  };

  const addIngredient = () => {
    const newIngredient = {
      id: `ing-${Date.now()}`,
      type: "raw", // Default to raw, will be updated when ingredient is selected
      name: "",
      quantity: "",
      unit: "",
      notes: "",
      cost: 0,
      commonMeasure: "",
    };

    onChange({ ingredients: [...recipe.ingredients, newIngredient] });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);

    // Recalculate allergens after removing ingredient
    const allAllergens = new Set<string>();
    newIngredients.forEach((ing) => {
      if (ing.type === "raw") {
        const mi = masterIngredients.find((m) => m.id === ing.name);
        if (mi?.allergens?.length) {
          mi.allergens.forEach((allergen) => allAllergens.add(allergen));
        }
      }
      // Note: We don't process allergens for prepared items here
    });

    onChange({
      ingredients: newIngredients,
      allergenInfo: {
        ...recipe.allergenInfo,
        contains: Array.from(allAllergens),
      },
    });
  };

  const isLoading = isLoadingMaster || isLoadingPrepared;
  const error = masterError || preparedError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-400">
          Loading ingredients and prepared items...
        </div>
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
            {error}. Please try refreshing the page or contact support if the
            problem persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-gray-800 z-20 pr-[6] pb-[4] pb-[4] px-[6] py-[6] py-[6] p-6">
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={recipe.ingredients.map((ing) => ing.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <SortableIngredientRow
                key={ingredient.id}
                ingredient={ingredient}
                index={index}
                handleIngredientChange={handleIngredientChange}
                removeIngredient={removeIngredient}
                rawIngredients={masterIngredients}
                preparedItems={preparedItems}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
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
