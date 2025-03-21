import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Check,
  History,
  RefreshCw,
  AlertTriangle,
  Link,
  DollarSign,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Info,
} from "lucide-react";
import { useVendorCodesStore } from "@/stores/vendorCodesStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { VendorCodeWithIngredient } from "@/types/vendor-codes";
import { MasterIngredient } from "@/types/master-ingredient";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export const ItemCodeGroupManager: React.FC = () => {
  const {
    vendorCodes,
    fetchVendorCodes,
    addVendorCode,
    updateVendorCode,
    deleteVendorCode,
    setCurrentVendorCode,
    isLoading,
    error,
  } = useVendorCodesStore();
  const { ingredients, fetchIngredients } = useMasterIngredientsStore();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [ingredientSearchTerm, setIngredientSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState<MasterIngredient | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newVendorId, setNewVendorId] = useState("");
  const [variationLabel, setVariationLabel] = useState("");
  const [noteTag, setNoteTag] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [filteredCodes, setFilteredCodes] = useState<
    VendorCodeWithIngredient[]
  >([]);
  const [vendors, setVendors] = useState<string[]>([]);
  const [selectedUmbrellaIngredient, setSelectedUmbrellaIngredient] = useState<
    string | null
  >(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [infoExpanded, setInfoExpanded] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Load vendor codes and ingredients on mount
  useEffect(() => {
    fetchVendorCodes();
    fetchIngredients();

    // Get unique vendors from operations settings
    const getVendors = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data, error } = await supabase
          .from("operations_settings")
          .select("vendors")
          .single();

        if (error) throw error;
        if (data && data.vendors) {
          setVendors(data.vendors);
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        // Set some default vendors if we can't fetch them
        setVendors(["Sysco", "US Foods", "Gordon Food Service", "Other"]);
      }
    };

    getVendors();
  }, [fetchVendorCodes, fetchIngredients]);

  // Filter codes based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCodes(vendorCodes);
      return;
    }

    const filtered = vendorCodes.filter(
      (code) =>
        code.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.vendor_id.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredCodes(filtered);
  }, [searchTerm, vendorCodes]);

  // Handle adding a new vendor code
  const handleAddCode = async () => {
    if (
      !selectedIngredient ||
      !newCode ||
      !newVendorId ||
      !user?.user_metadata?.organizationId
    ) {
      toast.error("Please select an ingredient, vendor, and enter a code");
      return;
    }

    try {
      await addVendorCode({
        organization_id: user.user_metadata.organizationId,
        master_ingredient_id: selectedIngredient.id,
        vendor_id: newVendorId,
        code: newCode,
        variation_label: variationLabel || undefined,
        note: noteTag || undefined,
        is_current: true,
      });

      // Reset form
      setNewCode("");
      setNewVendorId("");
      setVariationLabel("");
      setNoteTag("");
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding vendor code:", err);
    }
  };

  // Group codes by ingredient
  const codesByIngredient = filteredCodes.reduce(
    (acc, code) => {
      if (!acc[code.master_ingredient_id]) {
        acc[code.master_ingredient_id] = {
          ingredientName: code.ingredient_name,
          codes: [],
        };
      }
      acc[code.master_ingredient_id].codes.push(code);
      return acc;
    },
    {} as Record<
      string,
      { ingredientName: string; codes: VendorCodeWithIngredient[] }
    >,
  );

  // Set total pages to 1 for the example
  useEffect(() => {
    setTotalPages(1);
  }, []);

  // Get paginated data
  const paginatedIngredients = useMemo(() => {
    const ingredientEntries = Object.entries(codesByIngredient);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // For demo purposes, just return one example if there are any
    if (ingredientEntries.length > 0) {
      return [ingredientEntries[0]];
    }

    return [];
  }, [codesByIngredient, currentPage, itemsPerPage]);

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <h3 className="font-medium">Error Loading Item Code Groups</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 bg-[#262d3c] p-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#262d3c]">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              Item Code Group Management
            </h2>
            <p className="text-sm text-gray-400">
              Manage umbrella ingredients and their associated vendor codes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => fetchVendorCodes()} className="btn-ghost">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-ghost text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 focus:ring-primary-500/50 border border-primary-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Code Group
          </button>
        </div>
      </div>
      {/* Expandable Info Section */}
      <div className="expandable-info-section mb-6">
        <button
          className="expandable-info-header w-full justify-between"
          onClick={() => setInfoExpanded(!infoExpanded)}
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-lg font-medium text-white">
              What are Item Code Groups?
            </h3>
          </div>
          {infoExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {infoExpanded && (
          <div className="expandable-info-content">
            <p className="text-sm text-gray-300 p-4">
              Item Code Groups help you manage different vendor codes for the
              same product. For example, "Beef Brisket" might have different
              item codes for various grades and sizes like GFS #12345 (Choice
              Grade, 12-14 lbs), GFS #12346 (Prime Grade, 10-12 lbs), and GFS
              #12347 (Trimmed, 8-10 lbs). This feature lets you track all these
              codes in one place, including market vs. contract pricing, making
              inventory and ordering more efficient.
            </p>
          </div>
        )}
      </div>
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ingredient, code, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>
      {/* Create New Code Group Form - 4-line Layout with Explanations */}
      {isAdding && (
        <div className="card p-4 bg-gray-900 border border-gray-700">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-white">
                <Plus className="w-4 h-4 inline-block mr-1 text-primary-400" />
                Create New Code Group
              </h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Row 1: Choose Vendor */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-300">
                1. Choose Vendor <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={newVendorId}
                  onChange={(e) => setNewVendorId(e.target.value)}
                  className="input input-sm w-full bg-gray-800 text-xs py-1.5"
                  required
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 max-w-xs">
                  Select the supplier for this ingredient
                </div>
              </div>
            </div>

            {/* Row 2: Choose Ingredient */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-300">
                2. Choose Ingredient <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search for an ingredient..."
                    className="input input-sm w-full bg-gray-800 text-xs py-1.5"
                    value={ingredientSearchTerm}
                    onChange={(e) => setIngredientSearchTerm(e.target.value)}
                    onFocus={() => setIsAdding(true)}
                  />
                  {ingredientSearchTerm && (
                    <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                      {ingredients
                        .filter(
                          (ingredient) =>
                            ingredient.product
                              .toLowerCase()
                              .includes(ingredientSearchTerm.toLowerCase()) ||
                            (ingredient.item_code &&
                              ingredient.item_code
                                .toLowerCase()
                                .includes(ingredientSearchTerm.toLowerCase())),
                        )
                        .slice(0, 10)
                        .map((ingredient) => (
                          <div
                            key={ingredient.id}
                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-col"
                            onClick={() => {
                              setSelectedIngredient(ingredient);
                              setIngredientSearchTerm(ingredient.product);
                              // Auto-populate item code if available
                              if (ingredient && ingredient.item_code) {
                                setNewCode(ingredient.item_code);
                              }
                            }}
                          >
                            <span className="text-white">
                              {ingredient.product}
                            </span>
                            {ingredient.item_code && (
                              <span className="text-xs text-gray-400">
                                Code: {ingredient.item_code}
                              </span>
                            )}
                          </div>
                        ))}
                      {ingredients.filter(
                        (ingredient) =>
                          ingredient.product
                            .toLowerCase()
                            .includes(ingredientSearchTerm.toLowerCase()) ||
                          (ingredient.item_code &&
                            ingredient.item_code
                              .toLowerCase()
                              .includes(ingredientSearchTerm.toLowerCase())),
                      ).length === 0 && (
                        <div className="px-4 py-2 text-gray-400">
                          No ingredients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 max-w-xs">
                  The base ingredient this code represents
                </div>
              </div>
              {selectedIngredient && (
                <div className="mt-2 p-2 bg-gray-700/50 rounded-md flex justify-between items-center">
                  <div>
                    <span className="text-sm text-white">
                      {selectedIngredient.product}
                    </span>
                    {selectedIngredient.item_code && (
                      <span className="ml-2 text-xs text-gray-400">
                        Code: {selectedIngredient.item_code}
                      </span>
                    )}
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-300"
                    onClick={() => {
                      setSelectedIngredient(null);
                      setIngredientSearchTerm("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Row 3: Variation Info */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-300">
                3. Variation Info
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="Item Code (auto-populated if available)"
                    className="input input-sm w-full bg-gray-800 text-xs py-1.5"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Vendor's specific item code
                  </div>
                </div>
                <div>
                  <input
                    type="text"
                    value={variationLabel}
                    onChange={(e) => setVariationLabel(e.target.value)}
                    placeholder="Variation (e.g. Choice Grade, 12-14 lbs)"
                    className="input input-sm w-full bg-gray-800 text-xs py-1.5"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Optional: Specific details about this variation
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: Add Tag & Button */}
            <div className="flex items-end justify-between">
              <div className="flex-1 mr-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  4. Choose Tag
                </label>
                <input
                  type="text"
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  placeholder="Optional: Add a tag (e.g. Contract pricing)"
                  className="input input-sm w-full bg-gray-800 text-xs py-1.5"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Optional: Add a note or tag for this code
                </div>
              </div>
              <button
                onClick={handleAddCode}
                className="btn-primary whitespace-nowrap h-9"
                disabled={!selectedIngredient || !newCode || !newVendorId}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Code Group
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Item Code Groups List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : paginatedIngredients.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Item Code Groups Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? `No item code groups match your search for "${searchTerm}".`
                : "You haven't created any item code groups yet. Add your first code to get started."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAdding(true)}
                className="btn-primary mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Code Group
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Example Item Code Group */}
            {paginatedIngredients.map(
              ([ingredientId, { ingredientName, codes }]) => (
                <div key={ingredientId} className="card p-4 bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-primary-400" />
                      {ingredientName}
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                        Code Group Item
                      </span>
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // View price history for this umbrella ingredient
                          console.log(
                            `View price history for ${ingredientName}`,
                          );
                        }}
                        className="btn-ghost text-sm"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Price History
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                            Vendor
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                            Item Code / Variation
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                            Recipe Unit
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                            Cost per Unit
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                            Note/Tag
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                            Status
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">
                            Last Updated
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {codes.map((code) => (
                          <tr key={code.id} className="hover:bg-gray-700/30">
                            <td className="px-4 py-2 text-xs text-gray-300">
                              {code.vendor_id}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-300">
                              <div className="flex flex-col">
                                <span>{code.code}</span>
                                {code.variation_label ? (
                                  <span className="text-xs text-primary-400 mt-0.5">
                                    {code.variation_label}
                                  </span>
                                ) : (
                                  // Example variations for demo purposes
                                  <>
                                    {code.vendor_id === "Sysco" &&
                                      code.code === "12345" && (
                                        <span className="text-xs text-primary-400 mt-0.5">
                                          Choice Grade, 12-14 lbs
                                        </span>
                                      )}
                                    {code.vendor_id === "Sysco" &&
                                      code.code === "12346" && (
                                        <span className="text-xs text-primary-400 mt-0.5">
                                          Prime Grade, 10-12 lbs
                                        </span>
                                      )}
                                    {code.vendor_id === "Sysco" &&
                                      code.code === "12347" && (
                                        <span className="text-xs text-primary-400 mt-0.5">
                                          Trimmed, 8-10 lbs
                                        </span>
                                      )}
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-300">
                              {/* Display recipe unit type from the master ingredient */}
                              {(() => {
                                const ingredient = ingredients.find(
                                  (i) => i.id === code.master_ingredient_id,
                                );
                                return ingredient?.recipe_unit_type || "EA";
                              })()}
                            </td>
                            <td className="px-4 py-2 text-xs text-right text-gray-300">
                              {/* Display cost per recipe unit from the master ingredient */}
                              $
                              {(() => {
                                const ingredient = ingredients.find(
                                  (i) => i.id === code.master_ingredient_id,
                                );
                                return (
                                  ingredient?.cost_per_recipe_unit?.toFixed(
                                    2,
                                  ) || "0.00"
                                );
                              })()}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-300">
                              {editingNoteId === code.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingNoteText}
                                    onChange={(e) =>
                                      setEditingNoteText(e.target.value)
                                    }
                                    className="input input-sm w-full bg-gray-700 text-white text-xs"
                                    placeholder="Add a note or tag"
                                  />
                                  <button
                                    onClick={() => {
                                      // Save note logic would go here
                                      // In a real implementation, this would update the vendor code
                                      updateVendorCode(code.id, {
                                        note: editingNoteText,
                                      });
                                      setEditingNoteId(null);
                                      toast.success("Note saved");
                                    }}
                                    className="p-1 text-green-400 hover:text-green-300"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingNoteId(null)}
                                    className="p-1 text-gray-400 hover:text-gray-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingNoteId(code.id);
                                    // In a real implementation, this would get the existing note
                                    setEditingNoteText(code.note || "");
                                  }}
                                  className="cursor-pointer hover:bg-gray-700/50 p-1 rounded"
                                >
                                  {code.note ? (
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                      {code.note}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-500 italic">
                                      + Add note
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {code.is_current ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                  <Check className="w-3 h-3 mr-1" />
                                  Current
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
                                  Historical
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-300">
                              {new Date(code.updated_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2 text-xs text-right">
                              <div className="flex justify-end gap-2">
                                {!code.is_current && (
                                  <button
                                    onClick={() =>
                                      setCurrentVendorCode(code.id)
                                    }
                                    className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                    title="Set as current code"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    // Navigate to price history
                                    console.log(
                                      `View price history for ${code.ingredient_name} with vendor ${code.vendor_id}`,
                                    );
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                                  title="View price history"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (code.is_current) {
                                      toast.error(
                                        "Cannot delete the current code. Set another code as current first.",
                                      );
                                      return;
                                    }
                                    deleteVendorCode(code.id);
                                  }}
                                  className="p-1 text-rose-400 hover:text-rose-300 transition-colors"
                                  title="Delete code"
                                  disabled={code.is_current}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ),
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Showing example code group item
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
          </>
        )}
      </div>
    </div>
  );
};
