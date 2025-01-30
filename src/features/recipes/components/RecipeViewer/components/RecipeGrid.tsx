// RecipeGrid.tsx
import React from "react";
import { ChefHat, UtensilsCrossed } from "lucide-react";
import RecipeCard from "../../RecipeCard";
import type { Recipe } from "../../../types/recipe";

interface RecipeGridProps {
  recipes: Recipe[];
  activeTab: "prepared" | "final";
  searchTerm: string;
  onRecipeClick: (recipe: Recipe) => void;
}

export const RecipeGrid: React.FC<RecipeGridProps> = ({
  recipes,
  activeTab,
  searchTerm,
  onRecipeClick,
}) => {
  // Filter recipes based on active tab and search term
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesType = recipe.type === activeTab;
    const matchesSearch = searchTerm
      ? recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.station?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  // If no recipes found, show appropriate message
  if (filteredRecipes.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
          {activeTab === "prepared" ? (
            <UtensilsCrossed className="w-8 h-8 text-gray-600" />
          ) : (
            <ChefHat className="w-8 h-8 text-gray-600" />
          )}
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          No Recipes Found
        </h3>
        <p className="text-gray-400 max-w-md">
          {searchTerm
            ? `No ${activeTab === "prepared" ? "prep items" : "final plates"} match your search.`
            : `No ${activeTab === "prepared" ? "prep items" : "final plates"} available.`}
        </p>
      </div>
    );
  }

  // Show grid of recipe cards
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredRecipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onClick={() => onRecipeClick(recipe)}
          mode="view"
        />
      ))}
    </div>
  );
};
