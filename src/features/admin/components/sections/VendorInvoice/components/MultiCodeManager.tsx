import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  Check,
  History,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useVendorCodesStore } from "@/stores/vendorCodesStore";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { VendorCodeWithIngredient } from "@/types/vendor-codes";
import { MasterIngredient } from "@/types/master-ingredient";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export const MultiCodeManager: React.FC = () => {
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
  const [selectedIngredient, setSelectedIngredient] =
    useState<MasterIngredient | null>(null);
  const [newCode, setNewCode] = useState("");
  const [newVendorId, setNewVendorId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [filteredCodes, setFilteredCodes] = useState<
    VendorCodeWithIngredient[]
  >([]);
  const [vendors, setVendors] = useState<string[]>([]);

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
        is_current: true,
      });

      // Reset form
      setNewCode("");
      setNewVendorId("");
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

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 text-rose-400 rounded-lg flex items-center gap-3">
        <AlertTriangle className="w-5 h-5" />
        <div>
          <h3 className="font-medium">Error Loading Vendor Codes</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 bg-[#1a1f2b] p-2 rounded-lg">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1a1f2b]">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">
              Multi-Code Product Management
            </h3>
            <p className="text-sm text-gray-400">
              Manage multiple vendor codes for the same ingredient across
              different suppliers
            </p>
          </div>
        </div>
        <div className="flex gap-2 mr-2">
          <button onClick={() => fetchVendorCodes()} className="btn-ghost">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add New Code
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by ingredient, code, or vendor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10 w-full"
        />
      </div>

      {/* Add New Code Form */}
      {isAdding && (
        <div className="card p-6 bg-gray-800/50">
          <h3 className="text-lg font-medium text-white mb-4">
            Add New Vendor Code
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Ingredient
              </label>
              <select
                value={selectedIngredient?.id || ""}
                onChange={(e) => {
                  const ingredient = ingredients.find(
                    (i) => i.id === e.target.value,
                  );
                  setSelectedIngredient(ingredient || null);
                }}
                className="input w-full"
                required
              >
                <option value="">Select an ingredient</option>
                {ingredients.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.product}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Vendor
              </label>
              <select
                value={newVendorId}
                onChange={(e) => setNewVendorId(e.target.value)}
                className="input w-full"
                required
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor} value={vendor}>
                    {vendor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Vendor Code
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Enter vendor code"
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsAdding(false)} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleAddCode}
              className="btn-primary"
              disabled={!selectedIngredient || !newCode || !newVendorId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Code
            </button>
          </div>
        </div>
      )}

      {/* Vendor Codes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>
        ) : Object.keys(codesByIngredient).length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <div className="w-16 h-16 mx-auto bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              No Vendor Codes Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchTerm
                ? `No vendor codes match your search for "${searchTerm}".`
                : "You haven't added any vendor codes yet. Add your first code to get started."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAdding(true)}
                className="btn-primary mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Code
              </button>
            )}
          </div>
        ) : (
          Object.entries(codesByIngredient).map(
            ([ingredientId, { ingredientName, codes }]) => (
              <div key={ingredientId} className="card p-4 bg-gray-800/50">
                <h3 className="text-lg font-medium text-white mb-3">
                  {ingredientName}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                          Vendor
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                          Code
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-400">
                          Last Updated
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {codes.map((code) => (
                        <tr key={code.id} className="hover:bg-gray-700/30">
                          <td className="px-4 py-2 text-sm text-gray-300">
                            {code.vendor_id}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-300">
                            {code.code}
                          </td>
                          <td className="px-4 py-2 text-sm">
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
                          <td className="px-4 py-2 text-sm text-gray-300">
                            {new Date(code.updated_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            <div className="flex justify-end gap-2">
                              {!code.is_current && (
                                <button
                                  onClick={() => setCurrentVendorCode(code.id)}
                                  className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                                  title="Set as current code"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  // Navigate to price history
                                  // This would typically use a router, but for simplicity we'll just log
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
                                className="p-1 text-gray-400 hover:text-rose-400 transition-colors"
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
          )
        )}
      </div>
    </div>
  );
};
