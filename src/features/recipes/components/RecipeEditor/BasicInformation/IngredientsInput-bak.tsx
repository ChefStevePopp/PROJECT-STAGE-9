import React, { useEffect } from 'react';
import { UtensilsCrossed, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';
import type { Recipe, RecipeIngredient } from '../../../types/recipe';
import toast from 'react-hot-toast';

interface IngredientsInputProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const IngredientsInput: React.FC<IngredientsInputProps> = ({
  recipe,
  onChange,
}) => {
  const {
    ingredients: masterIngredients,
    fetchIngredients,
    isLoading,
    error,
  } = useMasterIngredientsStore();

  useEffect(() => {
    fetchIngredients().catch((err) => {
      console.error('Error fetching master ingredients:', err);
      toast.error('Failed to load ingredients');
    });
  }, [fetchIngredients]);

  const handleIngredientChange = (index: number, field: string, value: string) => {
    try {
        const newIngredients = [...recipe.ingredients];
        const ingredient = newIngredients[index];
        
        if (field === 'name') {
            // Debug log the master ingredients array
            console.log('Master Ingredients:', masterIngredients);
            
            const masterIngredient = masterIngredients.find(mi => mi.id === value);
            console.log('Selected master ingredient:', masterIngredient);
            
            if (masterIngredient) {
                ingredient.name = value;
                // Be more defensive with optional chaining
                ingredient.unit = masterIngredient?.recipe_unit_type || masterIngredient?.unit_of_measure || '';
                // Ensure we have a number for cost
                ingredient.cost = Number(masterIngredient?.cost_per_recipe_unit) || 0;
            }
        } else {
            ingredient[field] = value;
        }

        onChange({ ingredients: newIngredients });
    } catch (error) {
        console.error('Error in handleIngredientChange:', error);
        toast.error('Error updating ingredient');
    }
};

  const addIngredient = () => {
    onChange({
      ingredients: [
        ...recipe.ingredients,
        {
          id: `ing-${Date.now()}`,
          type: 'raw',
          name: '',
          quantity: '',
          unit: '',
          notes: '',
          cost: 0,
        },
      ],
    });
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

  if (!masterIngredients?.length) {
    return (
      <div className="flex items-center gap-3 bg-yellow-500/10 text-yellow-400 p-4 rounded-lg">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-medium">No Master Ingredients Found</p>
          <p className="text-sm text-gray-300 mt-1">
            Please add ingredients to your master ingredients list first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-lg font-medium text-white">Recipe Ingredients</h3>
        </div>
        <button onClick={addIngredient} className="btn-ghost text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-7 gap-4 px-4 py-2 bg-gray-800/50 rounded-lg text-sm font-medium text-gray-400">
        <div className="col-span-2">Ingredient</div>
        <div>Common Measure</div>
        <div>R/U Type</div>
        <div># R/U</div>
        <div>R/U Cost</div>
        <div>Total Cost</div>
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
              <select
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, 'name', e.target.value)
                }
                className="input w-full bg-gray-800/50"
                required
              >
                <option value="">Select ingredient...</option>
                {masterIngredients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.product}
                  </option>
                ))}
              </select>
            </div>

            {/* Common Measure */}
            <div>
              <input
                type="text"
                value={ingredient.commonMeasure || ''}
                onChange={(e) =>
                  handleIngredientChange(index, 'commonMeasure', e.target.value)
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
                  handleIngredientChange(index, 'quantity', e.target.value)
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
                  parseFloat(ingredient.quantity || '0') * ingredient.cost
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
    </div>
  );
};
