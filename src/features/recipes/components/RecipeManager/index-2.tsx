import React, { useState, useEffect } from 'react';
import { ChefHat, UtensilsCrossed, Plus, Search, Upload } from 'lucide-react';
import { useRecipeStore } from '@/stores/recipeStore';
import { RecipeCard } from '../RecipeCard';
import { RecipeEditorModal } from '../RecipeEditor';
import { RecipeImportModal } from '../RecipeImportModal';
import type { Recipe } from '../../types/recipe';
import toast from 'react-hot-toast';

export const RecipeManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'prepared' | 'final'>('prepared');
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  const { recipes, fetchRecipes, filterRecipes } = useRecipeStore();

  // Fetch recipes on mount
  useEffect(() => {
    fetchRecipes().catch(error => {
      console.error('Error fetching recipes:', error);
      toast.error('Failed to load recipes');
    });
  }, [fetchRecipes]);

  // Filter recipes based on active tab and search term
  const filteredRecipes = filterRecipes(activeTab, searchTerm);

  const handleNewRecipe = () => {
    const newRecipe: Recipe = {
      id: `new-${Date.now()}`,
      type: activeTab,
      name: '',
      description: '',
      station: '',
      storageArea: '',
      container: '',
      containerType: '',
      shelfLife: '',
      prepTime: 0,
      cookTime: 0,
      recipeUnitRatio: '1',
      unitType: 'portion',
      yield: {
        amount: 1,
        unit: 'portion'
      },
      ingredients: [],
      steps: [],
      media: [],
      allergenInfo: {
        contains: [],
        mayContain: [],
        crossContactRisk: []
      },
      qualityStandards: {
        appearance: {
          description: ''
        },
        texture: [],
        taste: [],
        aroma: [],
        temperature: {
          value: 0,
          unit: 'F',
          tolerance: 0
        }
      },
      training: {
        requiredSkillLevel: 'beginner',
        certificationRequired: [],
        commonErrors: [],
        keyTechniques: [],
        safetyProtocols: []
      },
      equipment: [],
      laborCostPerHour: 30,
      ingredientCost: 0,
      totalCost: 0,
      costPerUnit: 0,
      costPerRatioUnit: 0,
      costPerServing: 0,
      targetCostPercent: 25,
      version: '1.0',
      versions: [],
      lastModified: new Date().toISOString(),
      modifiedBy: ''
    };
    setEditingRecipe(newRecipe);
  };

  const tabs = [
    {
      id: 'prepared' as const,
      label: 'Mis en Place',
      icon: UtensilsCrossed,
      color: 'primary'
    },
    {
      id: 'final' as const,
      label: 'Final Plates',
      icon: ChefHat,
      color: 'green'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">
        src/features/recipes/components/RecipeManager/index.tsx
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recipe Manager</h1>
          <p className="text-gray-400">Recipe Library</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-ghost"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Recipe
          </button>
          <button
            onClick={handleNewRecipe}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Recipe
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
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

      {/* Search Bar */}
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

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => setEditingRecipe(recipe)}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
              {activeTab === 'prepared' ? (
                <UtensilsCrossed className="w-8 h-8 text-gray-600" />
              ) : (
                <ChefHat className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Recipes Found</h3>
            <p className="text-gray-400 max-w-md">
              {searchTerm 
                ? `No ${activeTab === 'prepared' ? 'prep items' : 'final plates'} match your search.`
                : `Get started by adding your first ${activeTab === 'prepared' ? 'prep item' : 'final plate'}.`
              }
            </p>
            <button
              onClick={handleNewRecipe}
              className="btn-primary mt-6"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Recipe
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingRecipe && (
        <RecipeEditorModal
          isOpen={true}
          onClose={() => setEditingRecipe(null)}
          recipe={editingRecipe}
        />
      )}

      <RecipeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};