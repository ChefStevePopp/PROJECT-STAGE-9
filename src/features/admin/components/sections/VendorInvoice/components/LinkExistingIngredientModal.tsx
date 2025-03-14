import React, { useState, useEffect } from "react";
import { Search, X, Link, Check, AlertTriangle } from "lucide-react";
import { MasterIngredient } from "@/types/master-ingredient";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import { useVendorCodesStore } from "@/stores/vendorCodesStore";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

interface LinkExistingIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  newItemCode: string;
  newItemName: string;
  vendorId: string;
  onSuccess: () => void;
}

export const LinkExistingIngredientModal: React.FC<
  LinkExistingIngredientModalProps
> = ({ isOpen, onClose, newItemCode, newItemName, vendorId, onSuccess }) => {
  const {
    ingredients,
    fetchIngredients,
    isLoading: ingredientsLoading,
  } = useMasterIngredientsStore();
  const { addVendorCode, isLoading: codesLoading } = useVendorCodesStore();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIngredients, setFilteredIngredients] = useState<
    MasterIngredient[]
  >([]);
  const [exactMatches, setExactMatches] = useState<MasterIngredient[]>([]);
  const [nameMatches, setNameMatches] = useState<MasterIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Find exact and name matches when ingredients or search term changes
  useEffect(() => {
    // Find exact matches by item code
    const exactCodeMatches = ingredients.filter(
      (ingredient) =>
        ingredient.item_code.toLowerCase() === newItemCode.toLowerCase(),
    );
    setExactMatches(exactCodeMatches);

    // Find name matches
    const searchString = searchTerm || newItemName;
    const nameMatchResults = ingredients.filter(
      (ingredient) =>
        ingredient.product.toLowerCase().includes(searchString.toLowerCase()) &&
        !exactCodeMatches.some((match) => match.id === ingredient.id),
    );
    setNameMatches(nameMatchResults);

    // Combine both for filtered results
    setFilteredIngredients([...exactCodeMatches, ...nameMatchResults]);
  }, [ingredients, searchTerm, newItemCode, newItemName]);

  const handleLinkIngredient = async (ingredient: MasterIngredient) => {
    if (!user?.user_metadata?.organizationId) {
      toast.error("User organization not found");
      return;
    }

    setIsLoading(true);
    try {
      // Create a vendor code linking this ingredient to the new code
      await addVendorCode({
        organization_id: user.user_metadata.organizationId,
        master_ingredient_id: ingredient.id,
        vendor_id: vendorId,
        code: newItemCode,
        is_current: true,
        variation_label:
          ingredient.product !== newItemName ? newItemName : undefined,
      });

      toast.success(
        `Successfully linked ${newItemCode} to ${ingredient.product}`,
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error linking ingredient:", error);
      toast.error("Failed to link ingredient");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">
            Link Item Code to Existing Ingredient
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6 space-y-2">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">
                New Item Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Item Code</span>
                  <p className="text-white font-medium">{newItemCode}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Product Name</span>
                  <p className="text-white font-medium">{newItemName}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Vendor</span>
                  <p className="text-white font-medium">{vendorId}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, item code, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {ingredientsLoading || isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-8 bg-gray-800/50 rounded-lg">
              <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                No matching ingredients found. Try adjusting your search or
                create a new ingredient.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exactMatches.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-2">
                    Exact Code Matches
                  </h4>
                  <div className="space-y-2">
                    {exactMatches.map((ingredient) => (
                      <IngredientCard
                        key={ingredient.id}
                        ingredient={ingredient}
                        onLink={handleLinkIngredient}
                        isExactMatch
                      />
                    ))}
                  </div>
                </div>
              )}

              {nameMatches.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-blue-400 mb-2">
                    Name Matches
                  </h4>
                  <div className="space-y-2">
                    {nameMatches.map((ingredient) => (
                      <IngredientCard
                        key={ingredient.id}
                        ingredient={ingredient}
                        onLink={handleLinkIngredient}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 flex justify-end">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface IngredientCardProps {
  ingredient: MasterIngredient;
  onLink: (ingredient: MasterIngredient) => void;
  isExactMatch?: boolean;
}

const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  onLink,
  isExactMatch,
}) => {
  return (
    <div
      className={`p-4 rounded-lg ${isExactMatch ? "bg-amber-500/10 border border-amber-500/30" : "bg-gray-800/50 hover:bg-gray-800"} transition-colors`}
    >
      <div className="flex justify-between">
        <div>
          <h5 className="font-medium text-white">{ingredient.product}</h5>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <div>
              <span className="text-xs text-gray-500">Item Code</span>
              <p className="text-sm text-gray-300">{ingredient.item_code}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Vendor</span>
              <p className="text-sm text-gray-300">{ingredient.vendor}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Category</span>
              <p className="text-sm text-gray-300">
                {ingredient.category_name || "Not categorized"}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500">Current Price</span>
              <p className="text-sm text-gray-300">
                ${ingredient.current_price.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div>
          <button
            onClick={() => onLink(ingredient)}
            className="btn-primary btn-sm"
          >
            <Link className="w-4 h-4 mr-1" />
            Link
          </button>
        </div>
      </div>
      {isExactMatch && (
        <div className="mt-3 text-xs bg-amber-500/20 text-amber-400 p-2 rounded">
          <Check className="w-3 h-3 inline-block mr-1" />
          This ingredient already has the same item code. Linking will create a
          new vendor code association.
        </div>
      )}
    </div>
  );
};
