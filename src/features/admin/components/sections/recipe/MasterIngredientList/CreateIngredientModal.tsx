import React from "react";
import { X } from "lucide-react";
import { MasterIngredientFormData } from "@/types/master-ingredient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface CreateIngredientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateIngredientModal: React.FC<CreateIngredientModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const { organization } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<MasterIngredientFormData>({
    product: "",
    major_group: "",
    category: "",
    sub_category: "",
    vendor: "",
    item_code: "",
    case_size: "",
    units_per_case: 0,
    recipe_unit_type: "",
    yield_percent: 100,
    cost_per_recipe_unit: 0,
    storage_area: "",
    allergen_peanut: false,
    allergen_crustacean: false,
    allergen_treenut: false,
    allergen_shellfish: false,
    allergen_sesame: false,
    allergen_soy: false,
    allergen_fish: false,
    allergen_wheat: false,
    allergen_milk: false,
    allergen_sulphite: false,
    allergen_egg: false,
    allergen_gluten: false,
    allergen_mustard: false,
    allergen_celery: false,
    allergen_garlic: false,
    allergen_onion: false,
    allergen_nitrite: false,
    allergen_mushroom: false,
    allergen_hot_pepper: false,
    allergen_citrus: false,
    allergen_pork: false,
    allergen_custom1_name: null,
    allergen_custom1_active: false,
    allergen_custom2_name: null,
    allergen_custom2_active: false,
    allergen_custom3_name: null,
    allergen_custom3_active: false,
    allergen_notes: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("master_ingredients").insert([
        {
          ...formData,
          organization_id: organization.id,
        },
      ]);

      if (error) throw error;

      toast.success("Ingredient created successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating ingredient:", error);
      toast.error("Failed to create ingredient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-full max-w-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Create New Ingredient
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Product Name*
            </label>
            <input
              type="text"
              value={formData.product}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, product: e.target.value }))
              }
              className="input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Major Group*
              </label>
              <input
                type="text"
                value={formData.major_group}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    major_group: e.target.value,
                  }))
                }
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Category*
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Sub Category
              </label>
              <input
                type="text"
                value={formData.sub_category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sub_category: e.target.value,
                  }))
                }
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Recipe Unit Type*
              </label>
              <input
                type="text"
                value={formData.recipe_unit_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recipe_unit_type: e.target.value,
                  }))
                }
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end gap-4">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? "Creating..." : "Create Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
