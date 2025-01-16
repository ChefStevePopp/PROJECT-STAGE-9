<<<<<<< HEAD
// src/features/recipes/components/RecipeEditor/BasicInformation/IngredientsInput.tsx
import React, { useEffect, useState } from "react";
=======
import React, { useEffect, useState, useCallback, useRef } from "react";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  AlertTriangle,
  Search,
<<<<<<< HEAD
  Tags,
  Package,
  ChevronDown,
  Filter,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
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
import type { Recipe, RecipeIngredient } from "../../../types/recipe";
=======
} from "lucide-react";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import type { Recipe, RecipeIngredient } from "../../../types/recipe";
import type { AllergenType } from "@/features/allergens/types";
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
import toast from "react-hot-toast";

// Ingredient Select Dropdown Component
const IngredientSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  ingredients: any[];
<<<<<<< HEAD
  disabled?: boolean;
}> = ({ value, onChange, ingredients, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Debug incoming data
  useEffect(() => {
    console.log("Ingredients provided to select:", ingredients);
  }, [ingredients]);

  // Group ingredients by major_group
  const groupedIngredients = React.useMemo(() => {
    console.log("Grouping ingredients...");
    return ingredients.reduce(
      (acc, ing) => {
        // Ensure we have the correct property name
        const group =
          ing.major_group_name || ing.major_group || "Uncategorized";
        if (!acc[group]) acc[group] = [];
        acc[group].push(ing);
        console.log(`Added ingredient to group ${group}:`, ing);
        return acc;
      },
      {} as Record<string, typeof ingredients>,
    );
  }, [ingredients]);

  // Filter ingredients based on search
  const filteredGroups = React.useMemo(() => {
    console.log("Filtering groups with search term:", searchTerm);
    return Object.entries(groupedIngredients).reduce(
      (acc, [group, ings]) => {
        const filtered = ings.filter((ing) => {
          const searchLower = searchTerm.toLowerCase();
          // More comprehensive search
          return (
            (ing.product?.toLowerCase() || "").includes(searchLower) ||
            (ing.category_name?.toLowerCase() || "").includes(searchLower) ||
            (ing.major_group_name?.toLowerCase() || "").includes(searchLower) ||
            (ing.item_code?.toLowerCase() || "").includes(searchLower)
          );
        });
        if (filtered.length) {
          acc[group] = filtered;
          console.log(`Group ${group} has ${filtered.length} matching items`);
        }
        return acc;
      },
      {} as Record<string, typeof ingredients>,
    );
  }, [groupedIngredients, searchTerm]);

  const selectedIngredient = React.useMemo(
    () => ingredients.find((ing) => ing.id === value),
    [ingredients, value],
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, ingredients.length - 1),
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onChange(ingredients[highlightedIndex].id);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg 
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-800"} 
          transition-colors`}
      >
        <Package className="w-5 h-5 text-primary-400" />
        <span className="flex-1 text-white">
          {selectedIngredient
            ? selectedIngredient.product
            : "Select ingredient..."}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-[600px] max-h-[500px] mt-2 p-4 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl"
          >
            {/* Search and Filters */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/50 outline-none"
                  placeholder="Search ingredients..."
                  autoFocus
                />
              </div>
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  !activeCategory
                    ? "bg-primary-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <Filter className="w-4 h-4" />
                All Categories
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {Object.keys(filteredGroups).map((group) => (
                <button
                  key={group}
                  onClick={() => setActiveCategory(group)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    activeCategory === group
                      ? "bg-primary-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Ingredients List */}
            <div className="overflow-y-auto max-h-[300px] rounded-lg divide-y divide-gray-800">
              {Object.entries(filteredGroups)
                .filter(
                  ([group]) => !activeCategory || group === activeCategory,
                )
                .map(([group, ings]) => (
                  <div key={group} className="py-2">
                    <div className="px-3 py-2 text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Tags className="w-4 h-4" />
                      {group}
                    </div>
                    <div className="space-y-1">
                      {ings.map((ing, idx) => (
                        <motion.button
                          key={ing.id}
                          onClick={() => {
                            onChange(ing.id);
                            setIsOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                            value === ing.id
                              ? "bg-primary-500 text-white"
                              : "hover:bg-gray-800 text-gray-300"
                          }`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="font-medium">{ing.product}</div>
                          {ing.category_name && (
                            <div className="text-sm opacity-60">
                              {ing.category_name}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* No Results */}
            {Object.keys(filteredGroups).length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No ingredients found matching "{searchTerm}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sortable Ingredient Row Component
const SortableIngredientRow = ({
  ingredient,
  index,
  masterIngredients,
  onUpdate,
  onRemove,
}: {
  ingredient: RecipeIngredient;
  index: number;
  masterIngredients: any[];
  onUpdate: (index: number, field: string, value: string) => void;
  onRemove: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ingredient.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-7 gap-4 items-center bg-gray-800/50 px-4 py-3 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="col-span-2 flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="w-5 h-5 text-gray-500 hover:text-gray-400" />
        </div>
        <IngredientSelect
          value={ingredient.name}
          onChange={(value) => onUpdate(index, "name", value)}
          ingredients={masterIngredients}
        />
      </div>

      <div>
        <input
          type="text"
          value={ingredient.commonMeasure || ""}
          onChange={(e) => onUpdate(index, "commonMeasure", e.target.value)}
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
          onChange={(e) => onUpdate(index, "quantity", e.target.value)}
          className="input w-full text-right bg-gray-800/50"
          placeholder="0"
          required
        />
      </div>

      <div>
        <input
          type="text"
          value={`$${ingredient.cost.toFixed(2)}`}
          className="input w-full bg-gray-800/50 text-right"
          disabled
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={`$${(parseFloat(ingredient.quantity || "0") * ingredient.cost).toFixed(2)}`}
          className="input w-full bg-gray-800/50 text-right"
          disabled
        />
        <button
          onClick={() => onRemove(index)}
          className="text-gray-400 hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// Main IngredientsInput Component
=======
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

>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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

<<<<<<< HEAD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchIngredients().catch((err) => {
      console.error("Error fetching master ingredients:", err);
      toast.error("Failed to load ingredients");
    });
  }, [fetchIngredients]);

=======
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

>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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
<<<<<<< HEAD

        if (masterIngredient) {
          ingredient.name = value;
          ingredient.unit = masterIngredient.recipeUnitType || "";
          ingredient.cost = Number(masterIngredient.costPerRecipeUnit) || 0;

          // Preserve user inputs
          ingredient.commonMeasure = ingredient.commonMeasure || "";
          ingredient.quantity = ingredient.quantity || "";
=======
        if (masterIngredient) {
          ingredient.name = value;
          ingredient.unit = masterIngredient.recipe_unit_type || "";
          ingredient.cost = Number(masterIngredient.cost_per_recipe_unit) || 0;
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
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

<<<<<<< HEAD
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = recipe.ingredients.findIndex((i) => i.id === active.id);
      const newIndex = recipe.ingredients.findIndex((i) => i.id === over.id);

      onChange({
        ingredients: arrayMove(recipe.ingredients, oldIndex, newIndex),
      });
    }
  };

  const addIngredient = () => {
    onChange({
      ingredients: [
        ...recipe.ingredients,
        {
          id: `ing-${Date.now()}`,
          type: "raw",
          name: "",
          quantity: "",
          unit: "",
          notes: "",
          cost: 0,
        },
      ],
    });
=======
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
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
  };

  const removeIngredient = (index: number) => {
    onChange({
      ingredients: recipe.ingredients.filter((_, i) => i !== index),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
<<<<<<< HEAD
        <motion.div
          className="text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading ingredients...
        </motion.div>
=======
        <div className="text-gray-400">Loading ingredients...</div>
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
      </div>
    );
  }

  if (error) {
    return (
<<<<<<< HEAD
      <motion.div
        className="flex items-center gap-3 bg-rose-500/10 text-rose-400 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
=======
      <div className="flex items-center gap-3 bg-rose-500/10 text-rose-400 p-4 rounded-lg">
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Error Loading Ingredients</p>
          <p className="text-sm text-gray-300 mt-1">
            Please try refreshing the page or contact support if the problem
            persists.
          </p>
        </div>
<<<<<<< HEAD
      </motion.div>
    );
  }
  if (!masterIngredients?.length) {
    return (
      <motion.div
        className="flex items-center gap-3 bg-yellow-500/10 text-yellow-400 p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-medium">No Master Ingredients Found</p>
          <p className="text-sm text-gray-300 mt-1">
            Please add ingredients to your master ingredients list first.
          </p>
        </div>
      </motion.div>
=======
      </div>
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
    );
  }

  return (
    <div className="space-y-4">
<<<<<<< HEAD
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Recipe Ingredients</h3>
        </div>
        <button onClick={addIngredient} className="btn-ghost text-sm group">
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          Add Ingredient
        </button>
      </motion.div>

      {/* Table Header */}
      <motion.div
        className="grid grid-cols-7 gap-4 px-4 py-2 bg-gray-800/50 rounded-lg text-sm font-medium text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="col-span-2">Ingredient</div>
        <div>Common Measure</div>
        <div>R/U Type</div>
        <div># R/U</div>
        <div>R/U Cost</div>
        <div>Total Cost</div>
      </motion.div>

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
          <AnimatePresence>
            {recipe.ingredients.map((ingredient, index) => (
              <SortableIngredientRow
                key={ingredient.id}
                ingredient={ingredient}
                index={index}
                masterIngredients={masterIngredients}
                onUpdate={handleIngredientChange}
                onRemove={removeIngredient}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {recipe.ingredients.length === 0 && (
        <motion.div
          className="text-center py-8 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          No ingredients added yet. Click "Add Ingredient" to start building
          your recipe.
        </motion.div>
      )}

      {/* Total Cost Summary */}
      {recipe.ingredients.length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-emerald-500/10 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
        </motion.div>
=======
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
>>>>>>> cb87c5dc74a44d0aec8ec39585a20d54ed8acafa
      )}
    </div>
  );
};
