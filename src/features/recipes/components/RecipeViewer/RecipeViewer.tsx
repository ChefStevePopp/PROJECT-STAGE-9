import React, { useState, useEffect } from "react";
import {
  ChefHat,
  UtensilsCrossed,
  Search,
  Book,
  Printer,
  Package,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { useRecipeStore } from "@/stores/recipeStore";
import RecipeCard from "../RecipeCard";
import type { Recipe } from "../../types/recipe";
import { useSupabase } from "@/context/SupabaseContext";
import toast from "react-hot-toast";

export const RecipeViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "prepared" | "final" | "receiving"
  >("prepared");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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
    {
      id: "receiving" as const,
      label: "Receiving Items",
      icon: Package,
      color: "amber",
    },
  ] as const;

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
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

      {/* Receiving Items Description */}
      {activeTab === "receiving" && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
          >
            <h3 className="text-lg font-medium text-amber-400">
              Receiving Items
            </h3>
            <button className="text-amber-400 hover:text-amber-300">
              {descriptionExpanded ? "Minimize" : "Learn More"}
            </button>
          </div>
          {descriptionExpanded && (
            <p className="text-gray-300 mt-2">
              Receiving items are an important part of mise-en-place that have
              costs and specific handling instructions associated with them.
              This section helps document proper receiving procedures for
              produce, proteins, and other ingredients to ensure quality, food
              safety, and cost control from the moment items enter your kitchen.
            </p>
          )}
        </div>
      )}

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
              ) : activeTab === "final" ? (
                <ChefHat className="w-8 h-8 text-gray-600" />
              ) : (
                <Package className="w-8 h-8 text-gray-600" />
              )}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Recipes Found
            </h3>
            <p className="text-gray-400 max-w-md">
              {searchTerm
                ? `No ${activeTab === "prepared" ? "prep items" : activeTab === "final" ? "final plates" : "receiving items"} match your search.`
                : `No ${activeTab === "prepared" ? "prep items" : activeTab === "final" ? "final plates" : "receiving items"} available.`}
            </p>
          </div>
        )}
      </div>

      {/* Navigate to full page viewer when recipe is selected */}
      {viewingRecipe && (
        <Navigate to={`/kitchen/recipes/${viewingRecipe.id}`} replace />
      )}
    </div>
  );
};
