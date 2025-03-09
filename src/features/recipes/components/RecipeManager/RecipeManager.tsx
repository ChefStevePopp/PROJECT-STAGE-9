import React, { useState, useEffect } from "react";
import {
  ChefHat,
  UtensilsCrossed,
  Plus,
  Search,
  Upload,
  Package,
} from "lucide-react";
import { useRecipeStore } from "@/features/recipes/stores/recipeStore";
import RecipeCard from "../RecipeCard";
import { RecipeEditorModal } from "../RecipeEditor";
import { RecipeImportModal } from "../RecipeImportModal";
import type { Recipe } from "../../types/recipe";
import { useSupabase } from "@/context/SupabaseContext";
import toast from "react-hot-toast";

const RecipeManager: React.FC = () => {
  const diagnosticPath =
    "src/features/recipes/components/RecipeManager/RecipeManager.tsx";

  const [activeTab, setActiveTab] = useState<
    "prepared" | "final" | "receiving"
  >("prepared");
  const [searchTerm, setSearchTerm] = useState("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const { recipes, fetchRecipes, filterRecipes } = useRecipeStore();
  const { supabase } = useSupabase();

  // Fetch organization ID on mount
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

  // Filter recipes based on active tab and search term
  const filteredRecipes = filterRecipes(activeTab, searchTerm);

  const handleNewRecipe = () => {
    setModalMode("create");
    const newRecipe: Partial<Recipe> = {
      type: activeTab,
      name: "",
      description: "",
      station: "",
      storage_area: "",
      container: "",
      container_type: "",
      shelf_life: "",
      prep_time: 0,
      cook_time: 0,
      rest_time: 0,
      recipe_unit_ratio: "1",
      unit_type: "portion",
      yield_amount: 1,
      yield_unit: "portion",
      ingredients: [],
      steps: [],
      media: [],
      allergens: {
        contains: [],
        mayContain: [],
        crossContactRisk: [],
      },
      quality_standards: {
        appearance_description: "",
        texture_points: [],
        taste_points: [],
        aroma_points: [],
        temperature: {
          value: 0,
          unit: "F",
          tolerance: 0,
        },
      },
      training: {
        required_skill_level: "beginner",
        certification_required: false,
        common_errors: [],
        key_techniques: [],
        safety_protocols: [],
        quality_standards: [],
      },
      cost_per_unit: 0,
      labor_cost_per_hour: 30,
      total_cost: 0,
      target_cost_percent: 25,
      version: "1.0",
      versions: [],
      organization_id: organizationId,
    };
    setEditingRecipe(newRecipe as Recipe);
  };

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
      {/* Diagnostic Text */}
      <div className="text-xs text-gray-500 font-mono">{diagnosticPath}</div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Recipe Manager</h1>
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
          <button onClick={handleNewRecipe} className="btn-primary">
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
              This section helps you document proper receiving procedures for
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
              onClick={() => {
                setModalMode("edit");
                setEditingRecipe(recipe);
              }}
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
                : `Get started by adding your first ${activeTab === "prepared" ? "prep item" : activeTab === "final" ? "final plate" : "receiving item"}.`}
            </p>
            <button onClick={handleNewRecipe} className="btn-primary mt-6">
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
          mode={modalMode}
          organizationId={organizationId}
        />
      )}

      <RecipeImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};

export default RecipeManager;
