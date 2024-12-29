import React, { useState, useEffect } from 'react';
import { ChefHat, UtensilsCrossed, Plus, Search, Upload, Database } from 'lucide-react';
import { useRecipeStore } from '@/stores/recipeStore';
import { usePreparedItemsStore } from '@/stores/preparedItemsStore';
import { RecipeEditorModal, RecipeCard } from './recipe';
import type { Recipe } from '@/types';
import toast from 'react-hot-toast';

export const RecipeConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prepared' | 'final'>('prepared');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  const { recipes, filterRecipes, seedFromPreparedItems } = useRecipeStore();
  const { items: preparedItems } = usePreparedItemsStore();

  useEffect(() => {
    if (preparedItems.length > 0) {
      seedFromPreparedItems(preparedItems);
    }
  }, [preparedItems, seedFromPreparedItems]);

  const handleManualSync = async () => {
    try {
      await seedFromPreparedItems(preparedItems);
      toast.success('Recipes synced from Prepared Items');
    } catch (error) {
      toast.error('Failed to sync recipes');
    }
  };

  const filteredRecipes = filterRecipes(activeTab, searchTerm);

  const tabs = [
    {
      id: 'prepared' as const,
      label: 'Prepared Items',
      icon: UtensilsCrossed,
      color: 'primary'
    },
    {
      id: 'final' as const,
      label: 'Final Plates',
      icon: ChefHat,
      color: 'green'
    }
  ] as const;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Recipe Configuration</h1>
        <div className="flex gap-4">
          {activeTab === 'prepared' && (
            <button
              onClick={handleManualSync}
              className="btn-ghost"
            >
              <Database className="w-5 h-5 mr-2" />
              Sync from Prepared Items
            </button>
          )}
          <button 
            className="btn-primary"
            onClick={() => setEditingRecipe({
              id: `new-${Date.now()}`,
              type: activeTab,
              name: '',
              category: '',
              subCategory: '',
              station: '',
              storageArea: '',
              container: '',
              containerType: '',
              shelfLife: '',
              description: '',
              prepTime: 0,
              cookTime: 0,
              recipeUnitRatio: '',
              unitType: '',
              costPerRatioUnit: 0,
              ingredients: [],
              instructions: [],
              notes: '',
              costPerServing: 0,
              lastUpdated: new Date().toISOString(),
              allergens: []
            })}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Recipe
          </button>
        </div>
      </header>

      {/* Standardized Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${tab.color} ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className={`w-5 h-5 ${
              activeTab === tab.id ? `text-${tab.color}-400` : 'text-current'
            }`} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => setEditingRecipe(recipe)}
          />
        ))}
      </div>

      {editingRecipe && (
        <RecipeEditorModal
          isOpen={true}
          onClose={() => setEditingRecipe(null)}
          recipe={editingRecipe}
        />
      )}
    </div>
  );
};