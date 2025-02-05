import React from "react";
import { ChevronLeft, Printer, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Recipe } from "../../../types/recipe";

interface ViewerHeaderProps {
  recipe: Recipe;
  onPrint: () => void;
  onBookView: () => void;
}

export const ViewerHeader: React.FC<ViewerHeaderProps> = ({
  recipe,
  onPrint,
  onBookView,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/kitchen/recipes")}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-[2.4rem] font-bold text-white">
              {recipe.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  recipe.type === "prepared"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {recipe.type === "prepared" ? "Prep Item" : "Final Plate"}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  recipe.status === "draft"
                    ? "bg-gray-500/20 text-gray-400"
                    : recipe.status === "review"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrint} className="btn-ghost">
            <Printer className="w-5 h-5 mr-2" />
            Print
          </button>
          <button onClick={onBookView} className="btn-primary">
            <Book className="w-5 h-5 mr-2" />
            Recipe Book
          </button>
        </div>
      </div>
    </header>
  );
};
