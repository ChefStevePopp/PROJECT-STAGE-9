import React, { useState, useEffect } from "react";
import { Search, X, Link, Check } from "lucide-react";
import { MasterIngredient } from "@/types/master-ingredient";
import { useMasterIngredientsStore } from "@/stores/masterIngredientsStore";
import toast from "react-hot-toast";

interface LinkMasterIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (masterIngredientId: string) => void;
  currentLinkedIds: string[];
  umbrellaName: string;
}

export const LinkMasterIngredientModal: React.FC<
  LinkMasterIngredientModalProps
> = ({ isOpen, onClose, onLink, currentLinkedIds, umbrellaName }) => {
  const { ingredients, fetchIngredients, isLoading } =
    useMasterIngredientsStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIngredients, setFilteredIngredients] = useState<
    MasterIngredient[]
  >([]);

  // Load ingredients on mount
  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // Filter ingredients based on search term and exclude already linked ingredients
  useEffect(() => {
    const availableIngredients = ingredients.filter(
      (ingredient) => !currentLinkedIds.includes(ingredient.id),
    );

    if (!searchTerm) {
      setFilteredIngredients(availableIngredients);
      return;
    }

    const filtered = availableIngredients.filter(
      (ingredient) =>
        ingredient.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.vendor.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredIngredients(filtered);
  }, [searchTerm, ingredients, currentLinkedIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">
            Link Master Ingredient to {umbrellaName}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-4">
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

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredIngredients.length === 0 ? (
            <div className="text-center py-8 bg-gray-800/50 rounded-lg">
              <p className="text-gray-400">
                {searchTerm
                  ? `No available ingredients match your search for "${searchTerm}".`
                  : "No available ingredients found. All ingredients may already be linked."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredIngredients.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => {
                    onLink(ingredient.id);
                    toast.success(
                      `Linked ${ingredient.product} to ${umbrellaName}`,
                    );
                    onClose();
                  }}
                  className="w-full p-4 text-left bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-white">
                      {ingredient.product}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Code: {ingredient.item_code} | Vendor: {ingredient.vendor}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary-400">
                    <Link className="w-4 h-4" />
                    <span>Link</span>
                  </div>
                </button>
              ))}
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
