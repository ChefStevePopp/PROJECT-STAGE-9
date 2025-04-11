import React from "react";
import { Task } from "@/types/tasks";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RecipeReferenceProps {
  task: Task;
  recipeName: string;
}

export const RecipeReference: React.FC<RecipeReferenceProps> = ({
  task,
  recipeName,
}) => {
  const navigate = useNavigate();

  // Function to navigate to recipe
  const navigateToRecipe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.recipe_id) {
      navigate(`/recipes/view/${task.recipe_id}`);
    }
  };

  if (!task.recipe_id || !recipeName) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 text-xs text-sky-400 mb-3 bg-sky-500/10 p-2 rounded border border-sky-500/30">
      <div className="flex items-center justify-between">
        <div className="font-medium">Recipe: {recipeName}</div>
        <button
          onClick={navigateToRecipe}
          className="flex items-center gap-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-1 rounded transition-colors"
        >
          <BookOpen className="w-3 h-3" />
          View Recipe
        </button>
      </div>
    </div>
  );
};
