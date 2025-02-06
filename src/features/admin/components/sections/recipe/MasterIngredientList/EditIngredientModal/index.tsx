import React from "react";
import { X } from "lucide-react";
import { BasicInformation } from "./BasicInformation";
import { AllergenSection } from "./AllergenSection";
import { RecipeUnits } from "./RecipeUnits";
import { PurchaseUnits } from "./PurchaseUnits";
import { MasterIngredient } from "@/types/master-ingredient";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import toast from "react-hot-toast";

interface EditIngredientModalProps {
  ingredient: MasterIngredient;
  onClose: () => void;
  onSave: (ingredient: MasterIngredient) => Promise<void>;
}

export const EditIngredientModal: React.FC<EditIngredientModalProps> = ({
  ingredient: initialIngredient,
  onClose,
  onSave,
}) => {
  // Use ref to track if component is mounted
  const isMounted = React.useRef(true);

  // Initialize form data with memoized deep clone of initial ingredient
  const [formData, setFormData] = React.useState(() => ({
    ...JSON.parse(JSON.stringify(initialIngredient)),
  }));

  const [activeTab, setActiveTab] = React.useState("basic");
  const [isSaving, setIsSaving] = React.useState(false);
  const { fetchIngredients } = useMasterIngredientsStore();

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Handle form updates
  const handleUpdate = React.useCallback(
    (updates: Partial<MasterIngredient>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Save changes
  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      await fetchIngredients(); // Refresh ingredient list
      toast.success("Changes saved successfully");
      onClose();
    } catch (error) {
      console.error("Error saving ingredient:", error);
      toast.error("Failed to save changes");
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
    }
  };

  // Memoize tabs to prevent unnecessary rerenders
  const tabs = React.useMemo(
    () => [
      { id: "basic", label: "Basic Information" },
      { id: "purchase", label: "Inventory Units" },
      { id: "recipe", label: "Recipe Units" },
      { id: "costing", label: "Costing" },
      { id: "allergens", label: "Allergens" },
    ],
    [],
  );

  // Handle tab changes
  const handleTabChange = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-semibold text-white">
            Edit {formData.product}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 sticky top-[81px] bg-gray-900 z-10">
          <div className="flex gap-4 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "text-primary-400 border-primary-400" : "text-gray-400 border-transparent hover:text-gray-300"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === "basic" && (
            <BasicInformation formData={formData} onChange={handleUpdate} />
          )}
          {activeTab === "purchase" && (
            <PurchaseUnits formData={formData} onChange={handleUpdate} />
          )}
          {activeTab === "recipe" && (
            <RecipeUnits formData={formData} onChange={handleUpdate} />
          )}
          {activeTab === "costing" && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">
                Costing Information
              </h3>
              {/* Add costing fields here */}
            </div>
          )}
          {activeTab === "allergens" && (
            <AllergenSection formData={formData} onChange={handleUpdate} />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-4 sticky bottom-0 bg-gray-900 z-10">
          <button onClick={onClose} className="btn-ghost" disabled={isSaving}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary min-w-[100px]"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
