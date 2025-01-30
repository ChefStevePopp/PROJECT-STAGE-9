// ViewerModal/index.tsx
import React, { useEffect } from "react";
import {
  X,
  Printer,
  ChefHat,
  UtensilsCrossed,
  AlertTriangle,
  Clock,
  Info,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AllergenBadge } from "@/features/allergens/components/AllergenBadge";
import type { Recipe } from "../../../types/recipe";

// Define the possible viewing modes for the recipe display
type ViewMode = "compact" | "detailed" | "training";

interface ViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

// Determine the appropriate view mode based on user role
const determineAllowedViewMode = (role?: string): ViewMode => {
  switch (role) {
    case "kitchen_team":
    case "chef":
    case "sous_chef":
      return "detailed";
    case "trainer":
    case "manager":
      return "training";
    default:
      return "compact";
  }
};

export const ViewerModal: React.FC<ViewerModalProps> = ({
  isOpen,
  onClose,
  recipe,
}) => {
  const { user } = useAuth();
  const viewMode = determineAllowedViewMode(user?.role);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Add class to prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Render the content based on the view mode
  const renderContent = () => {
    const baseContent = (
      <>
        {/* Recipe Description */}
        <div className="mb-6">
          <p className="text-gray-300">{recipe.description}</p>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Prep Time</div>
            <div className="text-xl font-bold text-white">
              {recipe.prep_time} min
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Cook Time</div>
            <div className="text-xl font-bold text-white">
              {recipe.cook_time} min
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Yield</div>
            <div className="text-xl font-bold text-white">
              {recipe.yield_amount} {recipe.yield_unit}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-400">Station</div>
            <div className="text-xl font-bold text-white">
              {recipe.station || "Not Specified"}
            </div>
          </div>
        </div>

        {/* Allergen Warnings */}
        {recipe.allergens?.contains?.length > 0 && (
          <div className="bg-rose-500/10 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="font-medium text-rose-400">Allergen Warning</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.allergens.contains.map((allergen) => (
                <AllergenBadge key={allergen} type={allergen} />
              ))}
            </div>
          </div>
        )}

        {/* Ingredients List */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Ingredients</h3>
          <div className="space-y-2">
            {recipe.ingredients?.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-3"
              >
                <div className="flex-1">
                  <span className="text-white">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                  <span className="text-gray-400 ml-2">{ingredient.name}</span>
                </div>
                {ingredient.notes && (
                  <div className="text-sm text-gray-400">
                    {ingredient.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Method */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Method</h3>
          <div className="space-y-4">
            {recipe.steps?.map((step, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white">{step.instruction}</p>
                    {step.notes && (
                      <p className="text-sm text-gray-400 mt-2">{step.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );

    // Add additional content for detailed and training views
    if (viewMode === "detailed" || viewMode === "training") {
      return (
        <>
          {baseContent}

          {/* Quality Standards */}
          {recipe.quality_standards && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Quality Standards
              </h3>
              <div className="space-y-4">
                {recipe.quality_standards.texture_points?.length > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">
                      Texture Points
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recipe.quality_standards.texture_points.map(
                        (point, index) => (
                          <li key={index} className="text-gray-300">
                            {point}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
                {recipe.quality_standards.taste_points?.length > 0 && (
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">
                      Taste Points
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recipe.quality_standards.taste_points.map(
                        (point, index) => (
                          <li key={index} className="text-gray-300">
                            {point}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      );
    }

    return baseContent;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <header className="sticky top-0 bg-gray-900 p-6 border-b border-gray-800 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">{recipe.name}</h2>
            <p className="text-sm text-gray-400">
              {recipe.type === "prepared" ? "Mis en Place" : "Final Plate"}
            </p>
          </div>
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

        {/* Modal Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};
