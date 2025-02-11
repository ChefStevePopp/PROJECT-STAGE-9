import React from "react";
import { X } from "lucide-react";
import { MasterIngredientFormData } from "@/types/master-ingredient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { BasicInformation } from "./BasicInformation";
import { AllergenSection } from "./AllergenSection";
import { RecipeUnits } from "./RecipeUnits";
import { PurchaseUnits } from "./PurchaseUnits";

interface EditIngredientModalProps {
  ingredient: MasterIngredientFormData;
  onClose: () => void;
  onSave: (ingredient: MasterIngredientFormData) => Promise<void>;
  isNew?: boolean;
}

// Function to calculate completion status
const getCompletionStatus = (data: MasterIngredientFormData) => {
  // Required fields for a complete ingredient
  const requiredFields = [
    "product",
    "major_group",
    "category",
    "recipe_unit_type",
    "recipe_unit_per_purchase_unit",
    "current_price",
    "unit_of_measure",
  ];

  // Count how many required fields are filled
  const filledFields = requiredFields.filter((field) => {
    const value = data[field];
    return value !== null && value !== undefined && value !== "" && value !== 0;
  }).length;

  const completionPercentage = (filledFields / requiredFields.length) * 100;

  if (completionPercentage === 100) {
    return { label: "Complete", color: "bg-emerald-500/20 text-emerald-400" };
  } else if (completionPercentage >= 50) {
    return { label: "In Progress", color: "bg-amber-500/20 text-amber-400" };
  } else {
    return { label: "Draft", color: "bg-gray-500/20 text-gray-400" };
  }
};

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  ingredient: initialIngredient,
  onClose,
  onSave,
  isNew = false,
}) => {
  const { organization } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<MasterIngredientFormData>({
    ...initialIngredient,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      toast.success("Ingredient saved successfully");
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error saving ingredient:", error);
      toast.error("Failed to save ingredient");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-gray-900">
          <div className="p-4 border-b border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isNew ? "Create New Ingredient" : formData.product}
                </h2>
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-300">
                      ID: {formData.id}
                    </span>
                  )}
                  {!isNew && (
                    <span className="text-xs text-gray-400">
                      Last edited:{" "}
                      {new Date(formData.updated_at).toLocaleDateString()}{" "}
                      {new Date(formData.updated_at).toLocaleTimeString()}
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      getCompletionStatus(formData).color
                    }`}
                  >
                    {getCompletionStatus(formData).label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-6">
            <BasicInformation
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />

            <PurchaseUnits
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />

            <RecipeUnits
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />

            <AllergenSection
              formData={formData}
              onChange={(updates) =>
                setFormData((prev) => ({ ...prev, ...updates }))
              }
            />
          </div>

          <div className="sticky bottom-0 z-10 bg-gray-900 p-4 border-t border-gray-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
