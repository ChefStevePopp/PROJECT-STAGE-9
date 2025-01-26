import React, { useState, useEffect } from "react";
import { ChefHat, UtensilsCrossed, Search, Book, Printer } from "lucide-react";
import { useRecipeStore } from "@/stores/recipeStore";
import RecipeCard from "../RecipeCard";
import ViewerModal from "./ViewerModal";
import type { Recipe } from "../../types/recipe";
import { useSupabase } from "@/context/SupabaseContext";
import toast from "react-hot-toast";

export const RecipeViewer: React.FC = () => {
  const diagnosticPath =
    "src/features/recipes/components/RecipeViewer/RecipeViewer.tsx";

  const [activeTab, setActiveTab] = useState<"prepared" | "final">("prepared");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Get recipes from store but handle filtering locally
  const { recipes, fetchRecipes } = useRecipeStore();
  const { supabase } = useSupabase();

  // Get organization ID on mount
  useEffect(() => {
    const getOrgId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.user_metadata?.organizationId) {
          setOrganizationId(user.user_metadata.organizationId);
        }
      } catch (error) {
        console.error("Failed to fetch organization ID:", error);
        toast.error("Failed to fetch organization ID");
      } finally {
        setIsLoading(false);
      }
    };
    getOrgId();
  }, [supabase]);

  // Fetch recipes on mount
  useEffect(() => {
    fetchRecipes().catch((error) => {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to load recipes");
    });
  }, [fetchRecipes]);

  // Filter recipes locally based on active tab and search term
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesType = recipe.type === activeTab;
    const matchesSearch = searchTerm
      ? recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.station?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  // Rest of component remains the same...
  const tabs = [
    {
      id: "prepared" as const,
      label: "Mis en Place",
      icon: UtensilsCrossed,
      color: "primary",
    },
    {
      id: "final" as const,
      label: "Final Plates",
      icon: ChefHat,
      color: "green",
    },
  ] as const;

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">{diagnosticPath}</div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Recipe Library</h1>
          <p className="text-gray-400">View and print recipes</p>
        </div>
        <div className="flex gap-4">
          {viewingRecipe && (
            <>
              <button onClick={() => window.print()} className="btn-ghost">
                <Printer className="w-5 h-5 mr-2" />
                Print Recipe
              </button>
              <button
                onClick={() => setViewingRecipe(null)}
                className="btn-primary"
              >
                <Book className="w-5 h-5 mr-2" />
                Recipe Book
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${tab.color} ${activeTab === tab.id ? "active" : ""}`}
          >
            <tab.icon
              className={`w-5 h-5 ${
                activeTab === tab.id ? `text-${tab.color}-400` : "text-current"
              }`}
            />
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
              onClick={() => setViewingRecipe(recipe)}
              mode="view"
            />
          ))
        ) : (
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
        )}
      </div>

      {/* Viewer Modal */}
      {viewingRecipe && (
        <ViewerModal
          isOpen={true}
          onClose={() => setViewingRecipe(null)}
          recipe={viewingRecipe}
        />
      )}
    </div>
  );
};
