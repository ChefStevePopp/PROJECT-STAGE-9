import React, { useState, useEffect, useRef } from "react";
import { Search, Clock, ChefHat } from "lucide-react";

interface RecipeSelectorProps {
  recipes: any[];
  selectedRecipeId: string;
  selectedStageId?: string;
  onRecipeSelect: (
    recipeId: string,
    recipeName: string,
    stageData?: any,
  ) => void;
  onStageSelect?: (stageId: string, stageName: string) => void;
}

const RecipeSelector: React.FC<RecipeSelectorProps> = ({
  recipes,
  selectedRecipeId,
  selectedStageId,
  onRecipeSelect,
  onStageSelect,
}) => {
  // Recipe search and dropdown state
  const [recipeSearch, setRecipeSearch] = useState("");
  const [recipeDropdownOpen, setRecipeDropdownOpen] = useState(false);
  const [filteredRecipes, setFilteredRecipes] = useState<any[]>([]);

  // Stage search and dropdown state (separate from recipe)
  const [stageSearch, setStageSearch] = useState("");
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [filteredStages, setFilteredStages] = useState<any[]>([]);
  const [selectedStageData, setSelectedStageData] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  // Refs for click outside handling
  const recipeRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Filter recipes based on search (recipes only, no stages)
  useEffect(() => {
    const recipeOptions = recipes.filter(
      (recipe) => !recipe.id.includes("stage_"),
    );

    const filteredRecipeOptions = recipeOptions.filter((recipe) =>
      recipe.name.toLowerCase().includes(recipeSearch.toLowerCase()),
    );

    setFilteredRecipes(filteredRecipeOptions);
  }, [recipeSearch, recipes]);

  // Filter stages based on selected recipe and stage search
  useEffect(() => {
    if (!selectedRecipe) {
      setFilteredStages([]);
      return;
    }

    if (selectedRecipe.stages && selectedRecipe.stages.length > 0) {
      const filteredStageOptions = selectedRecipe.stages
        .filter((stage: any) =>
          stage.name.toLowerCase().includes(stageSearch.toLowerCase()),
        )
        .map((stage: any) => ({
          id: `stage_${selectedRecipe.id}_${stage.id || stage.name}`,
          name: stage.name,
          isStage: true,
          recipeId: selectedRecipe.id,
          recipeName: selectedRecipe.name,
          total_time: stage.total_time || null,
          stageData: stage,
        }));

      setFilteredStages(filteredStageOptions);
    } else {
      setFilteredStages([]);
    }
  }, [stageSearch, selectedRecipe]);

  // Find the selected recipe name for display
  useEffect(() => {
    if (selectedRecipeId && recipes.length > 0) {
      // Handle regular recipe selection
      const recipe = recipes.find((r) => r.id === selectedRecipeId);
      if (recipe) {
        setSelectedRecipe(recipe);
        setRecipeSearch(recipe.name);

        // If no specific stage is selected, clear stage data
        if (!selectedStageId) {
          setSelectedStageData(null);
          setStageSearch("");
        }
      }
    }
  }, [selectedRecipeId, recipes]);

  // Handle stage selection separately
  useEffect(() => {
    if (selectedStageId && selectedRecipe && selectedRecipe.stages) {
      // Find the stage data from the selected recipe
      const stageOption = findStageFromRecipe(selectedRecipe, selectedStageId);

      if (stageOption) {
        setStageSearch(stageOption.name);
        setSelectedStageData(stageOption);
      }
    }
  }, [selectedStageId, selectedRecipe]);

  // Helper function to find stage data from a recipe
  const findStageFromRecipe = (recipe: any, stageId: string) => {
    if (!recipe.stages) return null;

    const [_, recipeId, stageIdOrName] = stageId.split("_");

    const stage = recipe.stages.find(
      (s: any) =>
        (s.id && `stage_${recipeId}_${s.id}` === stageId) ||
        `stage_${recipeId}_${s.name}` === stageId,
    );

    if (stage) {
      return {
        id: stageId,
        name: stage.name,
        isStage: true,
        recipeId: recipe.id,
        recipeName: recipe.name,
        total_time: stage.total_time || null,
        stageData: stage,
      };
    }

    return null;
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recipeRef.current &&
        !recipeRef.current.contains(event.target as Node)
      ) {
        setRecipeDropdownOpen(false);
      }

      if (
        stageRef.current &&
        !stageRef.current.contains(event.target as Node)
      ) {
        setStageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle recipe selection
  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipe(recipe);
    setRecipeSearch(recipe.name);
    setRecipeDropdownOpen(false);

    // Clear stage selection when recipe changes
    setStageSearch("");
    setSelectedStageData(null);

    // Notify parent component of recipe selection
    onRecipeSelect(recipe.id, recipe.name, null);
  };

  // Handle stage selection
  const handleStageSelect = (stage: any) => {
    setSelectedStageData(stage);
    setStageSearch(stage.name);
    setStageDropdownOpen(false);

    // Notify parent component of stage selection
    if (onStageSelect) {
      onStageSelect(stage.id, stage.name);
    } else {
      // Fallback to old behavior for backward compatibility
      onRecipeSelect(stage.id, `${selectedRecipe.name} - ${stage.name}`, stage);
    }
  };

  return (
    <div className="space-y-3">
      {/* Recipe Selector */}
      <div className="relative" ref={recipeRef}>
        <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
          <ChefHat className="w-3 h-3 text-blue-400" />
          Recipe
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Type to search recipes..."
            value={recipeSearch}
            onChange={(e) => {
              setRecipeSearch(e.target.value);
              setRecipeDropdownOpen(true);
            }}
            onFocus={() => setRecipeDropdownOpen(true)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white pr-8"
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        {recipeDropdownOpen && filteredRecipes.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className={`p-2 hover:bg-gray-700 cursor-pointer ${selectedRecipe?.id === recipe.id ? "bg-gray-700" : ""}`}
                onClick={() => handleRecipeSelect(recipe)}
              >
                {recipe.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage Selector - Only shown if a recipe with stages is selected */}
      {selectedRecipe &&
        selectedRecipe.stages &&
        selectedRecipe.stages.length > 0 && (
          <div className="relative" ref={stageRef}>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-400 mb-1">
              <Clock className="w-3 h-3 text-blue-400" />
              Prep Stage
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select a prep stage..."
                value={stageSearch}
                onChange={(e) => {
                  setStageSearch(e.target.value);
                  setStageDropdownOpen(true);
                }}
                onFocus={() => setStageDropdownOpen(true)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white pr-8"
              />
              <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {stageDropdownOpen && filteredStages.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto">
                {filteredStages.map((stage) => (
                  <div
                    key={stage.id}
                    className={`p-2 hover:bg-gray-700 cursor-pointer ${selectedStageData?.id === stage.id ? "bg-gray-700" : ""}`}
                    onClick={() => handleStageSelect(stage)}
                  >
                    {stage.name}
                    {stage.total_time && (
                      <span className="text-xs text-blue-400 ml-2">
                        ({stage.total_time} min)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Display selected stage details */}
      {selectedStageData && (
        <div className="mt-2 bg-gray-800/50 p-2 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">
              <span className="font-medium text-blue-400">Total Time:</span>{" "}
              {selectedStageData.total_time || "N/A"} minutes
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-300">
              <span className="font-medium text-blue-400">Selected Stage:</span>{" "}
              {selectedStageData.name} from {selectedRecipe?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSelector;
