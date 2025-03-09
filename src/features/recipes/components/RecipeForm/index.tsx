import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Recipe } from "../../types";

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (data: Partial<Recipe>) => void;
  onCancel: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<Partial<Recipe>>(
    initialData || {
      name: "",
      description: "",
      category: "",
      prepTime: 0,
      cookTime: 0,
      ingredients: [],
      instructions: [],
      type: "prepared",
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Recipe Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="input w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Recipe Type
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              type: e.target.value as "prepared" | "final" | "receiving",
            }))
          }
          className="input w-full"
          required
        >
          <option value="prepared">Prepared Item</option>
          <option value="final">Final Plate</option>
          <option value="receiving">Receiving Item</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="input w-full h-24"
          required
        />
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="btn-ghost">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initialData ? "Update Recipe" : "Create Recipe"}
        </button>
      </div>
    </form>
  );
};
