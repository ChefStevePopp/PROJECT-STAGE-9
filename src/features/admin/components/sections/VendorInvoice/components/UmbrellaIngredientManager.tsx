import React, { useState, useEffect, useMemo } from "react";
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
  Umbrella,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUmbrellaIngredientsStore } from "@/stores/umbrellaIngredientsStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useFoodRelationshipsStore } from "@/stores/foodRelationshipsStore";
import { useOperationsStore } from "@/stores/operationsStore";
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
  const [newUmbrellaMajorGroup, setNewUmbrellaMajorGroup] = useState("");
  const [newUmbrellaCategory, setNewUmbrellaCategory] = useState("");
  const [newUmbrellaSubCategory, setNewUmbrellaSubCategory] = useState("");
  const [filteredUmbrellaIngredients, setFilteredUmbrellaIngredients] =
    useState<UmbrellaIngredientWithDetails[]>([]);
  const [expandedUmbrellas, setExpandedUmbrellas] = useState<string[]>([]);
  const [isLinkingIngredient, setIsLinkingIngredient] = useState<string | null>(
    null,
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Get food relationships for cascading dropdowns
  const {
    majorGroups,
    categories,
    subCategories,
    fetchFoodRelationships,
    isLoading: isLoadingRelationships,
  } = useFoodRelationshipsStore();

  // Get operations settings
  const { settings, fetchSettings } = useOperationsStore();

  // Load umbrella ingredients, master ingredients, and food relationships on mount
  useEffect(() => {
    fetchUmbrellaIngredients();
    fetchIngredients();
    fetchFoodRelationships();
    fetchSettings();
  }, [
    fetchUmbrellaIngredients,
    fetchIngredients,
    fetchFoodRelationships,
    fetchSettings,
  ]);

  // Get filtered categories based on major group
  const filteredCategories = useMemo(() => {
    if (!newUmbrellaMajorGroup) return [];
    return categories.filter((c) => c.group_id === newUmbrellaMajorGroup);
  }, [categories, newUmbrellaMajorGroup]);

  // Get filtered subcategories based on category
  const filteredSubCategories = useMemo(() => {
    if (!newUmbrellaCategory) return [];
    return subCategories.filter((s) => s.category_id === newUmbrellaCategory);
  }, [subCategories, newUmbrellaCategory]);

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

  // Calculate total pages
  useEffect(() => {
    setTotalPages(Math.ceil(filteredUmbrellaIngredients.length / itemsPerPage));
  }, [filteredUmbrellaIngredients, itemsPerPage]);

  // Get paginated data
  const paginatedUmbrellaIngredients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUmbrellaIngredients.slice(startIndex, endIndex);
  }, [filteredUmbrellaIngredients, currentPage, itemsPerPage]);

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
        major_group: newUmbrellaMajorGroup || undefined,
        category: newUmbrellaCategory || undefined,
        sub_category: newUmbrellaSubCategory || undefined,
      });

      // Reset form
      setNewUmbrellaName("");
      setNewUmbrellaMajorGroup("");
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
        major_group: newUmbrellaMajorGroup || undefined,
        category: newUmbrellaCategory || undefined,
        sub_category: newUmbrellaSubCategory || undefined,
      });

      // Reset form
      setNewUmbrellaName("");
      setNewUmbrellaMajorGroup("");
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
    setNewUmbrellaMajorGroup(umbrella.major_group || "");
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
      <div>
        <h2 className="text-xl font-bold text-white">
          Umbrella Ingredient Management
        </h2>
        <p className="text-gray-400">
          Create and manage umbrella ingredients to group related products
        </p>
      </div>
      {/* Collapsible Info Box */}
      <details className="w-full rounded-lg">
        <summary className="cursor-pointer font-medium text-amber-400 hover:text-amber-300 transition-colors">
          What are Umbrella Ingredients?
        </summary>
        <div className="mt-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <p className="text-sm text-gray-300">
            Umbrella Ingredients let you group similar products that serve the
            same purpose in your kitchen. For example, you might create an
            "Olive Oil" umbrella that includes different brands, sizes, and
            grades of olive oil. This helps with recipe costing, inventory
            management, and makes it easier to substitute products when needed.
          </p>
        </div>
      </details>
      {/* Search Bar and Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search umbrella ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
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
      {/* Create New Umbrella Ingredient Form */}
      {isCreating && (
        <div className="card p-4 bg-gray-900 border border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-white">
                <Plus className="w-4 h-4 inline-block mr-1 text-rose-400" />
                Create New Umbrella Ingredient
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={newUmbrellaName}
                  onChange={(e) => setNewUmbrellaName(e.target.value)}
                  placeholder="Enter umbrella ingredient name"
                  className="input w-full"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  The name for this umbrella group (e.g. "Olive Oil")
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Major Group
                </label>
                <select
                  value={newUmbrellaMajorGroup}
                  onChange={(e) => {
                    setNewUmbrellaMajorGroup(e.target.value);
                    setNewUmbrellaCategory(""); // Reset category when major group changes
                    setNewUmbrellaSubCategory(""); // Reset sub-category when major group changes
                  }}
                  className="input w-full"
                >
                  <option value="">Select a major group</option>
                  {majorGroups?.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  The major group this umbrella belongs to
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={newUmbrellaCategory}
                  onChange={(e) => {
                    setNewUmbrellaCategory(e.target.value);
                    setNewUmbrellaSubCategory(""); // Reset sub-category when category changes
                  }}
                  className="input w-full"
                  disabled={!newUmbrellaMajorGroup} // Disable if no major group selected
                >
                  <option value="">Select a category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  The category within the major group
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Sub-Category
                </label>
                <select
                  value={newUmbrellaSubCategory}
                  onChange={(e) => setNewUmbrellaSubCategory(e.target.value)}
                  className="input w-full"
                  disabled={!newUmbrellaCategory} // Disable if no category selected
                >
                  <option value="">Select a sub-category</option>
                  {filteredSubCategories.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Optional: A more specific classification
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsCreating(false)}
                className="btn-ghost"
              >
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
          paginatedUmbrellaIngredients.map((umbrella) => (
            <div key={umbrella.id} className="card p-4 bg-gray-800/50">
              {/* Umbrella Header */}
              <div className="mb-3">
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
                      value={newUmbrellaMajorGroup}
                      onChange={(e) => {
                        setNewUmbrellaMajorGroup(e.target.value);
                        setNewUmbrellaCategory("");
                        setNewUmbrellaSubCategory("");
                      }}
                      className="input w-40"
                    >
                      <option value="">Select major group</option>
                      {majorGroups?.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newUmbrellaCategory}
                      onChange={(e) => {
                        setNewUmbrellaCategory(e.target.value);
                        setNewUmbrellaSubCategory("");
                      }}
                      className="input w-40"
                      disabled={!newUmbrellaMajorGroup}
                    >
                      <option value="">Select category</option>
                      {filteredCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newUmbrellaSubCategory}
                      onChange={(e) =>
                        setNewUmbrellaSubCategory(e.target.value)
                      }
                      className="input w-40"
                      disabled={!newUmbrellaCategory}
                    >
                      <option value="">Select sub-category</option>
                      {filteredSubCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
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
                    {/* Line 1: Name and badge on left, action buttons on right */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Umbrella className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        <h3 className="text-lg font-medium text-white">
                          {umbrella.name}
                        </h3>
                        <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded-full">
                          Umbrella Ingredient
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleExpanded(umbrella.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-700/30"
                          title={
                            expandedUmbrellas.includes(umbrella.id)
                              ? "Hide linked items"
                              : "Show linked items"
                          }
                        >
                          <Link className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditing(umbrella)}
                          className="p-1.5 text-gray-400 hover:text-amber-400 transition-colors rounded-md hover:bg-gray-700/30"
                          title="Edit umbrella ingredient"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUmbrellaIngredient(umbrella.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors rounded-md hover:bg-gray-700/30"
                          title="Delete umbrella ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Line 2: Categories on left, linked ingredients preview on right */}
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {umbrella.major_group_name && (
                          <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                            {umbrella.major_group_name}
                          </span>
                        )}
                        {umbrella.category_name && (
                          <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                            {umbrella.category_name}
                          </span>
                        )}
                        {umbrella.sub_category_name && (
                          <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                            {umbrella.sub_category_name}
                          </span>
                        )}
                        {!umbrella.category_name &&
                          !umbrella.sub_category_name &&
                          !umbrella.major_group_name && (
                            <span className="text-gray-500 italic text-xs">
                              No categories assigned
                            </span>
                          )}
                      </div>
                      {umbrella.master_ingredient_details.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {umbrella.master_ingredient_details
                            .slice(0, 2)
                            .map((ingredient) => (
                              <span
                                key={ingredient.id}
                                className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full text-gray-300"
                              >
                                {ingredient.product}
                              </span>
                            ))}
                          {umbrella.master_ingredient_details.length > 2 && (
                            <span className="text-xs bg-gray-700/50 px-2 py-0.5 rounded-full text-gray-300">
                              +{umbrella.master_ingredient_details.length - 2}{" "}
                              more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Line 3: Show linked items details button on right */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleExpanded(umbrella.id)}
                        className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        {expandedUmbrellas.includes(umbrella.id)
                          ? "Hide details"
                          : "Show details"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* We've moved the linked ingredients preview to line 2 */}

              {/* Linked Master Ingredients (expanded view) */}
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
                            <th className="px-4 py-2 text-xs font-medium text-gray-400 text-center">
                              Item Code
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">
                              Vendor
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">
                              Current Price
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">
                              Recipe Unit
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">
                              Cost per Recipe Unit
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">
                              Primary
                            </th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-400">
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
                                <td className="px-4 py-2 text-left text-xs text-white">
                                  {ingredient.product}
                                </td>
                                <td className="px-4 py-2 text-center text-xs text-gray-300">
                                  {ingredient.item_code}
                                </td>
                                <td className="px-4 py-2 text-center text-xs text-gray-300">
                                  {ingredient.vendor}
                                </td>
                                <td className="px-4 py-2 text-center text-xs text-gray-300">
                                  ${ingredient.current_price.toFixed(2)}
                                </td>
                                <td className="text-xs text-center text-gray-300 px-0.5 py-2">
                                  {ingredient.recipe_unit_type || "EA"}
                                </td>
                                <td className="px-4 py-2 text-center text-bold text-xs text-green-400">
                                  ${ingredient.cost_per_recipe_unit.toFixed(2)}
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
                                    className="form-radio h-3 w-3 text-rose-500"
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

        {/* Pagination Controls */}
        {filteredUmbrellaIngredients.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-400">
              Showing {paginatedUmbrellaIngredients.length} of{" "}
              {filteredUmbrellaIngredients.length} umbrella ingredients
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
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
