import React from "react";
import { X, Printer, Book } from "lucide-react";
import type { Recipe } from "../../types/recipe";

interface ViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

const ViewerModal: React.FC<ViewerModalProps> = ({
  isOpen,
  onClose,
  recipe,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">{recipe.name}</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => window.print()} className="btn-ghost">
              <Printer className="w-5 h-5 mr-2" />
              Print
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Basic recipe info */}
          <div className="space-y-4">
            <p className="text-gray-400">{recipe.description}</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-gray-400">Prep Time:</span>
                <span className="ml-2 text-white">{recipe.prep_time} min</span>
              </div>
              <div>
                <span className="text-gray-400">Cook Time:</span>
                <span className="ml-2 text-white">{recipe.cook_time} min</span>
              </div>
              <div>
                <span className="text-gray-400">Yield:</span>
                <span className="ml-2 text-white">
                  {recipe.yield_amount} {recipe.yield_unit}
                </span>
              </div>
            </div>
          </div>

          {/* We'll add more sections here as we develop them */}
        </div>
      </div>
    </div>
  );
};

export default ViewerModal;
