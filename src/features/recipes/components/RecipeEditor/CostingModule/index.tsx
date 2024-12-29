import React, { useState, useEffect } from 'react';
import { CircleDollarSign, Calculator, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useMasterIngredientsStore } from '@/stores/masterIngredientsStore';
import type { Recipe, RecipeIngredient } from '../../../types/recipe';
import { LABOR_RATE_PER_HOUR } from '@/constants';

interface CostingModuleProps {
  recipe: Recipe;
  onChange: (updates: Partial<Recipe>) => void;
}

export const CostingModule: React.FC<CostingModuleProps> = ({ recipe, onChange }) => {
  const { ingredients: masterIngredients } = useMasterIngredientsStore();
  const [totalCost, setTotalCost] = useState(0);

  const addIngredient = () => {
    const newIngredient: RecipeIngredient = {
      id: `ing-${Date.now()}`,
      type: 'raw',
      name: '',
      quantity: '',
      unit: '',
      notes: '',
      cost: 0
    };

    onChange({
      ingredients: [...recipe.ingredients, newIngredient]
    });
  };

  const updateIngredient = (index: number, updates: Partial<RecipeIngredient>) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], ...updates };

    // If ingredient is selected, update unit and cost info
    if (updates.name) {
      const masterIngredient = masterIngredients.find(mi => mi.id === updates.name);
      if (masterIngredient) {
        updatedIngredients[index].unit = masterIngredient.recipe_unit_type || masterIngredient.unit_of_measure;
        updatedIngredients[index].cost = masterIngredient.cost_per_recipe_unit;
      }
    }

    onChange({ ingredients: updatedIngredients });
  };

  const removeIngredient = (index: number) => {
    onChange({
      ingredients: recipe.ingredients.filter((_, i) => i !== index)
    });
  };

  // Calculate total cost whenever ingredients change
  useEffect(() => {
    const ingredientCost = recipe.ingredients.reduce((sum, ingredient) => {
      const quantity = parseFloat(ingredient.quantity) || 0;
      return sum + (quantity * ingredient.cost);
    }, 0);

    const laborCost = ((recipe.prepTime + recipe.cookTime) / 60) * (recipe.laborCostPerHour || LABOR_RATE_PER_HOUR);
    const newTotalCost = ingredientCost + laborCost;

    setTotalCost(newTotalCost);
    onChange({ 
      totalCost: newTotalCost,
      costPerUnit: newTotalCost / (recipe.yield?.amount || 1)
    });
  }, [recipe.ingredients, recipe.prepTime, recipe.cookTime, recipe.laborCostPerHour, recipe.yield?.amount]);

  return (
    <div className="space-y-6">
      {/* Ingredients Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-medium text-white">Recipe Ingredients & Costing</h3>
          </div>
          <button
            onClick={addIngredient}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </button>
        </div>

        <div className="space-y-4">
          {recipe.ingredients.map((ingredient, index) => (
            <div
              key={ingredient.id}
              className="grid grid-cols-6 gap-4 bg-gray-800/50 p-4 rounded-lg"
            >
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Ingredient
                </label>
                <select
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, { name: e.target.value })}
                  className="input w-full"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, { quantity: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Recipe Unit
                </label>
                <input
                  type="text"
                  value={ingredient.unit}
                  className="input w-full bg-gray-700"
                  disabled
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Cost per Unit
                </label>
                <input
                  type="text"
                  value={`$${ingredient.cost.toFixed(2)}`}
                  className="input w-full bg-gray-700"
                  disabled
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Recipe Yield */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Recipe Yield
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={recipe.yield?.amount || 1}
                  onChange={(e) => onChange({
                    yield: { 
                      ...recipe.yield,
                      amount: parseInt(e.target.value) 
                    }
                  })}
                  className="input flex-1"
                  min="1"
                  step="1"
                />
                <select
                  value={recipe.yield?.unit || 'portion'}
                  onChange={(e) => onChange({
                    yield: { 
                      ...recipe.yield,
                      unit: e.target.value 
                    }
                  })}
                  className="input w-32"
                >
                  <option value="portion">Portions</option>
                  <option value="serving">Servings</option>
                  <option value="kg">Kilograms</option>
                  <option value="lb">Pounds</option>
                  <option value="each">Each</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Target Cost %
              </label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={recipe.targetCostPercent}
                  onChange={(e) => onChange({ targetCostPercent: parseInt(e.target.value) })}
                  className="input flex-1"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="input w-12 flex items-center justify-center bg-gray-700">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-xl font-medium text-white">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cost per {recipe.yield?.unit || 'unit'}</span>
                <span className="text-xl font-medium text-white">
                  ${(totalCost / (recipe.yield?.amount || 1)).toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              {recipe.targetCostPercent && (
                <div className="bg-rose-500/10 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <p className="text-rose-400 font-medium">Cost Warning</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Target cost should be ${((totalCost * recipe.targetCostPercent) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};