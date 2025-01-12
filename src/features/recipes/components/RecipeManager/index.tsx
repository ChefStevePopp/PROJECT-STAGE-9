import React, { useEffect, useState } from "react";
import { useRecipeStore } from "../../stores/recipeStore";
import { Plus, Search } from "lucide-react";
import { LoadingLogo } from "@/components/LoadingLogo";
import { useAuth } from "@/hooks/useAuth";
import type { Recipe } from "../../types/recipe";

export const RecipeManager: React.FC = () => {
  const { recipes, isLoading, error, fetchRecipes } = useRecipeStore();
  const { organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (organization?.id) {
      fetchRecipes();
    }
  }, [fetchRecipes, organization?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingLogo message="Loading recipes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg">
        <h2 className="text-lg font-medium">Error Loading Recipes</h2>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recipe Manager</h1>
          <p className="text-gray-400">
            Create and manage your kitchen's recipes
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          New Recipe
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search recipes..."
          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/50 outline-none"
        />
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes
          .filter((recipe) =>
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((recipe) => (
            <div
              key={recipe.id}
              className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
            >
              <h3 className="font-medium text-white">{recipe.name}</h3>
              <p className="text-sm text-gray-400 mt-1">
                {recipe.description || "No description"}
              </p>
            </div>
          ))}
      </div>

      {recipes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No recipes found. Click "New Recipe" to create one.
        </div>
      )}
    </div>
  );
};
