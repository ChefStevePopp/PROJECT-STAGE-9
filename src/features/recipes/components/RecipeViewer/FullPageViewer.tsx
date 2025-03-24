import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ViewerHeader } from "./components/ViewerHeader";
import { ViewerSidebar } from "./components/ViewerSidebar";
import { Overview } from "./components/Overview";
import { Ingredients } from "./components/Ingredients";
import { Method } from "./components/Method";
import { Production } from "./components/Production";
import { Storage } from "./components/Storage";
import { Quality } from "./components/Quality";
import { Equipment } from "./components/Equipment";
import { Allergens } from "./components/Allergens";
import { Training } from "./components/Training";
import { Media } from "./components/Media";
import { useRecipeStore } from "../../stores/recipeStore";

export const FullPageViewer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipes, fetchRecipes } = useRecipeStore();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadRecipe = async () => {
      try {
        await fetchRecipes();
      } catch (error) {
        console.error("Error loading recipe:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecipe();
  }, [fetchRecipes]);

  const recipe = recipes.find((r) => r.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading recipe...</div>
      </div>
    );
  }

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 z-50">
        <ViewerHeader
          recipe={recipe}
          onPrint={() => window.print()}
          onBookView={() => navigate("/kitchen/recipes")}
        />
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        <ViewerSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Content sections */}
          <div className="prose prose-invert max-w-none">
            {activeTab === "overview" && <Overview recipe={recipe} />}
            {activeTab === "ingredients" && <Ingredients recipe={recipe} />}
            {activeTab === "method" && <Method recipe={recipe} />}
            {activeTab === "production" && <Production recipe={recipe} />}
            {activeTab === "storage" && <Storage recipe={recipe} />}
            {activeTab === "quality" && <Quality recipe={recipe} />}
            {activeTab === "equipment" && <Equipment recipe={recipe} />}
            {activeTab === "allergens" && <Allergens recipe={recipe} />}
            {activeTab === "training" && <Training recipe={recipe} />}
            {activeTab === "media" && <Media recipe={recipe} />}
          </div>
        </main>
      </div>
    </div>
  );
};
