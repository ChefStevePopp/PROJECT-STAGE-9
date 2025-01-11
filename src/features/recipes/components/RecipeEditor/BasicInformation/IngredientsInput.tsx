import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import type { Recipe, RecipeIngredient } from "../../../types/recipe";
import type { AllergenType } from "@/features/allergens/types";
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        // Reset search to selected ingredient name if one exists
        if (selectedIngredient) {
          setSearch(selectedIngredient.product);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedIngredient]);

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

      {open && (
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

// Rest of the IngredientsInput component remains the same...
