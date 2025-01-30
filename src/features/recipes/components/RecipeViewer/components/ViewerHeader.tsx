import React from "react";
import { Book, Printer } from "lucide-react";
import type { Recipe } from "../../../types/recipe";

interface ViewerHeaderProps {
  viewingRecipe: Recipe | null;
  onPrint: () => void;
  onBookView: () => void;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  viewingRecipe,
  onPrint,
  onBookView,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-white">Recipe Library</h1>
        <p className="text-gray-400">View and print recipes</p>
      </div>
      <div className="flex gap-4">
        {viewingRecipe && (
          <>
            <button onClick={onPrint} className="btn-ghost">
              <Printer className="w-5 h-5 mr-2" />
              Print Recipe
            </button>
            <button onClick={onBookView} className="btn-primary">
              <Book className="w-5 h-5 mr-2" />
              Recipe Book
            </button>
          </>
        )}
      </div>
    </div>
  );
};
