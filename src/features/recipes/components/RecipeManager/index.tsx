import React, { useEffect, useState } from "react";
import { useRecipeStore } from "../../stores/recipeStore";
import { Plus, Search, Package, ChefHat, Utensils } from "lucide-react";
import { LoadingLogo } from "@/components/LoadingLogo";
import { useAuth } from "@/hooks/useAuth";

export const RecipeManager: React.FC = () => {
  const { recipes, isLoading, error, fetchRecipes } = useRecipeStore();
  const { organization } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

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

  // Filter recipes by type if a type is selected
  const filteredRecipes = recipes.filter((recipe) => {
    // First filter by search term
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Then filter by type if not "all"
    const matchesType = selectedType === "all" || recipe.type === selectedType;

    return matchesSearch && matchesType;
  });

  // Count recipes by type
  const preparedCount = recipes.filter((r) => r.type === "prepared").length;
  const finalCount = recipes.filter((r) => r.type === "final").length;
  const receivingCount = recipes.filter((r) => r.type === "receiving").length;

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

      {/* Recipe Type Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedType("all")}
          className={`tab primary ${selectedType === "all" ? "active" : ""}`}
        >
          <Package className="w-5 h-5 mr-2" />
          All Recipes
          <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">
            {recipes.length}
          </span>
        </button>
        <button
          onClick={() => setSelectedType("prepared")}
          className={`tab blue ${selectedType === "prepared" ? "active" : ""}`}
        >
          <ChefHat className="w-5 h-5 mr-2" />
          Prepared Items
          <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">
            {preparedCount}
          </span>
        </button>
        <button
          onClick={() => setSelectedType("final")}
          className={`tab green ${selectedType === "final" ? "active" : ""}`}
        >
          <Utensils className="w-5 h-5 mr-2" />
          Final Dishes
          <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">
            {finalCount}
          </span>
        </button>
        <button
          onClick={() => setSelectedType("receiving")}
          className={`tab amber ${selectedType === "receiving" ? "active" : ""}`}
        >
          <Package className="w-5 h-5 mr-2 text-amber-400" />
          Receiving Items
          <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">
            {receivingCount}
          </span>
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
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
          >
            <h3 className="font-medium text-white">{recipe.name}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {recipe.description || "No description"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${recipe.type === "prepared" ? "bg-blue-500/20 text-blue-400" : recipe.type === "final" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}
              >
                {recipe.type === "prepared"
                  ? "Prepared Item"
                  : recipe.type === "final"
                    ? "Final Dish"
                    : "Receiving Item"}
              </span>
              {recipe.station && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300">
                  {recipe.station}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No recipes found. Click "New Recipe" to create one.
        </div>
      )}
    </div>
  );
};
