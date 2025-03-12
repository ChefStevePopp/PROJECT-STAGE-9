import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  Link,
  FileText,
  DollarSign,
  Package,
} from "lucide-react";
import { useUmbrellaIngredientsStore } from "@/stores/umbrellaIngredientsStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import {
  UmbrellaIngredient,
  UmbrellaIngredientWithDetails,
} from "@/types/umbrella-ingredient";
import { MasterIngredient } from "@/types/master-ingredient";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { LinkMasterIngredientModal } from "./LinkMasterIngredientModal";

export const UmbrellaIngredientManager: React.FC = () => {
  const {
    umbrellaIngredients,
    fetchUmbrellaIngredients,
    createUmbrellaIngredient,
    updateUmbrellaIngredient,
    deleteUmbrellaIngredient,
    addMasterIngredientToUmbrella,
    removeMasterIngredientFromUmbrella,
    setPrimaryMasterIngredient,
    isLoading,
    error,
  } = useUmbrellaIngredientsStore();
  const { ingredients, fetchIngredients } = useMasterIngredientsStore();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newUmbrellaName, setNewUmbrellaName] = useState("");
  const [newUmbrellaCategory, setNewUmbrellaCategory] = useState("");
  const [newUmbrellaSubCategory, setNewUmbrellaSubCategory] = useState("");
  const [filteredUmbrellaIngredients, setFilteredUmbrellaIngredients] =
    useState<UmbrellaIngredientWithDetails[]>([]);
  const [expandedUmbrellas, setExpandedUmbrellas] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [isLinkingIngredient, setIsLinkingIngredient] = useState<string | null>(
    null,
  );

  // Load umbrella ingredients and master ingredients on mount
  useEffect(() => {
    fetchUmbrellaIngredients();
    fetchIngredients();

    // Get unique categories and subcategories
    const getCategories = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data: categoryData, error: categoryError } = await supabase
          .from("food_categories")
          .select("name")
          .order("name");

        const { data: subCategoryData, error: subCategoryError } =
          await supabase
            .from("food_sub_categories")
            .select("name")
            .order("name");

        if (categoryError) throw categoryError;
        if (subCategoryError) throw subCategoryError;

        setCategories(categoryData?.map((c) => c.name) || []);
        setSubCategories(subCategoryData?.map((c) => c.name) || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    getCategories();
  }, [fetchUmbrellaIngredients, fetchIngredients]);

  // Filter umbrella ingredients based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUmbrellaIngredients(umbrellaIngredients);
      return;
    }

    const filtered = umbrellaIngredients.filter(
      (umbrella) =>
        umbrella.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (umbrella.category &&
          umbrella.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (umbrella.sub_category &&
          umbrella.sub_category
            .toLowerCase()
            .includes(searchTerm.toLowerCase())),
    );

    setFilteredUmbrellaIngredients(filtered);
  }, [searchTerm, umbrellaIngredients]);

  // Handle creating a new umbrella ingredient
  const handleCreateUmbrella = async () => {
    if (!newUmbrellaName || !user?.user_metadata?.organizationId) {
      toast.error("Please enter a name for the umbrella ingredient");
      return;
    }

    try {
      await createUmbrellaIngredient({
        name: newUmbrellaName,
        organization_id: user.user_metadata.organizationId,
        category: newUmbrellaCategory || undefined,
        sub_category: newUmbrellaSubCategory || undefined,
      });

      // Reset form
      setNewUmbrellaName("");
      setNewUmbrellaCategory("");
      setNewUmbrellaSubCategory("");
      setIsCreating(false);
    } catch (err) {
      console.error("Error creating umbrella ingredient:", err);
    }
  };

  // Handle updating an umbrella ingredient
  const handleUpdateUmbrella = async (id: string) => {
    if (!newUmbrellaName) {
      toast.error("Please enter a name for the umbrella ingredient");
      return;
    }

    try {
      await updateUmbrellaIngredient(id, {
        name: newUmbrellaName,
        category: newUmbrellaCategory || undefined,
        sub_category: newUmbrellaSubCategory || undefined,
      });

      // Reset form
      setNewUmbrellaName("");
      setNewUmbrellaCategory("");
      setNewUmbrellaSubCategory("");
      setIsEditing(null);
    } catch (err) {
      console.error("Error updating umbrella ingredient:", err);
    }
  };

  // Toggle expanded state for an umbrella ingredient
  const toggleExpanded = (id: string) => {
    setExpandedUmbrellas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Start editing an umbrella ingredient
  const startEditing = (umbrella: UmbrellaIngredient) => {
    setIsEditing(umbrella.id);
    setNewUmbrellaName(umbrella.name);
    setNewUmbrellaCategory(umbrella.category || "");
    setNewUmbrellaSubCategory(umbrella.sub_category || "");
  };

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <h3 className="font-medium">Error Loading Umbrella Ingredients</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            Umbrella Ingredient Management
          </h2>
          <p className="text-gray-400">
            Create and manage umbrella ingredients to group related products
          </p>
          <div className="mt-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <h3 className="text-sm font-medium text-amber-400 mb-1">
              What are Umbrella Ingredients?
            </h3>
            <p className="text-sm text-gray-300">
              Umbrella Ingredients let you group similar products that serve the
              same purpose in your kitchen. For example, you might create an
              "Olive Oil" umbrella that includes different brands, sizes, and
              grades of olive oil. This helps with recipe costing, inventory
              management, and makes it easier to substitute products when
              needed.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchUmbrellaIngredients()}
            className="btn-ghost"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button onClick={() => setIsCreating(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Umbrella Ingredient
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search umbrella ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Create New Umbrella Ingredient Form */}
      {isCreating && (
        <div className="card p-6 bg-gray-800/50">
          <h3 className="text-lg font-medium text-white mb-4">
            Create New Umbrella Ingredient
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Name
              </label>
              <input
                type="text"
                value={newUmbrellaName}
                onChange={(e) => setNewUmbrellaName(e.target.value)}
                placeholder="Enter umbrella ingredient name"
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <select
                value={newUmbrellaCategory}
                onChange={(e) => setNewUmbrellaCategory(e.target.value)}
                className="input w-full"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Sub-Category
              </label>
              <select
                value={newUmbrellaSubCategory}
                onChange={(e) => setNewUmbrellaSubCategory(e.target.value)}
                className="input w-full"
              >
                <option value="">Select a sub-category</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsCreating(false)} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleCreateUmbrella}
              className="btn-primary"
              disabled={!newUmbrellaName}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Umbrella Ingredient
            </button>
          </div>
        </div>
      )}

      {/* Umbrella Ingredients List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredUmbrellaIngredients.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Umbrella Ingredients Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? `No umbrella ingredients match your search for "${searchTerm}".`
                : "You haven't created any umbrella ingredients yet. Create your first one to get started."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreating(true)}
                className="btn-primary mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Umbrella Ingredient
              </button>
            )}
          </div>
        ) : (
          filteredUmbrellaIngredients.map((umbrella) => (
            <div key={umbrella.id} className="card p-4 bg-gray-800/50">
              {/* Umbrella Header */}
              <div className="flex items-center justify-between mb-3">
                {isEditing === umbrella.id ? (
                  <div className="flex-1 flex items-center gap-4">
                    <input
                      type="text"
                      value={newUmbrellaName}
                      onChange={(e) => setNewUmbrellaName(e.target.value)}
                      className="input flex-1"
                      placeholder="Umbrella ingredient name"
                    />
                    <select
                      value={newUmbrellaCategory}
                      onChange={(e) => setNewUmbrellaCategory(e.target.value)}
                      className="input w-48"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newUmbrellaSubCategory}
                      onChange={(e) =>
                        setNewUmbrellaSubCategory(e.target.value)
                      }
                      className="input w-48"
                    >
                      <option value="">Select sub-category</option>
                      {subCategories.map((subCategory) => (
                        <option key={subCategory} value={subCategory}>
                          {subCategory}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateUmbrella(umbrella.id)}
                        className="btn-primary"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditing(null)}
                        className="btn-ghost"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary-400" />
                      {umbrella.name}
                      <span className="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                        Umbrella Ingredient
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {umbrella.category && (
                        <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                          {umbrella.category}
                        </span>
                      )}
                      {umbrella.sub_category && (
                        <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                          {umbrella.sub_category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <button
                        onClick={() => toggleExpanded(umbrella.id)}
                        className="btn-ghost text-sm"
                      >
                        <Link className="w-4 h-4 mr-1" />
                        {expandedUmbrellas.includes(umbrella.id)
                          ? "Hide Linked Items"
                          : "Show Linked Items"}
                      </button>
                      <button
                        onClick={() => startEditing(umbrella)}
                        className="btn-ghost text-sm"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUmbrellaIngredient(umbrella.id)}
                        className="btn-ghost text-sm text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Linked Master Ingredients */}
              {expandedUmbrellas.includes(umbrella.id) && (
                <div className="mt-4 border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-white">
                      Linked Master Ingredients
                    </h4>
                    <button
                      onClick={() => setIsLinkingIngredient(umbrella.id)}
                      className="btn-ghost text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Link New Ingredient
                    </button>
                  </div>

                  {umbrella.master_ingredient_details.length === 0 ? (
                    <div className="text-center py-4 bg-gray-900/30 rounded-lg">
                      <p className="text-gray-400 text-sm">
                        No master ingredients linked to this umbrella ingredient
                        yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-900/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                              Product Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                              Item Code
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                              Vendor
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                              Current Price
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">
                              Primary
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {umbrella.master_ingredient_details.map(
                            (ingredient) => (
                              <tr
                                key={ingredient.id}
                                className="hover:bg-gray-700/30"
                              >
                                <td className="px-4 py-2 text-xs text-white">
                                  {ingredient.product}
                                </td>
                                <td className="px-4 py-2 text-xs text-gray-300">
                                  {ingredient.item_code}
                                </td>
                                <td className="px-4 py-2 text-xs text-gray-300">
                                  {ingredient.vendor}
                                </td>
                                <td className="px-4 py-2 text-xs text-right text-gray-300">
                                  ${ingredient.current_price.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-xs text-center">
                                  <input
                                    type="radio"
                                    checked={
                                      umbrella.primary_master_ingredient_id ===
                                      ingredient.id
                                    }
                                    onChange={() =>
                                      setPrimaryMasterIngredient(
                                        umbrella.id,
                                        ingredient.id,
                                      )
                                    }
                                    className="form-radio h-3 w-3 text-primary-500"
                                  />
                                </td>
                                <td className="px-4 py-2 text-xs text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => {
                                        // View price history
                                        console.log(
                                          `View price history for ${ingredient.product}`,
                                        );
                                      }}
                                      className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                      title="View price history"
                                    >
                                      <DollarSign className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        removeMasterIngredientFromUmbrella(
                                          umbrella.id,
                                          ingredient.id,
                                        )
                                      }
                                      className="p-1 text-gray-400 hover:text-rose-400 transition-colors"
                                      title="Unlink from umbrella"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Link Master Ingredient Modal */}
      {isLinkingIngredient && (
        <LinkMasterIngredientModal
          isOpen={!!isLinkingIngredient}
          onClose={() => setIsLinkingIngredient(null)}
          onLink={(masterIngredientId) => {
            if (isLinkingIngredient) {
              addMasterIngredientToUmbrella(
                isLinkingIngredient,
                masterIngredientId,
              );
            }
          }}
          currentLinkedIds={
            isLinkingIngredient
              ? umbrellaIngredients.find((u) => u.id === isLinkingIngredient)
                  ?.master_ingredients || []
              : []
          }
          umbrellaName={
            isLinkingIngredient
              ? umbrellaIngredients.find((u) => u.id === isLinkingIngredient)
                  ?.name || "Umbrella Ingredient"
              : "Umbrella Ingredient"
          }
        />
      )}
    </div>
  );
};
